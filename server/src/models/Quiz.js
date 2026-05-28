const mongoose = require('mongoose');

const dapAnSchema = new mongoose.Schema({
  chu:       { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  noiDung:   { type: String, required: true, maxlength: 500 },
  dungKhong: { type: Boolean, default: false },
}, { _id: false });

const cauHoiSchema = new mongoose.Schema({
  loai:          { type: String, enum: ['trac_nghiem', 'dien_khuyet', 'tu_luan'], required: true },
  noiDung:       { type: String, required: true, maxlength: 1000 },
  diem:          { type: Number, default: 1, min: 0, max: 10 },
  // trac_nghiem
  dapAn:         { type: [dapAnSchema], default: undefined },
  // dien_khuyet — nhiều đáp án alias được chấp nhận
  dapAnDung:     { type: [String], default: undefined },
  caseSensitive: { type: Boolean, default: false },
  // tu_luan — gợi ý cho huynh trưởng khi chấm
  goiY:          { type: String, maxlength: 500 },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  tieuDe:      { type: String, required: true, trim: true, maxlength: 200 },
  moTa:        { type: String, maxlength: 1000, default: '' },
  lop:         { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  namHoc:      { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc' },
  thoiGianLam: { type: Number, default: 30, min: 1, max: 180 }, // phút
  batDauTu:    { type: Date, default: null },
  ketThucLuc:  { type: Date, default: null },
  taoBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active:      { type: Boolean, default: false },
  cauHoi:      { type: [cauHoiSchema], default: [] },
}, { timestamps: true });

quizSchema.index({ lop: 1, active: 1 });
quizSchema.index({ lop: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
