const NamHoc = require('../models/NamHoc');

// Tính Chúa Nhật đầu tiên của tháng trong năm
const firstSundayOf = (year, month) => {   // month: 0-based
  const d = new Date(year, month, 1);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  return d;
};

// Tính Chúa Nhật cuối cùng của tháng trong năm
const lastSundayOf = (year, month) => {
  const last = new Date(year, month + 1, 0); // ngày cuối tháng
  while (last.getDay() !== 0) last.setDate(last.getDate() - 1);
  return last;
};

// GET /api/namhoc
exports.getAll = async (req, res, next) => {
  try {
    const list = await NamHoc.find().sort('-ngayBatDau');
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

// POST /api/namhoc  (Admin — tạo thủ công)
exports.create = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.create(req.body);
    res.status(201).json({ success: true, data: namHoc });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Năm học đã tồn tại' });
    next(err);
  }
};

// POST /api/namhoc/auto-next  (Admin — tự tạo năm học tiếp theo)
// Lấy năm học mới nhất, cộng thêm 1 năm, lấy ngày Chúa Nhật đầu tháng 9 → cuối tháng 6
exports.autoCreateNext = async (req, res, next) => {
  try {
    const latest = await NamHoc.findOne().sort('-ngayBatDau');
    const startYear = latest
      ? new Date(latest.ngayBatDau).getFullYear() + 1
      : new Date().getFullYear();
    const endYear = startYear + 1;

    const ten = `${startYear}-${endYear}`;
    const existing = await NamHoc.findOne({ ten });
    if (existing)
      return res.status(400).json({ success: false, message: `Năm học ${ten} đã tồn tại` });

    // Chúa Nhật đầu tiên của tháng 9 năm startYear
    const ngayBatDau = firstSundayOf(startYear, 8); // tháng 8 = September (0-based)
    // Chúa Nhật cuối cùng của tháng 6 năm endYear
    const ngayKetThuc = lastSundayOf(endYear, 5);   // tháng 5 = June

    const namHoc = await NamHoc.create({ ten, ngayBatDau, ngayKetThuc, dangHoatDong: false });
    res.status(201).json({ success: true, data: namHoc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/namhoc/:id/activate  (Admin — kích hoạt năm học, tắt các năm khác)
exports.activate = async (req, res, next) => {
  try {
    const namHoc = await NamHoc.findById(req.params.id);
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });

    namHoc.dangHoatDong = true;
    await namHoc.save(); // pre-save hook tự tắt các năm khác

    res.json({ success: true, data: namHoc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/namhoc/:id  (Admin — sửa thông tin)
exports.update = async (req, res, next) => {
  try {
    const { dangHoatDong, ...updateData } = req.body; // không cho sửa trạng thái qua route này
    const namHoc = await NamHoc.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!namHoc)
      return res.status(404).json({ success: false, message: 'Không tìm thấy năm học' });
    res.json({ success: true, data: namHoc });
  } catch (err) {
    next(err);
  }
};
