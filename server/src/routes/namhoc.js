const router = require('express').Router();
const ctrl = require('../controllers/namHocController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/',                   ctrl.getAll);
router.post('/',                  checkAuth, requireAdmin, ctrl.create);
router.post('/auto-next',         checkAuth, requireAdmin, ctrl.autoCreateNext);
router.put('/:id/activate',       checkAuth, requireAdmin, ctrl.activate);
router.put('/:id',                checkAuth, requireAdmin, ctrl.update);

module.exports = router;
