const router = require('express').Router();
const ctrl = require('../controllers/gradeController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

router.get('/:lopId', checkAuth, ctrl.getByClass);
router.post('/import', checkAuth, checkClassPermission, ctrl.importBulk);
router.post('/', checkAuth, checkClassPermission, ctrl.create);
router.put('/:id', checkAuth, checkClassPermission, ctrl.update);
router.delete('/:id', checkAuth, checkClassPermission, ctrl.remove);

module.exports = router;
