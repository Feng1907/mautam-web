const CountdownEvent = require('../models/CountdownEvent');

// GET /api/events — public, trả về sự kiện active sắp theo ngày
exports.list = async (req, res, next) => {
  try {
    const events = await CountdownEvent.find({ active: true }).sort({ date: 1 }).lean();
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
    const { name, date, icon, color, active, order } = req.body;
    if (!name?.trim() || !date) {
      return res.status(400).json({ success: false, message: 'Tên và ngày là bắt buộc.' });
    }
    const ev = await CountdownEvent.create({ name: name.trim(), date, icon, color, active, order, reminderPushSentAt: null });
    res.status(201).json({ success: true, data: ev });
  } catch (err) { next(err); }
};

// PUT /api/events/:id
exports.update = async (req, res, next) => {
  try {
    const { name, date, icon, color, active, order } = req.body;
    const ev = await CountdownEvent.findByIdAndUpdate(
      req.params.id,
      { name: name?.trim(), date, icon, color, active, order },
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
