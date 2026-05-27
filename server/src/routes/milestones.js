const router = require('express').Router();
const ctrl = require('../controllers/milestoneController');
const { checkAuth, requireGiaoly } = require('../middlewares/checkAuth');

router.get('/:studentId',  checkAuth, ctrl.list);
router.post('/',           checkAuth, requireGiaoly, ctrl.create);
router.delete('/:id',      checkAuth, requireGiaoly, ctrl.remove);

module.exports = router;
