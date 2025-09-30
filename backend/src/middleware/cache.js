const NodeCache = require('node-cache');

/**
 * Sistema de caché en memoria para optimizar consultas frecuentes
 */
class CacheService {
  constructor() {
    // Configuración del caché
    this.cache = new NodeCache({
      stdTTL: 600, // 10 minutos por defecto
      checkperiod: 120, // Verificar cada 2 minutos
      useClones: false, // Mejor performance
      maxKeys: 1000, // Máximo 1000 claves
      deleteOnExpire: true
    });

    // Estadísticas del caché
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      flushes: 0
    };

    // Configuraciones específicas por tipo de datos
    this.configs = {
      products: { ttl: 300 }, // 5 minutos
      categories: { ttl: 1800 }, // 30 minutos
      users: { ttl: 600 }, // 10 minutos
      orders: { ttl: 60 }, // 1 minuto
      stats: { ttl: 300 }, // 5 minutos
      search: { ttl: 180 } // 3 minutos
    };
  }

  /**
   * Obtener valor del caché
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Establecer valor en el caché
   */
  set(key, value, ttl = null) {
    const config = this.getConfig(key);
    const finalTtl = ttl || config.ttl;
    
    this.cache.set(key, value, finalTtl);
    this.stats.sets++;
    return true;
  }

  /**
   * Eliminar valor del caché
   */
  del(key) {
    const result = this.cache.del(key);
    if (result > 0) {
      this.stats.deletes++;
    }
    return result;
  }

  /**
   * Eliminar múltiples claves por patrón
   */
  delPattern(pattern) {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let deleted = 0;

    keys.forEach(key => {
      if (regex.test(key)) {
        if (this.cache.del(key) > 0) {
          deleted++;
          this.stats.deletes++;
        }
      }
    });

    return deleted;
  }

  /**
   * Limpiar todo el caché
   */
  flush() {
    this.cache.flushAll();
    this.stats.flushes++;
    return true;
  }

  /**
   * Obtener configuración para un tipo de clave
   */
  getConfig(key) {
    for (const [type, config] of Object.entries(this.configs)) {
      if (key.startsWith(type)) {
        return config;
      }
    }
    return { ttl: 600 }; // 10 minutos por defecto
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const keys = this.cache.keys();
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      keys: keys.length,
      maxKeys: 1000,
      hitRate: Math.round(hitRate * 100) / 100,
      stats: { ...this.stats },
      memory: process.memoryUsage()
    };
  }

  /**
   * Middleware para caché automático
   */
  middleware(options = {}) {
    return (req, res, next) => {
      // Solo cachear GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req, options);
      const cachedData = this.get(cacheKey);

      if (cachedData) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Interceptar la respuesta
      const originalJson = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, data, options.ttl);
        }
        
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson.call(this, data);
      }.bind(this);

      next();
    };
  }

  /**
   * Generar clave de caché única
   */
  generateCacheKey(req, options = {}) {
    const baseKey = options.key || req.path;
    const queryString = req.query ? JSON.stringify(req.query) : '';
    const user = req.user ? req.user.id : 'anonymous';
    
    return `${baseKey}:${user}:${queryString}`;
  }

  /**
   * Invalidar caché por patrón
   */
  invalidatePattern(pattern) {
    return this.delPattern(pattern);
  }

  /**
   * Invalidar caché de usuario específico
   */
  invalidateUser(userId) {
    return this.delPattern(`.*:${userId}:.*`);
  }

  /**
   * Invalidar caché de productos
   */
  invalidateProducts() {
    return this.delPattern('products.*');
  }

  /**
   * Invalidar caché de categorías
   */
  invalidateCategories() {
    return this.delPattern('categories.*');
  }
}

// Instancia global del servicio de caché
const cacheService = new CacheService();

/**
 * Middleware de caché para productos
 */
const cacheProducts = cacheService.middleware({
  key: 'products',
  ttl: 300 // 5 minutos
});

/**
 * Middleware de caché para categorías
 */
const cacheCategories = cacheService.middleware({
  key: 'categories',
  ttl: 1800 // 30 minutos
});

/**
 * Middleware de caché para búsquedas
 */
const cacheSearch = cacheService.middleware({
  key: 'search',
  ttl: 180 // 3 minutos
});

/**
 * Middleware de caché para estadísticas
 */
const cacheStats = cacheService.middleware({
  key: 'stats',
  ttl: 300 // 5 minutos
});

/**
 * Endpoint para estadísticas del caché
 */
const getCacheStats = (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    success: true,
    cache: stats
  });
};

/**
 * Endpoint para limpiar caché
 */
const clearCache = (req, res) => {
  const result = cacheService.flush();
  res.json({
    success: true,
    message: 'Cache cleared successfully',
    result
  });
};

/**
 * Endpoint para invalidar caché específico
 */
const invalidateCache = (req, res) => {
  const { pattern } = req.body;
  
  if (!pattern) {
    return res.status(400).json({
      success: false,
      message: 'Pattern is required'
    });
  }

  const deleted = cacheService.invalidatePattern(pattern);
  res.json({
    success: true,
    message: `Invalidated ${deleted} cache entries`,
    deleted
  });
};

module.exports = {
  cacheService,
  cacheProducts,
  cacheCategories,
  cacheSearch,
  cacheStats,
  getCacheStats,
  clearCache,
  invalidateCache
};
