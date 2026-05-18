const AuditLog = require('../models/AuditLog');

// GET /api/audit-logs?page=1&limit=50&action=&userId=
exports.getLogs = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 50);
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.user   = req.query.userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'hoTen vaiTro chucVu avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    const data = logs.map(l => ({
      id:        l._id,
      userId:    l.user?._id,
      user:      l.user,
      action:    l.action,
      entity:    l.entity,
      target:    l.target,
      ip:        l.ip,
      device:    l.device,
      timestamp: l.createdAt,
    }));

    res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
