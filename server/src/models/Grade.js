const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    // 'mieng' | '15phut' | '1tiet'
    loaiDiem: { type: String, enum: ['mieng', '15phut', '1tiet'], required: true },
    diem: { type: Number, min: 0, max: 10, required: true },
    hocKy: { type: Number, enum: [1, 2], required: true },
    namHoc: { type: String, required: true },
    ghiChu: String,
    nhapBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
