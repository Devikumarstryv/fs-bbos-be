const winston = require('winston');
const { format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Custom format for logs
const logFormat = format.combine(
    format.colorize(),
    format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(({ timestamp, level, message, meta }) => {
        return `${timestamp} [${level}] ${message}}`;
    })
);

// Create Winston logger instance
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            ),
        }),
        new DailyRotateFile({
            filename: 'logs/bbos-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
        }),
    ],
    exitOnError: false, 
});

// Middleware to log HTTP requests
const httpLogger = (req, res, next) => {
    logger.info(`Method: ${req.method} URL: ${req.url} Status: ${res.statusCode}`
      // {
      //  method: req.method,
       // url: req.url,
       // ip: req.ip,
        // userAgent: req.get('User-Agent'),
        //status: res.statusCode,
    // }
  );
    next();
};

module.exports = { logger, httpLogger };
