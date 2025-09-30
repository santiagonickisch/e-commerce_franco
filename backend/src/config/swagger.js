const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Franco Salon Exclusivo API',
      version: '1.0.0',
      description: 'API para e-commerce de productos profesionales para peluquería',
      contact: {
        name: 'Franco Salon Exclusivo',
        email: 'contacto@francosalonexclusivo.com',
        url: 'https://franco-salon-exclusivo.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.franco-salon-exclusivo.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            firstName: {
              type: 'string',
              description: 'Nombre del usuario'
            },
            lastName: {
              type: 'string',
              description: 'Apellido del usuario'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del usuario'
            },
            address: {
              type: 'string',
              description: 'Dirección del usuario'
            },
            city: {
              type: 'string',
              description: 'Ciudad del usuario'
            },
            postalCode: {
              type: 'string',
              description: 'Código postal del usuario'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Rol del usuario'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del usuario'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock', 'category'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del producto'
            },
            name: {
              type: 'string',
              description: 'Nombre del producto'
            },
            description: {
              type: 'string',
              description: 'Descripción del producto'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio del producto'
            },
            stock: {
              type: 'integer',
              description: 'Stock disponible'
            },
            category: {
              type: 'string',
              description: 'Categoría del producto'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs de las imágenes del producto'
            },
            isActive: {
              type: 'boolean',
              description: 'Estado activo del producto'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['userId', 'items', 'total', 'status'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del pedido'
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              },
              description: 'Items del pedido'
            },
            total: {
              type: 'number',
              format: 'float',
              description: 'Total del pedido'
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              description: 'Estado del pedido'
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            }
          }
        },
        OrderItem: {
          type: 'object',
          required: ['productId', 'quantity', 'price'],
          properties: {
            productId: {
              type: 'integer',
              description: 'ID del producto'
            },
            quantity: {
              type: 'integer',
              description: 'Cantidad'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Precio unitario'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            message: {
              type: 'string',
              description: 'Descripción del error'
            },
            statusCode: {
              type: 'integer',
              description: 'Código de estado HTTP'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de éxito'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Products',
        description: 'Gestión de productos'
      },
      {
        name: 'Orders',
        description: 'Gestión de pedidos'
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías'
      },
      {
        name: 'Health',
        description: 'Endpoints de salud y monitoreo'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/middleware/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
