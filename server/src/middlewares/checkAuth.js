const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('lopPhuTrach', 'tenLop');
    if (!req.user) return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.vaiTro !== 'admin')
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
  next();
};

module.exports = { checkAuth, requireAdmin };
