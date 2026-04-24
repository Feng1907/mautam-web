/**
 * Middleware QUAN TRỌNG: đảm bảo huynh trưởng chỉ thao tác trên lớp mình phụ trách.
 * Admin luôn được phép. Huynh trưởng chỉ được nếu lopId nằm trong lopPhuTrach.
 * lopId được lấy từ req.params.lopId hoặc req.body.lopId.
 */
const checkClassPermission = (req, res, next) => {
  const { user } = req;
  if (!user) return res.status(401).json({ success: false, message: 'Chưa xác thực' });

  if (user.vaiTro === 'admin') return next();

  const lopId = req.params.lopId || req.body.lopId;
  if (!lopId) return res.status(400).json({ success: false, message: 'Thiếu thông tin lớp' });

  const duocPhep = user.lopPhuTrach?.some((id) => id.toString() === lopId.toString());
  if (!duocPhep)
    return res.status(403).json({ success: false, message: 'Bạn không phụ trách lớp này' });

  next();
};

module.exports = checkClassPermission;
