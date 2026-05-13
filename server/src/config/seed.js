require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('./db');

const NamHoc   = require('../models/NamHoc');
const Class    = require('../models/Class');
const User     = require('../models/User');
const Student  = require('../models/Student');
const ParentStudent = require('../models/ParentStudent');

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
  // Xóa Student trước Class để tránh orphan references
  await Promise.all([
    ParentStudent.deleteMany({}),
    Student.deleteMany({}),
    NamHoc.deleteMany({}),
    Class.deleteMany({}),
    User.deleteMany({}),
  ]);

  // 1. Tạo năm học — tạo cả năm cũ lẫn năm hiện tại để test
  console.log('Tạo năm học...');
  await NamHoc.create({
    ten: '2024-2025',
    ngayBatDau: new Date('2024-09-01'),
    ngayKetThuc: new Date('2025-06-29'),
    dangHoatDong: false,
  });
  const namHoc = await NamHoc.create({
    ten: '2025-2026',
    ngayBatDau: new Date('2025-09-07'),  // Chúa Nhật đầu tiên tháng 9/2025
    ngayKetThuc: new Date('2026-06-28'), // Chúa Nhật cuối tháng 6/2026
    dangHoatDong: true,
  });

  // 2. Tạo 12 lớp
  console.log('Tạo 12 lớp...');
  const lops = await Class.insertMany(
    DS_LOP.map((l) => ({ ...l, namHoc: namHoc._id }))
  );

  // 3. Tạo tài khoản mẫu
  // Dùng User.create() thay vì insertMany() để pre('save') hook chạy → mật khẩu được hash
  console.log('Tạo tài khoản mẫu...');
  await Promise.all([
    User.create({
      hoTen: 'Admin Xứ Đoàn',
      email: 'admin@mautam.com',
      matKhau: 'Admin@123',
      vaiTro: 'admin',
    }),
    User.create({
      hoTen: 'Nguyễn Huynh Trưởng A',
      email: 'huynhtruong@mautam.com',
      matKhau: 'HT@12345',
      vaiTro: 'giaoly',
      chucVu: 'huynhtruong',
      phaiBatDauDoiMatKhau: true,
    }),
    User.create({
      hoTen: 'Trần Dự Trưởng B',
      email: 'dutruong@mautam.com',
      matKhau: 'DT@12345',
      vaiTro: 'giaoly',
      chucVu: 'dutruong',
      phaiBatDauDoiMatKhau: true,
    }),
  ]);

  console.log('\n✅ Seed hoàn thành!');
  console.log(`   Năm học    : ${namHoc.ten} (đang hoạt động)`);
  console.log(`   Số lớp     : ${lops.length}`);
  console.log(`   Admin      : admin@mautam.com / Admin@123`);
  console.log(`   HuynhTrưởng: huynhtruong@mautam.com / HT@12345`);
  console.log(`   DựTrưởng   : dutruong@mautam.com / DT@12345`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
