require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const healthRoutes = require('./routes/healthRoutes');
const logRoutes = require('./routes/logRoutes');
const logDashboardRoutes = require('./routes/logDashboard');

// Importar Swagger
const { setupSwagger } = require('./middleware/swagger');

// Importar sistema de logging avanzado
const { logger, httpLogger, dbLogger, securityLogger, performanceLogger, loggers } = require('./utils/logger');
const { 
  httpLoggingMiddleware, 
  errorLoggingMiddleware, 
  authLoggingMiddleware, 
  performanceLoggingMiddleware, 
  securityLoggingMiddleware, 
  databaseLoggingMiddleware, 
  businessMetricsMiddleware, 
  rateLimitLoggingMiddleware 
} = require('./middleware/loggingMiddleware');
const { setupAutoRotation } = require('./utils/logRotation');

// Importar middlewares
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { 
  sanitizeInput, 
  sanitizeFileUpload, 
  validateSecurityHeaders, 
  limitPayloadSize 
} = require('./middleware/sanitization');
const { 
  createLogger, 
  logError, 
  logAuth, 
  logPerformance 
} = require('./middleware/logging');
const { 
  collectMetrics, 
  healthCheck, 
  getMetrics, 
  getHealth 
} = require('./middleware/monitoring');
const { 
  cacheService,
  cacheProducts,
  cacheCategories,
  cacheSearch,
  cacheStats,
  getCacheStats,
  clearCache,
  invalidateCache
} = require('./middleware/cache');
const { 
  databaseOptimizer,
  logQueries,
  getDatabaseStats,
  cleanupDatabase
} = require('./middleware/database');

// Crear aplicación Express
const app = express();

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Compresión gzip
app.use(compression({
  level: 6, // Nivel de compresión (1-9)
  threshold: 1024, // Solo comprimir archivos > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Validación de headers de seguridad
app.use(validateSecurityHeaders);

// Limitación de tamaño de payload
app.use(limitPayloadSize('10mb'));

// Sanitización de datos de entrada
app.use(sanitizeInput);

// Monitoreo de métricas
app.use(collectMetrics);

// Logging de consultas de base de datos
app.use(logQueries);

// Rate limiting más granular
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging estructurado
app.use(createLogger());
app.use(logAuth());
app.use(logPerformance());

// Logging básico para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
  
  // Middleware de logging avanzado
  app.use(httpLoggingMiddleware);
  app.use(authLoggingMiddleware);
  app.use(performanceLoggingMiddleware);
  app.use(securityLoggingMiddleware);
  app.use(databaseLoggingMiddleware);
  app.use(businessMetricsMiddleware);
  app.use(rateLimitLoggingMiddleware);
}

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta de salud básica
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Ruta de salud detallada
app.get('/health/detailed', healthCheck, getHealth);

// Ruta de métricas
app.get('/metrics', getMetrics);

// Rutas de caché
app.get('/cache/stats', getCacheStats);
app.post('/cache/clear', clearCache);
app.post('/cache/invalidate', invalidateCache);

// Rutas de base de datos
app.get('/database/stats', getDatabaseStats);
app.post('/database/cleanup', cleanupDatabase);

// Configurar Swagger
setupSwagger(app);

// Inicializar sistema de logging avanzado
setupAutoRotation();
logger.info('Sistema de logging avanzado inicializado', {
  environment: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || 'info',
  logDir: process.env.LOG_DIR || './logs'
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/logs', logDashboardRoutes);

// Ruta de documentación básica
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Documentación de la API E-commerce',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Registrar nuevo usuario',
        'POST /api/auth/login': 'Iniciar sesión',
        'GET /api/auth/verify': 'Verificar token (requiere auth)',
        'GET /api/auth/profile': 'Obtener perfil (requiere auth)',
        'PUT /api/auth/profile': 'Actualizar perfil (requiere auth)',
        'PUT /api/auth/change-password': 'Cambiar contraseña (requiere auth)',
        'DELETE /api/auth/deactivate': 'Desactivar cuenta (requiere auth)'
      }
    }
  });
});

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de logging de errores
app.use(logError);

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = app;
