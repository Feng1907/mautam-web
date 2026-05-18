const router = require('express').Router();
const { getLogs } = require('../controllers/auditLogController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/', checkAuth, requireAdmin, getLogs);

module.exports = router;
