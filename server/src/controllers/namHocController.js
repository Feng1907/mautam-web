const NamHoc = require('../models/NamHoc');

// GET /api/namhoc
exports.getAll = async (req, res, next) => {
  try {
    const list = await NamHoc.find().sort('-ngayBatDau');
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

// POST /api/namhoc  (Admin only)
exports.create = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.create(req.body);
    res.status(201).json({ success: true, data: namHoc });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Năm học đã tồn tại' });
    next(err);
  }
};

// PUT /api/namhoc/:id/activate  (Admin only — set năm học này thành đang hoạt động)
exports.activate = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.findById(req.params.id);
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    namHoc.dangHoatDong = true;
    await namHoc.save(); // pre-save hook tự tắt các năm khác

    res.json({ success: true, data: namHoc });
  } catch (err) {
    next(err);
  }
};
