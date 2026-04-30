const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    tenLop: { type: String, required: true, trim: true },
    nhanh: {
      type: String,
      enum: ['ChienNon', 'AuNhi', 'ThieuNhi', 'NghiaSi', 'HiepSi'],
      required: true,
    },
    // Thứ tự hiển thị trong danh sách (1–12)
    thuTu: { type: Number, required: true },
    namHoc: { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc', required: true },
    huynhTruong: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    duTruong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moTa: String,
  },
  { timestamps: true }
);

// Mỗi tên lớp chỉ xuất hiện 1 lần trong 1 năm học
classSchema.index({ tenLop: 1, namHoc: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
