const router = require('express').Router();
const ctrl = require('../controllers/postController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', checkAuth, requireAdmin, ctrl.create);
router.put('/:id', checkAuth, requireAdmin, ctrl.update);
router.delete('/:id', checkAuth, requireAdmin, ctrl.remove);

module.exports = router;
