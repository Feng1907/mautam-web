const CountdownEvent = require('../models/CountdownEvent');
const Class   = require('../models/Class');
const Student = require('../models/Student');

// GET /api/events — public, trả về sự kiện active sắp theo ngày
exports.list = async (req, res, next) => {
  try {
    const events = await CountdownEvent.find({ active: true })
      .populate('rsvpList.user', 'hoTen avatar')
      .populate('studentRsvps.student', 'hoTen')
      .sort({ date: 1 }).lean();
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// GET /api/events/all — admin, trả về tất cả kể cả inactive
exports.listAll = async (req, res, next) => {
  try {
    const events = await CountdownEvent.find().sort({ date: 1 }).lean();
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
};

// POST /api/events
exports.create = async (req, res, next) => {
  try {
    const { name, date, icon, color, active, order, studentRsvpEnabled } = req.body;
    if (!name?.trim() || !date) {
      return res.status(400).json({ success: false, message: 'Tên và ngày là bắt buộc.' });
    }
    const ev = await CountdownEvent.create({ name: name.trim(), date, icon, color, active, order, studentRsvpEnabled, reminderPushSentAt: null });
    res.status(201).json({ success: true, data: ev });
  } catch (err) { next(err); }
};

// PUT /api/events/:id
exports.update = async (req, res, next) => {
  try {
    const { name, date, icon, color, active, order, studentRsvpEnabled } = req.body;
    const ev = await CountdownEvent.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), date, icon, color, active, order, studentRsvpEnabled },
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

    // Kiểm tra huynh trưởng có phụ trách lớp của học sinh này không
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
      ev.studentRsvps.splice(idx, 1); // bỏ đăng ký
    } else {
      ev.studentRsvps.push({ student: studentId, lop: student.lop, addedBy: req.user._id });
    }
    await ev.save();

    // populate để trả về tên
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
