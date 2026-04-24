const Attendance = require('../models/Attendance');
const NamHoc = require('../models/NamHoc');

// GET /api/attendance/:lopId?namHocId=...
exports.getByClass = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      namHocId = namHoc._id;
    }

    const records = await Attendance.find({ lop: req.params.lopId, namHoc: namHocId });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance  (upsert)
exports.upsert = async (req, res, next) => {
  try {
    const { studentId, lopId, date, present, ghiChu } = req.body;
    if (!studentId || !lopId || !date)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });

    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, lop: lopId, date },
      { present, ghiChu, diemDanhBoi: req.user._id, namHoc: namHoc._id },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/sundays?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Tự sinh danh sách tất cả ngày Chúa Nhật trong khoảng thời gian
exports.getSundays = async (req, res, next) => {
  try {
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Mặc định: dùng năm học đang hoạt động
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      startDate = namHoc.ngayBatDau;
      endDate = namHoc.ngayKetThuc;
    }

    const sundays = [];
    const cur = new Date(startDate);
    // Tìm Chúa Nhật đầu tiên
    while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1);
    while (cur <= endDate) {
      sundays.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 7);
    }

    res.json({ success: true, total: sundays.length, data: sundays });
  } catch (err) {
    next(err);
  }
};
