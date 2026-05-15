const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const NamHoc = require('../models/NamHoc');
const Student = require('../models/Student');

const NGANH_ORDER = ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'];
const NGANH_LABEL = {
  ChienNon: 'Chiên Non',
  AuNhi: 'Ấu Nhi',
  ThieuNhi: 'Thiếu Nhi',
  NghiaSi: 'Nghĩa Sĩ',
  HiepSi: 'Hiệp Sĩ',
};

const toId = (value) => String(value?._id || value || '');

const dateKey = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

const monthKey = (value) => value.slice(0, 7);

const getWeekStart = (value) => {
  const d = new Date(`${value}T00:00:00`);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

const buildPeriods = (startDate, endDate, mode) => {
  const periods = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return periods;

  if (mode === 'month') {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 7);
      periods.push({ key, label: `T${cursor.getMonth() + 1}/${cursor.getFullYear()}` });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return periods;
  }

  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() - cursor.getDay());
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    periods.push({
      key,
      label: cursor.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    });
    cursor.setDate(cursor.getDate() + 7);
  }
  return periods;
};

const buildAttendanceTrend = ({ periods, mode, classes, students, attendance }) => {
  const classBranch = new Map(classes.map((lop) => [toId(lop), lop.nhanh]));
  const branchStudentCounts = NGANH_ORDER.reduce((acc, nhanh) => ({ ...acc, [nhanh]: 0 }), {});

  students.forEach((student) => {
    const nhanh = classBranch.get(toId(student.lop));
    if (nhanh) branchStudentCounts[nhanh] += 1;
  });

  const bucket = new Map();
  periods.forEach((period) => {
    bucket.set(period.key, NGANH_ORDER.reduce((acc, nhanh) => {
      acc[nhanh] = { present: 0, recorded: 0 };
      return acc;
    }, {}));
  });

  attendance.forEach((record) => {
    const nhanh = classBranch.get(toId(record.lop));
    if (!nhanh) return;

    const key = mode === 'month' ? monthKey(record.date) : getWeekStart(record.date);
    const row = bucket.get(key);
    if (!row) return;

    row[nhanh].recorded += 1;
    if (record.present) row[nhanh].present += 1;
  });

  return periods.map((period) => {
    const row = { period: period.label, key: period.key };
    const stats = bucket.get(period.key);
    NGANH_ORDER.forEach((nhanh) => {
      const data = stats?.[nhanh] || { present: 0, recorded: 0 };
      const denominator = data.recorded || branchStudentCounts[nhanh];
      row[nhanh] = denominator ? Math.round((data.present / denominator) * 100) : 0;
    });
    return row;
  });
};

const buildEnrollmentComparison = ({ currentClasses, previousClasses, currentStudents, previousStudents }) => {
  const currentClassBranch = new Map(currentClasses.map((lop) => [toId(lop), lop.nhanh]));
  const previousClassBranch = new Map(previousClasses.map((lop) => [toId(lop), lop.nhanh]));

  return NGANH_ORDER.map((nhanh) => ({
    nhanh,
    label: NGANH_LABEL[nhanh],
    current: currentStudents.filter((student) => currentClassBranch.get(toId(student.lop)) === nhanh).length,
    previous: previousStudents.filter((student) => previousClassBranch.get(toId(student.lop)) === nhanh).length,
  }));
};

