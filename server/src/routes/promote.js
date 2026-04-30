const router = require('express').Router();
const ctrl   = require('../controllers/promoteController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.post('/',         checkAuth, requireAdmin, ctrl.promote);
router.get('/history',   checkAuth, requireAdmin, ctrl.history);

module.exports = router;
