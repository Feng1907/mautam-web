const router = require('express').Router();
const { checkAuth } = require('../middlewares/checkAuth');
const ctrl = require('../controllers/adminParentLinkController');

const requireAdmin = (req, res, next) => {
  if (req.user?.vaiTro !== 'admin')
    return res.status(403).json({ success: false, message: 'Chỉ admin mới có quyền' });
  next();
};

router.use(checkAuth, requireAdmin);

router.get('/search-users',    ctrl.searchUsers);
router.get('/search-students', ctrl.searchStudents);
router.post('/sync-roles',     ctrl.syncRoles);
router.get('/',                ctrl.getAll);
router.post('/',               ctrl.create);
router.patch('/:id',           ctrl.update);
router.delete('/:id',          ctrl.remove);

module.exports = router;
