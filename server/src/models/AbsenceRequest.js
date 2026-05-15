const mongoose = require('mongoose');

const absenceRequestSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lop: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notifiedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

absenceRequestSchema.index({ parent: 1, createdAt: -1 });
absenceRequestSchema.index({ student: 1, date: 1 });
absenceRequestSchema.index({ lop: 1, status: 1 });

module.exports = mongoose.model('AbsenceRequest', absenceRequestSchema);
