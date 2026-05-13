const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logDir = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

const exactLevel = (level) =>
  winston.format((info) => (info.level === level ? info : false))();

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${stack || message}${extra}`;
  })
);

const productionTransports = [
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: winston.format.combine(exactLevel('error'), baseFormat),
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'warn.log'),
    level: 'warn',
    format: winston.format.combine(exactLevel('warn'), baseFormat),
  }),
  new winston.transports.File({
    filename: path.join(logDir, 'info.log'),
    level: 'info',
    format: winston.format.combine(exactLevel('info'), baseFormat),
  }),
];

const developmentTransports = [
  new winston.transports.Console({
    level: 'info',
    format: consoleFormat,
  }),
];

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'info',
  levels: winston.config.npm.levels,
  transports: isProduction ? productionTransports : developmentTransports,
  exitOnError: false,
});

const emailBatchLogger = winston.createLogger({
  level: 'error',
  format: baseFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'email-batch-errors.log'),
      level: 'error',
    }),
  ],
  exitOnError: false,
});

module.exports = {
  logger,
  emailBatchLogger,
};
