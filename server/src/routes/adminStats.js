const router = require('express').Router();
const ctrl = require('../controllers/adminStatsController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/trends', checkAuth, requireAdmin, ctrl.getTrends);

module.exports = router;
