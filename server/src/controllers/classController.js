const Class = require('../models/Class');
const NamHoc = require('../models/NamHoc');
const User = require('../models/User');
const Student = require('../models/Student');
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
