const ChuyenCan = require('../models/ChuyenCan');
const NamHoc    = require('../models/NamHoc');

// GET /api/chuyen-can/:lopId?hocKy=1&namHocId=...
exports.getByLop = async (req, res, next) => {
  try {
    let { hocKy, namHocId } = req.query;
    if (!namHocId) {
      const nh = await NamHoc.findOne({ dangHoatDong: true });
      if (!nh)
        return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });
      namHocId = nh._id;
    }
    const query = { lop: req.params.lopId, namHoc: namHocId };
    if (hocKy) query.hocKy = Number(hocKy);
    const data = await ChuyenCan.find(query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/chuyen-can  (upsert — một bản ghi mỗi em mỗi HK)
exports.upsert = async (req, res, next) => {
  try {
    const { studentId, lopId, hocKy, tongBuoi, soBuoiDi, vangCoPhep, vangKhongPhep, diem, ghiChu } = req.body;

    if (!studentId || !lopId || !hocKy)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (studentId, lopId, hocKy)' });

    const namHoc = await NamHoc.findOne({ dangHoatDong: true });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Chưa có năm học đang hoạt động' });

    // Tự động tính điểm nếu không truyền thẳng
    let finalDiem;
    if (diem != null && diem !== '') {
      finalDiem = Math.min(10, Math.max(0, Number(diem)));
    } else {
      const vKP = Number(vangKhongPhep) || 0;
      const vCP = Number(vangCoPhep)    || 0;
      finalDiem = Math.min(10, Math.max(0, 10 - vKP * 1 - vCP * 0.5));
    }

    const record = await ChuyenCan.findOneAndUpdate(
      { student: studentId, lop: lopId, namHoc: namHoc._id, hocKy: Number(hocKy) },
      {
        tongBuoi:      Number(tongBuoi)      || 0,
        soBuoiDi:      Number(soBuoiDi)      || 0,
        vangCoPhep:    Number(vangCoPhep)    || 0,
        vangKhongPhep: Number(vangKhongPhep) || 0,
        diem:          finalDiem,
        ghiChu:        ghiChu || '',
        nhapBoi:       req.user._id,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/chuyen-can/:id
exports.remove = async (req, res, next) => {
  try {
    const record = await ChuyenCan.findByIdAndDelete(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
    res.json({ success: true, message: 'Đã xoá điểm chuyên cần' });
  } catch (err) {
    next(err);
  }
};
