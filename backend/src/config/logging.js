require('dotenv').config();

// Configuración del sistema de logging
const loggingConfig = {
  // Configuración general
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || './logs',
  
  // Configuración de rotación
  maxFileSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  compressionEnabled: process.env.LOG_COMPRESSION !== 'false',
  
  // Configuración de MongoDB (opcional)
  mongodbUrl: process.env.LOG_MONGODB_URL || null,
  
  // Configuración de notificaciones
  emailNotifications: process.env.LOG_EMAIL_NOTIFICATIONS === 'true',
  emailTo: process.env.LOG_EMAIL_TO || '',
  emailFrom: process.env.LOG_EMAIL_FROM || 'logs@francosalonexclusivo.com',
  
  // Configuración de alertas
  alertOnError: process.env.LOG_ALERT_ON_ERROR === 'true',
  alertOnWarning: process.env.LOG_ALERT_ON_WARNING === 'false',
  maxErrorsPerHour: parseInt(process.env.LOG_MAX_ERRORS_PER_HOUR) || 10,
  
  // Configuración de performance
  logSlowQueries: process.env.LOG_SLOW_QUERIES === 'true',
  slowQueryThreshold: parseInt(process.env.LOG_SLOW_QUERY_THRESHOLD) || 1000, // ms
  
  // Configuración de seguridad
  logSecurityEvents: process.env.LOG_SECURITY_EVENTS === 'true',
  logAuthAttempts: process.env.LOG_AUTH_ATTEMPTS === 'true',
  logAdminAccess: process.env.LOG_ADMIN_ACCESS === 'true',
  
  // Configuración de métricas de negocio
  logBusinessMetrics: process.env.LOG_BUSINESS_METRICS === 'true',
  logUserInteractions: process.env.LOG_USER_INTERACTIONS === 'true',
  logApiCalls: process.env.LOG_API_CALLS === 'true',
  
  // Configuración de frontend
  frontendLogging: process.env.FRONTEND_LOGGING === 'true',
  frontendLogLevel: process.env.FRONTEND_LOG_LEVEL || 'error',
  
  // Configuración de exportación
  exportEnabled: process.env.LOG_EXPORT_ENABLED === 'true',
  exportFormat: process.env.LOG_EXPORT_FORMAT || 'json',
  exportRetention: parseInt(process.env.LOG_EXPORT_RETENTION) || 90, // días
};

// Configuración de niveles de log por ambiente
const environmentLogLevels = {
  development: 'debug',
  staging: 'info',
  production: 'warn',
  test: 'error'
};

// Configuración de transportes por ambiente
const environmentTransports = {
  development: ['console', 'file'],
  staging: ['file', 'mongodb'],
  production: ['file', 'mongodb', 'email'],
  test: ['console']
};

// Configuración de formatos de log
const logFormats = {
  development: 'pretty',
  staging: 'json',
  production: 'json',
  test: 'simple'
};

// Configuración de retención por tipo de log
const retentionConfig = {
  error: '90d',
  warn: '30d',
  info: '7d',
  debug: '1d',
  http: '7d',
  security: '365d',
  performance: '14d',
  business: '30d'
};

// Configuración de alertas
const alertConfig = {
  error: {
    enabled: true,
    threshold: 5, // errores por hora
    cooldown: 3600000, // 1 hora en ms
    channels: ['email', 'console']
  },
  warning: {
    enabled: false,
    threshold: 20, // warnings por hora
    cooldown: 1800000, // 30 minutos en ms
    channels: ['console']
  },
  security: {
    enabled: true,
    threshold: 3, // eventos de seguridad por hora
    cooldown: 1800000, // 30 minutos en ms
    channels: ['email', 'console']
  }
};

// Configuración de métricas
const metricsConfig = {
  enabled: true,
  interval: 60000, // 1 minuto en ms
  retention: '7d',
  include: [
    'request_count',
    'response_time',
    'error_rate',
    'memory_usage',
    'cpu_usage',
    'database_queries',
    'cache_hits'
  ]
};

// Configuración de exportación
const exportConfig = {
  enabled: loggingConfig.exportEnabled,
  format: loggingConfig.exportFormat,
  retention: loggingConfig.exportRetention,
  compression: true,
  encryption: false,
  schedule: '0 2 * * *', // Diario a las 2 AM
  destinations: ['local', 's3'], // Opcional: S3, GCS, Azure
  filters: {
    level: ['error', 'warn'],
    timeRange: '7d',
    includeStack: true
  }
};

// Configuración de monitoreo
const monitoringConfig = {
  enabled: true,
  healthCheck: {
    enabled: true,
    interval: 300000, // 5 minutos
    timeout: 30000, // 30 segundos
    retries: 3
  },
  alerts: {
    enabled: true,
    channels: ['email', 'webhook'],
    webhookUrl: process.env.LOG_WEBHOOK_URL || null
  },
  dashboard: {
    enabled: true,
    port: process.env.LOG_DASHBOARD_PORT || 3001,
    auth: {
      enabled: true,
      username: process.env.LOG_DASHBOARD_USER || 'admin',
      password: process.env.LOG_DASHBOARD_PASS || 'admin123'
    }
  }
};

module.exports = {
  loggingConfig,
  environmentLogLevels,
  environmentTransports,
  logFormats,
  retentionConfig,
  alertConfig,
  metricsConfig,
  exportConfig,
  monitoringConfig
};
