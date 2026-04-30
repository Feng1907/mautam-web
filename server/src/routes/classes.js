const router = require('express').Router();
const ctrl = require('../controllers/classController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getOne);
router.post('/',             checkAuth, requireAdmin, ctrl.create);
router.patch('/:id',         checkAuth, requireAdmin, ctrl.update);
router.put('/:id/assign',   checkAuth, requireAdmin, ctrl.assign);
router.delete('/:id',       checkAuth, requireAdmin, ctrl.remove);

module.exports = router;
