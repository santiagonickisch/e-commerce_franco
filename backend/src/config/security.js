/**
 * Configuración de seguridad centralizada
 */

// Configuración de contraseñas
const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Cambiar a true para mayor seguridad
  allowedSpecialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  maxConsecutiveChars: 3,
  commonPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
};

// Configuración de rate limiting
const RATE_LIMIT_CONFIG = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP'
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por ventana
    message: 'Demasiados intentos de autenticación'
  },
  upload: {
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 uploads por minuto
    message: 'Demasiadas subidas de archivos'
  },
  api: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 requests por ventana
    message: 'Demasiadas solicitudes a la API'
  }
};

// Configuración de archivos
const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'],
  maxFiles: 10,
  uploadPath: './uploads',
  tempPath: './temp'
};

// Configuración de CORS
const CORS_CONFIG = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400 // 24 horas
};

// Configuración de headers de seguridad
const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Configuración de logging
const LOGGING_CONFIG = {
  levels: {
    error: 'error.log',
    warn: 'warn.log',
    info: 'info.log',
    security: 'security.log',
    auth: 'auth.log',
    performance: 'performance.log'
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  retentionDays: 30,
  format: 'json'
};

// Configuración de validación
const VALIDATION_CONFIG = {
  maxStringLength: 1000,
  maxArrayLength: 100,
  maxObjectDepth: 10,
  allowedHtmlTags: [], // Ninguna por defecto
  blockedPatterns: [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /onmouseover/i,
    /eval\(/i,
    /expression\(/i,
    /url\(/i
  ]
};

// Configuración de sesiones
const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict'
  }
};

// Configuración de JWT
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'ecommerce-api',
  audience: process.env.JWT_AUDIENCE || 'ecommerce-client',
  algorithm: 'HS256'
};

// Configuración de base de datos
const DATABASE_CONFIG = {
  connectionLimit: 10,
  acquireTimeoutMillis: 30000,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Configuración de monitoreo
const MONITORING_CONFIG = {
  healthCheckInterval: 30000, // 30 segundos
  metricsInterval: 60000, // 1 minuto
  alertThresholds: {
    responseTime: 5000, // 5 segundos
    errorRate: 0.05, // 5%
    memoryUsage: 0.9, // 90%
    cpuUsage: 0.8 // 80%
  }
};

module.exports = {
  PASSWORD_CONFIG,
  RATE_LIMIT_CONFIG,
  FILE_CONFIG,
  CORS_CONFIG,
  SECURITY_HEADERS,
  LOGGING_CONFIG,
  VALIDATION_CONFIG,
  SESSION_CONFIG,
  JWT_CONFIG,
  DATABASE_CONFIG,
  MONITORING_CONFIG
};
