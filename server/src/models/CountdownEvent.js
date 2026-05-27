const mongoose = require('mongoose');

const countdownEventSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    date:    { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/ },
    icon:    { type: String, default: '📅', maxlength: 10 },
    color:   { type: String, default: '#F8D444', match: /^#[0-9a-fA-F]{3,6}$/ },
    active:  { type: Boolean, default: true },
    order:   { type: Number, default: 0 },
    reminderPushSentAt: { type: Date, default: null },
    rsvpEnabled:        { type: Boolean, default: false },
    rsvpDeadline:       { type: Date, default: null },
    studentRsvpEnabled: { type: Boolean, default: false },
    rsvpList: [{
      user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status:      { type: String, enum: ['confirmed', 'tentative', 'declined'], required: true },
      note:        { type: String, maxlength: 200, default: '' },
      respondedAt: { type: Date, default: Date.now },
    }],
    studentRsvps: [{
      student:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      lop:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
      addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      addedAt:  { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

// Sắp xếp mặc định: ngày tăng dần
countdownEventSchema.index({ date: 1 });

module.exports = mongoose.model('CountdownEvent', countdownEventSchema);
