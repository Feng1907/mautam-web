const mongoose = require('mongoose');

const htRoomSchema = new mongoose.Schema({
  name:      { type: String, maxlength: 100, default: null },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isGroup:   { type: Boolean, default: false },
  classRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  lastMsg:       { type: String, default: null },
  lastMsgAt:     { type: Date,   default: null },
  pinnedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'HtMessage', default: null },
}, { timestamps: true });

htRoomSchema.index({ members: 1 });
htRoomSchema.index({ classRef: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('HtRoom', htRoomSchema);
