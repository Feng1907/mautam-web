const CountdownEvent = require('../models/CountdownEvent');
const Class   = require('../models/Class');
const Student = require('../models/Student');
const User    = require('../models/User');

// GET /api/events — public, trả về sự kiện active sắp theo ngày
exports.list = async (req, res, next) => {
  try {
    const events = await CountdownEvent.find({ active: true })
      .populate('rsvpList.user', 'hoTen avatar')
      .populate('studentRsvps.student', 'hoTen')
      .populate('dangKyLop.lop', 'tenLop nganh')
      .populate('dangKyLop.dangKyBoi', 'hoTen')
      .sort({ date: 1 }).lean();
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// GET /api/events/all — admin, trả về tất cả kể cả inactive
exports.listAll = async (req, res, next) => {
  try {
    const events = await CountdownEvent.find()
      .populate('dangKyLop.lop', 'tenLop nganh')
      .populate('dangKyLop.dangKyBoi', 'hoTen')
      .sort({ date: 1 }).lean();
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// POST /api/events
exports.create = async (req, res, next) => {
  try {
    const { name, date, icon, color, active, order, studentRsvpEnabled,
            rsvpEnabled, rsvpDeadline,
            dangKyLopEnabled, dangKyLopMo, dangKyLopDong } = req.body;
    if (!name?.trim() || !date) {
      return res.status(400).json({ success: false, message: 'Tên và ngày là bắt buộc.' });
    }
    const ev = await CountdownEvent.create({
      name: name.trim(), date, icon, color, active, order, studentRsvpEnabled,
      rsvpEnabled, rsvpDeadline: rsvpDeadline || null,
      dangKyLopEnabled, dangKyLopMo: dangKyLopMo || null, dangKyLopDong: dangKyLopDong || null,
      reminderPushSentAt: null,
    });
    res.status(201).json({ success: true, data: ev });
  } catch (err) { next(err); }
};

// PUT /api/events/:id
exports.update = async (req, res, next) => {
  try {
    const { name, date, icon, color, active, order, studentRsvpEnabled,
            rsvpEnabled, rsvpDeadline,
            dangKyLopEnabled, dangKyLopMo, dangKyLopDong } = req.body;
    const ev = await CountdownEvent.findByIdAndUpdate(
      req.params.id,
      {
        name: name?.trim(), date, icon, color, active, order, studentRsvpEnabled,
        rsvpEnabled, rsvpDeadline: rsvpDeadline || null,
        dangKyLopEnabled, dangKyLopMo: dangKyLopMo || null, dangKyLopDong: dangKyLopDong || null,
      },
      { new: true, runValidators: true }
    );
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện.' });
    res.json({ success: true, data: ev });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
exports.remove = async (req, res, next) => {
  try {
    const ev = await CountdownEvent.findByIdAndDelete(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện.' });
    res.json({ success: true, message: 'Đã xóa sự kiện.' });
  } catch (err) { next(err); }
};

// POST /api/events/:id/rsvp — giaoly/admin đăng ký tham gia
exports.rsvpEvent = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!['confirmed', 'tentative', 'declined'].includes(status))
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });

    const ev = await CountdownEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    if (!ev.rsvpEnabled) return res.status(400).json({ success: false, message: 'Sự kiện chưa mở đăng ký' });
    if (ev.rsvpDeadline && new Date() > ev.rsvpDeadline)
      return res.status(400).json({ success: false, message: 'Đã hết hạn đăng ký' });

    const idx = ev.rsvpList.findIndex(r => r.user.toString() === req.user._id.toString());
    if (idx >= 0) {
      ev.rsvpList[idx].status = status;
      ev.rsvpList[idx].note = note || '';
      ev.rsvpList[idx].respondedAt = new Date();
    } else {
      ev.rsvpList.push({ user: req.user._id, status, note: note || '' });
    }
    await ev.save();
    res.json({ success: true, message: 'Đã cập nhật đăng ký' });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id/rsvp — hủy đăng ký
exports.cancelRsvp = async (req, res, next) => {
  try {
    const ev = await CountdownEvent.findByIdAndUpdate(
      req.params.id,
      { $pull: { rsvpList: { user: req.user._id } } },
      { new: true }
    );
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    res.json({ success: true, message: 'Đã hủy đăng ký' });
  } catch (err) { next(err); }
};

// POST /api/events/:id/student-rsvp — giaoly toggle đăng ký cho học sinh
exports.toggleStudentRsvp = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, message: 'Thiếu studentId' });

    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });

    const lop = await Class.findOne({
      _id: student.lop,
      $or: [{ huynhTruong: req.user._id }, { duTruong: req.user._id }],
    });
    if (!lop && req.user.vaiTro !== 'admin')
      return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });

    const ev = await CountdownEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });

    const idx = ev.studentRsvps.findIndex(r => r.student.toString() === studentId.toString());
    if (idx >= 0) {
      ev.studentRsvps.splice(idx, 1);
    } else {
      ev.studentRsvps.push({ student: studentId, lop: student.lop, addedBy: req.user._id });
    }
    await ev.save();
    await ev.populate('studentRsvps.student', 'hoTen');
    res.json({ success: true, data: ev.studentRsvps });
  } catch (err) { next(err); }
};

