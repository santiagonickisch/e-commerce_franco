const express = require('express');
const router = express.Router();
const { loggers } = require('../utils/logger');

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Recibe logs del frontend
 *     description: Endpoint para recibir logs del cliente y almacenarlos
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - message
 *               - timestamp
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [ERROR, WARN, INFO, DEBUG]
 *                 example: ERROR
 *                 description: Nivel del log
 *               message:
 *                 type: string
 *                 example: Application Error
 *                 description: Mensaje del log
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:30:00.000Z
 *                 description: Timestamp del log
 *               url:
 *                 type: string
 *                 example: https://franco-salon-exclusivo.com/products
 *                 description: URL donde ocurrió el error
 *               userAgent:
 *                 type: string
 *                 example: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
 *                 description: User agent del navegador
 *               userId:
 *                 type: string
 *                 example: user123
 *                 description: ID del usuario (si está autenticado)
 *               sessionId:
 *                 type: string
 *                 example: session456
 *                 description: ID de la sesión
 *               stack:
 *                 type: string
 *                 example: Error: Something went wrong\n    at function (file.js:10:5)
 *                 description: Stack trace del error
 *               error:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: TypeError
 *                   message:
 *                     type: string
 *                     example: Cannot read property 'x' of undefined
 *                   stack:
 *                     type: string
 *                     example: TypeError: Cannot read property 'x' of undefined\n    at function (file.js:10:5)
 *     responses:
 *       200:
 *         description: Log recibido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Log recibido exitosamente
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', (req, res) => {
  try {
    const { level, message, timestamp, url, userAgent, userId, sessionId, stack, error } = req.body;
    
    // Validar datos requeridos
    if (!level || !message || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos: level, message, timestamp'
      });
    }
    
    // Log del evento
    loggers.info('Frontend Log Received', {
      level,
      message,
      timestamp,
      url,
      userAgent,
      userId,
      sessionId,
      stack,
      error,
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.json({
      success: true,
      message: 'Log recibido exitosamente'
    });
  } catch (error) {
    loggers.error('Error procesando log del frontend', error, {
      body: req.body,
      ip: req.ip || req.connection.remoteAddress
    });
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/logs/stats:
 *   get:
 *     summary: Obtiene estadísticas de logs
 *     description: Devuelve estadísticas de los logs del sistema
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Estadísticas de logs obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalLogs:
 *                       type: integer
 *                       example: 1250
 *                       description: Total de logs
 *                     errorCount:
 *                       type: integer
 *                       example: 45
 *                       description: Número de errores
 *                     warningCount:
 *                       type: integer
 *                       example: 120
 *                       description: Número de warnings
 *                     infoCount:
 *                       type: integer
 *                       example: 1085
 *                       description: Número de logs informativos
 *                     totalSizeMB:
 *                       type: number
 *                       example: 15.5
 *                       description: Tamaño total de logs en MB
 *                     fileCount:
 *                       type: integer
 *                       example: 12
 *                       description: Número de archivos de log
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', (req, res) => {
  try {
    const { getLogStats, analyzeLogs } = require('../utils/logRotation');
    
    const stats = getLogStats();
    const analysis = analyzeLogs();
    
    res.json({
      success: true,
      stats: {
        ...stats,
        ...analysis
      }
    });
  } catch (error) {
    loggers.error('Error obteniendo estadísticas de logs', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/logs/export:
 *   post:
 *     summary: Exporta logs
 *     description: Exporta logs en un archivo comprimido
 *     tags: [Logs]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *                 description: Fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-31
 *                 description: Fecha de fin
 *     responses:
 *       200:
 *         description: Logs exportados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logs exportados exitosamente
 *                 filePath:
 *                   type: string
 *                   example: /logs/logs_export_2024-01-15.tar.gz
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/export', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const { exportLogs } = require('../utils/logRotation');
    
    const defaultStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];
    
    const exportPath = await exportLogs(
      startDate || defaultStartDate,
      endDate || defaultEndDate
    );
    
    res.json({
      success: true,
      message: 'Logs exportados exitosamente',
      filePath: exportPath
    });
  } catch (error) {
    loggers.error('Error exportando logs', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/logs/rotate:
 *   post:
 *     summary: Rota logs manualmente
 *     description: Ejecuta rotación manual de logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Rotación de logs ejecutada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Rotación de logs ejecutada exitosamente
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/rotate', async (req, res) => {
  try {
    const { autoRotate } = require('../utils/logRotation');
    
    await autoRotate();
    
    res.json({
      success: true,
      message: 'Rotación de logs ejecutada exitosamente'
    });
  } catch (error) {
    loggers.error('Error rotando logs', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
