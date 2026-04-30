const router = require('express').Router();
const ctrl = require('../controllers/studentController');
const { checkAuth } = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');

// Xem — tất cả đã đăng nhập
router.get('/:lopId',              checkAuth, ctrl.getByClass);
router.get('/:lopId/:id/lich-su',  checkAuth, ctrl.lichSu);
router.get('/:lopId/:id',          checkAuth, ctrl.getOne);

// Thêm — lopId lấy từ req.body.lop
router.post('/', checkAuth, checkClassPermission, ctrl.create);

// Sửa / Xoá — lopId truyền qua params để middleware kiểm tra
router.put('/:lopId/:id',    checkAuth, checkClassPermission, ctrl.update);
router.delete('/:lopId/:id', checkAuth, checkClassPermission, ctrl.remove);

module.exports = router;
