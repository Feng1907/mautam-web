const mongoose = require('mongoose');

const assigneeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  note: { type: String, default: '' },
}, { _id: false });

const taskSchema = new mongoose.Schema({
  type:      { type: String, required: true },
  assignees: { type: [assigneeSchema], default: [] },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  date:  { type: String, default: '' },
  tasks: { type: [taskSchema], default: [] },
}, { _id: false });

const assignmentSheetSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  taskTypes:   { type: [String], default: [] },
  sessions:    { type: [sessionSchema], default: [] },
  isPublished: { type: Boolean, default: false },
  notifiedAt:  { type: Date, default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

assignmentSheetSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AssignmentSheet', assignmentSheetSchema);
