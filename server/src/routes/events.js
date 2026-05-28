const router = require('express').Router();
const ctrl = require('../controllers/countdownController');
const { checkAuth, requireAdmin, requireGiaoly } = require('../middlewares/checkAuth');

router.get('/',     ctrl.list);                              // public
router.get('/all',  checkAuth, requireAdmin, ctrl.listAll); // admin
router.post('/',    checkAuth, requireAdmin, ctrl.create);
router.put('/:id',  checkAuth, requireAdmin, ctrl.update);
router.delete('/:id', checkAuth, requireAdmin, ctrl.remove);

// RSVP huynh trưởng — chỉ giaoly/admin
router.post('/:id/rsvp',          checkAuth, requireGiaoly, ctrl.rsvpEvent);
router.delete('/:id/rsvp',        checkAuth, requireGiaoly, ctrl.cancelRsvp);
router.get('/:id/rsvp',           checkAuth, requireAdmin,  ctrl.getRsvpList);

// Student RSVP — giaoly đăng ký cho học sinh lớp mình
router.post('/:id/student-rsvp',  checkAuth, requireGiaoly, ctrl.toggleStudentRsvp);

module.exports = router;
