const mongoose = require('mongoose');

const countdownEventSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, maxlength: 100 },
    date:    { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/ },
    icon:    { type: String, default: '📅', maxlength: 10 },
    color:   { type: String, default: '#F8D444', match: /^#[0-9a-fA-F]{3,6}$/ },
    active:  { type: Boolean, default: true },
    order:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Sắp xếp mặc định: ngày tăng dần
countdownEventSchema.index({ date: 1 });

module.exports = mongoose.model('CountdownEvent', countdownEventSchema);
