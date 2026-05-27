const router = require('express').Router();
const ctrl = require('../controllers/htChatController');
const { checkAuth, requireGiaoly } = require('../middlewares/checkAuth');

router.use(checkAuth, requireGiaoly);

router.get('/users',                   ctrl.getUsers);
router.get('/rooms',                   ctrl.getRooms);
router.post('/rooms',                  ctrl.createRoom);
router.get('/rooms/:id/messages',      ctrl.getMessages);
router.post('/rooms/:id/messages',     ctrl.sendMessage);
router.put('/rooms/:id/read',          ctrl.markRead);

module.exports = router;
