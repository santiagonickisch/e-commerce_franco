const { ZodError } = require('zod');

/**
 * Middleware para validar datos de entrada usando esquemas de Zod
 * @param {Object} schema - Esquema de Zod para validación
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validar según el tipo de request
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware para manejar errores de validación de archivos
 */
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Archivo requerido'
    });
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WEBP'
    });
  }

  // Validar tamaño del archivo (5MB máximo)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande. Máximo 5MB'
    });
  }

  next();
};

/**
 * Middleware para validar paginación
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'El número de página debe ser mayor a 0'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'El límite debe estar entre 1 y 100'
    });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validate,
  validateFile,
  validatePagination
};


