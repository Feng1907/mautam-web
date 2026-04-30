require('dotenv').config();
const app       = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Render chạy sau reverse proxy — cần trust proxy để req.ip chính xác
app.set('trust proxy', 1);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Graceful shutdown — Render gửi SIGTERM khi restart/deploy
  const shutdown = () => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
});
