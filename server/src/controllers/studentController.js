const Student = require('../models/Student');

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

// POST /api/students
exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
exports.update = async (req, res, next) => {
  try {
    // Không cho phép đổi lớp qua route này (dùng route transfer riêng)
    const { lop, ...updateData } = req.body;
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
