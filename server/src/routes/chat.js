const router      = require('express').Router();
const multer      = require('multer');
const rateLimit   = require('express-rate-limit');
const { checkAuth } = require('../middlewares/checkAuth');
const {
  chat, chatStream,
  getHistory, saveHistoryHandler, clearHistoryHandler,
} = require('../controllers/chatController');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    message: 'Anh/Chị gửi quá nhiều tin nhắn rồi. Vui lòng chờ một chút nhé! 🙏',
  },
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Định dạng tệp không được hỗ trợ (chỉ chấp nhận PDF, Word, TXT, ảnh JPG/PNG).'));
  },
}).single('file');

// Lịch sử chat (yêu cầu đăng nhập)
router.get('/history',      checkAuth, getHistory);
router.post('/history/save', checkAuth, saveHistoryHandler);
router.delete('/history',   checkAuth, clearHistoryHandler);

// POST /api/chat — file upload (yêu cầu đăng nhập)
router.post('/', checkAuth, chatLimiter, (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'Tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn nhé!'
        : err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, chat);

// POST /api/chat/stream — SSE streaming (yêu cầu đăng nhập)
router.post('/stream', checkAuth, chatLimiter, chatStream);

module.exports = router;
