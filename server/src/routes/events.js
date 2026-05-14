const router = require('express').Router();
const ctrl = require('../controllers/countdownController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/',     ctrl.list);                              // public
router.get('/all',  checkAuth, requireAdmin, ctrl.listAll); // admin
router.post('/',    checkAuth, requireAdmin, ctrl.create);
router.put('/:id',  checkAuth, requireAdmin, ctrl.update);
router.delete('/:id', checkAuth, requireAdmin, ctrl.remove);

module.exports = router;
