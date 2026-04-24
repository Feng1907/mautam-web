const Class = require('../models/Class');
const NamHoc = require('../models/NamHoc');
const User = require('../models/User');

// GET /api/classes?namHocId=...  (mặc định lấy năm đang hoạt động)
exports.getAll = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học nào đang hoạt động' });
      namHocId = namHoc._id;
    }

    const classes = await Class.find({ namHoc: namHocId })
      .sort('thuTu')
      .populate('huynhTruong', 'hoTen email soDienThoai')
      .populate('duTruong', 'hoTen email soDienThoai');

    res.json({ success: true, data: classes });
  } catch (err) {
    next(err);
  }
};

// GET /api/classes/:id
exports.getOne = async (req, res, next) => {
  try {
    const lop = await Class.findById(req.params.id)
      .populate('namHoc', 'ten dangHoatDong')
      .populate('huynhTruong', 'hoTen email soDienThoai')
      .populate('duTruong', 'hoTen email soDienThoai');

    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    res.json({ success: true, data: lop });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes  (Admin only)
exports.create = async (req, res, next) => {
  try {
    const { tenLop, nhanh, thuTu, namHocId, moTa } = req.body;

    const namHoc = await NamHoc.findById(namHocId);
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const lop = await Class.create({ tenLop, nhanh, thuTu, namHoc: namHocId, moTa });
    res.status(201).json({ success: true, data: lop });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Tên lớp đã tồn tại trong năm học này' });
    next(err);
  }
};

// PUT /api/classes/:id/assign  (Admin phân công Huynh trưởng / Dự trưởng)
exports.assign = async (req, res, next) => {
  try {
    const { huynhTruongId, duTruongIds } = req.body;
    const lop = await Class.findById(req.params.id);
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Cập nhật lớp
    if (huynhTruongId !== undefined) lop.huynhTruong = huynhTruongId || null;
    if (duTruongIds !== undefined) lop.duTruong = duTruongIds;
    await lop.save();

    // Đồng bộ lopPhuTrach trên User: xóa lớp này khỏi tất cả HT/DT cũ rồi gán lại
    await User.updateMany({ lopPhuTrach: lop._id }, { $pull: { lopPhuTrach: lop._id } });

    const nguoiPhuTrach = [
      ...(huynhTruongId ? [huynhTruongId] : []),
      ...(duTruongIds || []),
    ];
    if (nguoiPhuTrach.length) {
      await User.updateMany(
        { _id: { $in: nguoiPhuTrach } },
        { $addToSet: { lopPhuTrach: lop._id } }
      );
    }

    const updated = await Class.findById(lop._id)
      .populate('huynhTruong', 'hoTen email')
      .populate('duTruong', 'hoTen email');

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
