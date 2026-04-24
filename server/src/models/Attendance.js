const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    // Ngày Chúa Nhật dạng 'YYYY-MM-DD'
    date: { type: String, required: true },
    present: { type: Boolean, default: false },
    ghiChu: String,
    // Người điểm danh
    diemDanhBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Mỗi học sinh chỉ có 1 bản ghi điểm danh / ngày / lớp
attendanceSchema.index({ student: 1, lop: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
