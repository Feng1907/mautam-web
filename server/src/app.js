const express = require('express');
const cors    = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

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

app.use('/api/liturgy',   require('./routes/liturgy'));
app.use('/api/loi-chua',  require('./routes/loiChua'));
app.use('/api/notify',    require('./routes/notify'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

module.exports = app;
