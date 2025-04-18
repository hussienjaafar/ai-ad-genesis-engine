
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Ad Engine API',
      version: '1.0.0',
      description: 'API documentation for the AI Ad Engine platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Business',
        description: 'Business management endpoints',
      },
      {
        name: 'Content',
        description: 'Content generation endpoints',
      },
      {
        name: 'OAuth',
        description: 'OAuth integration endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints',
      },
      {
        name: 'Experiments',
        description: 'A/B testing experiment endpoints',
      },
      {
        name: 'Agency',
        description: 'Agency management endpoints',
      },
      {
        name: 'Billing',
        description: 'Subscription and usage billing endpoints',
      },
    ],
    paths: {
      // Auth paths
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Creates a new user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserRegistration',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
            },
          },
          security: [],
        },
      },

      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          description: 'Authenticates user and returns tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                    },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Successfully logged in',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
          security: [],
        },
      },

      '/api/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          description: 'Gets a new access token using refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: {
                      type: 'string',
                    },
                  },
                  required: ['refreshToken'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'New access token issued',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      accessToken: {
                        type: 'string',
                      },
                      refreshToken: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Invalid or expired refresh token',
            },
          },
          security: [],
        },
      },

      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout user',
          description: 'Invalidates refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: {
                      type: 'string',
                    },
                  },
                  required: ['refreshToken'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Successfully logged out',
            },
          },
        },
      },

      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          description: 'Returns the currently authenticated user',
          responses: {
            200: {
              description: 'User information',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      },

      // Business paths
      '/api/businesses': {
        get: {
          tags: ['Business'],
          summary: 'Get all businesses',
          description: 'Returns all businesses for the current user',
          responses: {
            200: {
              description: 'List of businesses',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Business',
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Business'],
          summary: 'Create business',
          description: 'Creates a new business',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/BusinessInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Business created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Business',
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
            },
          },
        },
      },

      '/api/businesses/{id}': {
        get: {
          tags: ['Business'],
          summary: 'Get business by ID',
          description: 'Returns a single business by ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          responses: {
            200: {
              description: 'Business found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Business',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not own this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
        put: {
          tags: ['Business'],
          summary: 'Update business',
          description: 'Updates an existing business',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/BusinessInput',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Business updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Business',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not own this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
        delete: {
          tags: ['Business'],
          summary: 'Delete business',
          description: 'Deletes an existing business',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          responses: {
            200: {
              description: 'Business deleted',
            },
            403: {
              description: 'Forbidden - User does not own this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
      },

      // Experiment paths
      '/api/businesses/{businessId}/experiments': {
        get: {
          tags: ['Experiments'],
          summary: 'Get all experiments',
          description: 'Returns all experiments for a business',
          parameters: [
            {
              in: 'path',
              name: 'businessId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          responses: {
            200: {
              description: 'List of experiments',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Experiment',
                    },
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not own this business',
            },
          },
        },
        post: {
          tags: ['Experiments'],
          summary: 'Create experiment',
          description: 'Creates a new A/B test experiment',
          parameters: [
            {
              in: 'path',
              name: 'businessId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExperimentInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Experiment created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Experiment',
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
            },
            403: {
              description: 'Forbidden - User does not own this business',
            },
          },
        },
      },

      '/api/experiments/{id}': {
        get: {
          tags: ['Experiments'],
          summary: 'Get experiment by ID',
          description: 'Returns a single experiment by ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Experiment ID',
            },
          ],
          responses: {
            200: {
              description: 'Experiment found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Experiment',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this experiment',
            },
            404: {
              description: 'Experiment not found',
            },
          },
        },
      },

      '/api/experiments/{id}/status': {
        patch: {
          tags: ['Experiments'],
          summary: 'Update experiment status',
          description: 'Updates the status of an experiment (active, paused, completed)',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Experiment ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['active', 'paused', 'completed'],
                    },
                  },
                  required: ['status'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Experiment status updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Experiment',
                  },
                },
              },
            },
            400: {
              description: 'Bad request - Invalid status or attempt to change split on active experiment',
            },
            403: {
              description: 'Forbidden - User does not have access to this experiment',
            },
            404: {
              description: 'Experiment not found',
            },
          },
        },
      },

      '/api/businesses/{businessId}/experiments/{expId}/results': {
        get: {
          tags: ['Experiments'],
          summary: 'Get experiment results',
          description: 'Returns the latest results for an experiment with statistical significance',
          parameters: [
            {
              in: 'path',
              name: 'businessId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
            {
              in: 'path',
              name: 'expId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Experiment ID',
            },
          ],
          responses: {
            200: {
              description: 'Experiment results',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExperimentResult',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this business',
            },
            404: {
              description: 'Experiment or results not found',
            },
          },
        },
      },
      
      // Billing paths
      '/api/businesses/{id}/billing': {
        get: {
          tags: ['Billing'],
          summary: 'Get billing details',
          description: 'Returns current billing details and usage for a business',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          responses: {
            200: {
              description: 'Billing details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BillingDetails',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
      },
      
      '/api/businesses/{id}/billing/subscribe': {
        post: {
          tags: ['Billing'],
          summary: 'Subscribe to a plan',
          description: 'Creates or updates a subscription for a business',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    planId: {
                      type: 'string',
                      description: 'Stripe plan ID',
                    },
                    paymentMethodId: {
                      type: 'string',
                      description: 'Stripe payment method ID',
                    },
                  },
                  required: ['planId', 'paymentMethodId'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Subscription created or updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Subscription',
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
            },
            403: {
              description: 'Forbidden - User does not have access to this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
      },
      
      '/api/businesses/{id}/billing/cancel': {
        post: {
          tags: ['Billing'],
          summary: 'Cancel subscription',
          description: 'Cancels the subscription for a business at the end of the billing period',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
          ],
          responses: {
            200: {
              description: 'Subscription cancellation scheduled',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Subscription',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this business',
            },
            404: {
              description: 'Business or subscription not found',
            },
          },
        },
      },
      
      '/api/businesses/{id}/billing/usage': {
        get: {
          tags: ['Billing'],
          summary: 'Get usage history',
          description: 'Returns token usage history for a business',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID',
            },
            {
              in: 'query',
              name: 'days',
              required: false,
              schema: {
                type: 'integer',
                default: 30,
              },
              description: 'Number of days to retrieve usage for',
            },
          ],
          responses: {
            200: {
              description: 'Usage history',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/UsageRecord',
                    },
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this business',
            },
            404: {
              description: 'Business not found',
            },
          },
        },
      },
      
      // Agency paths
      '/api/agencies': {
        get: {
          tags: ['Agency'],
          summary: 'Get all agencies',
          description: 'Returns all agencies the user has access to',
          responses: {
            200: {
              description: 'List of agencies',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Agency',
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Agency'],
          summary: 'Create agency',
          description: 'Creates a new agency',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AgencyInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Agency created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agency',
                  },
                },
              },
            },
            400: {
              description: 'Bad request',
            },
          },
        },
      },
      
      '/api/agencies/{agencyId}': {
        get: {
          tags: ['Agency'],
          summary: 'Get agency by ID',
          description: 'Returns a single agency by ID',
          parameters: [
            {
              in: 'path',
              name: 'agencyId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Agency ID',
            },
          ],
          responses: {
            200: {
              description: 'Agency found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agency',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this agency',
            },
            404: {
              description: 'Agency not found',
            },
          },
        },
        put: {
          tags: ['Agency'],
          summary: 'Update agency',
          description: 'Updates an existing agency',
          parameters: [
            {
              in: 'path',
              name: 'agencyId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Agency ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AgencyInput',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Agency updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agency',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this agency',
            },
            404: {
              description: 'Agency not found',
            },
          },
        },
        delete: {
          tags: ['Agency'],
          summary: 'Delete agency',
          description: 'Deletes an existing agency',
          parameters: [
            {
              in: 'path',
              name: 'agencyId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Agency ID',
            },
          ],
          responses: {
            200: {
              description: 'Agency deleted',
            },
            403: {
              description: 'Forbidden - User does not have access to this agency',
            },
            404: {
              description: 'Agency not found',
            },
          },
        },
      },
      
      '/api/agencies/{agencyId}/clients': {
        post: {
          tags: ['Agency'],
          summary: 'Add client business to agency',
          description: 'Links a business as a client to an agency',
          parameters: [
            {
              in: 'path',
              name: 'agencyId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Agency ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    businessId: {
                      type: 'string',
                      description: 'Business ID to add as client',
                    },
                  },
                  required: ['businessId'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Client added successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agency',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this agency',
            },
            404: {
              description: 'Agency or business not found',
            },
          },
        },
      },
      
      '/api/agencies/{agencyId}/clients/{businessId}': {
        delete: {
          tags: ['Agency'],
          summary: 'Remove client business from agency',
          description: 'Removes a business client link from an agency',
          parameters: [
            {
              in: 'path',
              name: 'agencyId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Agency ID',
            },
            {
              in: 'path',
              name: 'businessId',
              required: true,
              schema: {
                type: 'string',
              },
              description: 'Business ID to remove',
            },
          ],
          responses: {
            200: {
              description: 'Client removed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Agency',
                  },
                },
              },
            },
            403: {
              description: 'Forbidden - User does not have access to this agency',
            },
            404: {
              description: 'Agency or business not found',
            },
          },
        },
      },
    },
  },
  apis: ['./src/models/*.ts', './src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
