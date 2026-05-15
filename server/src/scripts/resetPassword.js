require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const EMAIL  = process.argv[2];
const NEW_PW = process.argv[3];

if (!EMAIL || !NEW_PW) {
  console.error('Dùng: node resetPassword.js <email> <matkhaumoi>');
  process.exit(1);
}

async function run() {
  await connectDB();
  const User = require('../models/User');
  const user = await User.findOne({ email: EMAIL.toLowerCase() }).select('+matKhau');
  if (!user) { console.error('❌ Không tìm thấy email:', EMAIL); process.exit(1); }

  const hashed = await bcrypt.hash(NEW_PW, 12);
  await User.updateOne({ _id: user._id }, { matKhau: hashed, phaiBatDauDoiMatKhau: false });
  console.log(`✅ Đã reset mật khẩu cho ${user.hoTen} (${EMAIL})`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
