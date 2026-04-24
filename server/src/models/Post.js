const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    tieuDe: { type: String, required: true, trim: true },
    tomTat: { type: String, trim: true },
    noiDung: { type: String, required: true },
    loai: {
      type: String,
      enum: ['tintuc', 'thongbao', 'thongbaokhan'],
      default: 'tintuc',
    },
    anhDaiDien: String,
    tacGia: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    daDang: { type: Boolean, default: false },
    // Thông báo khẩn có thể có thời hạn hiển thị
    hanHienThi: { type: Date, default: null },
  },
  { timestamps: true }
);

// Truy vấn bài đã đăng, mới nhất trước
postSchema.index({ daDang: 1, createdAt: -1 });
// Tìm kiếm toàn văn
postSchema.index({ tieuDe: 'text', tomTat: 'text' });

module.exports = mongoose.model('Post', postSchema);
