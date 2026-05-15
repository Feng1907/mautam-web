const mongoose = require('mongoose');

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    quanHe: {
      type: String,
      trim: true,
      default: 'phuHuynh',
    },
    trangThai: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'rejected'],
      default: 'active',
    },
    ghiChu: {
      type: String,
      trim: true,
    },
    rejectedReason: {
      type: String,
      trim: true,
      default: null,
    },
    linkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    collection: 'parent_students',
    timestamps: true,
  }
);

parentStudentSchema.index({ parent: 1, student: 1 }, { unique: true });
parentStudentSchema.index({ parent: 1, trangThai: 1 });
parentStudentSchema.index({ student: 1, trangThai: 1 });

module.exports = mongoose.model('ParentStudent', parentStudentSchema);
