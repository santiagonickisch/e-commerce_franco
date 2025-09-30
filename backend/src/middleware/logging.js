const fs = require('fs');
const path = require('path');

/**
 * Middleware de logging estructurado
 * Registra todas las solicitudes y respuestas con información de seguridad
 */
const createLogger = () => {
  // Crear directorio de logs si no existe
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  return (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Información de la solicitud
    const requestInfo = {
      timestamp,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      referer: req.get('Referer') || 'Direct',
      contentLength: req.get('Content-Length') || '0',
      contentType: req.get('Content-Type') || 'Unknown'
    };

    // Detectar patrones sospechosos
    const suspiciousPatterns = [
      /\.\./, // Path traversal
      /<script/i, // XSS
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript injection
      /eval\(/i, // Code injection
      /exec\(/i, // Command injection
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(req.url) || pattern.test(req.get('User-Agent') || '')
    );

    if (isSuspicious) {
      requestInfo.securityAlert = 'Suspicious request detected';
      console.warn('🚨 SECURITY ALERT:', requestInfo);
    }

    // Interceptar la respuesta
    const originalSend = res.send;
    res.send = function(data) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Información de la respuesta
      const responseInfo = {
        ...requestInfo,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: data ? data.length : 0,
        success: res.statusCode >= 200 && res.statusCode < 400
      };

      // Log según el nivel
      if (res.statusCode >= 500) {
        console.error('❌ SERVER ERROR:', responseInfo);
        logToFile('error', responseInfo);
      } else if (res.statusCode >= 400) {
        console.warn('⚠️ CLIENT ERROR:', responseInfo);
        logToFile('warn', responseInfo);
      } else if (isSuspicious) {
        console.warn('🚨 SECURITY:', responseInfo);
        logToFile('security', responseInfo);
      } else {
        console.log('✅ REQUEST:', responseInfo);
        logToFile('info', responseInfo);
      }

      // Llamar al método original
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Escribe logs a archivos específicos
 */
const logToFile = (level, data) => {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    const filename = `${level}.log`;
    const filepath = path.join(logsDir, filename);
    
    const logEntry = JSON.stringify(data) + '\n';
    fs.appendFileSync(filepath, logEntry);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

/**
 * Middleware para logging de errores específicos
 */
const logError = (error, req, res, next) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  };

  console.error('💥 ERROR:', errorInfo);
  logToFile('error', errorInfo);
  
  next(error);
};

/**
 * Middleware para logging de autenticación
 */
const logAuth = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (req.url.includes('/auth/')) {
      const authInfo = {
        timestamp: new Date().toISOString(),
        action: req.url.split('/').pop(),
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400
      };

      console.log('🔐 AUTH:', authInfo);
      logToFile('auth', authInfo);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware para logging de performance
 */
const logPerformance = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convertir a milisegundos

    if (duration > 1000) { // Log solo si tarda más de 1 segundo
      const perfInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip
      };

      console.warn('🐌 SLOW REQUEST:', perfInfo);
      logToFile('performance', perfInfo);
    }
  });

  next();
};

/**
 * Función para limpiar logs antiguos
 */
const cleanupLogs = () => {
  const logsDir = path.join(__dirname, '../../logs');
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos

  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted old log file: ${file}`);
      }
    });
  }
};

// Limpiar logs cada 24 horas
setInterval(cleanupLogs, 24 * 60 * 60 * 1000);

module.exports = {
  createLogger,
  logError,
  logAuth,
  logPerformance,
  cleanupLogs
};
