const router = require('express').Router();
const ctrl   = require('../controllers/quizController');
const { checkAuth, requireGiaoly } = require('../middlewares/checkAuth');

// Lịch sử quiz của học sinh (đặt trước /:id để tránh conflict)
router.get('/student/:studentId', checkAuth, ctrl.getStudentQuizzes);

// Quiz CRUD — giaoly/admin quản lý
router.get('/',     checkAuth, ctrl.list);
router.post('/',    checkAuth, requireGiaoly, ctrl.create);
router.get('/:id',  checkAuth, ctrl.getOne);
router.put('/:id',  checkAuth, requireGiaoly, ctrl.update);
router.delete('/:id', checkAuth, requireGiaoly, ctrl.remove);

// Làm bài — học sinh/phụ huynh
router.post('/:id/start',  checkAuth, ctrl.startQuiz);
router.post('/:id/submit', checkAuth, ctrl.submitQuiz);

// Báo vi phạm — public (dùng sendBeacon, không có auth header)
router.post('/:id/violation', ctrl.reportViolation);

// Kết quả & giám sát — giaoly/admin
router.get('/:id/results',     checkAuth, requireGiaoly, ctrl.getResults);
router.get('/:id/monitor',     checkAuth, requireGiaoly, ctrl.getMonitor);
router.get('/:id/leaderboard', checkAuth, ctrl.getLeaderboard);

// Chấm tự luận
router.get('/:id/attempts', checkAuth, requireGiaoly, ctrl.getAttempts);
router.post('/:id/attempts/:attemptId/grade', checkAuth, requireGiaoly, ctrl.gradeEssay);

module.exports = router;
