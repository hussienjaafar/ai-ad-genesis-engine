
describe('Insight-Driven Generation Flow', () => {
  beforeEach(() => {
    // Mock auth state
    cy.window().then((win) => {
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'test@example.com',
        role: 'admin'
      }));
    });
    
    // Mock insights data
    cy.intercept('GET', '/api/businesses/*/analytics/insights', {
      statusCode: 200,
      body: {
        businessId: '123',
        patternInsights: [
          {
            _id: '60d21b4667d0d8992e610c85',
            element: 'Limited time offer: 20% off',
            elementType: 'headline',
            performance: {
              withElement: {
                impressions: 10000,
                clicks: 500,
                ctr: 0.05,
                sampleSize: 10
              },
              withoutElement: {
                impressions: 10000,
                clicks: 300,
                ctr: 0.03,
                sampleSize: 10
              },
              uplift: 0.67,
              confidence: 0.95
            }
          }
        ],
        createdAt: new Date().toISOString()
      }
    }).as('getInsights');
    
    // Mock performance metrics for the dashboard
    cy.intercept('GET', '/api/businesses/*/analytics/performance*', {
      statusCode: 200,
      body: {
        kpis: {
          spend: 1000,
          roas: 3.5,
          ctr: 0.035,
          cpl: 25
        },
        daily: [
          {
            date: '2023-01-01',
            impressions: 1000,
            clicks: 50,
            spend: 100,
            leads: 5,
            ctr: 0.05,
            cpc: 2,
            cpl: 20
          }
        ]
      }
    }).as('getPerformance');
    
    // Mock content generation endpoint
    cy.intercept('POST', '/api/businesses/*/content/generate', {
      statusCode: 201,
      body: {
        contentId: '60d21b4667d0d8992e610c86',
        parsedContent: {
          headline: 'New Limited Time Offer: 25% Off',
          primaryText: 'Take advantage of our special promotion before it expires.',
          callToAction: 'Shop Now'
        }
      }
    }).as('generateContent');
  });
  
  it('should generate content variation from insight', () => {
    // Visit the analytics dashboard
    cy.visit('/analytics');
    
    // Wait for data to load
    cy.wait(['@getPerformance', '@getInsights']);
    
    // Click on the "Patterns & Insights" tab if it's not active
    cy.contains('Patterns & Insights').click();
    
    // Should see the insights table
    cy.contains('Top Performing Patterns').should('be.visible');
    
    // Should see the insight in the table
    cy.contains('Limited time offer: 20% off').should('be.visible');
    
    // Click the "Generate Variation" button
    cy.contains('Generate Variation').click();
    
    // Modal should open
    cy.contains('Generate Variation from Insight').should('be.visible');
    
    // Should show the winning element
    cy.contains('Winning Element:').next().contains('Limited time offer: 20% off').should('be.visible');
    
    // Should show the performance uplift
    cy.contains('Performance Uplift:').next().contains('+67.00%').should('be.visible');
    
    // Select content type
    cy.get('select, [role="combobox"]').first().click();
    cy.contains('Facebook Ad').click();
    
    // Fill optional fields
    cy.get('input[name="tone"]').type('Professional');
    
    // Submit the form
    cy.contains('button', 'Generate Content').click();
    
    // Wait for generation to complete
    cy.wait('@generateContent');
    
    // Should show success message
    cy.contains('Content successfully generated!').should('be.visible');
    
    // Should show link to content library
    cy.contains('View in Content Library').should('be.visible');
  });
});
