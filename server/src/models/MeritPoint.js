const mongoose = require('mongoose');

const meritPointSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  lop:     { type: mongoose.Schema.Types.ObjectId, ref: 'Class',   required: true },
  namHoc:  { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc',  required: true },
  hocKy:   { type: Number, enum: [1, 2], required: true },

  // Dương = cộng điểm, âm = trừ điểm (range: -10 → +10)
  diem:    { type: Number, required: true },
  lyDo:    { type: String, required: true, trim: true },

  nhapBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

meritPointSchema.index({ student: 1, hocKy: 1, namHoc: 1 });

module.exports = mongoose.model('MeritPoint', meritPointSchema);
