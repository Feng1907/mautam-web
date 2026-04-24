const router = require('express').Router();
const { login, getMe } = require('../controllers/authController');
const { checkAuth } = require('../middlewares/checkAuth');

router.post('/login', login);
router.get('/me', checkAuth, getMe);

module.exports = router;
