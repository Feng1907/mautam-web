const Attendance = require('../models/Attendance');
const AbsenceRequest = require('../models/AbsenceRequest');
const ChuyenCan = require('../models/ChuyenCan');
const Grade = require('../models/Grade');
const NamHoc = require('../models/NamHoc');
const ParentStudent = require('../models/ParentStudent');
const Student = require('../models/Student');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { sendPushToUsers } = require('../utils/pushNotifier');
const logger = require('../utils/logger');

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

// GET /api/parent/students/:studentId/semester-report?namHocId=...&hocKy=1
exports.getSemesterReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const hocKy = Number(req.query.hocKy || 1);
    const namHocId = await resolveNamHocId(req.query.namHocId);
    const student = await assertParentCanAccessStudent(req.user._id, studentId);

    const [grades, chuyenCan] = await Promise.all([
      Grade.find({ student: studentId, namHoc: namHocId, hocKy })
        .populate('lop', 'tenLop nhanh')
        .sort({ loaiDiem: 1, createdAt: 1 }),
      ChuyenCan.findOne({ student: studentId, namHoc: namHocId, hocKy })
        .populate('lop', 'tenLop nhanh'),
    ]);

    const gradeRows = grades.map((grade) => ({
      _id: grade._id,
      loaiDiem: grade.loaiDiem,
      diem: grade.diem,
      ghiChu: grade.ghiChu || '',
      createdAt: grade.createdAt,
    }));

    const gradeAverage = grades.length
      ? Number((grades.reduce((sum, grade) => sum + Number(grade.diem || 0), 0) / grades.length).toFixed(1))
      : null;

    const teacherComments = [
      chuyenCan?.ghiChu,
      ...grades.map((grade) => grade.ghiChu),
    ].filter(Boolean);

    res.json({
      success: true,
      data: {
        student,
        namHoc: namHocId,
        hocKy,
        gradeAverage,
        chuyenCan,
        grades: gradeRows,
        teacherComment: teacherComments[0] || 'Chưa có nhận xét từ Giáo lý viên.',
        comments: teacherComments,
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

// POST /api/parent/students/:studentId/absence-request
exports.createAbsenceRequest = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { date, reason } = req.body;
    await assertParentCanAccessStudent(req.user._id, studentId);

    const student = await Student.findById(studentId)
      .select('hoTen tenThanh lop')
      .populate({
        path: 'lop',
        select: 'tenLop nhanh huynhTruong',
        populate: { path: 'huynhTruong', select: 'hoTen email pushSubscriptions' },
      });

    if (!student?.lop) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp của đoàn sinh' });
    }

    const request = await AbsenceRequest.create({
      parent: req.user._id,
      student: student._id,
      lop: student.lop._id,
      date,
      reason,
      notifiedTo: student.lop.huynhTruong?._id || null,
    });

    const huynhTruong = student.lop.huynhTruong;
    if (huynhTruong?.email) {
      sendEmail({
        to: huynhTruong.email,
        subject: `[Xin phép nghỉ] ${student.tenThanh || ''} ${student.hoTen}`.trim(),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
            <h3 style="margin-top:0;color:#8B0000">Phụ huynh xin phép nghỉ</h3>
            <p><strong>Đoàn sinh:</strong> ${student.tenThanh || ''} ${student.hoTen}</p>
            <p><strong>Lớp:</strong> ${student.lop.tenLop}</p>
            <p><strong>Ngày nghỉ:</strong> ${date}</p>
            <p><strong>Lý do:</strong> ${reason}</p>
          </div>
        `,
      }).catch((err) => logger.warn('absenceRequest email failed', { studentId: student._id, error: err.message }));
    }

    if (huynhTruong?._id) {
      sendPushToUsers([huynhTruong._id], {
        title: 'Phụ huynh xin phép nghỉ',
        body: `${student.tenThanh ? `${student.tenThanh} ` : ''}${student.hoTen} xin nghỉ ngày ${date}.`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        url: '/admin/lop-hoc',
        type: 'absence-request',
      }).catch((err) => logger.warn('absenceRequest push failed', { studentId: student._id, error: err.message }));
    }

    res.status(201).json({
      success: true,
      message: 'Đã gửi xin phép nghỉ đến Huynh trưởng lớp',
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent/students/:studentId/absence-requests
exports.getAbsenceRequests = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    await assertParentCanAccessStudent(req.user._id, studentId);
    const requests = await AbsenceRequest.find({ student: studentId, parent: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('date reason status createdAt');
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

// POST /api/parent/link-request  — phụ huynh tự gửi yêu cầu liên kết
exports.createLinkRequest = async (req, res, next) => {
  try {
    const { studentId, quanHe = 'Cha/Mẹ', ghiChu } = req.body;
    if (!studentId)
      return res.status(400).json({ success: false, message: 'Thiếu studentId' });

    const student = await Student.findById(studentId)
      .select('hoTen tenThanh lop trangThai')
      .populate('lop', 'tenLop');

    if (!student || student.trangThai !== 'active')
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });

    const existing = await ParentStudent.findOne({ parent: req.user._id, student: studentId });
    if (existing) {
      const msgMap = {
        active: 'Bạn đã được liên kết với đoàn sinh này rồi.',
        pending: 'Yêu cầu liên kết đang chờ admin duyệt.',
        rejected: null,
      };
      if (existing.trangThai !== 'rejected')
        return res.status(409).json({ success: false, message: msgMap[existing.trangThai] });

      // Cho phép gửi lại nếu bị từ chối
      existing.trangThai = 'pending';
      existing.quanHe = quanHe;
      existing.ghiChu = ghiChu;
      existing.rejectedReason = null;
      existing.linkedBy = req.user._id;
      await existing.save();
      return res.json({ success: true, message: 'Đã gửi lại yêu cầu liên kết, chờ admin duyệt.', data: existing });
    }

    const link = await ParentStudent.create({
      parent: req.user._id,
      student: studentId,
      quanHe,
      ghiChu,
      trangThai: 'pending',
      linkedBy: req.user._id,
    });

    // Thông báo push cho admin
    const admins = await User.find({ vaiTro: 'admin' }).select('_id').lean();
    if (admins.length) {
      sendPushToUsers(admins.map(a => a._id), {
        title: 'Yêu cầu liên kết phụ huynh mới',
        body: `${req.user.hoTen} muốn liên kết với ${student.tenThanh} ${student.hoTen}`,
        icon: '/favicon.svg',
        url: '/admin/phu-huynh',
        type: 'link-request',
      }).catch((err) => logger.warn('linkRequest push failed', { userId: req.user._id, error: err.message }));
    }

    res.status(201).json({ success: true, message: 'Đã gửi yêu cầu liên kết, chờ admin duyệt.', data: link });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent/link-requests  — xem danh sách yêu cầu của chính mình
exports.getMyLinkRequests = async (req, res, next) => {
  try {
    const requests = await ParentStudent.find({ parent: req.user._id })
      .populate({ path: 'student', select: 'hoTen tenThanh lop', populate: { path: 'lop', select: 'tenLop' } })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

// GET /api/parent/search-students?q=  — tìm đoàn sinh để gửi yêu cầu liên kết
exports.searchStudentsPublic = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2)
      return res.json({ success: true, data: [] });

    const students = await Student.find({
      trangThai: 'active',
      $or: [
        { hoTen: { $regex: q, $options: 'i' } },
        { tenThanh: { $regex: q, $options: 'i' } },
      ],
    })
      .select('hoTen tenThanh lop')
      .populate('lop', 'tenLop')
      .limit(10)
      .lean();

    // Ẩn bớt thông tin nhạy cảm — chỉ trả về đủ để nhận dạng
    const safe = students.map(s => ({
      _id: s._id,
      tenThanh: s.tenThanh,
      hoTen: s.hoTen,
      tenLop: s.lop?.tenLop || null,
    }));

    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};
