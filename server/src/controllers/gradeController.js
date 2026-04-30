const Grade = require('../models/Grade');
const NamHoc = require('../models/NamHoc');

// GET /api/grades/:lopId?namHocId=...&hocKy=1
exports.getByClass = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      namHocId = namHoc._id;
    }

    const filter = { lop: req.params.lopId, namHoc: namHocId };
    if (req.query.hocKy) filter.hocKy = Number(req.query.hocKy);

    const grades = await Grade.find(filter)
      .populate('student', 'hoTen tenThanh')
      .sort('student');

    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

// POST /api/grades
exports.create = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const grade = await Grade.create({
      ...req.body,
      namHoc: namHoc._id,
      nhapBoi: req.user._id,
    });
    res.status(201).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

// PUT /api/grades/:id
exports.update = async (req, res, next) => {
  try {
    // Không cho phép thay đổi student, lop, namHoc qua route này
    const { student, lop, namHoc, ...updateData } = req.body;
    const grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!grade)
      return res.status(404).json({ success: false, message: 'Không tìm thấy điểm' });
    res.json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/grades/:id
exports.remove = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade)
      return res.status(404).json({ success: false, message: 'Không tìm thấy điểm' });
    res.json({ success: true, message: 'Đã xoá điểm' });
  } catch (err) {
    next(err);
  }
};
