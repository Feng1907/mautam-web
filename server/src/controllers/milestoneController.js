const StudentMilestone = require('../models/StudentMilestone');

const LOAI_LABEL = {
  ruatoi:   'Rửa tội',
  ruocle:   'Rước lễ lần đầu',
  themsucc: 'Thêm sức',
  giaivai:  'Giải vạ',
  khac:     'Khác',
};

// GET /api/milestones/:studentId
exports.list = async (req, res, next) => {
  try {
    const milestones = await StudentMilestone.find({ student: req.params.studentId })
      .populate('ghiBoi', 'hoTen')
      .sort({ ngay: 1 })
      .lean();
    res.json({ success: true, data: milestones });
  } catch (err) { next(err); }
};

// POST /api/milestones
exports.create = async (req, res, next) => {
  try {
    const { studentId, loai, ngay, ghiChu } = req.body;
    if (!studentId || !loai || !ngay)
      return res.status(400).json({ success: false, message: 'studentId, loại và ngày là bắt buộc' });
    if (!LOAI_LABEL[loai])
      return res.status(400).json({ success: false, message: 'Loại cột mốc không hợp lệ' });

    const milestone = await StudentMilestone.create({
      student: studentId,
      loai,
      ngay: new Date(ngay),
      ghiChu: ghiChu || '',
      ghiBoi: req.user._id,
    });
    const populated = await milestone.populate('ghiBoi', 'hoTen');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// DELETE /api/milestones/:id
exports.remove = async (req, res, next) => {
  try {
    const m = await StudentMilestone.findById(req.params.id);
    if (!m) return res.status(404).json({ success: false, message: 'Không tìm thấy cột mốc' });
    await m.deleteOne();
    res.json({ success: true });
  } catch (err) { next(err); }
};
