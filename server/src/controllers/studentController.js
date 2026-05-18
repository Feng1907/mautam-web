const Student   = require('../models/Student');
const Grade     = require('../models/Grade');
const ChuyenCan = require('../models/ChuyenCan');
const NamHoc    = require('../models/NamHoc');

// GET /api/students?lopId=...
exports.getByClass = async (req, res, next) => {
  try {
    const { lopId } = req.params;
    const students = await Student.find({ lop: lopId, trangThai: 'active' })
      .sort('hoTen');
    res.json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:lopId/:id
exports.getOne = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('lop', 'tenLop');
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// Chuẩn hóa ngaySinh: chuỗi rỗng → null để Mongoose không báo cast error
const normalizeBody = (body) => ({
  ...body,
  ngaySinh: body.ngaySinh === '' ? null : (body.ngaySinh || null),
});

// POST /api/students
exports.create = async (req, res, next) => {
  try {
    const student = await Student.create(normalizeBody(req.body));
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
exports.update = async (req, res, next) => {
  try {
    // Không cho phép đổi lớp qua route này (dùng route transfer riêng)
    const { lop, ...updateData } = normalizeBody(req.body);
    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:lopId/:id/lich-su  — Lịch sử điểm qua các năm học
exports.lichSu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [namHocList, grades, ccList] = await Promise.all([
      NamHoc.find().sort('-ngayBatDau').lean(),
      Grade.find({ student: id }).lean(),
      ChuyenCan.find({ student: id }).lean(),
    ]);

    const gradesByNam = {};
    for (const g of grades) {
      const key = g.namHoc.toString();
      if (!gradesByNam[key]) gradesByNam[key] = [];
      gradesByNam[key].push(g);
    }
    const ccByNam = {};
    for (const c of ccList) {
      const key = c.namHoc.toString();
      if (!ccByNam[key]) ccByNam[key] = [];
      ccByNam[key].push(c);
    }

    const result = namHocList
      .map((nh) => {
        const key = nh._id.toString();
        const gs = gradesByNam[key] || [];
        const cs = ccByNam[key] || [];
        if (!gs.length && !cs.length) return null;
        return { namHoc: { _id: nh._id, ten: nh.ten }, grades: gs, chuyenCan: cs };
      })
      .filter(Boolean);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id  (soft delete)
// GET /api/students/count  — tổng số đoàn sinh active (public, dùng cho home stats)
exports.count = async (req, res, next) => {
  try {
    const total = await Student.countDocuments({ trangThai: 'active' });
    res.json({ success: true, total });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { trangThai: 'inactive' },
      { new: true }
    );
    if (!student)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đoàn sinh' });
    res.json({ success: true, message: 'Đã xoá đoàn sinh' });
  } catch (err) {
    next(err);
  }
};
