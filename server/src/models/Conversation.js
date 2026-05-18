const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id:          { type: Number },
  role:        { type: String, enum: ['user', 'model'], required: true },
  text:        { type: String, default: '' },
  fileName:    { type: String, default: null },
  suggestions: { type: [String], default: [] },
  isError:     { type: Boolean, default: false },
  ts:          { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, default: 'Cuộc trò chuyện mới', maxlength: 100, trim: true },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
