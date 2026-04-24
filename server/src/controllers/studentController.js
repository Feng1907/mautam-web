const Student = require('../models/Student');

exports.getByClass = async (req, res, next) => {
  try {
    const students = await Student.find({ lop: req.params.lopId, trangThai: 'active' }).sort('hoTen');
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { trangThai: 'inactive' });
    res.json({ success: true, message: 'Đã xoá học sinh' });
  } catch (err) {
    next(err);
  }
};
