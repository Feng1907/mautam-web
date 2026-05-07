const router = require('express').Router();
const { guiDiemDanh, guiLichLe, guiBangDiem } = require('../controllers/notifyController');
const { checkAuth, requireAdmin }  = require('../middlewares/checkAuth');

// Chỉ admin hoặc giaoly (huynh trưởng) mới được gửi email
const requireStaff = (req, res, next) => {
  if (!['admin', 'giaoly'].includes(req.user?.vaiTro))
    return res.status(403).json({ success: false, message: 'Không có quyền gửi thông báo' });
  next();
};

router.post('/diem-danh', checkAuth, requireStaff, guiDiemDanh);
router.post('/lich-le',   checkAuth, requireStaff, guiLichLe);
router.post('/bang-diem', checkAuth, requireStaff, guiBangDiem);

module.exports = router;
