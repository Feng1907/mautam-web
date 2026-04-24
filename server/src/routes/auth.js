const router = require('express').Router();
const {
  login,
  getMe,
  register,
  changePassword,
  forgotPassword,
} = require('../controllers/authController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.post('/login', login);
router.get('/me', checkAuth, getMe);
router.post('/register', checkAuth, requireAdmin, register);
router.put('/change-password', checkAuth, changePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;
