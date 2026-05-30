const router = require('express').Router();
const { checkAuth, requireGiaoly } = require('../middlewares/checkAuth');
const ctrl = require('../controllers/absenceRequestController');

router.get('/',       checkAuth, requireGiaoly, ctrl.getByClass);
router.patch('/:id/status', checkAuth, requireGiaoly, ctrl.updateStatus);

module.exports = router;
