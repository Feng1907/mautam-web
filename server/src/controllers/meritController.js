const MeritPoint = require('../models/MeritPoint');
const NamHoc     = require('../models/NamHoc');

// GET /api/merit/:lopId?hocKy=1&namHocId=
exports.getByLop = async (req, res, next) => {
  try {
    const { hocKy, namHocId } = req.query;
    let resolvedNamHocId = namHocId;
    if (!resolvedNamHocId) {
      const active = await NamHoc.findOne({ dangHoatDong: true });
      if (active) resolvedNamHocId = active._id;
    }

    const filter = { lop: req.params.lopId };
    if (hocKy)             filter.hocKy  = Number(hocKy);
    if (resolvedNamHocId)  filter.namHoc = resolvedNamHocId;

    const data = await MeritPoint.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'hoTen tenThanh')
      .populate('nhapBoi', 'hoTen');

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// POST /api/merit
// Body: { studentId, lopId, hocKy, diem, lyDo, namHocId? }
exports.create = async (req, res, next) => {
  try {
    const { studentId, lopId, hocKy, diem, lyDo, namHocId } = req.body;

    if (diem === 0)
      return res.status(400).json({ success: false, message: 'Điểm không được là 0' });
    if (!lyDo?.trim())
      return res.status(400).json({ success: false, message: 'Vui lòng nhập lý do' });

    let resolvedNamHocId = namHocId;
    if (!resolvedNamHocId) {
      const active = await NamHoc.findOne({ dangHoatDong: true });
      if (!active)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      resolvedNamHocId = active._id;
    }

    const record = await MeritPoint.create({
      student: studentId,
      lop:     lopId,
      namHoc:  resolvedNamHocId,
      hocKy:   Number(hocKy),
      diem:    Number(diem),
      lyDo:    lyDo.trim(),
      nhapBoi: req.user?._id,
    });

    const populated = await record.populate('nhapBoi', 'hoTen');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// DELETE /api/merit/:id
exports.remove = async (req, res, next) => {
  try {
    const record = await MeritPoint.findByIdAndDelete(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
