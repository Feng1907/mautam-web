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
