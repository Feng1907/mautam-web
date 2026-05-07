/**
 * gradeCalculator.js — Hàm tính điểm dùng chung (DRY)
 * Được import bởi exportController và notifyController
 */

const LOAI_DIEM = [
  { key: 'mieng',  heSo: 1 },
  { key: '15phut', heSo: 1 },
  { key: '1tiet',  heSo: 2 },
];

const TI_LE_HT = 0.8;
const TI_LE_CC = 0.2;

// Tính TBM học tập có trọng số (chưa nhân tỷ lệ 80%)
const tinhTBHocTap = (gradeList) => {
  if (!gradeList.length) return null;
  let tongHS = 0, tongD = 0;
  gradeList.forEach(g => {
    const hs = LOAI_DIEM.find(l => l.key === g.loaiDiem)?.heSo || 1;
    tongHS += hs;
    tongD  += g.diem * hs;
  });
  return tongHS ? tongD / tongHS : null;
};

// Điểm tổng kết = TBM×80% + CC×20%
const tinhTongKet = (tbHT, diemCC) => {
  if (tbHT === null && diemCC == null) return null;
  if (tbHT === null)   return parseFloat((diemCC * TI_LE_CC).toFixed(2));
  if (diemCC == null)  return parseFloat(tbHT.toFixed(2));
  return parseFloat((tbHT * TI_LE_HT + diemCC * TI_LE_CC).toFixed(2));
};

// Phân loại học lực theo điểm tổng kết
const phanLoai = (diem) => {
  if (diem === null || diem === undefined) return '—';
  const v = parseFloat(diem);
  if (v >= 9)   return 'Xuất sắc';
  if (v >= 8)   return 'Giỏi';
  if (v >= 6.5) return 'Khá';
  if (v >= 5)   return 'Trung bình';
  return 'Yếu';
};

module.exports = { LOAI_DIEM, TI_LE_HT, TI_LE_CC, tinhTBHocTap, tinhTongKet, phanLoai };
