const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const htMessageSchema = new mongoose.Schema({
  room:    { type: ObjectId, ref: 'HtRoom', required: true, index: true },
  sender:  { type: ObjectId, ref: 'User', required: true },
  text:    { type: String, maxlength: 2000, default: '' },
  readBy:  [{ type: ObjectId, ref: 'User' }],
  deleted: { type: Boolean, default: false },
  reactions: [{
    emoji: { type: String, required: true },
    users: [{ type: ObjectId, ref: 'User' }],
  }],
  attachments: [{
    url:      { type: String, required: true },
    fileName: { type: String },
    fileType: { type: String }, // 'image' | 'file'
    fileSize: { type: Number },
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'HtMessage', default: null },
}, { timestamps: true });

htMessageSchema.pre('validate', function (next) {
  if (!this.text?.trim() && !this.attachments?.length)
    return next(new Error('Tin nhắn phải có nội dung hoặc tệp đính kèm'));
  next();
});

module.exports = mongoose.model('HtMessage', htMessageSchema);
