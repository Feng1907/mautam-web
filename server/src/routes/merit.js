const router = require('express').Router();
const ctrl   = require('../controllers/meritController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

router.get('/:lopId',   checkAuth, ctrl.getByLop);
router.post('/',        checkAuth, checkClassPermission, ctrl.create);
router.delete('/:id',   checkAuth, ctrl.remove);

module.exports = router;
