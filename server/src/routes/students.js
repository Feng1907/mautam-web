const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

// GET /api/students/:lopId - xem danh sách lớp (tất cả đăng nhập được xem)
router.get('/:lopId', checkAuth, ctrl.getByClass);

// Các thao tác tạo/sửa/xoá yêu cầu quyền phụ trách lớp
router.post('/', checkAuth, checkClassPermission, ctrl.create);
router.put('/:id', checkAuth, checkClassPermission, ctrl.update);
router.delete('/:id', checkAuth, checkClassPermission, ctrl.remove);

module.exports = router;
