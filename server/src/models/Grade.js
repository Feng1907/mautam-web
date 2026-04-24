const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    namHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc', required: true },
    loaiDiem: { type: String, enum: ['mieng', '15phut', '1tiet'], required: true },
    diem: { type: Number, min: 0, max: 10, required: true },
    hocKy: { type: Number, enum: [1, 2], required: true },
    ghiChu: String,
    nhapBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Truy vấn nhanh toàn bộ điểm của lớp theo năm học và học kỳ
gradeSchema.index({ lop: 1, namHoc: 1, hocKy: 1 });
// Truy vấn điểm theo từng học sinh
gradeSchema.index({ student: 1, namHoc: 1 });

module.exports = mongoose.model('Grade', gradeSchema);
