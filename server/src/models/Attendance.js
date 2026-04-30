const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    namHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc', required: true },
    // Ngày Chúa Nhật dạng 'YYYY-MM-DD'
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    present: { type: Boolean, default: false },
    ghiChu: String,
    diemDanhBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Mỗi học sinh chỉ có 1 bản ghi / ngày / lớp
attendanceSchema.index({ student: 1, lop: 1, date: 1 }, { unique: true });
// Truy vấn nhanh toàn bộ lớp theo ngày
attendanceSchema.index({ lop: 1, namHoc: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
