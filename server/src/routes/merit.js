const router = require('express').Router();
const ctrl   = require('../controllers/meritController');
const { checkAuth } = require('../middlewares/checkAuth');

router.get('/:lopId',   checkAuth, ctrl.getByLop);
router.post('/',        checkAuth, ctrl.create);
router.delete('/:id',   checkAuth, ctrl.remove);

module.exports = router;
