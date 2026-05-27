const mongoose = require('mongoose');

const htRoomSchema = new mongoose.Schema({
  name:      { type: String, maxlength: 100, default: null },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isGroup:   { type: Boolean, default: false },
  lastMsg:   { type: String, default: null },
  lastMsgAt: { type: Date,   default: null },
}, { timestamps: true });

htRoomSchema.index({ members: 1 });

module.exports = mongoose.model('HtRoom', htRoomSchema);
