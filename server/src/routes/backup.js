const router = require('express').Router();
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');
const { exportJson } = require('../controllers/backupController');

// GET /api/backup/json — yêu cầu admin
router.get('/json', checkAuth, requireAdmin, exportJson);

module.exports = router;
