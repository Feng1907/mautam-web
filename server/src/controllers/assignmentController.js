const AssignmentSheet = require('../models/AssignmentSheet');
const User = require('../models/User');
const { sendPushToUsers } = require('../utils/pushNotifier');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

// GET /api/assignments
exports.getAll = async (req, res, next) => {
  try {
    const sheets = await AssignmentSheet.find()
      .select('title description isPublished notifiedAt createdBy createdAt')
      .populate('createdBy', 'hoTen')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: sheets });
  } catch (err) { next(err); }
};

// GET /api/assignments/:id
exports.getOne = async (req, res, next) => {
  try {
    const sheet = await AssignmentSheet.findById(req.params.id)
      .populate('createdBy', 'hoTen')
      .populate('sessions.tasks.assignees.user', 'hoTen avatar')
      .lean();
    if (!sheet) return res.status(404).json({ success: false, message: 'Không tìm thấy bảng phân công' });
    if (!sheet.isPublished && req.user?.vaiTro !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bảng chưa được công bố' });
    }
    res.json({ success: true, data: sheet });
  } catch (err) { next(err); }
};

// POST /api/assignments
exports.create = async (req, res, next) => {
  try {
    const { title, description, taskTypes, sessions } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Tiêu đề không được để trống' });
    const sheet = await AssignmentSheet.create({
      title, description, taskTypes: taskTypes || [], sessions: sessions || [],
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: sheet });
  } catch (err) { next(err); }
};

// PUT /api/assignments/:id
exports.update = async (req, res, next) => {
  try {
    const { title, description, taskTypes, sessions } = req.body;
    const sheet = await AssignmentSheet.findByIdAndUpdate(
      req.params.id,
      { title, description, taskTypes, sessions },
      { new: true, runValidators: true }
    );
    if (!sheet) return res.status(404).json({ success: false, message: 'Không tìm thấy bảng phân công' });
    res.json({ success: true, data: sheet });
  } catch (err) { next(err); }
};

// DELETE /api/assignments/:id
exports.remove = async (req, res, next) => {
  try {
    const sheet = await AssignmentSheet.findByIdAndDelete(req.params.id);
    if (!sheet) return res.status(404).json({ success: false, message: 'Không tìm thấy bảng phân công' });
    res.json({ success: true, message: 'Đã xóa bảng phân công' });
  } catch (err) { next(err); }
};

// POST /api/assignments/:id/publish
exports.publish = async (req, res, next) => {
  try {
    const sheet = await AssignmentSheet.findById(req.params.id).lean();
    if (!sheet) return res.status(404).json({ success: false, message: 'Không tìm thấy bảng phân công' });

    await AssignmentSheet.findByIdAndUpdate(req.params.id, { isPublished: true, notifiedAt: new Date() });

    // Thu thập tất cả user được phân công
    const userIds = new Set();
    for (const session of sheet.sessions) {
      for (const task of session.tasks) {
        for (const assignee of task.assignees) {
          if (assignee.user) userIds.add(assignee.user.toString());
        }
      }
    }

    const userIdArr = [...userIds];
    if (!userIdArr.length) return res.json({ success: true, notified: 0 });

    // Push notification
    sendPushToUsers(userIdArr, {
      title: `📋 Phân công mới: ${sheet.title}`,
      body: 'Bạn đã được phân công. Nhấn để xem chi tiết.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      url: `/phan-cong/${sheet._id}`,
      type: 'assignment',
    }).catch((err) => logger.warn('assignment push failed', { error: err.message }));

    // Email
    const users = await User.find({ _id: { $in: userIdArr } }).select('hoTen email').lean();
    for (const user of users) {
      if (!user.email) continue;
      sendEmail({
        to: user.email,
        subject: `[Phân công] ${sheet.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
            <h3 style="color:#8B0000">📋 Bạn có phân công mới</h3>
            <p>Xin chào <strong>${user.hoTen}</strong>,</p>
            <p>Bạn vừa được phân công trong <strong>${sheet.title}</strong>.</p>
            <p>Vui lòng xem chi tiết trên hệ thống.</p>
          </div>
        `,
      }).catch((err) => logger.warn('assignment email failed', { userId: user._id, error: err.message }));
    }

    res.json({ success: true, notified: userIdArr.length });
  } catch (err) { next(err); }
};
