const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true, trim: true },
    tenThanh: { type: String, required: true, trim: true },
    // Ngày sinh tùy chọn — chuỗi rỗng '' hoặc undefined được set thành null tự động
    ngaySinh: {
      type: Date,
      required: false,
      default: null,
      set: v => (v === '' || v === undefined) ? null : v,
    },
    gioiTinh: { type: String, enum: ['Nam', 'Nu'], required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    phuHuynh: {
      hoTen: { type: String, trim: true },
      soDienThoai: { type: String, trim: true },
    },
    trangThai: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: String,
  },
  { timestamps: true }
);

// Tìm kiếm nhanh theo lớp và trạng thái
studentSchema.index({ lop: 1, trangThai: 1 });
// Tìm kiếm theo tên
studentSchema.index({ hoTen: 'text', tenThanh: 'text' });

module.exports = mongoose.model('Student', studentSchema);
