import { createRequire } from 'node:module';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

const require = createRequire(import.meta.url);
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const NamHoc = require('../src/models/NamHoc');
const Class = require('../src/models/Class');
const Student = require('../src/models/Student');
const PromotionHistory = require('../src/models/PromotionHistory');
const { connectTestDb, clearTestDb, closeTestDb } = require('./helpers/db');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'vitest-secret';

const makeToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('POST /api/promote transaction rollback', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it('rollback toan bo khi loi xay ra giua chung, khong de lai du lieu rac', async () => {
    const admin = await User.create({
      hoTen: 'Admin Test',
      email: 'admin@test.local',
      matKhau: 'Admin@123',
      vaiTro: 'admin',
    });

    const namHocCu = await NamHoc.create({
      ten: '2025-2026',
      ngayBatDau: new Date('2025-09-01'),
      ngayKetThuc: new Date('2026-05-31'),
      dangHoatDong: true,
    });

    const namHocMoi = await NamHoc.create({
      ten: '2026-2027',
      ngayBatDau: new Date('2026-09-01'),
      ngayKetThuc: new Date('2027-05-31'),
      dangHoatDong: false,
    });

    const fromLop = await Class.create({
      tenLop: 'Khai Tam',
      nhanh: 'ChienNon',
      thuTu: 1,
      namHoc: namHocCu._id,
    });

    const toLop = await Class.create({
      tenLop: 'Xung Toi 1',
      nhanh: 'AuNhi',
      thuTu: 2,
      namHoc: namHocMoi._id,
    });

    const student = await Student.create({
      hoTen: 'Nguyen Van A',
      tenThanh: 'Phero',
      gioiTinh: 'Nam',
      lop: fromLop._id,
    });

    const invalidStudentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/promote')
      .set('Authorization', `Bearer ${makeToken(admin)}`)
      .send({
        namHocMoiId: namHocMoi._id.toString(),
        ghiChu: 'Test rollback',
        items: [
          {
            studentId: student._id.toString(),
            fromLopId: fromLop._id.toString(),
            toLopId: toLop._id.toString(),
          },
          {
            studentId: invalidStudentId.toString(),
            fromLopId: fromLop._id.toString(),
            toLopId: toLop._id.toString(),
          },
        ],
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);

    const unchangedStudent = await Student.findById(student._id);
    expect(unchangedStudent.lop.toString()).toBe(fromLop._id.toString());

    const histories = await PromotionHistory.find();
    expect(histories).toHaveLength(0);
  });
});
