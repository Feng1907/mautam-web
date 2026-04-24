const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true, trim: true },
    tenThanh: { type: String, required: true },
    ngaySinh: { type: Date, required: true },
    gioiTinh: { type: String, enum: ['Nam', 'Nu'] },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    phuHuynh: {
      hoTen: String,
      soDienThoai: String,
    },
    trangThai: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
