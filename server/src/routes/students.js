const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

// Xem danh sách lớp — tất cả đã đăng nhập
router.get('/:lopId', checkAuth, ctrl.getByClass);
router.get('/:lopId/:id', checkAuth, ctrl.getOne);

// Thêm/sửa/xoá — cần quyền phụ trách lớp
router.post('/', checkAuth, checkClassPermission, ctrl.create);
router.put('/:id', checkAuth, checkClassPermission, ctrl.update);
router.delete('/:id', checkAuth, checkClassPermission, ctrl.remove);

module.exports = router;
