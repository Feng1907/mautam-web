const router      = require('express').Router();
const multer      = require('multer');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { checkAuth } = require('../middlewares/checkAuth');
const {
  chat, chatStream,
  listConversations, createConversation, getConversation,
  deleteConversation, saveConversation,
} = require('../controllers/chatController');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),
  message: { success: false, message: 'Anh/Chị gửi quá nhiều tin nhắn rồi. Vui lòng chờ một chút nhé! 🙏' },
});

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain',
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

// ── Conversations ─────────────────────────────────────────────────────────────
router.get('/conversations',           checkAuth, listConversations);
router.post('/conversations',          checkAuth, createConversation);
router.get('/conversations/:id',       checkAuth, getConversation);
router.delete('/conversations/:id',    checkAuth, deleteConversation);
router.post('/conversations/:id/save', checkAuth, saveConversation);

// ── AI chat (yêu cầu đăng nhập) ──────────────────────────────────────────────
router.post('/', checkAuth, chatLimiter, (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Tệp vượt quá 5MB.' : err.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, chat);

router.post('/stream', checkAuth, chatLimiter, chatStream);

module.exports = router;
