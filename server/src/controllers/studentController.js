const Student   = require('../models/Student');
const Grade     = require('../models/Grade');
const ChuyenCan = require('../models/ChuyenCan');
const NamHoc    = require('../models/NamHoc');

// GET /api/students?lopId=...
exports.getByClass = async (req, res, next) => {
  try {
    const { lopId } = req.params;
    const students = await Student.find({ lop: lopId, trangThai: 'active' })
      .sort('hoTen');
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:lopId/:id
exports.getOne = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('lop', 'tenLop');
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// Chuẩn hóa ngaySinh: chuỗi rỗng → null để Mongoose không báo cast error
const normalizeBody = (body) => ({
  ...body,
  ngaySinh: body.ngaySinh === '' ? null : (body.ngaySinh || null),
});

// POST /api/students
exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(normalizeBody(req.body));
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
exports.update = async (req, res, next) => {
  try {
    // Không cho phép đổi lớp qua route này (dùng route transfer riêng)
    const { lop, ...updateData } = normalizeBody(req.body);
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:lopId/:id/lich-su  — Lịch sử điểm qua các năm học
exports.lichSu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const namHocList = await NamHoc.find().sort('-ngayBatDau');

    const result = await Promise.all(
      namHocList.map(async (nh) => {
        const grades = await Grade.find({ student: id, namHoc: nh._id });
        const ccList = await ChuyenCan.find({ student: id, namHoc: nh._id });
        if (!grades.length && !ccList.length) return null;
        return { namHoc: { _id: nh._id, ten: nh.ten }, grades, chuyenCan: ccList };
      })
    );

    res.json({ success: true, data: result.filter(Boolean) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id  (soft delete)
exports.remove = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { trangThai: 'inactive' },
      { new: true }
    );
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, message: 'Đã xoá đoàn sinh' });
  } catch (err) {
    next(err);
  }
};
