const Attendance = require('../models/Attendance');
const NamHoc = require('../models/NamHoc');
const Student = require('../models/Student');
const Class = require('../models/Class');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { logger } = require('../utils/logger');

// ─── Rate limit per token (in-memory, tự dọn sau khi token hết hạn) ──────────
const qrScanAttempts = new Map(); // key: token[:16], value: { count, expAt }
const MAX_SCAN_ATTEMPTS = 60;     // tối đa 60 lần/token (1 lớp không quá 60 em)

function getRateKey(token) { return token.slice(-16); }

function checkRateLimit(token, expAt) {
  const key = getRateKey(token);
  const now = Date.now();
  // Dọn entry đã hết hạn
  if (qrScanAttempts.has(key) && qrScanAttempts.get(key).expAt < now) {
    qrScanAttempts.delete(key);
  }
  const entry = qrScanAttempts.get(key) || { count: 0, expAt };
  entry.count += 1;
  qrScanAttempts.set(key, entry);
  return entry.count <= MAX_SCAN_ATTEMPTS;
}

// ─── Haversine distance (meters) giữa 2 tọa độ GPS ───────────────────────────
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /api/attendance/qr-session
// Admin/GLV tạo QR chứa sessionToken JWT TTL 3–5 phút
exports.generateQrSession = async (req, res, next) => {
  try {
    const { lopId, date, ttlMinutes = 5, lat, lng, maxDistance = 200 } = req.body;
    if (!lopId || !date)
      return res.status(400).json({ success: false, message: 'Thiếu lopId hoặc date' });

    // Giới hạn TTL: tối thiểu 0.25 phút (15s), tối đa 15 phút
    const ttl = Math.min(Math.max(Number(ttlMinutes), 0.25), 15);
    const ttlSeconds = Math.round(ttl * 60);

    // Payload: thêm loc nếu admin bật yêu cầu vị trí
    const hasLocation = lat != null && lng != null;
    const payload = {
      lopId, date, type: 'qr-attendance',
      ...(hasLocation && { loc: { lat: Number(lat), lng: Number(lng), maxDistance: Number(maxDistance) } }),
    };

    const sessionToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: `${ttlSeconds}s` });

    // URL học sinh sẽ truy cập sau khi quét
    const scanUrl = `${process.env.CLIENT_URL}/diem-danh-qr?token=${sessionToken}`;

    // Tạo QR code dạng base64 PNG (512×512, error correction M)
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    logger.info(`[QR] Session created — lop:${lopId} date:${date} ttl:${ttl}m loc:${hasLocation}`);

    res.json({
      success: true,
      data: {
        qrDataUrl,
        sessionToken,
        lopId,
        date,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
        ttlSeconds,
        requiresLocation: hasLocation,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/:lopId?namHocId=...
exports.getByClass = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      namHocId = namHoc._id;
    }

    const records = await Attendance.find({ lop: req.params.lopId, namHoc: namHocId });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance  (upsert)
exports.upsert = async (req, res, next) => {
  try {
    const { studentId, lopId, date, present, ghiChu } = req.body;
    if (!studentId || !lopId || !date)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });

    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, lop: lopId, date },
      { present, ghiChu, diemDanhBoi: req.user._id, namHoc: namHoc._id },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/sundays?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Tự sinh danh sách tất cả ngày Chúa Nhật trong khoảng thời gian
exports.getSundays = async (req, res, next) => {
  try {
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Mặc định: dùng năm học đang hoạt động
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      startDate = namHoc.ngayBatDau;
      endDate = namHoc.ngayKetThuc;
    }

    const sundays = [];
    const cur = new Date(startDate);
    // Tìm Chúa Nhật đầu tiên
    while (cur.getDay() !== 0) cur.setDate(cur.getDate() + 1);
    while (cur <= endDate) {
      sundays.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 7);
    }

    res.json({ success: true, total: sundays.length, data: sundays });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/qr-verify?token=...  (public — không cần auth)
// Đoàn sinh gọi sau khi quét QR: verify token + trả về thông tin lớp & danh sách đoàn sinh
exports.verifyQrToken = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: 'Thiếu token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const expired = e.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        expired,
        message: expired ? 'Mã QR đã hết hạn' : 'Mã QR không hợp lệ',
      });
    }

    if (payload.type !== 'qr-attendance')
      return res.status(400).json({ success: false, message: 'Mã QR không đúng loại' });

    const { lopId, date } = payload;

    // Lấy tên lớp
    const lop = await Class.findById(lopId).select('tenLop nhanh');
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Danh sách đoàn sinh active trong lớp
    const students = await Student.find({ lop: lopId, trangThai: 'active' })
      .select('hoTen tenThanh gioiTinh avatar')
      .sort({ hoTen: 1 });

    res.json({
      success: true,
      data: {
        lopId, date,
        lopName: lop.tenLop,
        nhanh: lop.nhanh,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        requiresLocation: !!payload.loc,
        maxDistance: payload.loc?.maxDistance ?? null,
        students,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance/qr-scan  (public — bảo vệ bởi JWT token)
// Pipeline: [V1] signature → [V2] type → [V3] expiry → [V4] rate-limit →
//           [V5] student∈class → [V6] location → [V7] duplicate → [V8] ghi DB
exports.scanQr = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  try {
    const { token, studentId, lat, lng } = req.body;

    // [V1+V2+V3] Kiểm tra token: signature, type, expiry
    if (!token || !studentId)
      return res.status(400).json({ success: false, message: 'Thiếu token hoặc studentId' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      const expired = e.name === 'TokenExpiredError';
      logger.warn(`[QR-SCAN] Token ${expired ? 'expired' : 'invalid'} — ip:${ip}`);
      return res.status(401).json({
        success: false, expired,
        message: expired ? 'Mã QR đã hết hạn' : 'Mã QR không hợp lệ',
      });
    }

    if (payload.type !== 'qr-attendance') {
      logger.warn(`[QR-SCAN] Wrong token type: ${payload.type} — ip:${ip}`);
      return res.status(400).json({ success: false, message: 'Mã QR không đúng loại' });
    }

    const { lopId, date, loc } = payload;

    // [V4] Rate limit per token — chống brute-force studentId
    const allowed = checkRateLimit(token, payload.exp * 1000);
    if (!allowed) {
      logger.warn(`[QR-SCAN] Rate limit exceeded — lop:${lopId} ip:${ip}`);
      return res.status(429).json({ success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' });
    }

    // [V5] Student phải active và thuộc lớp này
    const student = await Student.findOne({ _id: studentId, lop: lopId, trangThai: 'active' })
      .select('hoTen tenThanh');
    if (!student) {
      logger.warn(`[QR-SCAN] Student ${studentId} not in class ${lopId} — ip:${ip}`);
      return res.status(404).json({ success: false, message: 'Đoàn sinh không thuộc lớp này' });
    }

    // [V6] Kiểm tra vị trí địa lý (nếu token yêu cầu)
    if (loc) {
      if (lat == null || lng == null) {
        return res.status(400).json({
          success: false,
          requiresLocation: true,
          message: 'Buổi điểm danh này yêu cầu xác nhận vị trí. Vui lòng cho phép truy cập GPS.',
        });
      }
      const dist = haversineMeters(loc.lat, loc.lng, Number(lat), Number(lng));
      const maxDist = loc.maxDistance || 200;
      logger.info(`[QR-SCAN] Location check — student:${student.hoTen} dist:${Math.round(dist)}m max:${maxDist}m`);
      if (dist > maxDist) {
        logger.warn(`[QR-SCAN] Location FAILED — ${student.hoTen} dist:${Math.round(dist)}m > ${maxDist}m ip:${ip}`);
        return res.status(403).json({
          success: false,
          locationFailed: true,
          distance: Math.round(dist),
          maxDistance: maxDist,
          message: `Vị trí của bạn quá xa (${Math.round(dist)}m). Bạn phải ở trong vòng ${maxDist}m.`,
        });
      }
    }

    // [V7] Chống điểm danh trùng
    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const existing = await Attendance.findOne({ student: studentId, lop: lopId, date });
    if (existing?.present) {
      logger.info(`[QR-SCAN] Duplicate — ${student.hoTen} lop:${lopId} date:${date}`);
      return res.status(409).json({
        success: false,
        alreadyChecked: true,
        message: `${student.hoTen} đã điểm danh buổi này rồi`,
      });
    }

    // [V8] Ghi có mặt vào DB
    await Attendance.findOneAndUpdate(
      { student: studentId, lop: lopId, date },
      { present: true, namHoc: namHoc._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info(`[QR-SCAN] ✓ ${student.hoTen} — lop:${lopId} date:${date} ip:${ip}${loc ? ` dist:${Math.round(haversineMeters(loc.lat, loc.lng, Number(lat), Number(lng)))}m` : ''}`);

    res.json({
      success: true,
      message: `Điểm danh thành công! Chào ${student.tenThanh} ${student.hoTen} 🙏`,
      data: { studentName: student.hoTen, tenThanh: student.tenThanh, date, lopId },
    });
  } catch (err) {
    next(err);
  }
};
