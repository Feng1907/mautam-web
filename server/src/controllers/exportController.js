const ExcelJS    = require('exceljs');
const Class      = require('../models/Class');
const Student    = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade      = require('../models/Grade');
const ChuyenCan  = require('../models/ChuyenCan');
const NamHoc     = require('../models/NamHoc');
const { LOAI_DIEM, tinhTBHocTap, tinhTongKet, phanLoai: phanLoaiTK } = require('../utils/gradeCalculator');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Lấy năm học: ưu tiên query, fallback năm đang hoạt động
const resolveNamHoc = async (namHocId) => {
  if (namHocId) return NamHoc.findById(namHocId);
  return NamHoc.findOne({ dangHoatDong: true });
};

// Sinh danh sách Chúa Nhật trong khoảng
const genSundays = (start, end) => {
  const sundays = [];
  const cur = new Date(start);
  while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1);
  while (cur <= new Date(end)) {
    sundays.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 7);
  }
  return sundays;
};

// Style ô tiêu đề
const headerStyle = {
  font:      { bold: true, color: { argb: 'FFFFFFFF' } },
  fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: {
    top:    { style: 'thin' }, bottom: { style: 'thin' },
    left:   { style: 'thin' }, right:  { style: 'thin' },
  },
};

const cellBorder = {
  border: {
    top: { style: 'hair' }, bottom: { style: 'hair' },
    left: { style: 'hair' }, right:  { style: 'hair' },
  },
};

const applyBorder = (cell) => Object.assign(cell, cellBorder);

