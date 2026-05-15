require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const EMAIL  = process.argv[2] || 'anphong.duong22@gmail.com';
const NEW_PW = 'Test@12345';

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  // Tìm user thẳng trong collection, không qua model
  const user = await db.collection('users').findOne({ email: EMAIL.toLowerCase() });
  if (!user) {
    console.log('❌ Không tìm thấy email:', EMAIL);
    console.log('📋 Danh sách tất cả email trong DB:');
    const all = await db.collection('users').find({}, { projection: { email: 1, hoTen: 1 } }).toArray();
    all.forEach(u => console.log('  -', u.email, '|', u.hoTen));
    process.exit(1);
  }

  console.log('✅ Tìm thấy user:', user.hoTen, '|', user.email);
  console.log('   Hash hiện tại:', user.matKhau ? user.matKhau.substring(0, 20) + '...' : '(trống)');

  // Hash mật khẩu mới
  const hashed = await bcrypt.hash(NEW_PW, 12);

  // Update thẳng vào collection
  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: { matKhau: hashed, phaiBatDauDoiMatKhau: false } }
  );

  // Verify ngay lập tức
  const updated = await db.collection('users').findOne({ _id: user._id });
  const ok = await bcrypt.compare(NEW_PW, updated.matKhau);

  console.log('   Hash mới:', updated.matKhau.substring(0, 20) + '...');
  console.log(ok ? '✅ Verify OK — đăng nhập bằng:' : '❌ Verify THẤT BẠI');
  console.log('   Email   :', EMAIL);
  console.log('   Mật khẩu:', NEW_PW);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
