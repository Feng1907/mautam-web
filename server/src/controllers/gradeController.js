const Grade = require('../models/Grade');
const NamHoc = require('../models/NamHoc');

// GET /api/grades/:lopId?namHocId=...&hocKy=1
exports.getByClass = async (req, res, next) => {
  try {
    let namHocId = req.query.namHocId;
    if (!namHocId) {
      const namHoc = await NamHoc.findOne({ dangHoatDong: true });
      if (!namHoc)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      namHocId = namHoc._id;
    }

    const filter = { lop: req.params.lopId, namHoc: namHocId };
    if (req.query.hocKy) filter.hocKy = Number(req.query.hocKy);

    const grades = await Grade.find(filter)
      .populate('student', 'hoTen tenThanh')
      .sort('student');

    res.json({ success: true, data: grades });
  } catch (err) {
    next(err);
  }
};

// POST /api/grades
exports.create = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const grade = await Grade.create({
      ...req.body,
      namHoc: namHoc._id,
      nhapBoi: req.user._id,
    });
    res.status(201).json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

// PUT /api/grades/:id
exports.update = async (req, res, next) => {
  try {
    // Không cho phép thay đổi student, lop, namHoc qua route này
    const { student, lop, namHoc, ...updateData } = req.body;
    const grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!grade)
      return res.status(404).json({ success: false, message: 'Không tìm thấy điểm' });
    res.json({ success: true, data: grade });
  } catch (err) {
    next(err);
  }
};

// POST /api/grades/import  { lopId, rows: [{ studentId, loaiDiem, hocKy, diem, ghiChu }] }
exports.importBulk = async (req, res, next) => {
  try {
    const { lopId, rows } = req.body;
    if (!lopId || !Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ success: false, message: 'Thiếu lopId hoặc rows' });
    }

    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc) return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    const validLoai = ['mieng', '15phut', '1tiet'];
    const errors = [];
    const ops = [];

    rows.forEach((row, i) => {
      const diem = Number(row.diem);
      const hocKy = Number(row.hocKy);
      if (!row.studentId) { errors.push({ row: i + 1, msg: 'Thiếu studentId' }); return; }
      if (!validLoai.includes(row.loaiDiem)) { errors.push({ row: i + 1, msg: `loaiDiem không hợp lệ: ${row.loaiDiem}` }); return; }
      if (![1, 2].includes(hocKy)) { errors.push({ row: i + 1, msg: `hocKy không hợp lệ: ${row.hocKy}` }); return; }
      if (isNaN(diem) || diem < 0 || diem > 10) { errors.push({ row: i + 1, msg: `Điểm không hợp lệ: ${row.diem}` }); return; }

      ops.push({
        updateOne: {
          filter: { student: row.studentId, lop: lopId, namHoc: namHoc._id, loaiDiem: row.loaiDiem, hocKy },
          update: { $set: { diem, ghiChu: row.ghiChu || '', nhapBoi: req.user._id } },
          upsert: true,
        },
      });
    });

    let result = { upsertedCount: 0, modifiedCount: 0 };
    if (ops.length) result = await Grade.bulkWrite(ops);

    res.json({
      success: true,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      errors,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/grades/:id
exports.remove = async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade)
      return res.status(404).json({ success: false, message: 'Không tìm thấy điểm' });
    res.json({ success: true, message: 'Đã xoá điểm' });
  } catch (err) {
    next(err);
  }
};
