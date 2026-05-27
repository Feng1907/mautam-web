const mongoose = require('mongoose');

const htMessageSchema = new mongoose.Schema({
  room:   { type: mongoose.Schema.Types.ObjectId, ref: 'HtRoom', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, maxlength: 2000, required: true },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('HtMessage', htMessageSchema);
