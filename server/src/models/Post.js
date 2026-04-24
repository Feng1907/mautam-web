const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    tieuDe: { type: String, required: true },
    tomTat: String,
    noiDung: { type: String, required: true },
    // 'tintuc' | 'thongbao' | 'thongbaokhan'
    loai: {
      type: String,
      enum: ['tintuc', 'thongbao', 'thongbaokhan'],
      default: 'tintuc',
    },
    anhDaiDien: String,
    tacGia: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    daDang: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