const buildAttentionStudents = ({ classes, students, attendance }) => {
  const classMap = new Map(classes.map((lop) => [toId(lop), lop]));
  const latestWeeks = [...new Set(attendance.map((record) => getWeekStart(record.date)))]
    .sort()
    .slice(-6);
  const previousWeeks = latestWeeks.slice(0, 3);
  const recentWeeks = latestWeeks.slice(-3);

  if (recentWeeks.length < 3) return [];

  const recordsByStudent = new Map();
  attendance.forEach((record) => {
    const studentId = toId(record.student);
    if (!recordsByStudent.has(studentId)) recordsByStudent.set(studentId, new Map());
    recordsByStudent.get(studentId).set(getWeekStart(record.date), record.present);
  });

  return students
    .map((student) => {
      const byWeek = recordsByStudent.get(toId(student)) || new Map();
      const recentAbsent = recentWeeks.filter((week) => byWeek.get(week) === false).length;
      const previousAbsent = previousWeeks.filter((week) => byWeek.get(week) === false).length;
      const recentRecorded = recentWeeks.filter((week) => byWeek.has(week)).length;

      const suddenIncrease = recentAbsent - previousAbsent;
      if (recentRecorded < 2 || recentAbsent < 2 || suddenIncrease < 1) return null;

      const lop = classMap.get(toId(student.lop));
      return {
        studentId: toId(student),
        hoTen: student.hoTen,
        tenThanh: student.tenThanh,
        lop: lop?.tenLop || '',
        nhanh: lop?.nhanh || '',
        recentAbsent,
        previousAbsent,
        recentAbsenceRate: Math.round((recentAbsent / recentWeeks.length) * 100),
        reason: `Vắng ${recentAbsent}/3 tuần gần nhất`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.recentAbsenceRate - a.recentAbsenceRate || b.recentAbsent - a.recentAbsent)
    .slice(0, 12);
};

exports.getTrends = async (req, res, next) => {
  try {
    const years = await NamHoc.find().sort('-ngayBatDau').lean();
    const currentYear = req.query.namHocId
      ? years.find((year) => toId(year) === req.query.namHocId)
      : years.find((year) => year.dangHoatDong) || years[0];

    if (!currentYear) {
      return res.json({
        success: true,
        data: {
          namHoc: null,
          previousNamHoc: null,
          weeklyAttendanceByBranch: [],
          monthlyAttendanceByBranch: [],
          enrollmentComparison: [],
          attentionStudents: [],
        },
      });
    }

    const currentIndex = years.findIndex((year) => toId(year) === toId(currentYear));
    const previousYear = years[currentIndex + 1] || null;

    const [currentClasses, previousClasses] = await Promise.all([
      Class.find({ namHoc: currentYear._id }).sort({ thuTu: 1 }).lean(),
      previousYear ? Class.find({ namHoc: previousYear._id }).sort({ thuTu: 1 }).lean() : [],
    ]);

    const currentClassIds = currentClasses.map((lop) => lop._id);
    const previousClassIds = previousClasses.map((lop) => lop._id);

    const [currentStudents, previousStudents, attendance] = await Promise.all([
      Student.find({ lop: { $in: currentClassIds }, trangThai: 'active' }).select('hoTen tenThanh lop').lean(),
      previousYear
        ? Student.find({ lop: { $in: previousClassIds }, trangThai: 'active' }).select('hoTen tenThanh lop').lean()
        : [],
      Attendance.find({
        lop: { $in: currentClassIds },
        namHoc: currentYear._id,
        date: {
          $gte: dateKey(currentYear.ngayBatDau),
          $lte: dateKey(currentYear.ngayKetThuc),
        },
      }).select('student lop date present').lean(),
    ]);

    const weeklyPeriods = buildPeriods(currentYear.ngayBatDau, currentYear.ngayKetThuc, 'week');
    const monthlyPeriods = buildPeriods(currentYear.ngayBatDau, currentYear.ngayKetThuc, 'month');

    res.json({
      success: true,
      data: {
        namHoc: {
          _id: currentYear._id,
          ten: currentYear.ten,
          ngayBatDau: currentYear.ngayBatDau,
          ngayKetThuc: currentYear.ngayKetThuc,
        },
        previousNamHoc: previousYear ? {
          _id: previousYear._id,
          ten: previousYear.ten,
          ngayBatDau: previousYear.ngayBatDau,
          ngayKetThuc: previousYear.ngayKetThuc,
        } : null,
        branches: NGANH_ORDER.map((nhanh) => ({ key: nhanh, label: NGANH_LABEL[nhanh] })),
        weeklyAttendanceByBranch: buildAttendanceTrend({
          periods: weeklyPeriods,
          mode: 'week',
          classes: currentClasses,
          students: currentStudents,
          attendance,
        }),
        monthlyAttendanceByBranch: buildAttendanceTrend({
          periods: monthlyPeriods,
          mode: 'month',
          classes: currentClasses,
          students: currentStudents,
          attendance,
        }),
        enrollmentComparison: buildEnrollmentComparison({
          currentClasses,
          previousClasses,
          currentStudents,
          previousStudents,
        }),
        attentionStudents: buildAttentionStudents({
          classes: currentClasses,
          students: currentStudents,
          attendance,
        }),
      },
    });
  } catch (err) {
    next(err);
  }
};
