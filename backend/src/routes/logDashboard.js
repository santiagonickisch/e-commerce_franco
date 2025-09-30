const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getLogStats, analyzeLogs } = require('../utils/logRotation');

/**
 * @swagger
 * /api/logs/dashboard:
 *   get:
 *     summary: Dashboard de logs
 *     description: Devuelve información del dashboard de logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Dashboard de logs obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalLogs:
 *                           type: integer
 *                           example: 1250
 *                         errorCount:
 *                           type: integer
 *                           example: 45
 *                         warningCount:
 *                           type: integer
 *                           example: 120
 *                         infoCount:
 *                           type: integer
 *                           example: 1085
 *                         totalSizeMB:
 *                           type: number
 *                           example: 15.5
 *                         fileCount:
 *                           type: integer
 *                           example: 12
 *                     recentErrors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             example: 2024-01-15T10:30:00.000Z
 *                           level:
 *                             type: string
 *                             example: error
 *                           message:
 *                             type: string
 *                             example: Database connection failed
 *                           stack:
 *                             type: string
 *                             example: Error: Connection timeout
 *                     performance:
 *                       type: object
 *                       properties:
 *                         avgResponseTime:
 *                           type: number
 *                           example: 250.5
 *                         slowQueries:
 *                           type: integer
 *                           example: 12
 *                         memoryUsage:
 *                           type: number
 *                           example: 85.2
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', (req, res) => {
  try {
    const stats = getLogStats();
    const analysis = analyzeLogs();
    
    // Obtener errores recientes
    const recentErrors = getRecentErrors(10);
    
    // Obtener métricas de performance
    const performance = getPerformanceMetrics();
    
    res.json({
      success: true,
      dashboard: {
        stats: {
          ...stats,
          ...analysis
        },
        recentErrors,
        performance,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Función para obtener errores recientes
const getRecentErrors = (limit = 10) => {
  try {
    const logDir = process.env.LOG_DIR || './logs';
    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .sort((a, b) => {
        const statsA = fs.statSync(path.join(logDir, a));
        const statsB = fs.statSync(path.join(logDir, b));
        return statsB.mtime - statsA.mtime;
      });
    
    let errors = [];
    
    files.slice(0, 3).forEach(file => {
      const filePath = path.join(logDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          if (logEntry.level === 'error') {
            errors.push({
              timestamp: logEntry.timestamp,
              level: logEntry.level,
              message: logEntry.message,
              stack: logEntry.stack,
              meta: logEntry.meta
            });
          }
        } catch (parseError) {
          // Ignorar líneas que no son JSON válido
        }
      });
    });
    
    return errors
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    return [];
  }
};

// Función para obtener métricas de performance
const getPerformanceMetrics = () => {
  try {
    const logDir = process.env.LOG_DIR || './logs';
    const performanceFile = path.join(logDir, 'performance.log');
    
    if (!fs.existsSync(performanceFile)) {
      return {
        avgResponseTime: 0,
        slowQueries: 0,
        memoryUsage: 0
      };
    }
    
    const content = fs.readFileSync(performanceFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    let totalResponseTime = 0;
    let responseCount = 0;
    let slowQueries = 0;
    let memoryUsage = 0;
    
    lines.forEach(line => {
      try {
        const logEntry = JSON.parse(line);
        if (logEntry.operation === 'request_duration') {
          const duration = parseFloat(logEntry.duration.replace('ms', ''));
          totalResponseTime += duration;
          responseCount++;
          
          if (duration > 1000) {
            slowQueries++;
          }
        }
        
        if (logEntry.operation === 'memory_usage') {
          memoryUsage = parseFloat(logEntry.value);
        }
      } catch (parseError) {
        // Ignorar líneas que no son JSON válido
      }
    });
    
    return {
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      slowQueries,
      memoryUsage
    };
  } catch (error) {
    return {
      avgResponseTime: 0,
      slowQueries: 0,
      memoryUsage: 0
    };
  }
};

/**
 * @swagger
 * /api/logs/search:
 *   post:
 *     summary: Buscar en logs
 *     description: Busca en los logs del sistema
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "error"
 *                 description: Término de búsqueda
 *               level:
 *                 type: string
 *                 enum: [error, warn, info, debug]
 *                 example: "error"
 *                 description: Nivel de log a buscar
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00.000Z"
 *                 description: Fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-31T23:59:59.999Z"
 *                 description: Fecha de fin
 *               limit:
 *                 type: integer
 *                 example: 100
 *                 description: Límite de resultados
 *     responses:
 *       200:
 *         description: Búsqueda de logs completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         example: 2024-01-15T10:30:00.000Z
 *                       level:
 *                         type: string
 *                         example: error
 *                       message:
 *                         type: string
 *                         example: Database connection failed
 *                       meta:
 *                         type: object
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/search', (req, res) => {
  try {
    const { query, level, startDate, endDate, limit = 100 } = req.body;
    
    const results = searchLogs(query, level, startDate, endDate, limit);
    
    res.json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Función para buscar en logs
const searchLogs = (query, level, startDate, endDate, limit) => {
  try {
    const logDir = process.env.LOG_DIR || './logs';
    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'));
    
    let results = [];
    
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          
          // Filtrar por nivel
          if (level && logEntry.level !== level) {
            return;
          }
          
          // Filtrar por fecha
          if (startDate && new Date(logEntry.timestamp) < new Date(startDate)) {
            return;
          }
          
          if (endDate && new Date(logEntry.timestamp) > new Date(endDate)) {
            return;
          }
          
          // Filtrar por query
          if (query && !logEntry.message.toLowerCase().includes(query.toLowerCase())) {
            return;
          }
          
          results.push(logEntry);
        } catch (parseError) {
          // Ignorar líneas que no son JSON válido
        }
      });
    });
    
    return results
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    return [];
  }
};

module.exports = router;
