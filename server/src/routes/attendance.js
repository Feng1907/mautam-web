const router = require('express').Router();
const ctrl = require('../controllers/attendanceController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

router.get('/sundays', ctrl.getSundays);
router.get('/:lopId', checkAuth, ctrl.getByClass);
router.post('/', checkAuth, checkClassPermission, ctrl.upsert);

module.exports = router;
