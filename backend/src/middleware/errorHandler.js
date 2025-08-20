/**
 * Middleware para manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con estos datos'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Error de referencia: registro relacionado no encontrado'
    });
  }

  // Error de validación de Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: err.errors.map(error => ({
        field: error.path.join('.'),
        message: error.message
      }))
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado'
    });
  }

  // Error de rate limiting
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Intenta de nuevo más tarde'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud'
    });
  }

  // Error de cast de MongoDB (si se usara)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }

  // Error de validación de MongoDB (si se usara)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Clase personalizada para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  AppError
};


