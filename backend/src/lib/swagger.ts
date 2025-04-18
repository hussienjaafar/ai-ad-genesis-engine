
import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const setupSwagger = (app: Express): void => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AI Ad Genesis Engine API',
        version: '1.0.0',
        description: 'API documentation for AI Ad Genesis Engine',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 4000}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
