const router = require('express').Router();
const ctrl = require('../controllers/namHocController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/', ctrl.getAll);
router.post('/', checkAuth, requireAdmin, ctrl.create);
router.put('/:id/activate', checkAuth, requireAdmin, ctrl.activate);

module.exports = router;
