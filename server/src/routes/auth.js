const router = require('express').Router();
const {
  login,
  getMe,
  signup,
  register,
  updateProfile,
  changePassword,
  forgotPassword,
} = require('../controllers/authController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.post('/login',           login);
router.post('/signup',          signup);                          // Đăng ký công khai
router.get('/me',               checkAuth, getMe);
router.post('/register',        checkAuth, requireAdmin, register); // Admin tạo HT
router.put('/profile',          checkAuth, updateProfile);
router.put('/change-password',  checkAuth, changePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;
