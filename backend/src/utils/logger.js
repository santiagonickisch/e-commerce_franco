const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
require('dotenv').config();

// Configuración de niveles de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Configuración de colores para consola
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Configuración de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configuración de formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Configuración de transportes
const transports = [
  // Consola para desarrollo
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  }),

  // Archivo de errores
  new DailyRotateFile({
    filename: path.join(process.env.LOG_DIR || './logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: customFormat
  }),

  // Archivo de logs generales
  new DailyRotateFile({
    filename: path.join(process.env.LOG_DIR || './logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: customFormat
  }),

  // Archivo de logs HTTP
  new DailyRotateFile({
    filename: path.join(process.env.LOG_DIR || './logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '7d',
    format: customFormat
  }),

  // Archivo de logs de aplicación
  new DailyRotateFile({
    filename: path.join(process.env.LOG_DIR || './logs', 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '30d',
    format: customFormat
  })
];

// Configuración de MongoDB para logs (opcional)
if (process.env.LOG_MONGODB_URL) {
  transports.push(
    new winston.transports.MongoDB({
      db: process.env.LOG_MONGODB_URL,
      collection: 'logs',
      level: 'info',
      options: {
        useUnifiedTopology: true
      }
    })
  );
}

// Crear logger principal
const logger = winston.createLogger({
  levels: logLevels,
  transports: transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
});

// Logger específico para HTTP
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || './logs', 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

// Logger específico para base de datos
const dbLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || './logs', 'database-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Logger específico para seguridad
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || './logs', 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d' // Mantener logs de seguridad por más tiempo
    })
  ]
});

// Logger específico para performance
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(process.env.LOG_DIR || './logs', 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Funciones de logging especializadas
const loggers = {
  // Logger principal
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Logger HTTP
  http: (message, meta = {}) => httpLogger.info(message, meta),

  // Logger de base de datos
  database: (message, meta = {}) => dbLogger.info(message, meta),

  // Logger de seguridad
  security: (message, meta = {}) => securityLogger.info(message, meta),

  // Logger de performance
  performance: (message, meta = {}) => performanceLogger.info(message, meta),

  // Logging de requests HTTP
  request: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null,
      sessionId: req.sessionID
    };
    httpLogger.info('HTTP Request', logData);
  },

  // Logging de errores HTTP
  httpError: (req, res, error) => {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      error: error.message,
      stack: error.stack,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null
    };
    httpLogger.error('HTTP Error', logData);
  },

  // Logging de autenticación
  auth: (action, userId, ip, success, details = {}) => {
    const logData = {
      action,
      userId,
      ip,
      success,
      timestamp: new Date().toISOString(),
      ...details
    };
    securityLogger.info('Authentication Event', logData);
  },

  // Logging de base de datos
  dbQuery: (query, duration, success, error = null) => {
    const logData = {
      query: query.replace(/\s+/g, ' ').trim(),
      duration: `${duration}ms`,
      success,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
    dbLogger.info('Database Query', logData);
  },

  // Logging de performance
  performance: (operation, duration, metadata = {}) => {
    const logData = {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    performanceLogger.info('Performance Metric', logData);
  },

  // Logging de seguridad
  security: (event, details = {}) => {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      ...details
    };
    securityLogger.info('Security Event', logData);
  }
};

// Función para crear contexto de logging
const createContext = (req, additionalData = {}) => {
  return {
    requestId: req.headers['x-request-id'] || generateRequestId(),
    userId: req.user ? req.user.id : null,
    sessionId: req.sessionID,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    ...additionalData
  };
};

// Función para generar ID de request
const generateRequestId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Función para logging de errores con stack trace
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  });
};

// Función para logging de métricas de negocio
const logBusinessMetric = (metric, value, context = {}) => {
  logger.info('Business Metric', {
    metric,
    value,
    timestamp: new Date().toISOString(),
    ...context
  });
};

// Función para logging de eventos de usuario
const logUserEvent = (event, userId, details = {}) => {
  logger.info('User Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = {
  logger,
  httpLogger,
  dbLogger,
  securityLogger,
  performanceLogger,
  loggers,
  createContext,
  logError,
  logBusinessMetric,
  logUserEvent
};
