import { createRequire } from 'node:module';
import { describe, it, expect } from 'vitest';

const require = createRequire(import.meta.url);
const {
  LOAI_DIEM,
  TI_LE_HT,
  TI_LE_CC,
  tinhTBHocTap,
  tinhTongKet,
  phanLoai,
} = require('../src/utils/gradeCalculator');

describe('gradeCalculator', () => {
  it('khai bao dung he so va ti le tinh diem', () => {
    expect(LOAI_DIEM).toEqual([
      { key: 'mieng', heSo: 1 },
      { key: '15phut', heSo: 1 },
      { key: '1tiet', heSo: 2 },
    ]);
    expect(TI_LE_HT).toBe(0.8);
    expect(TI_LE_CC).toBe(0.2);
  });

  it('tinh TBM co trong so mieng/15phut he so 1 va 1tiet he so 2', () => {
    const grades = [
      { loaiDiem: 'mieng', diem: 8 },
      { loaiDiem: '15phut', diem: 7 },
      { loaiDiem: '1tiet', diem: 9 },
    ];

    expect(tinhTBHocTap(grades)).toBe(8.25);
  });

  it('tra ve null khi khong co diem hoc tap', () => {
    expect(tinhTBHocTap([])).toBeNull();
  });

  it('tinh diem tong ket bang TBM x 80% + CC x 20% va lam tron 2 chu so', () => {
    expect(tinhTongKet(8.25, 9)).toBe(8.4);
    expect(tinhTongKet(6.666, 8.333)).toBe(7);
  });

  it('giu TBM khi chua co diem chuyen can', () => {
    expect(tinhTongKet(7.456, null)).toBe(7.46);
    expect(tinhTongKet(7.456, undefined)).toBe(7.46);
  });

  it('chi tinh 20% CC khi chua co TBM', () => {
    expect(tinhTongKet(null, 8)).toBe(1.6);
  });

  it('tra ve null khi khong co ca TBM lan CC', () => {
    expect(tinhTongKet(null, null)).toBeNull();
    expect(tinhTongKet(null, undefined)).toBeNull();
  });

  it('phan loai hoc luc dung nguong quy che', () => {
    expect(phanLoai(null)).toBe('—');
    expect(phanLoai(9)).toBe('Xuất sắc');
    expect(phanLoai(8)).toBe('Giỏi');
    expect(phanLoai(6.5)).toBe('Khá');
    expect(phanLoai(5)).toBe('Trung bình');
    expect(phanLoai(4.99)).toBe('Yếu');
  });
});
