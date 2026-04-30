const mongoose = require('mongoose');

const promotionHistorySchema = new mongoose.Schema({
  // Năm học mới (đích đến)
  namHocMoi: { type: mongoose.Schema.Types.ObjectId, ref: 'NamHoc', required: true },

  // Danh sách đoàn sinh được chuyển
  chiTiet: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      fromLop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
      toLop:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    },
  ],

  ghiChu:       { type: String, default: '' },
  thucHienBoi:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PromotionHistory', promotionHistorySchema);
