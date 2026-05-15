require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const DEFAULT_PW = 'MauTam@2026';

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}, {
    projection: { email: 1, hoTen: 1, vaiTro: 1 }
  }).toArray();

  console.log(`\nTìm thấy ${users.length} tài khoản. Đặt lại mật khẩu: ${DEFAULT_PW}\n`);

  const hashed = await bcrypt.hash(DEFAULT_PW, 12);

  for (const u of users) {
    await db.collection('users').updateOne(
      { _id: u._id },
      { $set: { matKhau: hashed, phaiBatDauDoiMatKhau: true } }
    );
    console.log(`✅ ${u.hoTen} | ${u.email} | ${u.vaiTro}`);
  }

  console.log(`\n✅ Xong! Tất cả đăng nhập bằng mật khẩu: ${DEFAULT_PW}`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
