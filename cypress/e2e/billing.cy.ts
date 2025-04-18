
describe('Billing and Usage Flow', () => {
  beforeEach(() => {
    // Login and setup intercepts
    cy.intercept('GET', '/api/businesses/*/billing', {
      fixture: 'billing-details.json'
    }).as('getBilling');
    
    cy.intercept('GET', '/api/businesses/*/billing/usage', {
      fixture: 'usage-history.json'
    }).as('getUsage');
    
    cy.intercept('GET', '/api/billing/plans', {
      fixture: 'billing-plans.json'
    }).as('getPlans');

    // Mock login
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
  });

  it('should display billing information and handle plan changes', () => {
    // Visit business details page
    cy.visit('/businesses/b123');
    cy.get('[data-cy="nav-billing"]').click();

    // Wait for billing data to load
    cy.wait('@getBilling');
    cy.wait('@getUsage');

    // Verify billing components are visible
    cy.contains('Billing & Usage').should('be.visible');
    cy.contains('Token Quota').should('be.visible');
    cy.contains('Token Usage').should('be.visible');
    
    // Check progress bar and quota information
    cy.get('.progress').should('be.visible');
    cy.contains('tokens used').should('be.visible');
    cy.contains('tokens limit').should('be.visible');

    // Test changing plan flow
    cy.contains('Change Plan').click();
    cy.wait('@getPlans');
    
    // Mock plan selection
    cy.contains('Pro Plan').parent().find('input[type="radio"]').check({force: true});
    
    // Mock subscription response
    cy.intercept('POST', '/api/businesses/*/billing/subscribe', {
      statusCode: 200,
      body: {
        subscriptionId: 'sub_123',
        clientSecret: 'pi_123_secret'
      }
    }).as('subscribe');
    
    cy.contains('Confirm Subscription').click();
    cy.wait('@subscribe');
    
    // Verify success toast
    cy.contains('Successfully subscribed to plan').should('be.visible');
    
    // Test quota exceeded flow
    cy.intercept('GET', '/api/businesses/*/billing', {
      body: {
        usage: {
          currentUsage: 95000,
          quota: 100000,
          percentUsed: 95
        },
        subscription: {
          status: 'active',
          planId: 'price_basic',
          planName: 'Basic Plan',
          billingStatus: 'active',
          currentPeriodEnd: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          cancelAtPeriodEnd: false
        }
      }
    }).as('updatedBilling');
    
    // Refresh to see updated state
    cy.visit('/businesses/b123/billing');
    cy.wait('@updatedBilling');
    
    // Verify quota warning is displayed
    cy.contains('Quota almost reached').should('be.visible');
    
    // Test content generation with quota warning and upgrade prompt
    cy.visit('/businesses/b123/generate');
    
    // Mock content generation API to return quota exceeded error
    cy.intercept('POST', '/api/businesses/*/content/generate', {
      statusCode: 429,
      body: {
        error: 'Monthly token quota exceeded. Please upgrade your plan to continue.'
      }
    }).as('generateContent');
    
    // Try to generate content
    cy.get('[data-cy="generate-button"]').click();
    cy.wait('@generateContent');
    
    // Verify upgrade prompt is shown
    cy.contains('Monthly token quota exceeded').should('be.visible');
    cy.contains('Upgrade Plan').should('be.visible');
    
    // Test cancel subscription flow
    cy.visit('/businesses/b123/billing');
    cy.wait('@updatedBilling');
    
    cy.contains('Cancel Plan').click();
    
    // Verify cancel confirmation dialog
    cy.contains('Are you sure?').should('be.visible');
    
    // Mock cancel response
    cy.intercept('POST', '/api/businesses/*/billing/cancel', {
      statusCode: 200,
      body: {
        status: 'subscription_canceled'
      }
    }).as('cancelSubscription');
    
    cy.contains('Cancel Subscription').click();
    cy.wait('@cancelSubscription');
    
    // Verify success toast
    cy.contains('Subscription will be canceled').should('be.visible');
  });
});
