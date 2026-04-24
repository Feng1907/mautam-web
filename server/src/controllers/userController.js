const User = require('../models/User');

// GET /api/users  (Admin only — danh sách tất cả giáo lý viên)
exports.getAll = async (req, res, next) => {
  try {
    const { vaiTro } = req.query;
    const filter = {};
    if (vaiTro) filter.vaiTro = vaiTro;

    const users = await User.find(filter)
      .select('-matKhau')
      .populate('lopPhuTrach', 'tenLop nhanh');

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id  (Admin only — cập nhật thông tin, vaiTro)
exports.update = async (req, res, next) => {
  try {
    const { matKhau, ...updateData } = req.body; // Không cho đổi mật khẩu qua route này
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-matKhau');
    if (!user)
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id  (Admin only)
exports.remove = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Không thể xoá chính mình' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá người dùng' });
  } catch (err) {
    next(err);
  }
};
