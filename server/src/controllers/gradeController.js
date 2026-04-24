const Grade = require('../models/Grade');

exports.getByClass = async (req, res, next) => {
  try {
    const grades = await Grade.find({ lop: req.params.lopId }).populate('student', 'hoTen tenThanh');
    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const grade = await Grade.create({ ...req.body, nhapBoi: req.user._id });
    res.status(201).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grade) return res.status(404).json({ success: false, message: 'Không tìm thấy điểm' });
    res.json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá điểm' });
  } catch (err) {
    next(err);
  }
};
