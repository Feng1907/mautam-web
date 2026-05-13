/**
 * notifyController.js
 * Gửi email thông báo cho phụ huynh:
 *  POST /api/notify/diem-danh  — thông báo điểm danh 1 buổi
 *  POST /api/notify/lich-le    — lịch lễ tuần tới
 */

const Attendance           = require('../models/Attendance');
const Student              = require('../models/Student');
const Class                = require('../models/Class');
const NamHoc               = require('../models/NamHoc');
const Grade                = require('../models/Grade');
const ChuyenCan            = require('../models/ChuyenCan');
const sendEmail            = require('../utils/sendEmail');
const { diemDanhTemplate, lichLeTemplate, bangDiemTemplate } = require('../utils/emailTemplates');
const { LOAI_DIEM, tinhTBHocTap, tinhTongKet, phanLoai } = require('../utils/gradeCalculator');
const { logger, emailBatchLogger } = require('../utils/logger');

const logEmailBatchError = (context, payload) => {
  const meta = { context, ...payload };

  logger.error(`[${context}] Loi gui email ${payload.email}: ${payload.error}`);
  emailBatchLogger.error('Email batch send failed', meta);
};

// ── Helper: lấy tuần tới (thứ Hai → Chúa Nhật) ───────────────────────────────
const getTuanToi = () => {
  const now  = new Date();
  const dow  = now.getDay(); // 0=CN, 1=Hai...
  // Thứ Hai tuần tới
  const diff = dow === 0 ? 1 : 8 - dow;
  const startMs = now.setHours(0, 0, 0, 0) + diff * 864e5;
  const days  = Array.from({ length: 7 }, (_, i) => new Date(startMs + i * 864e5));
  return days;
};

const toIso   = (d) => d.toISOString().slice(0, 10);
const toShort = (d) => d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });

