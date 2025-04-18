
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const setupSwagger = (app: express.Application) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AI Ad Engine API',
        version,
        description: 'API for the AI Ad Engine system',
        license: {
          name: 'Private',
          url: 'https://yourcompany.com',
        },
        contact: {
          name: 'API Support',
          url: 'https://yourcompany.com/contact',
          email: 'support@yourcompany.com',
        },
      },
      servers: [
        {
          url: '/api',
          description: 'API base path',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'refreshToken',
          },
        },
      },
      // Global security applied to all routes unless overridden at operation level
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/**/*.ts', './src/models/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  
  // Custom security handler to exempt OAuth callback routes from auth requirements
  // in the Swagger UI (they're already exempted in the actual routes)
  const oauth_callback_paths = [
    '/oauth/meta/callback',
    '/oauth/google/callback'
  ];
  
  for (const path of oauth_callback_paths) {
    if (swaggerSpec.paths[path] && swaggerSpec.paths[path].get) {
      // Override security to empty array for these specific paths
      swaggerSpec.paths[path].get.security = [];
    }
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Expose the Swagger spec as JSON endpoint
  app.get('/api-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
