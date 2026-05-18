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

const chatHistorySchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
