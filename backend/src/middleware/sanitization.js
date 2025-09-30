const { z } = require('zod');

/**
 * Middleware de sanitización de datos
 * Limpia y valida todos los datos de entrada
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar params
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Error en sanitización:', error);
    return res.status(400).json({
      success: false,
      message: 'Error en la validación de datos de entrada'
    });
  }
};

/**
 * Sanitiza un objeto recursivamente
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitizar la clave también
      const cleanKey = sanitizeString(key);
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitiza una cadena de texto
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .trim() // Eliminar espacios al inicio y final
    .replace(/[<>]/g, '') // Eliminar caracteres HTML peligrosos
    .replace(/javascript:/gi, '') // Eliminar javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Eliminar event handlers
    .replace(/script/gi, '') // Eliminar la palabra script
    .replace(/eval/gi, '') // Eliminar la palabra eval
    .replace(/expression/gi, '') // Eliminar la palabra expression
    .replace(/vbscript:/gi, '') // Eliminar vbscript: URLs
    .replace(/data:/gi, '') // Eliminar data: URLs
    .replace(/[\x00-\x1F\x7F]/g, ''); // Eliminar caracteres de control
};

/**
 * Middleware para validar y sanitizar archivos
 */
const sanitizeFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    // Validar archivo único
    if (req.file) {
      req.file = validateFile(req.file);
    }

    // Validar múltiples archivos
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files = req.files.map(file => validateFile(file));
      } else {
        // req.files es un objeto con arrays
        for (const fieldName in req.files) {
          req.files[fieldName] = req.files[fieldName].map(file => validateFile(file));
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error en validación de archivos:', error);
    return res.status(400).json({
      success: false,
      message: 'Error en la validación del archivo'
    });
  }
};

/**
 * Valida un archivo individual
 */
const validateFile = (file) => {
  // Tipos de archivo permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Tamaño máximo (5MB)
  const maxSize = 5 * 1024 * 1024;

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
  }

  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB');
  }

  // Sanitizar el nombre del archivo
  file.originalname = sanitizeString(file.originalname);

  return file;
};

/**
 * Middleware para validar headers de seguridad
 */
const validateSecurityHeaders = (req, res, next) => {
  // Verificar User-Agent
  const userAgent = req.get('User-Agent');
  if (!userAgent || userAgent.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'User-Agent inválido'
    });
  }

  // Verificar que no sea un bot malicioso
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  if (isSuspicious && !userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
    console.warn(`Solicitud sospechosa detectada: ${userAgent} - IP: ${req.ip}`);
  }

  next();
};

/**
 * Middleware para limitar el tamaño del payload
 */
const limitPayloadSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        success: false,
        message: 'El payload es demasiado grande'
      });
    }

    next();
  };
};

/**
 * Convierte un tamaño en string a bytes
 */
const parseSize = (size) => {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    return 10 * 1024 * 1024; // 10MB por defecto
  }

  const value = parseFloat(match[1]);
  const unit = match[2];
  return Math.floor(value * units[unit]);
};

module.exports = {
  sanitizeInput,
  sanitizeFileUpload,
  validateSecurityHeaders,
  limitPayloadSize,
  sanitizeString,
  sanitizeObject
};
