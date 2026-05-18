const ParentStudent = require('../models/ParentStudent');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendPushToUsers } = require('../utils/pushNotifier');
const logger = require('../utils/logger');

// GET /api/admin/parent-links?search=&status=&page=1&limit=20
exports.getAll = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const dbFilter = {};
    if (status) dbFilter.trangThai = status;

    const links = await ParentStudent.find(dbFilter)
      .populate('parent', 'hoTen email vaiTro avatar')
      .populate({ path: 'student', select: 'hoTen tenThanh lop', populate: { path: 'lop', select: 'tenLop' } })
      .populate('linkedBy', 'hoTen')
      .populate('reviewedBy', 'hoTen')
      .sort({ createdAt: -1 })
      .lean();

    // Filter in-memory (search across parent name/email + student name)
    const q = search.trim().toLowerCase();
    const filtered = q
      ? links.filter(l =>
          `${l.parent?.hoTen} ${l.parent?.email} ${l.student?.tenThanh} ${l.student?.hoTen}`
            .toLowerCase()
            .includes(q)
        )
      : links;

    const total = filtered.length;
    const data  = filtered.slice(skip, skip + Number(limit));

    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/parent-links
exports.create = async (req, res, next) => {
  try {
    const { parentId, studentId, quanHe = 'Cha/Mẹ', ghiChu } = req.body;
    if (!parentId || !studentId)
      return res.status(400).json({ success: false, message: 'Thiếu parentId hoặc studentId' });

    const [parent, student] = await Promise.all([
      User.findById(parentId).select('hoTen email vaiTro'),
      Student.findById(studentId).select('hoTen tenThanh lop').populate('lop', 'tenLop'),
    ]);

    if (!parent)   return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản phụ huynh' });
    if (!student)  return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });

    const existing = await ParentStudent.findOne({ parent: parentId, student: studentId });
    if (existing) {
      if (existing.trangThai === 'active')
        return res.status(409).json({ success: false, message: 'Liên kết này đã tồn tại' });
      existing.trangThai = 'active';
      existing.quanHe = quanHe;
      existing.ghiChu = ghiChu;
      existing.linkedBy = req.user._id;
      await existing.save();
      return res.json({ success: true, message: 'Đã kích hoạt lại liên kết', data: existing });
    }

    const link = await ParentStudent.create({
      parent: parentId,
      student: studentId,
      quanHe,
      ghiChu,
      linkedBy: req.user._id,
    });

    // Tự động nâng vaiTro lên PARENT để user truy cập được dashboard phụ huynh
    if (parent.vaiTro !== 'PARENT') {
      await User.findByIdAndUpdate(parentId, { vaiTro: 'PARENT' });
    }

    res.status(201).json({ success: true, message: 'Đã tạo liên kết phụ huynh — đoàn sinh', data: link });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/parent-links/:id  — toggle active/inactive, approve, reject
exports.update = async (req, res, next) => {
  try {
    const { trangThai, quanHe, ghiChu, rejectedReason } = req.body;
    const link = await ParentStudent.findById(req.params.id)
      .populate('parent', 'hoTen email vaiTro _id');
    if (!link) return res.status(404).json({ success: false, message: 'Không tìm thấy liên kết' });

    const prevStatus = link.trangThai;
    if (trangThai      !== undefined) link.trangThai      = trangThai;
    if (quanHe         !== undefined) link.quanHe         = quanHe;
    if (ghiChu         !== undefined) link.ghiChu         = ghiChu;
    if (rejectedReason !== undefined) link.rejectedReason = rejectedReason;
    link.reviewedBy = req.user._id;
    await link.save();

    // Khi duyệt: nâng role user lên PARENT
    if (trangThai === 'active' && prevStatus === 'pending' && link.parent) {
      await User.findByIdAndUpdate(link.parent._id, { vaiTro: 'PARENT' });
    }

    // Thông báo push cho phụ huynh
    if (trangThai === 'active' || trangThai === 'rejected') {
      const msg = trangThai === 'active'
        ? 'Yêu cầu liên kết của bạn đã được duyệt. Bạn có thể vào dashboard phụ huynh ngay.'
        : `Yêu cầu liên kết bị từ chối${rejectedReason ? `: ${rejectedReason}` : '.'}`;
      sendPushToUsers([link.parent._id], {
        title: trangThai === 'active' ? '✅ Yêu cầu liên kết được duyệt' : '❌ Yêu cầu liên kết bị từ chối',
        body: msg,
        icon: '/favicon.svg',
        url: '/phu-huynh',
        type: 'link-request-result',
      }).catch((err) => logger.warn('linkRequestResult push failed', { linkId: link._id, error: err.message }));
    }

    res.json({ success: true, message: 'Đã cập nhật liên kết', data: link });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/parent-links/sync-roles
// Cập nhật vaiTro='PARENT' cho tất cả user đang có liên kết active
exports.syncRoles = async (req, res, next) => {
  try {
    const activeLinks = await ParentStudent.find({ trangThai: 'active' }).distinct('parent');
    const result = await User.updateMany(
      { _id: { $in: activeLinks }, vaiTro: { $ne: 'PARENT' } },
      { vaiTro: 'PARENT' }
    );
    res.json({ success: true, message: `Đã cập nhật ${result.modifiedCount} tài khoản lên vai trò PARENT` });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/parent-links/:id
exports.remove = async (req, res, next) => {
  try {
    const link = await ParentStudent.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Không tìm thấy liên kết' });
    res.json({ success: true, message: 'Đã xóa liên kết' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/parent-links/search-users?q=  — tìm user có vaiTro PARENT
exports.searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ success: true, data: [] });

    const users = await User.find({
      vaiTro: { $in: ['user', 'PARENT'] },
      $or: [
        { hoTen: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('hoTen email avatar')
      .limit(10)
      .lean();

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/parent-links/search-students?q=&lopId=
exports.searchStudents = async (req, res, next) => {
  try {
    const q     = (req.query.q || '').trim();
    const lopId = req.query.lopId || null;

    const filter = { trangThai: 'active' };
    if (lopId) filter.lop = lopId;
    if (q) filter.$or = [
      { hoTen:    { $regex: q, $options: 'i' } },
      { tenThanh: { $regex: q, $options: 'i' } },
    ];

    if (!q && !lopId) return res.json({ success: true, data: [] });

    const students = await Student.find(filter)
      .select('hoTen tenThanh lop')
      .populate('lop', 'tenLop')
      .limit(15)
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};
