const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  selector:  { type: String, required: true },  // 16-char prefix for O(1) lookup
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  ip:        { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// MongoDB TTL index — tự xóa document sau khi hết hạn
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Unique index để lookup O(1) bằng selector
refreshTokenSchema.index({ selector: 1 }, { unique: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
