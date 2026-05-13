const Attendance = require('../models/Attendance');
const ChuyenCan = require('../models/ChuyenCan');
const Grade = require('../models/Grade');
const NamHoc = require('../models/NamHoc');
const ParentStudent = require('../models/ParentStudent');

const resolveNamHocId = async (namHocId) => {
  if (namHocId) return namHocId;

  const namHoc = await NamHoc.findOne({ dangHoatDong: true });
  if (!namHoc) {
    const err = new Error('Chua co nam hoc dang hoat dong');
    err.statusCode = 404;
    throw err;
  }

  return namHoc._id;
};

const assertParentCanAccessStudent = async (parentId, studentId) => {
  const link = await ParentStudent.findOne({
    parent: parentId,
    student: studentId,
    trangThai: 'active',
  }).populate('student', 'hoTen tenThanh lop trangThai');

  if (!link) {
    const err = new Error('Khong co quyen xem du lieu cua doan sinh nay');
    err.statusCode = 403;
    throw err;
  }

  return link.student;
};

// GET /api/parent/students
exports.getMyStudents = async (req, res, next) => {
  try {
    const links = await ParentStudent.find({
      parent: req.user._id,
      trangThai: 'active',
    })
      .populate({
        path: 'student',
        select: 'hoTen tenThanh lop trangThai avatar',
        populate: { path: 'lop', select: 'tenLop nhanh' },
      })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: links
        .filter((link) => link.student)
        .map((link) => ({
          _id: link.student._id,
          hoTen: link.student.hoTen,
          tenThanh: link.student.tenThanh,
          lop: link.student.lop,
          trangThai: link.student.trangThai,
          avatar: link.student.avatar,
          quanHe: link.quanHe,
        })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent/students/:studentId/grades?namHocId=...&hocKy=1
exports.getStudentGrades = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { hocKy } = req.query;
    const namHocId = await resolveNamHocId(req.query.namHocId);
    const student = await assertParentCanAccessStudent(req.user._id, studentId);

    const filter = { student: studentId, namHoc: namHocId };
    if (hocKy) filter.hocKy = Number(hocKy);

    const [grades, chuyenCan] = await Promise.all([
      Grade.find(filter)
        .populate('lop', 'tenLop nhanh')
        .sort({ hocKy: 1, loaiDiem: 1, createdAt: 1 }),
      ChuyenCan.find(filter)
        .populate('lop', 'tenLop nhanh')
        .sort({ hocKy: 1 }),
    ]);

    res.json({
      success: true,
      data: {
        student,
        namHoc: namHocId,
        grades,
        chuyenCan,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent/students/:studentId/attendance?namHocId=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    const namHocId = await resolveNamHocId(req.query.namHocId);
    const student = await assertParentCanAccessStudent(req.user._id, studentId);

    const filter = { student: studentId, namHoc: namHocId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const records = await Attendance.find(filter)
      .populate('lop', 'tenLop nhanh')
      .sort({ date: 1 });

    const summary = records.reduce((acc, record) => {
      acc.total += 1;
      if (record.present) acc.present += 1;
      else acc.absent += 1;
      return acc;
    }, { total: 0, present: 0, absent: 0 });

    summary.percentage = summary.total
      ? Math.round((summary.present / summary.total) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        student,
        namHoc: namHocId,
        summary,
        records,
      },
    });
  } catch (err) {
    next(err);
  }
};