// GET /api/events/:id/rsvp — admin xem danh sách RSVP
exports.getRsvpList = async (req, res, next) => {
  try {
    const ev = await CountdownEvent.findById(req.params.id)
      .populate('rsvpList.user', 'hoTen email lopPhuTrach avatar').lean();
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    const summary = {
      confirmed: ev.rsvpList.filter(r => r.status === 'confirmed').length,
      tentative: ev.rsvpList.filter(r => r.status === 'tentative').length,
      declined:  ev.rsvpList.filter(r => r.status === 'declined').length,
    };
    res.json({ success: true, data: ev.rsvpList, summary });
  } catch (err) { next(err); }
};

// ── Đăng ký lớp (dangKyLop) ──────────────────────────────────────────────────

// POST /api/events/:id/lop-rsvp — giaoly đăng ký / cập nhật lớp mình
exports.lopRsvp = async (req, res, next) => {
  try {
    const { lopId, soLuong, ghiChu } = req.body;
    if (!lopId) return res.status(400).json({ success: false, message: 'Thiếu lopId' });

    const ev = await CountdownEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });

    if (req.user.vaiTro !== 'admin') {
      if (!ev.dangKyLopEnabled)
        return res.status(400).json({ success: false, message: 'Sự kiện chưa mở đăng ký theo lớp' });
      const now = new Date();
      if (ev.dangKyLopMo && now < ev.dangKyLopMo)
        return res.status(400).json({ success: false, message: 'Chưa đến thời gian đăng ký' });
      if (ev.dangKyLopDong && now > ev.dangKyLopDong)
        return res.status(400).json({ success: false, message: 'Đã hết thời gian đăng ký' });

      // Giaoly chỉ được đăng ký lớp trong lopPhuTrach
      const me = await User.findById(req.user._id).select('lopPhuTrach').lean();
      const lopIds = (me?.lopPhuTrach || []).map(id => id.toString());
      if (!lopIds.includes(lopId.toString()))
        return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });
    }

    const idx = ev.dangKyLop.findIndex(r => r.lop.toString() === lopId.toString());
    if (idx >= 0) {
      ev.dangKyLop[idx].soLuong  = soLuong ?? ev.dangKyLop[idx].soLuong;
      ev.dangKyLop[idx].ghiChu   = ghiChu  ?? ev.dangKyLop[idx].ghiChu;
    } else {
      ev.dangKyLop.push({ lop: lopId, dangKyBoi: req.user._id, soLuong: soLuong || 0, ghiChu: ghiChu || '' });
    }
    await ev.save();
    await ev.populate('dangKyLop.lop', 'tenLop nganh');
    await ev.populate('dangKyLop.dangKyBoi', 'hoTen');
    res.json({ success: true, data: ev.dangKyLop });
  } catch (err) { next(err); }
};

// POST /api/events/:id/lop-rsvp/chot — toggle chốt đăng ký lớp
exports.chotLopRsvp = async (req, res, next) => {
  try {
    const { lopId } = req.body;
    if (!lopId) return res.status(400).json({ success: false, message: 'Thiếu lopId' });

    const ev = await CountdownEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });

    const idx = ev.dangKyLop.findIndex(r => r.lop.toString() === lopId.toString());
    if (idx < 0) return res.status(400).json({ success: false, message: 'Lớp chưa đăng ký sự kiện này' });

    // Giaoly chỉ chốt được lớp của mình
    if (req.user.vaiTro !== 'admin') {
      const me = await User.findById(req.user._id).select('lopPhuTrach').lean();
      const lopIds = (me?.lopPhuTrach || []).map(id => id.toString());
      if (!lopIds.includes(lopId.toString()))
        return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });
    }

    ev.dangKyLop[idx].daChot  = !ev.dangKyLop[idx].daChot;
    ev.dangKyLop[idx].chotLuc = ev.dangKyLop[idx].daChot ? new Date() : undefined;
    await ev.save();
    await ev.populate('dangKyLop.lop', 'tenLop nganh');
    await ev.populate('dangKyLop.dangKyBoi', 'hoTen');
    res.json({ success: true, data: ev.dangKyLop });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id/lop-rsvp — hủy đăng ký lớp
exports.cancelLopRsvp = async (req, res, next) => {
  try {
    const { lopId } = req.body;
    if (!lopId) return res.status(400).json({ success: false, message: 'Thiếu lopId' });

    const ev = await CountdownEvent.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });

    const entry = ev.dangKyLop.find(r => r.lop.toString() === lopId.toString());
    if (!entry) return res.status(400).json({ success: false, message: 'Lớp chưa đăng ký' });
    if (entry.daChot && req.user.vaiTro !== 'admin')
      return res.status(400).json({ success: false, message: 'Đã chốt, không thể hủy. Liên hệ admin.' });

    ev.dangKyLop = ev.dangKyLop.filter(r => r.lop.toString() !== lopId.toString());
    await ev.save();
    res.json({ success: true, message: 'Đã hủy đăng ký lớp' });
  } catch (err) { next(err); }
};

// GET /api/events/:id/lop-rsvp — admin xem danh sách đăng ký lớp
exports.getLopRsvpList = async (req, res, next) => {
  try {
    const ev = await CountdownEvent.findById(req.params.id)
      .populate('dangKyLop.lop', 'tenLop nganh')
      .populate('dangKyLop.dangKyBoi', 'hoTen').lean();
    if (!ev) return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    const summary = {
      tongLop:     ev.dangKyLop.length,
      tongSoLuong: ev.dangKyLop.reduce((s, r) => s + (r.soLuong || 0), 0),
      daChot:      ev.dangKyLop.filter(r => r.daChot).length,
    };
    res.json({ success: true, data: ev.dangKyLop, summary });
  } catch (err) { next(err); }
};
