const router = require('express').Router();
const { checkAuth }            = require('../middlewares/checkAuth');
const checkClassPermission = require('../middlewares/checkClassPermission');
const ctrl                     = require('../controllers/chuyenCanController');

// GET lấy điểm chuyên cần cả lớp
router.get('/:lopId', checkAuth, checkClassPermission, ctrl.getByLop);

// POST upsert điểm chuyên cần 1 em
router.post('/', checkAuth, ctrl.upsert);

// DELETE xoá điểm chuyên cần
router.delete('/:id', checkAuth, ctrl.remove);

module.exports = router;
