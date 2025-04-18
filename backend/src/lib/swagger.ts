
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
        schemas: {
          PerformanceMetrics: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', format: 'date' },
                    platform: { type: 'string' },
                    metrics: {
                      type: 'object',
                      properties: {
                        impressions: { type: 'number' },
                        clicks: { type: 'number' },
                        spend: { type: 'number' },
                        leads: { type: 'number' },
                        ctr: { type: 'number' },
                        cpl: { type: 'number' }
                      }
                    }
                  }
                }
              },
              totals: {
                type: 'object',
                properties: {
                  impressions: { type: 'number' },
                  clicks: { type: 'number' },
                  spend: { type: 'number' },
                  leads: { type: 'number' },
                  ctr: { type: 'number' },
                  cpl: { type: 'number' }
                }
              },
              timeframe: {
                type: 'object',
                properties: {
                  start: { type: 'string', format: 'date' },
                  end: { type: 'string', format: 'date' },
                  days: { type: 'number' }
                }
              }
            }
          },
          PerformanceInsights: {
            type: 'object',
            properties: {
              businessId: { type: 'string' },
              patternInsights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    element: { type: 'string' },
                    elementType: { type: 'string' },
                    performance: {
                      type: 'object',
                      properties: {
                        uplift: { type: 'number' },
                        withElement: {
                          type: 'object',
                          properties: {
                            ctr: { type: 'number' },
                            sampleSize: { type: 'number' }
                          }
                        },
                        withoutElement: {
                          type: 'object',
                          properties: {
                            ctr: { type: 'number' },
                            sampleSize: { type: 'number' }
                          }
                        },
                        confidence: { type: 'number' }
                      }
                    }
                  }
                }
              },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
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

  // Add specific documentation for analytics endpoints
  if (swaggerSpec.paths && swaggerSpec.paths['/businesses/{id}/analytics/performance']) {
    swaggerSpec.paths['/businesses/{id}/analytics/performance'].get.description = 
      'Get detailed performance metrics for a business over a specified time period';
    swaggerSpec.paths['/businesses/{id}/analytics/performance'].get.parameters.push({
      name: 'days',
      in: 'query',
      description: 'Number of days to include in the analysis (default: 30)',
      schema: {
        type: 'integer',
        default: 30
      }
    });
    swaggerSpec.paths['/businesses/{id}/analytics/performance'].get.responses['200'].description = 
      'Successful response containing daily metrics and aggregated totals';
    swaggerSpec.paths['/businesses/{id}/analytics/performance'].get.responses['200'].content = {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/PerformanceMetrics'
        }
      }
    };
  }

  if (swaggerSpec.paths && swaggerSpec.paths['/businesses/{id}/analytics/insights']) {
    swaggerSpec.paths['/businesses/{id}/analytics/insights'].get.description = 
      'Get AI-generated insights about content performance patterns';
    swaggerSpec.paths['/businesses/{id}/analytics/insights'].get.responses['200'].description = 
      'Successful response containing pattern insights with statistical significance';
    swaggerSpec.paths['/businesses/{id}/analytics/insights'].get.responses['200'].content = {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/PerformanceInsights'
        }
      }
    };
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Expose the Swagger spec as JSON endpoint
  app.get('/api-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
