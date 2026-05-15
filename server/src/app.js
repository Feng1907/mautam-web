const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: 'Du lieu gui len khong hop le',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
};

const mongoId = (field, message) =>
  body(field)
    .isMongoId()
    .withMessage(message);

const optionalMongoId = (field, message) =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage(message);

const optionalText = (field, max, message) =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max })
    .withMessage(message);

const validate = (rules) => [...rules, handleValidationErrors];

const authValidators = {
  login: validate([
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email khong hop le'),
    body('matKhau').isString().notEmpty().withMessage('Mat khau la bat buoc'),
  ]),
  signup: validate([
    body('hoTen').trim().notEmpty().withMessage('Ho ten la bat buoc').isLength({ max: 120 }).withMessage('Ho ten qua dai'),
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email khong hop le'),
    body('matKhau').isLength({ min: 6, max: 128 }).withMessage('Mat khau phai tu 6 den 128 ky tu'),
    optionalText('soDienThoai', 30, 'So dien thoai qua dai'),
  ]),
  register: validate([
    body('hoTen').trim().notEmpty().withMessage('Ho ten la bat buoc').isLength({ max: 120 }).withMessage('Ho ten qua dai'),
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email khong hop le'),
    body('vaiTro').optional().isIn(['admin', 'giaoly', 'user', 'PARENT']).withMessage('Vai tro khong hop le'),
    optionalText('soDienThoai', 30, 'So dien thoai qua dai'),
  ]),
  profile: validate([
    optionalText('hoTen', 120, 'Ho ten qua dai'),
    optionalText('soDienThoai', 30, 'So dien thoai qua dai'),
    body('avatar')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage('Avatar khong hop le')
      .isLength({ max: 2 * 1024 * 1024 })
      .withMessage('Anh qua lon, vui long chon anh duoi 1.5MB'),
  ]),
  changePassword: validate([
    body('matKhauCu').isString().notEmpty().withMessage('Mat khau cu la bat buoc'),
    body('matKhauMoi').isLength({ min: 6, max: 128 }).withMessage('Mat khau moi phai tu 6 den 128 ky tu'),
  ]),
  forgotPassword: validate([
    body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email khong hop le'),
  ]),
};

const studentValidators = {
  create: validate([
    body('hoTen').trim().notEmpty().withMessage('Ho ten la bat buoc').isLength({ max: 120 }).withMessage('Ho ten qua dai'),
    body('tenThanh').trim().notEmpty().withMessage('Ten thanh la bat buoc').isLength({ max: 80 }).withMessage('Ten thanh qua dai'),
    body('gioiTinh').isIn(['Nam', 'Nu']).withMessage('Gioi tinh khong hop le'),
    mongoId('lop', 'Lop khong hop le'),
    optionalMongoId('lopId', 'LopId khong hop le'),
    body('ngaySinh').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Ngay sinh khong hop le'),
    optionalText('phuHuynh.hoTen', 120, 'Ten phu huynh qua dai'),
    optionalText('phuHuynh.soDienThoai', 30, 'So dien thoai phu huynh qua dai'),
    body('phuHuynh.email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email phu huynh khong hop le'),
    body('avatar').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 2048 }).withMessage('Avatar khong hop le'),
  ]),
  update: validate([
    body('hoTen').optional().trim().notEmpty().withMessage('Ho ten khong duoc de trong').isLength({ max: 120 }).withMessage('Ho ten qua dai'),
    body('tenThanh').optional().trim().notEmpty().withMessage('Ten thanh khong duoc de trong').isLength({ max: 80 }).withMessage('Ten thanh qua dai'),
    body('gioiTinh').optional().isIn(['Nam', 'Nu']).withMessage('Gioi tinh khong hop le'),
    body('ngaySinh').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Ngay sinh khong hop le'),
    optionalText('phuHuynh.hoTen', 120, 'Ten phu huynh qua dai'),
    optionalText('phuHuynh.soDienThoai', 30, 'So dien thoai phu huynh qua dai'),
    body('phuHuynh.email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Email phu huynh khong hop le'),
    body('avatar').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 2048 }).withMessage('Avatar khong hop le'),
  ]),
};

const postValidators = {
  save: validate([
    body('tieuDe').trim().notEmpty().withMessage('Tieu de la bat buoc').isLength({ max: 200 }).withMessage('Tieu de qua dai'),
    optionalText('tomTat', 500, 'Tom tat qua dai'),
    body('noiDung').trim().notEmpty().withMessage('Noi dung la bat buoc').isLength({ max: 50000 }).withMessage('Noi dung qua dai'),
    body('loai').optional().isIn(['tintuc', 'thongbao', 'thongbaokhan']).withMessage('Loai bai viet khong hop le'),
    body('anhDaiDien').optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 2048 }).withMessage('Anh dai dien khong hop le'),
    body('daDang').optional().isBoolean().withMessage('Trang thai dang khong hop le').toBoolean(),
    body('hanHienThi').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Han hien thi khong hop le'),
  ]),
};

const notifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Qua nhieu request gui thong bao, vui long thu lai sau 15 phut',
  },
});

app.use(helmet());

// CORS: cho phép CLIENT_URL (có thể nhiều origin cách nhau dấu phẩy)
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Cho phép requests không có origin (Postman, mobile app)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} không được phép`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/api/auth/login', authValidators.login);
app.post('/api/auth/signup', authValidators.signup);
app.post('/api/auth/register', authValidators.register);
app.put('/api/auth/profile', authValidators.profile);
app.put('/api/auth/change-password', authValidators.changePassword);
app.post('/api/auth/forgot-password', authValidators.forgotPassword);

app.post('/api/students', studentValidators.create);
app.put('/api/students/:lopId/:id', studentValidators.update);

app.post('/api/posts', postValidators.save);
app.put('/api/posts/:id', postValidators.save);

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/namhoc',     require('./routes/namhoc'));
app.use('/api/classes',    require('./routes/classes'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grades',     require('./routes/grades'));
app.use('/api/posts',      require('./routes/posts'));
app.use('/api/export',     require('./routes/export'));
app.use('/api/promote',    require('./routes/promote'));
app.use('/api/merit',      require('./routes/merit'));
app.use('/api/chuyen-can', require('./routes/chuyencan'));
app.use('/api/parent',     require('./routes/parent'));
app.use('/api/admin/stats', require('./routes/adminStats'));

app.use('/api/liturgy',   require('./routes/liturgy'));
app.use('/api/loi-chua',  require('./routes/loiChua'));
app.use('/api/search',    require('./routes/search'));
app.use('/api/notify',    notifyLimiter, require('./routes/notify'));
app.use('/api/subscribe', require('./routes/subscribe'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/subscribe',     require('./routes/subscribe'));
app.use('/api/events',       require('./routes/events'));
app.use('/api/admin/stats', require('./routes/adminStats'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

module.exports = app;
