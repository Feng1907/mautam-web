const AuditLog = require('../models/AuditLog');

const parseDevice = (ua = '') => {
  if (!ua) return 'Unknown';
  const browser = ua.includes('Firefox') ? 'Firefox'
    : ua.includes('Edg') ? 'Edge'
    : ua.includes('Chrome') ? 'Chrome'
    : ua.includes('Safari') ? 'Safari'
    : 'Browser';
  const os = ua.includes('Windows') ? 'Windows'
    : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS'
    : ua.includes('Android') ? 'Android'
    : ua.includes('Mac') ? 'Mac'
    : ua.includes('Linux') ? 'Linux'
    : 'Unknown';
  return `${browser} / ${os}`;
};

/**
 * Log a user action. Fire-and-forget — never throws.
 * @param {object} req  - Express request (for user + ip + ua)
 * @param {string} action - 'create' | 'update' | 'delete' | 'grant' | 'login' | 'export'
 * @param {string} entity - 'student' | 'user' | 'grade' | 'post' | 'class' | 'namhoc' | ...
 * @param {string} target - Human-readable description, e.g. 'Nguyễn Văn An'
 */
const logAction = (req, action, entity, target) => {
  AuditLog.create({
    user:   req.user?._id,
    action,
    entity,
    target,
    ip:     req.ip || req.connection?.remoteAddress,
    device: parseDevice(req.headers?.['user-agent']),
  }).catch(() => {});
};

module.exports = { logAction };
