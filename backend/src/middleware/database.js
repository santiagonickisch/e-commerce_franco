const prisma = require('../config/database');

/**
 * Middleware para optimizar consultas de base de datos
 */
class DatabaseOptimizer {
  constructor() {
    this.queryStats = {
      totalQueries: 0,
      slowQueries: 0,
      averageTime: 0,
      queries: []
    };
  }

  /**
   * Middleware para logging de consultas
   */
  logQueries() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Interceptar la respuesta
      const originalSend = res.send;
      res.send = function(data) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Registrar estadísticas
        this.queryStats.totalQueries++;
        this.queryStats.averageTime = 
          (this.queryStats.averageTime * (this.queryStats.totalQueries - 1) + duration) / 
          this.queryStats.totalQueries;
        
        if (duration > 1000) { // Consultas lentas > 1 segundo
          this.queryStats.slowQueries++;
          this.queryStats.queries.push({
            url: req.url,
            method: req.method,
            duration,
            timestamp: new Date().toISOString()
          });
          
          // Mantener solo las últimas 100 consultas lentas
          if (this.queryStats.queries.length > 100) {
            this.queryStats.queries.shift();
          }
        }
        
        return originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  }

  /**
   * Obtener estadísticas de consultas
   */
  getQueryStats() {
    return {
      ...this.queryStats,
      slowQueryRate: this.queryStats.totalQueries > 0 
        ? (this.queryStats.slowQueries / this.queryStats.totalQueries) * 100 
        : 0
    };
  }

  /**
   * Optimizar consulta de productos con paginación
   */
  async getProductsOptimized(filters = {}, pagination = {}) {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const {
      page = 1,
      limit = 20
    } = pagination;

    const skip = (page - 1) * limit;

    // Construir where clause
    const where = {
      isActive: true,
      ...(category && { category: { name: category } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Construir orderBy
    const orderBy = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    try {
      // Ejecutar consulta optimizada
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            createdAt: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }),
        prisma.product.count({ where })
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en consulta optimizada de productos:', error);
      throw error;
    }
  }

  /**
   * Optimizar consulta de categorías
   */
  async getCategoriesOptimized() {
    try {
      return await prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error en consulta optimizada de categorías:', error);
      throw error;
    }
  }

  /**
   * Optimizar consulta de usuario con datos mínimos
   */
  async getUserOptimized(userId) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Error en consulta optimizada de usuario:', error);
      throw error;
    }
  }

  /**
   * Optimizar consulta de pedidos con paginación
   */
  async getOrdersOptimized(userId, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    try {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            orderItems: {
              select: {
                quantity: true,
                price: true,
                product: {
                  select: {
                    name: true,
                    images: true
                  }
                }
              }
            }
          }
        }),
        prisma.order.count({ where: { userId } })
      ]);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en consulta optimizada de pedidos:', error);
      throw error;
    }
  }

  /**
   * Optimizar consulta de carrito
   */
  async getCartOptimized(userId) {
    try {
      return await prisma.cartItem.findMany({
        where: { userId },
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error en consulta optimizada de carrito:', error);
      throw error;
    }
  }

  /**
   * Optimizar consulta de estadísticas
   */
  async getStatsOptimized() {
    try {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'COMPLETED' }
        })
      ]);

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0
      };
    } catch (error) {
      console.error('Error en consulta optimizada de estadísticas:', error);
      throw error;
    }
  }

  /**
   * Crear índices para optimización
   */
  async createIndexes() {
    try {
      // Nota: En Prisma, los índices se definen en el schema.prisma
      // Este método es para documentar qué índices son importantes
      console.log('Índices recomendados para optimización:');
      console.log('- products: isActive, categoryId, price');
      console.log('- orders: userId, status, createdAt');
      console.log('- cartItems: userId, productId');
      console.log('- users: email, isActive');
      
      return true;
    } catch (error) {
      console.error('Error creando índices:', error);
      throw error;
    }
  }

  /**
   * Limpiar conexiones inactivas
   */
  async cleanupConnections() {
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log('Conexiones de base de datos limpiadas');
      return true;
    } catch (error) {
      console.error('Error limpiando conexiones:', error);
      throw error;
    }
  }
}

// Instancia global del optimizador
const databaseOptimizer = new DatabaseOptimizer();

/**
 * Middleware para logging de consultas
 */
const logQueries = databaseOptimizer.logQueries();

/**
 * Endpoint para estadísticas de base de datos
 */
const getDatabaseStats = (req, res) => {
  const stats = databaseOptimizer.getQueryStats();
  res.json({
    success: true,
    database: stats
  });
};

/**
 * Endpoint para limpiar conexiones
 */
const cleanupDatabase = async (req, res) => {
  try {
    await databaseOptimizer.cleanupConnections();
    res.json({
      success: true,
      message: 'Database connections cleaned up successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up database connections',
      error: error.message
    });
  }
};

module.exports = {
  databaseOptimizer,
  logQueries,
  getDatabaseStats,
  cleanupDatabase
};
