const mongoose = require('mongoose');

const chuyenCanSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  lop:           { type: mongoose.Schema.Types.ObjectId, ref: 'Class',   required: true },
  namHoc:        { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc',  required: true },
  hocKy:         { type: Number, enum: [1, 2], required: true },
  tongBuoi:      { type: Number, default: 0, min: 0 },
  soBuoiDi:      { type: Number, default: 0, min: 0 },
  vangCoPhep:    { type: Number, default: 0, min: 0 },
  vangKhongPhep: { type: Number, default: 0, min: 0 },
  diem:          { type: Number, min: 0, max: 10, required: true },
  ghiChu:        { type: String, default: '' },
  nhapBoi:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Một bản ghi duy nhất mỗi em mỗi lớp mỗi học kỳ
chuyenCanSchema.index({ student: 1, lop: 1, namHoc: 1, hocKy: 1 }, { unique: true });
chuyenCanSchema.index({ student: 1, hocKy: 1, namHoc: 1 }, { unique: true });
chuyenCanSchema.index({ lop: 1, namHoc: 1, hocKy: 1 });

module.exports = mongoose.model('ChuyenCan', chuyenCanSchema);
