const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

// Route tĩnh phải đặt TRƯỚC route có param (:lopId)
router.get('/sundays', ctrl.getSundays);
router.post('/qr-session', checkAuth, checkClassPermission, ctrl.generateQrSession);
// Public — bảo vệ bởi JWT token trong payload, không cần auth header
router.get('/qr-verify', ctrl.verifyQrToken);
router.post('/qr-scan', ctrl.scanQr);
router.get('/:lopId', checkAuth, ctrl.getByClass);
router.post('/', checkAuth, checkClassPermission, ctrl.upsert);

module.exports = router;
