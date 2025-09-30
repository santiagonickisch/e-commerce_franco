const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Middleware de monitoreo de performance y recursos
 */
class MonitoringService {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      activeConnections: 0
    };
    
    this.startTime = Date.now();
    this.lastHealthCheck = Date.now();
    
    // Iniciar monitoreo automático
    this.startMonitoring();
  }

  /**
   * Middleware para recopilar métricas de requests
   */
  collectMetrics() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Incrementar contador de requests
      this.metrics.requests++;
      
      // Interceptar la respuesta
      const originalSend = res.send;
      res.send = function(data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Registrar tiempo de respuesta
        this.metrics.responseTime.push(responseTime);
        
        // Mantener solo los últimos 1000 registros
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime.shift();
        }
        
        // Incrementar contador de errores si es necesario
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
        
        return originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  }

  /**
   * Obtener métricas del sistema
   */
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      platform: {
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname()
      },
      loadAverage: os.loadavg(),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024)
    };
  }

  /**
   * Obtener métricas de la aplicación
   */
  getApplicationMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;
    
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests) * 100 
      : 0;
    
    return {
      timestamp: new Date().toISOString(),
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime),
      uptime: Date.now() - this.startTime,
      activeConnections: this.metrics.activeConnections
    };
  }

  /**
   * Verificar salud del sistema
   */
  checkHealth() {
    const systemMetrics = this.getSystemMetrics();
    const appMetrics = this.getApplicationMetrics();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        memory: systemMetrics.memory.used < systemMetrics.memory.total * 0.9,
        cpu: systemMetrics.loadAverage[0] < 4,
        responseTime: appMetrics.averageResponseTime < 5000,
        errorRate: appMetrics.errorRate < 5
      }
    };
    
    // Determinar estado general
    const allChecksPass = Object.values(health.checks).every(check => check);
    health.status = allChecksPass ? 'healthy' : 'unhealthy';
    
    return health;
  }

  /**
   * Iniciar monitoreo automático
   */
  startMonitoring() {
    setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlerts();
    }, 60000); // Cada minuto
  }

  /**
   * Recopilar métricas del sistema
   */
  collectSystemMetrics() {
    const systemMetrics = this.getSystemMetrics();
    
    // Registrar uso de memoria
    this.metrics.memoryUsage.push(systemMetrics.memory.used);
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
    
    // Registrar uso de CPU
    this.metrics.cpuUsage.push(systemMetrics.loadAverage[0]);
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage.shift();
    }
  }

  /**
   * Verificar alertas
   */
  checkAlerts() {
    const health = this.checkHealth();
    
    if (health.status === 'unhealthy') {
      console.warn('🚨 SYSTEM ALERT: System health check failed', health);
      this.logAlert(health);
    }
  }

  /**
   * Registrar alerta
   */
  logAlert(alert) {
    try {
      const logsDir = path.join(__dirname, '../../logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const alertFile = path.join(logsDir, 'alerts.log');
      const alertEntry = JSON.stringify(alert) + '\n';
      fs.appendFileSync(alertFile, alertEntry);
    } catch (error) {
      console.error('Error logging alert:', error);
    }
  }

  /**
   * Obtener estadísticas detalladas
   */
  getDetailedStats() {
    return {
      system: this.getSystemMetrics(),
      application: this.getApplicationMetrics(),
      health: this.checkHealth(),
      metrics: {
        responseTime: {
          min: Math.min(...this.metrics.responseTime),
          max: Math.max(...this.metrics.responseTime),
          avg: this.metrics.responseTime.length > 0 
            ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
            : 0
        },
        memory: {
          min: Math.min(...this.metrics.memoryUsage),
          max: Math.max(...this.metrics.memoryUsage),
          avg: this.metrics.memoryUsage.length > 0 
            ? this.metrics.memoryUsage.reduce((a, b) => a + b, 0) / this.metrics.memoryUsage.length 
            : 0
        }
      }
    };
  }

  /**
   * Resetear métricas
   */
  resetMetrics() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      activeConnections: 0
    };
    this.startTime = Date.now();
  }
}

// Instancia global del servicio de monitoreo
const monitoringService = new MonitoringService();

/**
 * Middleware para recopilar métricas
 */
const collectMetrics = monitoringService.collectMetrics();

/**
 * Middleware para verificar salud
 */
const healthCheck = (req, res, next) => {
  const health = monitoringService.checkHealth();
  
  if (health.status === 'unhealthy') {
    return res.status(503).json({
      success: false,
      message: 'Service unhealthy',
      health
    });
  }
  
  next();
};

/**
 * Endpoint para métricas
 */
const getMetrics = (req, res) => {
  const stats = monitoringService.getDetailedStats();
  res.json(stats);
};

/**
 * Endpoint para salud
 */
const getHealth = (req, res) => {
  const health = monitoringService.checkHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

/**
 * Endpoint para resetear métricas
 */
const resetMetrics = (req, res) => {
  monitoringService.resetMetrics();
  res.json({
    success: true,
    message: 'Metrics reset successfully'
  });
};

module.exports = {
  collectMetrics,
  healthCheck,
  getMetrics,
  getHealth,
  resetMetrics,
  monitoringService
};
