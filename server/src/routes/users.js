const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/', checkAuth, requireAdmin, ctrl.getAll);
router.put('/:id', checkAuth, requireAdmin, ctrl.update);
router.delete('/:id', checkAuth, requireAdmin, ctrl.remove);

module.exports = router;
