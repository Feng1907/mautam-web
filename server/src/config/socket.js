const { Server } = require('socket.io');
const { logger }  = require('../utils/logger');

let io = null;

function initSocket(httpServer) {
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
    },
    // Tự reconnect phía client — server chấp nhận mọi transport
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`[Socket] connected: ${socket.id}`);

    // Client join vào room theo lopId để nhận event của lớp đó
    socket.on('join:lop', (lopId) => {
      socket.join(`lop:${lopId}`);
      logger.info(`[Socket] ${socket.id} joined lop:${lopId}`);
    });

    socket.on('leave:lop', (lopId) => {
      socket.leave(`lop:${lopId}`);
    });

    // Admin join room riêng để nhận thông báo hệ thống
    socket.on('join:admin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io chưa được khởi tạo');
  return io;
}

module.exports = { initSocket, getIO };