// ── POST /api/notify/diem-danh ────────────────────────────────────────────────
// Body: { lopId, date, sendAll? }
// - date: 'YYYY-MM-DD' — ngày cần gửi thông báo
// - sendAll: true → gửi cả học sinh có mặt lẫn vắng; false → chỉ gửi vắng mặt
exports.guiDiemDanh = async (req, res, next) => {
  try {
    const { lopId, date, sendAll = true } = req.body;

    if (!lopId || !date)
      return res.status(400).json({ success: false, message: 'Thiếu lopId hoặc date' });

    // Lấy thông tin lớp + năm học
    const lop = await Class.findById(lopId)
      .populate('namHoc', 'ten')
      .populate('huynhTruong', 'hoTen');
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Lấy toàn bộ đoàn sinh active trong lớp, có email phụ huynh
    const students = await Student.find({ lop: lopId, trangThai: 'active' });

    // Lấy bản ghi điểm danh ngày đó
    const records = await Attendance.find({ lop: lopId, date });
    const presentMap = Object.fromEntries(records.map(r => [r.student.toString(), r.present]));

    const tenHuynhTruong = lop.huynhTruong?.hoTen || '';
    const namHoc         = lop.namHoc?.ten || '';
    const tenLop         = lop.tenLop;

    let sent = 0, skipped = 0;
    const errors = [];

    // Gửi bất đồng bộ, không block response, dùng allSettled tránh crash batch
    const tasks = students.map(async (sv) => {
      const email = sv.phuHuynh?.email;
      if (!email) { skipped++; return; }

      const present = presentMap[sv._id.toString()] ?? false;
      // Nếu sendAll=false, chỉ gửi khi vắng
      if (!sendAll && present) { skipped++; return; }

      const html = diemDanhTemplate({
        tenThanh: sv.tenThanh,
        hoTen:    sv.hoTen,
        present,
        date,
        tenLop,
        tenHuynhTruong,
        namHoc,
      });

      try {
        await sendEmail({
          to:      email,
          subject: `[Mẫu Tâm] Điểm danh ${present ? 'có mặt' : 'vắng'} — ${sv.tenThanh} ${sv.hoTen}`,
          html,
        });
        sent++;
      } catch (err) {
        errors.push({ student: sv.hoTen, email, error: err.message });
        logEmailBatchError('notify/diem-danh', {
          email,
          student: sv.hoTen,
          studentId: sv._id,
          lopId,
          date,
          error: err.message,
        });
      }
    });

    await Promise.allSettled(tasks);

    res.json({ success: true, sent, skipped, errors });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/notify/lich-le ──────────────────────────────────────────────────
// Body: { lopId? } — nếu không có lopId → gửi tất cả lớp
exports.guiLichLe = async (req, res, next) => {
  try {
    const { lopId } = req.body || {};

    // Lấy danh sách lớp cần gửi
    const lopQuery = lopId ? { _id: lopId } : {};
    const lops = await Class.find(lopQuery)
      .populate('namHoc', 'ten')
      .populate('huynhTruong', 'hoTen');

    if (!lops.length)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Lấy lịch lễ tuần tới từ romcal ───────────────────────────────────────────
    const tuanDays = getTuanToi();
    const tuanTu   = `${toShort(tuanDays[0])} – ${tuanDays[6].toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}`;

    // Dùng romcal nếu có, fallback về mảng rỗng
    let feasts = [];
    try {
      const Romcal = require('romcal');
      const year   = tuanDays[0].getFullYear();
      let calendar = Romcal.calendarFor({ year, locale: 'vi' });
      if (calendar?.then) calendar = await calendar;
      const entries = Object.values(calendar);

      const COLOR_MAP = {
        WHITE: 'trang', GOLD: 'trang',
        RED:   'do',
        PURPLE: 'tim', VIOLET: 'tim',
        GREEN: 'xanh',
        ROSE:  'hong',
      };

      feasts = tuanDays
        .map(day => {
          const iso   = toIso(day);
          const entry = entries.find(e => e?.moment?.slice(0, 10) === iso);
          if (!entry) return null;
          // Bỏ qua ngày thường (FERIA)
          if (!entry.type || entry.type === 'FERIA') return null;
          const colorKey = (entry.data?.meta?.liturgicalColor?.key || 'GREEN').toUpperCase();
          return {
            ngay:   day.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
            ten:    entry.name || iso,
            mauKey: COLOR_MAP[colorKey] || 'xanh',
          };
        })
        .filter(Boolean);
    } catch {
      // romcal không có → feasts rỗng, template vẫn hiển thị placeholder
    }

    // Giờ lễ Chúa Nhật — hardcode theo thực tế giáo xứ (có thể mở rộng fetch từ DB)
    const gioLe = ['05:30', '09:00', '17:00', '18:30'];

    let sent = 0, skipped = 0;
    const errors = [];

    // Gửi từng lớp
    for (const lop of lops) {
      const students = await Student.find({ lop: lop._id, trangThai: 'active' });
      const tenHuynhTruong = lop.huynhTruong?.hoTen || '';
      const tenLop         = lop.tenLop;

      const tasks = students.map(async (sv) => {
        const email = sv.phuHuynh?.email;
        if (!email) { skipped++; return; }

        const html = lichLeTemplate({ feasts, tuanTu, gioLe, tenLop, tenHuynhTruong });

        try {
          await sendEmail({
            to:      email,
            subject: `[Mẫu Tâm] Lịch lễ tuần tới (${tuanTu}) — Lớp ${tenLop}`,
            html,
          });
          sent++;
        } catch (err) {
          errors.push({ student: sv.hoTen, email, error: err.message });
          logEmailBatchError('notify/lich-le', {
            email,
            student: sv.hoTen,
            studentId: sv._id,
            lopId: lop._id,
            tuanTu,
            error: err.message,
          });
        }
      });

      await Promise.allSettled(tasks);
    }

    res.json({ success: true, sent, skipped, errors });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/notify/bang-diem ────────────────────────────────────────────────
// Body: { lopId, hocKy, namHocId? }
exports.guiBangDiem = async (req, res, next) => {
  try {
    const { lopId, hocKy: hocKyRaw, namHocId } = req.body;
    const hocKy = Number(hocKyRaw) || 1;

    if (!lopId)
      return res.status(400).json({ success: false, message: 'Thiếu lopId' });
    if (![1, 2].includes(hocKy))
      return res.status(400).json({ success: false, message: 'hocKy phải là 1 hoặc 2' });

    // Lấy thông tin lớp
    const lop = await Class.findById(lopId)
      .populate('huynhTruong', 'hoTen')
      .populate('namHoc', 'ten');
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Xác định năm học: ưu tiên body, fallback năm đang hoạt động
    const namHoc = namHocId
      ? await NamHoc.findById(namHocId)
      : await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const students = await Student.find({ lop: lopId, trangThai: 'active' });

    // Lấy toàn bộ điểm và chuyên cần của lớp 1 lần
    const [allGrades, allCC] = await Promise.all([
      Grade.find({ lop: lopId, namHoc: namHoc._id, hocKy }),
      ChuyenCan.find({ lop: lopId, namHoc: namHoc._id, hocKy }),
    ]);

    const tenHuynhTruong = lop.huynhTruong?.hoTen || '';
    const tenLop         = lop.tenLop;
    const tenNamHoc      = namHoc.ten;

    let sent = 0, skipped = 0;
    const errors  = [];
    const summary = { xuatSac: 0, gioi: 0, kha: 0, trungBinh: 0, yeu: 0, chuaDu: 0 };

    // Label đẹp cho loại điểm
    const LOAI_LABELS = { mieng: 'Miệng', '15phut': '15 phút', '1tiet': '1 tiết' };

    for (const sv of students) {
      const svGrades  = allGrades.filter(g => g.student.toString() === sv._id.toString());
      const ccRec     = allCC.find(c => c.student.toString() === sv._id.toString());
      const tbHT      = tinhTBHocTap(svGrades);
      const diemCC    = ccRec?.diem ?? null;
      const tongKet   = tinhTongKet(tbHT, diemCC);
      const hocLuc    = phanLoai(tongKet);

      // Thống kê học lực
      if (hocLuc === 'Xuất sắc')        summary.xuatSac++;
      else if (hocLuc === 'Giỏi')       summary.gioi++;
      else if (hocLuc === 'Khá')        summary.kha++;
      else if (hocLuc === 'Trung bình') summary.trungBinh++;
      else if (hocLuc === 'Yếu')        summary.yeu++;
      else                               summary.chuaDu++;

      const email = sv.phuHuynh?.email;
      if (!email) { skipped++; continue; }

      // Xây dựng danh sách điểm theo loại cho template
      const gradesByLoai = LOAI_DIEM.map(l => ({
        loai:     LOAI_LABELS[l.key] || l.key,
        heSo:     l.heSo,
        danhSach: svGrades.filter(g => g.loaiDiem === l.key).map(g => g.diem),
      }));

      const html = bangDiemTemplate({
        student:      { tenThanh: sv.tenThanh, hoTen: sv.hoTen, gioiTinh: sv.gioiTinh },
        gradesByLoai,
        tbHocTap:     tbHT,
        diemCC,
        tongKet,
        hocLuc,
        hocKy,
        namHoc:       tenNamHoc,
        tenLop,
        tenHuynhTruong,
      });

      try {
        await sendEmail({
          to:      email,
          subject: `[Mẫu Tâm] Bảng điểm HK${hocKy} — ${sv.tenThanh} ${sv.hoTen} — Lớp ${tenLop}`,
          html,
        });
        sent++;
      } catch (err) {
        errors.push({ student: sv.hoTen, email, error: err.message });
        logEmailBatchError('notify/bang-diem', {
          email,
          student: sv.hoTen,
          studentId: sv._id,
          lopId,
          hocKy,
          namHocId: namHoc._id,
          error: err.message,
        });
      }

      // Delay 100ms giữa mỗi email để tránh spam filter
      await new Promise(r => setTimeout(r, 100));
    }

    res.json({ success: true, sent, skipped, errors, summary });
  } catch (err) {
    next(err);
  }
};
