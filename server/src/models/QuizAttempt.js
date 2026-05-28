const mongoose = require('mongoose');

const viPhamSchema = new mongoose.Schema({
  loai:     { type: String, enum: ['chuyen_tab', 'mat_focus', 'dong_trang'], required: true },
  thoiGian: { type: Date, default: Date.now },
  soGiay:   { type: Number, default: 0 },
}, { _id: false });

const cauTraLoiSchema = new mongoose.Schema({
  cauHoiIndex: { type: Number, required: true },
  loai:        { type: String, enum: ['trac_nghiem', 'dien_khuyet', 'tu_luan'] },
  // trac_nghiem
  dapAnChon:   { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  // dien_khuyet
  noiDungDien: { type: String, maxlength: 500, default: '' },
  // tu_luan
  baiViet:     { type: String, maxlength: 3000, default: '' },
  // kết quả chấm (tự động cho trac_nghiem/dien_khuyet, thủ công cho tu_luan)
  dungKhong:   { type: Boolean, default: null },
  diemDat:     { type: Number, default: null },
  chamBoi:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  nhanXetCham: { type: String, maxlength: 500, default: '' },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  quiz:       { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  lop:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  batDau:     { type: Date, default: Date.now },
  nopLuc:     { type: Date, default: null },
  daHoanThanh:    { type: Boolean, default: false },
  cauTraLoi:      { type: [cauTraLoiSchema], default: [] },
  diem:           { type: Number, default: null },   // trac_nghiem + dien_khuyet
  diemTuLuan:     { type: Number, default: null },   // cộng thêm sau khi chấm tay
  tongDiem:       { type: Number, default: null },   // tổng điểm có thể đạt
  daChayDuTuLuan: { type: Boolean, default: false }, // tất cả tu_luan đã được chấm
  viPham:    { type: [viPhamSchema], default: [] },
  soViPham:  { type: Number, default: 0 },
  biFlagged: { type: Boolean, default: false },
}, { timestamps: true });

// Mỗi học sinh chỉ có 1 attempt per quiz
quizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });
quizAttemptSchema.index({ quiz: 1, daHoanThanh: 1 });
quizAttemptSchema.index({ lop: 1, quiz: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
