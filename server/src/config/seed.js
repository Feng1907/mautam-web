require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('./db');

const NamHoc = require('../models/NamHoc');
const Class = require('../models/Class');
const User = require('../models/User');

// 12 lớp theo đúng PLAN.md
const DS_LOP = [
  { tenLop: 'Khai Tâm',    nhanh: 'ChienNon',  thuTu: 1 },
  { tenLop: 'XT 1',        nhanh: 'AuNhi',     thuTu: 2 },
  { tenLop: 'XT 2A',       nhanh: 'AuNhi',     thuTu: 3 },
  { tenLop: 'XT 2B',       nhanh: 'AuNhi',     thuTu: 4 },
  { tenLop: 'XT 3A',       nhanh: 'AuNhi',     thuTu: 5 },
  { tenLop: 'XT 3B',       nhanh: 'AuNhi',     thuTu: 6 },
  { tenLop: 'Thêm Sức 1',  nhanh: 'ThieuNhi',  thuTu: 7 },
  { tenLop: 'Thêm Sức 2',  nhanh: 'ThieuNhi',  thuTu: 8 },
  { tenLop: 'Sống Đạo 1',  nhanh: 'NghiaSi',   thuTu: 9 },
  { tenLop: 'Sống Đạo 2',  nhanh: 'NghiaSi',   thuTu: 10 },
  { tenLop: 'Sống Đạo 3',  nhanh: 'NghiaSi',   thuTu: 11 },
  { tenLop: 'Hiệp Sĩ',     nhanh: 'HiepSi',    thuTu: 12 },
];

async function seed() {
  await connectDB();
  console.log('Đang xóa dữ liệu cũ...');
  await Promise.all([
    NamHoc.deleteMany({}),
    Class.deleteMany({}),
    User.deleteMany({}),
  ]);

  // 1. Tạo năm học
  console.log('Tạo năm học 2024-2025...');
  const namHoc = await NamHoc.create({
    ten: '2024-2025',
    ngayBatDau: new Date('2024-09-01'),
    ngayKetThuc: new Date('2025-06-30'),
    dangHoatDong: true,
  });

  // 2. Tạo 12 lớp
  console.log('Tạo 12 lớp...');
  const lops = await Class.insertMany(
    DS_LOP.map((l) => ({ ...l, namHoc: namHoc._id }))
  );

  // 3. Tạo tài khoản Admin mặc định
  console.log('Tạo tài khoản admin...');
  await User.create({
    hoTen: 'Admin Xứ Đoàn',
    email: 'admin@mautam.com',
    matKhau: 'Admin@123',
    vaiTro: 'admin',
  });

  console.log('\n✅ Seed hoàn thành!');
  console.log(`   Năm học: ${namHoc.ten}`);
  console.log(`   Số lớp : ${lops.length}`);
  console.log(`   Login  : admin@mautam.com / Admin@123`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
