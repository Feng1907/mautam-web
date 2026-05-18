const router = require('express').Router();
const { getAll, getOne, create, update, remove, publish } = require('../controllers/assignmentController');
const { checkAuth, requireAdmin } = require('../middlewares/checkAuth');

router.get('/',          getAll);
router.get('/:id',       checkAuth, getOne);
router.post('/',         checkAuth, requireAdmin, create);
router.put('/:id',       checkAuth, requireAdmin, update);
router.delete('/:id',    checkAuth, requireAdmin, remove);
router.post('/:id/publish', checkAuth, requireAdmin, publish);

module.exports = router;
