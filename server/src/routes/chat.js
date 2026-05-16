const router    = require('express').Router();
const multer    = require('multer');
const rateLimit = require('express-rate-limit');
const { chat }  = require('../controllers/chatController');

// ── Rate limit: 20 tin nhắn / phút / IP ──────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Anh/Chị gửi quá nhiều tin nhắn rồi. Vui lòng chờ một chút nhé! 🙏',
  },
});

// ── Multer: lưu vào bộ nhớ tạm (xóa ngay sau khi AI trả lời) ─────────────────
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Định dạng tệp không được hỗ trợ (chỉ chấp nhận PDF, Word, TXT, ảnh JPG/PNG).'));
  },
}).single('file');

// ── Route: POST /api/chat ─────────────────────────────────────────────────────
router.post('/', chatLimiter, (req, res, next) => {
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

module.exports = router;
