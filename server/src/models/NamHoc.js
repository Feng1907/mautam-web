const mongoose = require('mongoose');

const namHocSchema = new mongoose.Schema(
  {
    // VD: '2024-2025'
    ten: { type: String, required: true, unique: true, trim: true },
    ngayBatDau: { type: Date, required: true },
    ngayKetThuc: { type: Date, required: true },
    // Chỉ 1 năm học được active tại một thời điểm — dùng để lọc dữ liệu mặc định
    dangHoatDong: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Khi set 1 năm học thành dangHoatDong=true, tự động tắt các năm khác
namHocSchema.pre('save', async function () {
  if (this.isModified('dangHoatDong') && this.dangHoatDong) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { dangHoatDong: false }
    );
  }
});

module.exports = mongoose.model('NamHoc', namHocSchema);
