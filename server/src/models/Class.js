const mongoose = require('mongoose');

// 5 ngành TNTT: Chiên Non, Ấu Nhi, Thiếu Nhi, Nghĩa Sĩ, Hiệp Sĩ
const classSchema = new mongoose.Schema(
  {
    tenLop: { type: String, required: true },
    // VD: 'Khai Tâm', 'XT 1', 'XT 2A', 'Thêm Sức 1', 'Sống Đạo 1', 'Hiệp Sĩ'
    nhanh: {
      type: String,
      enum: ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'],
      required: true,
    },
    huynhTruong: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    duTruong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    namHoc: { type: String, required: true }, // VD: '2024-2025'
    moTa: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
