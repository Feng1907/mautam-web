const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    matKhau: { type: String, required: true, select: false },
    // 'admin' | 'giaoly' | 'user'
    vaiTro: { type: String, enum: ['admin', 'giaoly', 'user'], default: 'user' },
    // Lớp được phân công (chỉ có với vaiTro = 'giaoly')
    lopPhuTrach: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    soDienThoai: String,
    avatar: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('matKhau')) return next();
  this.matKhau = await bcrypt.hash(this.matKhau, 12);
  next();
});

userSchema.methods.kiemTraMatKhau = function (matKhauNhap) {
  return bcrypt.compare(matKhauNhap, this.matKhau);
};

module.exports = mongoose.model('User', userSchema);
