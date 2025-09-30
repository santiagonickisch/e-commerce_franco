const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica el estado del servidor
 *     description: Endpoint básico para verificar que el servidor está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00.000Z
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                   description: Tiempo de funcionamiento en segundos
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', healthController.healthCheck);

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Verifica el estado detallado del servidor
 *     description: Endpoint detallado para verificar el estado del servidor, base de datos y servicios
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Estado detallado del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tiempo de funcionamiento en segundos
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: connected
 *                     responseTime:
 *                       type: number
 *                       description: Tiempo de respuesta de la base de datos en ms
 *                 memory:
 *                   type: object
 *                   properties:
 *                     used:
 *                       type: number
 *                       description: Memoria usada en MB
 *                     free:
 *                       type: number
 *                       description: Memoria libre en MB
 *                     total:
 *                       type: number
 *                       description: Memoria total en MB
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/detailed', healthController.detailedHealthCheck);

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Obtiene métricas del servidor
 *     description: Devuelve métricas de performance y uso del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Métricas del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de requests procesados
 *                     perMinute:
 *                       type: number
 *                       description: Requests por minuto
 *                     errors:
 *                       type: integer
 *                       description: Total de errores
 *                 responseTime:
 *                   type: object
 *                   properties:
 *                     average:
 *                       type: number
 *                       description: Tiempo promedio de respuesta en ms
 *                     min:
 *                       type: number
 *                       description: Tiempo mínimo de respuesta en ms
 *                     max:
 *                       type: number
 *                       description: Tiempo máximo de respuesta en ms
 *                 database:
 *                   type: object
 *                   properties:
 *                     connections:
 *                       type: integer
 *                       description: Conexiones activas a la base de datos
 *                     queries:
 *                       type: integer
 *                       description: Total de queries ejecutadas
 *                     slowQueries:
 *                       type: integer
 *                       description: Queries lentas detectadas
 *                 cache:
 *                   type: object
 *                   properties:
 *                     hits:
 *                       type: integer
 *                       description: Cache hits
 *                     misses:
 *                       type: integer
 *                       description: Cache misses
 *                     hitRate:
 *                       type: number
 *                       description: Tasa de aciertos del cache
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/metrics', healthController.getMetrics);

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Verifica si el servidor está listo
 *     description: Endpoint para verificar si el servidor está listo para recibir tráfico
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor listo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                       example: true
 *                     cache:
 *                       type: boolean
 *                       example: true
 *                     storage:
 *                       type: boolean
 *                       example: true
 *       503:
 *         description: Servidor no está listo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ready', healthController.readinessCheck);

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Verifica si el servidor está vivo
 *     description: Endpoint para verificar si el servidor está vivo (liveness probe)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor vivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Servidor no está vivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/live', healthController.livenessCheck);

module.exports = router;
