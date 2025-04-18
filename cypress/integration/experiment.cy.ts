
describe('A/B Testing Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      body: { accessToken: 'mock-token' }
    }).as('refreshToken');
    
    // Set auth token
    window.localStorage.setItem('accessToken', 'mock-token');
    
    // Mock business ID
    const businessId = '60d21b4667d0d8992e610c85';
    
    // Mock experiments list
    cy.intercept('GET', `/api/businesses/${businessId}/experiments`, {
      statusCode: 200,
      body: [
        {
          _id: '60d21b4667d0d8992e610c86',
          businessId,
          name: 'Ad Copy Test',
          contentIdOriginal: '60d21b4667d0d8992e610c87',
          contentIdVariant: '60d21b4667d0d8992e610c88',
          split: {
            original: 50,
            variant: 50
          },
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-02-01T00:00:00.000Z',
          status: 'active',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      ]
    }).as('getExperiments');
    
    // Mock content list for experiment creation
    cy.intercept('GET', `/api/businesses/${businessId}/content`, {
      statusCode: 200,
      body: [
        {
          _id: '60d21b4667d0d8992e610c87',
          title: 'Original Ad Copy',
          type: 'facebook',
          platform: 'facebook'
        },
        {
          _id: '60d21b4667d0d8992e610c88',
          title: 'Variant Ad Copy',
          type: 'facebook',
          platform: 'facebook'
        }
      ]
    }).as('getContent');
    
    // Mock experiment results
    cy.intercept('GET', `/api/businesses/${businessId}/experiments/60d21b4667d0d8992e610c86/results`, {
      statusCode: 200,
      body: {
        experimentId: '60d21b4667d0d8992e610c86',
        results: {
          original: {
            impressions: 5000,
            clicks: 250,
            conversions: 50,
            conversionRate: 0.01
          },
          variant: {
            impressions: 5000,
            clicks: 300,
            conversions: 75,
            conversionRate: 0.015
          }
        },
        lift: 50,
        pValue: 0.04,
        isSignificant: true,
        lastUpdated: '2023-01-15T00:00:00.000Z'
      }
    }).as('getExperimentResults');
    
    // Mock experiment by ID
    cy.intercept('GET', `/api/experiments/60d21b4667d0d8992e610c86`, {
      statusCode: 200,
      body: {
        _id: '60d21b4667d0d8992e610c86',
        businessId,
        name: 'Ad Copy Test',
        contentIdOriginal: '60d21b4667d0d8992e610c87',
        contentIdVariant: '60d21b4667d0d8992e610c88',
        split: {
          original: 50,
          variant: 50
        },
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-02-01T00:00:00.000Z',
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }).as('getExperiment');
    
    // Mock create experiment
    cy.intercept('POST', `/api/businesses/${businessId}/experiments`, {
      statusCode: 201,
      body: {
        _id: '60d21b4667d0d8992e610c89',
        businessId,
        name: 'New Test',
        contentIdOriginal: '60d21b4667d0d8992e610c87',
        contentIdVariant: '60d21b4667d0d8992e610c88',
        split: {
          original: 50,
          variant: 50
        },
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-02-01T00:00:00.000Z',
        status: 'active',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }).as('createExperiment');
    
    // Mock update experiment status
    cy.intercept('PATCH', '/api/experiments/*/status', {
      statusCode: 200,
      body: {
        _id: '60d21b4667d0d8992e610c86',
        status: 'completed'
      }
    }).as('updateExperimentStatus');
    
    // Visit the experiments page
    cy.visit(`/businesses/${businessId}/experiments`);
  });
  
  it('should display list of experiments', () => {
    cy.wait('@getExperiments');
    
    // Check page header
    cy.contains('A/B Test Experiments');
    
    // Check experiment in the table
    cy.contains('Ad Copy Test');
    cy.contains('Active');
    cy.contains('50/50');
    
    // Check "Create Experiment" button exists
    cy.contains('button', 'Create Experiment').should('exist');
  });
  
  it('should create a new experiment', () => {
    cy.wait('@getExperiments');
    
    // Click create experiment button
    cy.contains('button', 'Create Experiment').click();
    
    // Wait for content to load
    cy.wait('@getContent');
    
    // Fill out the form
    cy.get('input#name').type('New A/B Test');
    
    // Select original content
    cy.get('button').contains('Select original content').click();
    cy.get('.SelectContent div').contains('Original Ad Copy').click();
    
    // Select variant content
    cy.get('button').contains('Select variant content').click();
    cy.get('.SelectContent div').contains('Variant Ad Copy').click();
    
    // Set dates using today and 14 days from now
    
    // Submit form
    cy.contains('button', 'Create Experiment').click();
    
    // Wait for creation request
    cy.wait('@createExperiment');
    
    // Check for success toast
    cy.contains('Experiment created successfully');
  });
  
  it('should view experiment results', () => {
    cy.wait('@getExperiments');
    
    // Click on results button
    cy.contains('button', 'Results').click();
    
    // Wait for experiment data to load
    cy.wait('@getExperiment');
    cy.wait('@getExperimentResults');
    
    // Check page content
    cy.contains('Ad Copy Test');
    cy.contains('Active');
    
    // Check metrics
    cy.contains('Conversion Rate');
    cy.contains('50% lift'); // From mock data
    
    // Check bar chart
    cy.get('svg').should('exist'); // Chart should render
    
    // Check statistical significance section
    cy.contains('Statistically Significant Results');
    cy.contains('P-Value');
    
    // Check stop experiment button
    cy.contains('button', 'Stop Experiment').click();
    
    // Wait for status update request
    cy.wait('@updateExperimentStatus');
  });
});
