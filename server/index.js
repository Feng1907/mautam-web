require('dotenv').config();
const http      = require('http');
const app       = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { startEventReminderScheduler } = require('./src/utils/eventReminderScheduler');

const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

connectDB().then(() => {
  const server = http.createServer(app);

  // Khởi tạo Socket.io — export io instance để dùng trong controllers
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  const eventReminderTimer = startEventReminderScheduler();

  const shutdown = () => {
    clearInterval(eventReminderTimer);
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT',  shutdown);
});
