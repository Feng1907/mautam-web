const Class = require('../models/Class');
const NamHoc = require('../models/NamHoc');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const ChuyenCan = require('../models/ChuyenCan');
const { sendPushToUsers } = require('../utils/pushNotifier');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

// GET /api/classes?namHocId=...  (mặc định lấy năm đang hoạt động)
exports.getAll = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học nào đang hoạt động' });
      namHocId = namHoc._id;
    }

    const classes = await Class.find({ namHoc: namHocId })
      .sort('thuTu')
      .populate('huynhTruong', 'hoTen email soDienThoai')
      .populate('duTruong', 'hoTen email soDienThoai')
      .lean();

    // Đếm sĩ số từng lớp trong một câu query duy nhất
    const counts = await Student.aggregate([
      { $match: { lop: { $in: classes.map(c => c._id) }, trangThai: 'active' } },
      { $group: { _id: '$lop', siSo: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.siSo]));

    const data = classes.map(c => ({ ...c, siSo: countMap[c._id.toString()] ?? 0 }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/classes/:id
exports.getOne = async (req, res, next) => {
  try {
    const lop = await Class.findById(req.params.id)
      .populate('namHoc', 'ten dangHoatDong')
      .populate('huynhTruong', 'hoTen email soDienThoai')
      .populate('duTruong', 'hoTen email soDienThoai');

    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    res.json({ success: true, data: lop });
  } catch (err) {
    next(err);
  }
};

// POST /api/classes  (Admin only)
exports.create = async (req, res, next) => {
  try {
    const { tenLop, nhanh, thuTu, namHocId, moTa } = req.body;

    const namHoc = await NamHoc.findById(namHocId);
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    const lop = await Class.create({ tenLop, nhanh, thuTu, namHoc: namHocId, moTa });
    res.status(201).json({ success: true, data: lop });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Tên lớp đã tồn tại trong năm học này' });
    next(err);
  }
};

// PATCH /api/classes/:id  (Admin only — cập nhật tên lớp, khối ngành, thứ tự)
exports.update = async (req, res, next) => {
  try {
    const { tenLop, nhanh, thuTu } = req.body;
    const lop = await Class.findById(req.params.id);
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    if (tenLop !== undefined) lop.tenLop = tenLop.trim();
    if (nhanh   !== undefined) lop.nhanh  = nhanh;
    if (thuTu   !== undefined) lop.thuTu  = thuTu;

    await lop.save();

    const updated = await Class.findById(lop._id)
      .populate('huynhTruong', 'hoTen email soDienThoai')
      .populate('duTruong',    'hoTen email soDienThoai');

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Tên lớp đã tồn tại trong năm học này' });
    next(err);
  }
};

// DELETE /api/classes/:id  (Admin only — chặn nếu lớp còn đoàn sinh)
exports.remove = async (req, res, next) => {
  try {
    const lop = await Class.findById(req.params.id);
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    const soLuong = await Student.countDocuments({ lop: lop._id });
    if (soLuong > 0)
      return res.status(409).json({
        success: false,
        message: `Lớp đang có ${soLuong} đoàn sinh. Hãy chuyển đoàn sinh sang lớp khác trước khi xóa.`,
      });

    // Gỡ lớp khỏi lopPhuTrach của các HT/DT
    await User.updateMany({ lopPhuTrach: lop._id }, { $pull: { lopPhuTrach: lop._id } });
    await lop.deleteOne();

    res.json({ success: true, message: 'Đã xóa lớp thành công' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/classes/:id/assign  (Admin phân công Huynh trưởng / Dự trưởng)
exports.assign = async (req, res, next) => {
  try {
    const { huynhTruongId, duTruongIds } = req.body;
    const lop = await Class.findById(req.params.id);
    if (!lop)
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp' });

    // Cập nhật lớp
    if (huynhTruongId !== undefined) lop.huynhTruong = huynhTruongId || null;
    if (duTruongIds !== undefined) lop.duTruong = duTruongIds;
    await lop.save();

    // Đồng bộ lopPhuTrach trên User: xóa lớp này khỏi tất cả HT/DT cũ rồi gán lại
    await User.updateMany({ lopPhuTrach: lop._id }, { $pull: { lopPhuTrach: lop._id } });

    // Gán lại HT
    if (huynhTruongId) {
      await User.findByIdAndUpdate(huynhTruongId, {
        $addToSet: { lopPhuTrach: lop._id },
        vaiTro: 'giaoly',
        chucVu: 'huynhtruong',
      });
    }

    // Gán lại DT — ngang quyền HT trong lớp
    for (const dtId of (duTruongIds || [])) {
      await User.findByIdAndUpdate(dtId, {
        $addToSet: { lopPhuTrach: lop._id },
        vaiTro: 'giaoly',
        chucVu: 'dutruong',
      });
    }

    // Người bị gỡ khỏi lớp: nếu không còn lớp nào → hạ vaiTro về 'user'
    const cuuPhuTrach = await User.find({ _id: { $in: [] } }); // placeholder — handled below
    await User.updateMany(
      { vaiTro: 'giaoly', lopPhuTrach: { $size: 0 } },
      { vaiTro: 'user', chucVu: null }
    );

    const updated = await Class.findById(lop._id)
      .populate('huynhTruong', 'hoTen email')
      .populate('duTruong', 'hoTen email');

    // Notify người vừa được phân công
    const newIds = [huynhTruongId, ...(duTruongIds || [])].filter(Boolean);
    if (newIds.length) {
      const lopName = lop.tenLop;
      sendPushToUsers(newIds, {
        title: '📚 Bạn được phân công lớp mới',
        body: `Bạn vừa được phân công phụ trách lớp ${lopName}.`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        url: '/lop-hoc',
        type: 'class-assignment',
      }).catch((err) => logger.warn('classAssign push failed', { error: err.message }));

      const assignedUsers = await User.find({ _id: { $in: newIds } }).select('hoTen email').lean();
      for (const u of assignedUsers) {
        if (!u.email) continue;
        sendEmail({
          to: u.email,
          subject: `[Phân công] Lớp ${lopName}`,
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
              <h3 style="color:#8B0000">📚 Phân công lớp học</h3>
              <p>Xin chào <strong>${u.hoTen}</strong>,</p>
              <p>Bạn vừa được phân công phụ trách <strong>lớp ${lopName}</strong>.</p>
              <p>Vui lòng đăng nhập hệ thống để xem danh sách đoàn sinh.</p>
            </div>
          `,
        }).catch((err) => logger.warn('classAssign email failed', { userId: u._id, error: err.message }));
      }
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/classes/:id/stats
exports.getClassStats = async (req, res, next) => {
  try {
    const lopId = req.params.id;

    if (req.user.vaiTro !== 'admin') {
      const owns = req.user.lopPhuTrach?.some(l => (l._id || l).toString() === lopId);
      if (!owns) return res.status(403).json({ success: false, message: 'Không có quyền xem lớp này' });
    }

    const namHoc = await NamHoc.findOne({ dangHoatDong: true }).lean();
    if (!namHoc) return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const [students, attendances, grades, chuyenCans] = await Promise.all([
      Student.find({ lop: lopId, trangThai: 'active' }).select('hoTen tenThanh gioiTinh').lean(),
      Attendance.find({ lop: lopId, namHoc: namHoc._id }).lean(),
      Grade.find({ lop: lopId, namHoc: namHoc._id }).lean(),
      ChuyenCan.find({ lop: lopId, namHoc: namHoc._id }).lean(),
    ]);

    // Gender split
    const soNam = students.filter(s => s.gioiTinh === 'Nam').length;
    const soNu  = students.filter(s => s.gioiTinh === 'Nu').length;

    // Attendance stats
    const allDates = [...new Set(attendances.map(a => a.date))];
    const totalSessions = allDates.length;
    const totalPresent  = attendances.filter(a => a.present).length;
    const attendanceRate = totalSessions > 0 && students.length > 0
      ? Math.round((totalPresent / (totalSessions * students.length)) * 100)
      : 0;

    // Per-student attendance rate
    const studentAttMap = {};
    attendances.forEach(a => {
      const sid = a.student.toString();
      if (!studentAttMap[sid]) studentAttMap[sid] = { total: 0, present: 0 };
      studentAttMap[sid].total++;
      if (a.present) studentAttMap[sid].present++;
    });
    const lowAttendance = students.filter(s => {
      const sid = s._id.toString();
      const att = studentAttMap[sid];
      if (!att || att.total === 0) return totalSessions > 0;
      return (att.present / att.total) < 0.7;
    }).map(s => ({
      _id: s._id,
      hoTen: s.hoTen,
      tenThanh: s.tenThanh,
      rate: studentAttMap[s._id.toString()]
        ? Math.round((studentAttMap[s._id.toString()].present / studentAttMap[s._id.toString()].total) * 100)
        : 0,
    }));

    // Grade distribution by loaiDiem + hocKy
    const bands = (diem) => {
      if (diem >= 8) return '8-10';
      if (diem >= 6) return '6-7';
      if (diem >= 4) return '4-5';
      return '0-3';
    };
    const gradeStats = {};
    grades.forEach(g => {
      const key = `${g.loaiDiem}_hk${g.hocKy}`;
      if (!gradeStats[key]) gradeStats[key] = { loaiDiem: g.loaiDiem, hocKy: g.hocKy, count: 0, sum: 0, dist: { '0-3': 0, '4-5': 0, '6-7': 0, '8-10': 0 } };
      gradeStats[key].count++;
      gradeStats[key].sum += g.diem;
      gradeStats[key].dist[bands(g.diem)]++;
    });
    const gradeList = Object.values(gradeStats).map(g => ({ ...g, avg: g.count ? +(g.sum / g.count).toFixed(2) : null }));

    // ChuyenCan averages
    const ccHK = { 1: { sum: 0, count: 0 }, 2: { sum: 0, count: 0 } };
    chuyenCans.forEach(c => {
      if (ccHK[c.hocKy]) { ccHK[c.hocKy].sum += c.diem; ccHK[c.hocKy].count++; }
    });

    res.json({
      success: true,
      data: {
        soHocSinh: students.length,
        soNam, soNu,
        totalSessions,
        attendanceRate,
        lowAttendance,
        gradeList,
        chuyenCan: {
          hk1Avg: ccHK[1].count ? +(ccHK[1].sum / ccHK[1].count).toFixed(2) : null,
          hk2Avg: ccHK[2].count ? +(ccHK[2].sum / ccHK[2].count).toFixed(2) : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

