
describe('Agency Management', () => {
  beforeEach(() => {
    // Mock the authentication to simulate a logged-in user
    cy.intercept('GET', '/api/auth/me', {
      id: 'user123',
      email: 'admin@example.com',
      role: 'agencyAdmin'
    }).as('getUser');
    
    // Mock the agencies endpoint
    cy.intercept('GET', '/api/agencies', {
      body: []
    }).as('getAgencies');
    
    // Visit the agencies page
    cy.visit('/agencies');
    cy.wait('@getUser');
    cy.wait('@getAgencies');
  });

  it('should create a new agency and add clients', () => {
    // Mock the create agency API call
    cy.intercept('POST', '/api/agencies', {
      statusCode: 201,
      body: {
        _id: 'agency123',
        name: 'Test Agency',
        ownerUserId: 'user123',
        clientBusinessIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('createAgency');
    
    // Mock the businesses API call
    cy.intercept('GET', '/api/businesses', {
      body: [
        {
          id: 'business1',
          name: 'Client Business 1',
          industry: 'technology',
          description: 'Test business'
        },
        {
          id: 'business2',
          name: 'Client Business 2',
          industry: 'healthcare',
          description: 'Another test business'
        }
      ]
    }).as('getBusinesses');
    
    // Mock the update agency clients API call
    cy.intercept('PUT', '/api/agencies/agency123/clients', {
      body: {
        _id: 'agency123',
        name: 'Test Agency',
        ownerUserId: 'user123',
        clientBusinessIds: ['business1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('updateAgencyClients');
    
    // Mock the agency overview API call
    cy.intercept('GET', '/api/agencies/agency123/overview', {
      body: {
        aggregatedKPIs: {
          totalSpend: 500,
          avgCTR: 2.5,
          totalImpressions: 10000,
          totalClicks: 250
        },
        clientBreakdown: [
          {
            businessId: 'business1',
            businessName: 'Client Business 1',
            spend: 500,
            impressions: 10000,
            clicks: 250
          }
        ],
        activeExperiments: [
          {
            id: 'exp1',
            name: 'Test Experiment',
            businessId: 'business1',
            businessName: 'Client Business 1',
            status: 'active',
            lift: 5.2,
            confidence: 92.5,
            startDate: new Date().toISOString()
          }
        ]
      }
    }).as('getAgencyOverview');
    
    // Click on create agency button
    cy.contains('button', 'Create Agency').click();
    
    // Fill in the agency name
    cy.get('input#agency-name').type('Test Agency');
    
    // Submit the form
    cy.contains('button', 'Create Agency').click();
    cy.wait('@createAgency');
    
    // After agency creation, mock the refreshed agencies list
    cy.intercept('GET', '/api/agencies', {
      body: [
        {
          _id: 'agency123',
          name: 'Test Agency',
          ownerUserId: 'user123',
          clientBusinessIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }).as('getUpdatedAgencies');
    
    // Mock the get agency by id API call
    cy.intercept('GET', '/api/agencies/agency123', {
      body: {
        _id: 'agency123',
        name: 'Test Agency',
        ownerUserId: 'user123',
        clientBusinessIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }).as('getAgency');
    
    // Click on View to navigate to agency overview
    cy.contains('button', 'View').click();
    cy.wait('@getAgency');
    cy.wait('@getAgencyOverview');
    
    // Check if we're on the agency overview page and see the agency name
    cy.contains('h1', 'Test Agency').should('be.visible');
    
    // Switch to the clients tab
    cy.contains('button', 'Manage Clients').click();
    cy.wait('@getBusinesses');
    
    // Check if the "Add Client" button is visible
    cy.contains('button', 'Add Client').click();
    
    // Select a client from the dropdown
    cy.get('[role="combobox"]').click();
    cy.contains('Client Business 1').click();
    
    // Submit the form to add the client
    cy.contains('button', 'Add Client').click();
    cy.wait('@updateAgencyClients');
    
    // Switch back to overview tab
    cy.contains('button', 'Overview').click();
    
    // Check if KPIs are displayed
    cy.contains('Total Spend').should('be.visible');
    cy.contains('Average CTR').should('be.visible');
    
    // Check if the client breakdown chart is visible
    cy.contains('Spend By Client').should('be.visible');
    
    // Check if active experiments are displayed
    cy.contains('Active Experiments').should('be.visible');
    cy.contains('Test Experiment').should('be.visible');
  });
});
