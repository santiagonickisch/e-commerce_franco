const expressWinston = require('express-winston');
const { logger, httpLogger, loggers } = require('../utils/logger');

// Middleware de logging para requests HTTP
const httpLoggingMiddleware = expressWinston.logger({
  winstonInstance: httpLogger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: true,
  colorize: false,
  ignoreRoute: (req, res) => {
    // Ignorar rutas de salud y métricas para reducir ruido
    return req.url === '/health' || req.url === '/metrics';
  },
  requestWhitelist: ['body', 'headers', 'query', 'params'],
  responseWhitelist: ['body', 'statusCode'],
  requestFilter: (req, propName) => {
    // Filtrar información sensible
    if (propName === 'headers') {
      const filteredHeaders = { ...req.headers };
      delete filteredHeaders.authorization;
      delete filteredHeaders.cookie;
      delete filteredHeaders['x-api-key'];
      return filteredHeaders;
    }
    if (propName === 'body') {
      const filteredBody = { ...req.body };
      delete filteredBody.password;
      delete filteredBody.confirmPassword;
      delete filteredBody.creditCard;
      return filteredBody;
    }
    return req[propName];
  }
});

// Middleware de logging para errores HTTP
const errorLoggingMiddleware = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP Error {{err.message}}',
  requestWhitelist: ['body', 'headers', 'query', 'params'],
  responseWhitelist: ['body', 'statusCode'],
  requestFilter: (req, propName) => {
    // Filtrar información sensible
    if (propName === 'headers') {
      const filteredHeaders = { ...req.headers };
      delete filteredHeaders.authorization;
      delete filteredHeaders.cookie;
      delete filteredHeaders['x-api-key'];
      return filteredHeaders;
    }
    if (propName === 'body') {
      const filteredBody = { ...req.body };
      delete filteredBody.password;
      delete filteredBody.confirmPassword;
      delete filteredBody.creditCard;
      return filteredBody;
    }
    return req[propName];
  }
});

// Middleware personalizado para logging de autenticación
const authLoggingMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de intentos de autenticación
    if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      const userId = req.user ? req.user.id : null;
      
      loggers.auth(
        req.path.includes('/login') ? 'login' : 'register',
        userId,
        req.ip || req.connection.remoteAddress,
        success,
        {
          userAgent: req.get('User-Agent'),
          statusCode: res.statusCode
        }
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware para logging de performance
const performanceLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log de performance para requests lentos (>1s)
    if (duration > 1000) {
      loggers.performance('slow_request', duration, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      });
    }
    
    // Log de métricas de performance
    loggers.performance('request_duration', duration, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    });
  });
  
  next();
};

// Middleware para logging de seguridad
const securityLoggingMiddleware = (req, res, next) => {
  // Log de intentos de acceso a rutas protegidas
  if (req.path.includes('/admin') || req.path.includes('/api/admin')) {
    loggers.security('admin_access_attempt', {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user.id : null,
      authenticated: !!req.user
    });
  }
  
  // Log de requests con headers sospechosos
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'];
  const hasSuspiciousHeaders = suspiciousHeaders.some(header => req.headers[header]);
  
  if (hasSuspiciousHeaders) {
    loggers.security('suspicious_headers', {
      headers: suspiciousHeaders.filter(header => req.headers[header]),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
  }
  
  next();
};

// Middleware para logging de base de datos
const databaseLoggingMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de queries de base de datos si hay información disponible
    if (req.dbQueryInfo) {
      loggers.database('database_query', {
        query: req.dbQueryInfo.query,
        duration: req.dbQueryInfo.duration,
        success: req.dbQueryInfo.success,
        error: req.dbQueryInfo.error,
        method: req.method,
        url: req.url
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware para logging de métricas de negocio
const businessMetricsMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de métricas de negocio específicas
    if (req.path.includes('/api/products') && req.method === 'GET') {
      loggers.info('product_view', {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        query: req.query
      });
    }
    
    if (req.path.includes('/api/orders') && req.method === 'POST') {
      loggers.info('order_created', {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user.id : null
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware para logging de errores personalizados
const errorLoggingMiddleware = (err, req, res, next) => {
  // Log de errores con contexto completo
  loggers.error('Application Error', {
    message: err.message,
    stack: err.stack,
    name: err.name,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null,
    timestamp: new Date().toISOString()
  });
  
  next(err);
};

// Middleware para logging de rate limiting
const rateLimitLoggingMiddleware = (req, res, next) => {
  if (res.get('X-RateLimit-Remaining') === '0') {
    loggers.security('rate_limit_exceeded', {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      limit: res.get('X-RateLimit-Limit'),
      resetTime: res.get('X-RateLimit-Reset')
    });
  }
  
  next();
};

// Función para crear middleware de logging personalizado
const createCustomLoggingMiddleware = (logFunction, filter = null) => {
  return (req, res, next) => {
    if (filter && !filter(req, res)) {
      return next();
    }
    
    const originalSend = res.send;
    
    res.send = function(data) {
      logFunction(req, res, data);
      return originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  httpLoggingMiddleware,
  errorLoggingMiddleware,
  authLoggingMiddleware,
  performanceLoggingMiddleware,
  securityLoggingMiddleware,
  databaseLoggingMiddleware,
  businessMetricsMiddleware,
  rateLimitLoggingMiddleware,
  createCustomLoggingMiddleware
};
