const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, enum: ['create', 'update', 'delete', 'grant', 'login', 'export'], required: true },
  entity:    { type: String, required: true },  // 'student', 'user', 'grade', ...
  target:    { type: String, required: true },  // human-readable description
  ip:        { type: String },
  device:    { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
