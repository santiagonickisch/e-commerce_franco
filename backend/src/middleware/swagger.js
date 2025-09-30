const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('../config/swagger');

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { 
      background-color: #1f2937; 
    }
    .swagger-ui .topbar .download-url-wrapper { 
      display: none; 
    }
    .swagger-ui .info .title { 
      color: #FFD700; 
    }
    .swagger-ui .scheme-container { 
      background: #374151; 
      border-radius: 8px; 
    }
    .swagger-ui .btn.authorize { 
      background-color: #FFD700; 
      color: #1f2937; 
      border: none; 
    }
    .swagger-ui .btn.authorize:hover { 
      background-color: #FFA500; 
    }
  `,
  customSiteTitle: 'Franco Salon Exclusivo API',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    defaultModelRendering: 'example',
    displayOperationId: false,
    showRequestHeaders: true,
    showResponseHeaders: true
  }
};

const setupSwagger = (app) => {
  // Documentación Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));
  
  // JSON de la especificación
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
  });
  
  // Redirección a la documentación
  app.get('/docs', (req, res) => {
    res.redirect('/api-docs');
  });
};

module.exports = { setupSwagger, swaggerOptions };
