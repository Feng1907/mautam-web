const router = require('express').Router();
const ctrl   = require('../controllers/exportController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

// Chỉ admin và giaoly lớp mình mới được export
router.get('/attendance/:lopId', checkAuth, checkClassPermission, ctrl.exportAttendance);
router.get('/grades/:lopId',     checkAuth, checkClassPermission, ctrl.exportGrades);

module.exports = router;