// ── Export chuyên cần ─────────────────────────────────────────────────────────
// GET /api/export/attendance/:lopId?namHocId=...
exports.exportAttendance = async (req, res, next) => {
  try {
    const namHoc   = await resolveNamHoc(req.query.namHocId);
    if (!namHoc) return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const lop      = await Class.findById(req.params.lopId).populate('huynhTruong', 'hoTen');
    if (!lop)      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    const students = await Student.find({ lop: lop._id, trangThai: 'active' }).sort('hoTen');
    const sundays  = genSundays(namHoc.ngayBatDau, namHoc.ngayKetThuc);
    const records  = await Attendance.find({ lop: lop._id, namHoc: namHoc._id });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Xứ Đoàn Mẫu Tâm';
    const ws = wb.addWorksheet('Chuyên cần');

    // ── Tiêu đề file ──
    ws.mergeCells(1, 1, 1, sundays.length + 4);
    const titleCell = ws.getCell('A1');
    titleCell.value = `BẢNG CHUYÊN CẦN - LỚP ${lop.tenLop.toUpperCase()} - NĂM HỌC ${namHoc.ten}`;
    titleCell.font  = { bold: true, size: 13, color: { argb: 'FFC0392B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    ws.mergeCells(2, 1, 2, sundays.length + 4);
    ws.getCell('A2').value = `Huynh trưởng: ${lop.huynhTruong?.hoTen || '—'}   |   Sĩ số: ${students.length}`;
    ws.getCell('A2').alignment = { horizontal: 'center' };
    ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    ws.getRow(2).height = 18;

    // ── Header hàng 3 ──
    const headerRow = ws.getRow(3);
    const headers = [
      { header: 'STT',      width: 5  },
      { header: 'Tên Thánh', width: 14 },
      { header: 'Họ tên',   width: 22 },
      ...sundays.map(d => ({ header: d.slice(5).replace('-', '/'), width: 6 })),
      { header: 'Có mặt',  width: 8  },
      { header: 'Vắng',    width: 8  },
      { header: '% Chuyên cần', width: 12 },
    ];
    headers.forEach((h, i) => {
      ws.getColumn(i + 1).width = h.width;
      const cell = headerRow.getCell(i + 1);
      cell.value = h.header;
      Object.assign(cell, headerStyle);
    });
    headerRow.height = 36;

    // ── Dữ liệu ──
    students.forEach((s, idx) => {
      const row = ws.getRow(4 + idx);
      let coMat = 0;

      row.getCell(1).value = idx + 1;
      row.getCell(2).value = s.tenThanh;
      row.getCell(3).value = s.hoTen;

      sundays.forEach((date, di) => {
        const present = records.some(r => r.student.toString() === s._id.toString() && r.date === date && r.present);
        const cell = row.getCell(4 + di);
        cell.value = present ? '✓' : '';
        cell.alignment = { horizontal: 'center' };
        if (present) {
          coMat++;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5F5E3' } };
          cell.font = { color: { argb: 'FF1E8449' }, bold: true };
        }
        applyBorder(cell);
      });

      const soVang = sundays.length - coMat;
      const pct = sundays.length ? Math.round((coMat / sundays.length) * 100) : 0;

      const cCoMat = row.getCell(4 + sundays.length);
      cCoMat.value = coMat;
      cCoMat.font  = { bold: true, color: { argb: 'FF1E8449' } };
      cCoMat.alignment = { horizontal: 'center' };
      applyBorder(cCoMat);

      const cVang = row.getCell(5 + sundays.length);
      cVang.value = soVang;
      if (soVang > 0) cVang.font = { bold: true, color: { argb: 'FFC0392B' } };
      cVang.alignment = { horizontal: 'center' };
      applyBorder(cVang);

      const cPct = row.getCell(6 + sundays.length);
      cPct.value = `${pct}%`;
      cPct.alignment = { horizontal: 'center' };
      cPct.font = { bold: true, color: { argb: pct >= 80 ? 'FF1E8449' : pct >= 60 ? 'FF9B7D00' : 'FFC0392B' } };
      applyBorder(cPct);

      // Màu xen kẽ hàng
      if (idx % 2 === 1) {
        [1, 2, 3].forEach(ci => {
          row.getCell(ci).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
        });
      }
      [1, 2, 3].forEach(ci => applyBorder(row.getCell(ci)));
      row.height = 18;
    });

    // ── Hàng tổng kết ──
    const sumRow = ws.getRow(4 + students.length);
    sumRow.getCell(1).value = '';
    sumRow.getCell(2).value = '';
    const sumLabel = sumRow.getCell(3);
    sumLabel.value = 'Sĩ số có mặt';
    sumLabel.font  = { bold: true };
    applyBorder(sumLabel);

    sundays.forEach((date, di) => {
      const cnt = records.filter(r => r.date === date && r.present).length;
      const cell = sumRow.getCell(4 + di);
      cell.value = cnt;
      cell.font  = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };
      applyBorder(cell);
    });
    sumRow.height = 20;

    // ── Gửi file ──
    const fileName = `ChuyenCan_${lop.tenLop.replace(/\s/g, '_')}_${namHoc.ten}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// ── Export bảng điểm ──────────────────────────────────────────────────────────
// GET /api/export/grades/:lopId?namHocId=...&hocKy=1
exports.exportGrades = async (req, res, next) => {
  try {
    const namHoc   = await resolveNamHoc(req.query.namHocId);
    if (!namHoc) return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const hocKy  = Number(req.query.hocKy) || 1;
    const lop    = await Class.findById(req.params.lopId).populate('huynhTruong', 'hoTen');
    if (!lop)    return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    const students = await Student.find({ lop: lop._id, trangThai: 'active' }).sort('hoTen');
    const grades   = await Grade.find({ lop: lop._id, namHoc: namHoc._id, hocKy });

    const LOAI = [
      { key: 'mieng',  label: 'Miệng',   heSo: 1 },
      { key: '15phut', label: '15 phút', heSo: 1 },
      { key: '1tiet',  label: '1 tiết',  heSo: 2 },
    ];

    const tinhTB = (list) => {
      if (!list.length) return null;
      let tongHS = 0, tongD = 0;
      list.forEach(g => {
        const hs = LOAI.find(l => l.key === g.loaiDiem)?.heSo || 1;
        tongHS += hs; tongD += g.diem * hs;
      });
      return tongHS ? (tongD / tongHS).toFixed(1) : null;
    };

    const phanLoai = (tb) => {
      if (!tb) return '—';
      const v = parseFloat(tb);
      if (v >= 9)   return 'Xuất sắc';
      if (v >= 8)   return 'Giỏi';
      if (v >= 6.5) return 'Khá';
      if (v >= 5)   return 'Trung bình';
      return 'Yếu';
    };

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Xứ Đoàn Mẫu Tâm';
    const ws = wb.addWorksheet(`Bảng điểm HK${hocKy}`);

    // ── Tiêu đề ──
    ws.mergeCells('A1:J1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `BẢNG ĐIỂM GIÁO LÝ - LỚP ${lop.tenLop.toUpperCase()} - HK${hocKy} - NĂM HỌC ${namHoc.ten}`;
    titleCell.font  = { bold: true, size: 13, color: { argb: 'FFC0392B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    ws.mergeCells('A2:J2');
    ws.getCell('A2').value = `Huynh trưởng: ${lop.huynhTruong?.hoTen || '—'}   |   Sĩ số: ${students.length}`;
    ws.getCell('A2').alignment = { horizontal: 'center' };
    ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    ws.getRow(2).height = 18;

    // ── Header ──
    const cols = [
      { header: 'STT',       width: 5  },
      { header: 'Tên Thánh', width: 14 },
      { header: 'Họ tên',    width: 22 },
      { header: 'Miệng (×1)', width: 20 },
      { header: '15 phút (×1)', width: 20 },
      { header: '1 tiết (×2)', width: 20 },
      { header: 'TBM',       width: 8  },
      { header: 'Học lực',   width: 12 },
    ];
    const hRow = ws.getRow(3);
    cols.forEach((c, i) => {
      ws.getColumn(i + 1).width = c.width;
      const cell = hRow.getCell(i + 1);
      cell.value = c.header;
      Object.assign(cell, headerStyle);
    });
    hRow.height = 36;

    // ── Dữ liệu ──
    students.forEach((s, idx) => {
      const row = ws.getRow(4 + idx);
      row.getCell(1).value = idx + 1;
      row.getCell(2).value = s.tenThanh;
      row.getCell(3).value = s.hoTen;
      [1, 2, 3].forEach(ci => applyBorder(row.getCell(ci)));

      LOAI.forEach((l, li) => {
        const list = grades.filter(g =>
          g.student.toString() === s._id.toString() && g.loaiDiem === l.key
        );
        const cell = row.getCell(4 + li);
        cell.value = list.map(g => g.diem).join(', ') || '—';
        cell.alignment = { horizontal: 'center', wrapText: true };
        if (idx % 2 === 1)
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
        applyBorder(cell);
      });

      const allGrades = grades.filter(g => g.student.toString() === s._id.toString());
      const tb  = tinhTB(allGrades);
      const tbV = tb ? parseFloat(tb) : null;

      const tbCell = row.getCell(7);
      tbCell.value = tb ? Number(tb) : '—';
      tbCell.alignment = { horizontal: 'center' };
      tbCell.font = {
        bold: true,
        color: { argb: !tbV ? 'FF888888' : tbV >= 8 ? 'FF1E8449' : tbV >= 5 ? 'FF1A5276' : 'FFC0392B' },
      };
      applyBorder(tbCell);

      const loaiCell = row.getCell(8);
      loaiCell.value = phanLoai(tb);
      loaiCell.alignment = { horizontal: 'center' };
      loaiCell.font = {
        bold: true,
        color: { argb: !tbV ? 'FF888888' : tbV >= 8 ? 'FF1E8449' : tbV >= 6.5 ? 'FF1A5276' : tbV >= 5 ? 'FF9B7D00' : 'FFC0392B' },
      };
      applyBorder(loaiCell);
      row.height = 18;
    });

    // ── Hàng thống kê ──
    const statRow = ws.getRow(4 + students.length);
    statRow.getCell(3).value = 'Trung bình lớp';
    statRow.getCell(3).font  = { bold: true };
    applyBorder(statRow.getCell(3));

    LOAI.forEach((l, li) => {
      const list = grades.filter(g => g.loaiDiem === l.key);
      const avg  = list.length ? (list.reduce((s, g) => s + g.diem, 0) / list.length).toFixed(1) : '—';
      const cell = statRow.getCell(4 + li);
      cell.value = avg;
      cell.font  = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };
      applyBorder(cell);
    });

    const allTBs = students
      .map(s => tinhTB(grades.filter(g => g.student.toString() === s._id.toString())))
      .filter(v => v !== null).map(Number);
    const lopTB = allTBs.length ? (allTBs.reduce((a, b) => a + b, 0) / allTBs.length).toFixed(1) : '—';
    const lopTBCell = statRow.getCell(7);
    lopTBCell.value = lopTB !== '—' ? Number(lopTB) : '—';
    lopTBCell.font  = { bold: true, color: { argb: 'FFC0392B' } };
    lopTBCell.alignment = { horizontal: 'center' };
    lopTBCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };
    applyBorder(lopTBCell);
    statRow.height = 20;

    // ── Gửi file ──
    const fileName = `BangDiem_${lop.tenLop.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.ten}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// ── Shared: helpers tổng kết ─────────────────────────────────────────────────
// tinhTBHocTap, tinhTongKet, phanLoaiTK, LOAI_DIEM đã import từ gradeCalculator

const HOC_LUC_COLOR = {
  'Xuất sắc': 'FFFFB300',
  'Giỏi':     'FF1E8449',
  'Khá':      'FF1A5276',
  'Trung bình': 'FF9B7D00',
  'Yếu':      'FFC0392B',
};

// Tô màu hàng xen kẽ
const rowFill = (idx) => idx % 2 === 1
  ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F4EE' } }
  : undefined;

// Thêm header tổng kết (dùng chung cho 2 hàm export)
const buildTongKetSheet = (ws, lop, students, grades, ccRecords, hocKy, namHoc) => {
  // ── Tiêu đề ──
  ws.mergeCells('A1:J1');
  const t1 = ws.getCell('A1');
  t1.value = `BẢNG TỔNG KẾT CUỐI KỲ ${hocKy} — LỚP ${lop.tenLop.toUpperCase()} — NĂM HỌC ${namHoc.ten}`;
  t1.font  = { bold: true, size: 13, color: { argb: 'FFC0392B' } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:J2');
  const t2 = ws.getCell('A2');
  t2.value = `Huynh trưởng: ${lop.huynhTruong?.hoTen || '—'}   |   Sĩ số: ${students.length}   |   HT×80% + CC×20%`;
  t2.alignment = { horizontal: 'center' };
  t2.font = { italic: true, size: 10, color: { argb: 'FF555555' } };
  ws.getRow(2).height = 18;

  // ── Header cột ──
  const cols = [
    { header: 'STT',        width: 5  },
    { header: 'Tên Thánh',  width: 14 },
    { header: 'Họ tên',     width: 24 },
    { header: 'Giới tính',  width: 10 },
    { header: 'Miệng',      width: 10 },
    { header: '15 phút',    width: 10 },
    { header: '1 tiết',     width: 10 },
    { header: 'TBM học tập (80%)', width: 16 },
    { header: 'CC (20%)',   width: 10 },
    { header: 'Tổng kết',   width: 12 },
    { header: 'Học lực',    width: 14 },
  ];
  const hRow = ws.getRow(3);
  cols.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width;
    const cell = hRow.getCell(i + 1);
    cell.value = c.header;
    Object.assign(cell, headerStyle);
  });
  hRow.height = 36;

  // ── Dữ liệu ──
  const tkValues = [];
  students.forEach((s, idx) => {
    const row    = ws.getRow(4 + idx);
    const fill   = rowFill(idx);
    const sGrades = grades.filter(g => g.student.toString() === s._id.toString());
    const ccRec   = ccRecords.find(c => c.student.toString() === s._id.toString());
    const tbHT    = tinhTBHocTap(sGrades);
    const diemCC  = ccRec?.diem ?? null;
    const tk      = tinhTongKet(tbHT, diemCC);
    const loai    = phanLoaiTK(tk);
    if (tk !== null) tkValues.push(tk);

    const setCell = (ci, value, extra = {}) => {
      const cell = row.getCell(ci);
      cell.value = value;
      if (fill) cell.fill = fill;
      applyBorder(cell);
      Object.assign(cell, extra);
    };

    setCell(1, idx + 1, { alignment: { horizontal: 'center' } });
    setCell(2, s.tenThanh);
    setCell(3, s.hoTen);
    setCell(4, s.gioiTinh === 'Nam' ? '♂ Nam' : '♀ Nữ', { alignment: { horizontal: 'center' } });

    LOAI_DIEM.forEach((l, li) => {
      const list = sGrades.filter(g => g.loaiDiem === l.key);
      setCell(5 + li, list.map(g => g.diem).join(', ') || '—', { alignment: { horizontal: 'center' } });
    });

    const tbV = tbHT !== null ? parseFloat(tbHT.toFixed(1)) : null;
    setCell(8, tbV ?? '—', {
      alignment: { horizontal: 'center' },
      font: { bold: true, color: { argb: !tbV ? 'FF888888' : tbV >= 8 ? 'FF1E8449' : tbV >= 5 ? 'FF1A5276' : 'FFC0392B' } },
    });

    setCell(9, diemCC ?? '—', {
      alignment: { horizontal: 'center' },
      font: { bold: !!ccRec, color: { argb: ccRec?.diem >= 8 ? 'FF1E8449' : ccRec?.diem >= 5 ? 'FF1A5276' : 'FF888888' } },
    });

    const tkV = tk !== null ? parseFloat(tk.toFixed(1)) : null;
    setCell(10, tkV ?? '—', {
      alignment: { horizontal: 'center' },
      font: { bold: true, size: 11, color: { argb: !tkV ? 'FF888888' : tkV >= 8 ? 'FF1E8449' : tkV >= 5 ? 'FF1A5276' : 'FFC0392B' } },
    });

    const loaiCell = row.getCell(11);
    loaiCell.value = loai;
    if (fill) loaiCell.fill = fill;
    loaiCell.alignment = { horizontal: 'center' };
    loaiCell.font = { bold: true, color: { argb: HOC_LUC_COLOR[loai] || 'FF888888' } };
    applyBorder(loaiCell);
    row.height = 18;
  });

  // ── Hàng tổng kết cuối bảng ──
  const statRow = ws.getRow(4 + students.length);
  statRow.getCell(3).value = 'TB lớp';
  statRow.getCell(3).font  = { bold: true };
  applyBorder(statRow.getCell(3));

  const tbLop = tkValues.length
    ? parseFloat((tkValues.reduce((a, b) => a + b, 0) / tkValues.length).toFixed(1))
    : null;
  const tbLopCell = statRow.getCell(10);
  tbLopCell.value = tbLop ?? '—';
  tbLopCell.font  = { bold: true, size: 12, color: { argb: 'FFC0392B' } };
  tbLopCell.alignment = { horizontal: 'center' };
  tbLopCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDECEA' } };
  applyBorder(tbLopCell);
  statRow.height = 22;
};

// ── Export tổng kết 1 lớp ────────────────────────────────────────────────────
// GET /api/export/tong-ket/:lopId?hocKy=1&namHocId=...
exports.exportTongKet = async (req, res, next) => {
  try {
    const namHoc = await resolveNamHoc(req.query.namHocId);
    if (!namHoc) return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const hocKy   = Number(req.query.hocKy) || 1;
    const lop     = await Class.findById(req.params.lopId).populate('huynhTruong', 'hoTen');
    if (!lop)     return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    const students = await Student.find({ lop: lop._id, trangThai: 'active' }).sort('hoTen');
    const grades   = await Grade.find({ lop: lop._id, namHoc: namHoc._id, hocKy });
    const ccRecords = await ChuyenCan.find({ lop: lop._id, namHoc: namHoc._id, hocKy });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Xứ Đoàn Mẫu Tâm';
    const ws = wb.addWorksheet(`Tổng kết HK${hocKy}`);

    buildTongKetSheet(ws, lop, students, grades, ccRecords, hocKy, namHoc);

    const fileName = `TongKet_${lop.tenLop.replace(/\s/g, '_')}_HK${hocKy}_${namHoc.ten}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// ── Export tổng kết toàn đoàn (mỗi lớp 1 sheet) ─────────────────────────────
// GET /api/export/tong-ket-toan-doan?hocKy=1&namHocId=...
exports.exportTongKetToanDoan = async (req, res, next) => {
  try {
    const namHoc = await resolveNamHoc(req.query.namHocId);
    if (!namHoc) return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const hocKy  = Number(req.query.hocKy) || 1;
    const classes = await Class.find({ namHoc: namHoc._id })
      .sort('thuTu')
      .populate('huynhTruong', 'hoTen');
    if (!classes.length)
      return res.status(404).json({ success: false, message: 'Chưa có lớp nào trong năm học này' });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Xứ Đoàn Mẫu Tâm';

    for (const lop of classes) {
      const students  = await Student.find({ lop: lop._id, trangThai: 'active' }).sort('hoTen');
      const grades    = await Grade.find({ lop: lop._id, namHoc: namHoc._id, hocKy });
      const ccRecords = await ChuyenCan.find({ lop: lop._id, namHoc: namHoc._id, hocKy });

      // Tên sheet tối đa 31 ký tự
      const sheetName = lop.tenLop.slice(0, 31);
      const ws = wb.addWorksheet(sheetName);
      buildTongKetSheet(ws, lop, students, grades, ccRecords, hocKy, namHoc);
    }

    const fileName = `TongKetToanDoan_HK${hocKy}_${namHoc.ten}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
