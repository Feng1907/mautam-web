const Attendance = require('../models/Attendance');

exports.getByClass = async (req, res, next) => {
  try {
    const records = await Attendance.find({ lop: req.params.lopId });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

// Upsert: tạo mới hoặc cập nhật bản ghi điểm danh
exports.upsert = async (req, res, next) => {
  try {
    const { studentId, lopId, date, present, ghiChu } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { student: studentId, lop: lopId, date },
      { present, ghiChu, diemDanhBoi: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách ngày Chúa Nhật trong năm học (tạo tự động)
exports.getSundays = async (req, res) => {
  const { startDate, endDate } = req.query;
  const start = new Date(startDate || `${new Date().getFullYear()}-09-01`);
  const end = new Date(endDate || `${new Date().getFullYear() + 1}-06-30`);
  const sundays = [];
  const cur = new Date(start);
  while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    sundays.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 7);
  }
  res.json({ success: true, data: sundays });
};
