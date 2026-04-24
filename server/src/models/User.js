const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    matKhau: { type: String, required: true, select: false },
    vaiTro: { type: String, enum: ['admin', 'giaoly', 'user'], default: 'user' },
    // Lớp được phân công — chỉ có ý nghĩa với vaiTro='giaoly'
    lopPhuTrach: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    soDienThoai: { type: String, trim: true },
    // Buộc đổi mật khẩu sau lần đăng nhập đầu tiên (Admin tạo hộ)
    phaiBatDauDoiMatKhau: { type: Boolean, default: false },
    avatar: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('matKhau')) return;
  this.matKhau = await bcrypt.hash(this.matKhau, 12);
});

userSchema.methods.kiemTraMatKhau = function (matKhauNhap) {
  return bcrypt.compare(matKhauNhap, this.matKhau);
};

module.exports = mongoose.model('User', userSchema);
