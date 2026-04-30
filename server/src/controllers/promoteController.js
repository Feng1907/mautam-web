const mongoose        = require('mongoose');
const Student         = require('../models/Student');
const Class           = require('../models/Class');
const NamHoc          = require('../models/NamHoc');
const PromotionHistory = require('../models/PromotionHistory');

// POST /api/promote
// Body: { items: [{ studentId, fromLopId, toLopId }], namHocMoiId, ghiChu }
exports.promote = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, namHocMoiId, ghiChu } = req.body;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: 'Danh sách đoàn sinh trống' });

    const namHocMoi = await NamHoc.findById(namHocMoiId).session(session);
    if (!namHocMoi)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học đích' });

    // Cập nhật từng đoàn sinh sang lớp mới
    const chiTiet = [];
    for (const { studentId, fromLopId, toLopId } of items) {
      const [student, toLop] = await Promise.all([
        Student.findById(studentId).session(session),
        Class.findById(toLopId).session(session),
      ]);
      if (!student) throw new Error(`Không tìm thấy đoàn sinh ${studentId}`);
      if (!toLop)   throw new Error(`Không tìm thấy lớp đích ${toLopId}`);

      student.lop = toLopId;
      await student.save({ session });

      chiTiet.push({ student: studentId, fromLop: fromLopId, toLop: toLopId });
    }

    // Ghi lịch sử
    await PromotionHistory.create([{
      namHocMoi: namHocMoiId,
      chiTiet,
      ghiChu:      ghiChu || '',
      thucHienBoi: req.user?._id,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: `Đã chuyển ${chiTiet.length} đoàn sinh thành công`,
      soLuong: chiTiet.length,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// GET /api/promote/history?namHocId=&page=1&limit=20
exports.history = async (req, res, next) => {
  try {
    const { namHocId, page = 1, limit = 20 } = req.query;
    const filter = namHocId ? { namHocMoi: namHocId } : {};

    const [list, total] = await Promise.all([
      PromotionHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('namHocMoi', 'ten')
        .populate('thucHienBoi', 'hoTen')
        .populate('chiTiet.student', 'hoTen tenThanh')
        .populate('chiTiet.fromLop', 'tenLop')
        .populate('chiTiet.toLop', 'tenLop'),
      PromotionHistory.countDocuments(filter),
    ]);

    res.json({ success: true, data: list, total });
  } catch (err) {
    next(err);
  }
};
