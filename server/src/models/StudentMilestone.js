const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  loai: {
    type: String,
    enum: ['ruatoi', 'ruocle', 'themsucc', 'giaivai', 'khac'],
    required: true,
  },
  ngay:   { type: Date, required: true },
  ghiChu: { type: String, maxlength: 300, default: '' },
  ghiBoi: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('StudentMilestone', milestoneSchema);
