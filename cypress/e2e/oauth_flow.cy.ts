
describe('OAuth Authentication Flow', () => {
  beforeEach(() => {
    // Stub window methods used during auth
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpen');
    });

    // Mock the Supabase auth responses
    cy.intercept('POST', '*/supabase.co/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
        }
      }
    }).as('authToken');
  });

  it('should allow login with Google OAuth', () => {
    // Visit the login page
    cy.visit('/login');
    
    // Click on Google sign-in button
    cy.contains('Continue with Google').click();
    
    // Verify the window.open was called with a Google OAuth URL
    cy.get('@windowOpen').should('be.called');
    cy.get('@windowOpen').should('be.calledWithMatch', /accounts\.google\.com/);
    
    // Mock successful OAuth callback
    // This requires a custom command or direct manipulation
    // of the localStorage to simulate a successful login
    cy.window().then(win => {
      // Simulate Supabase auth state change
      const event = new CustomEvent('supabase.auth.event', {
        detail: {
          event: 'SIGNED_IN',
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'mock-user-id',
              email: 'test@example.com'
            }
          }
        }
      });
      win.dispatchEvent(event);
    });
    
    // Verify redirect to dashboard after successful login
    cy.url().should('include', '/');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show error message on failed OAuth', () => {
    // Mock failed auth response
    cy.intercept('POST', '*/supabase.co/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid OAuth session'
      }
    }).as('authError');
    
    cy.visit('/login');
    cy.contains('Continue with Google').click();
    
    // Simulate error response
    cy.window().then(win => {
      const event = new CustomEvent('supabase.auth.event', {
        detail: {
          event: 'ERROR',
          error: 'Failed to sign in'
        }
      });
      win.dispatchEvent(event);
    });
    
    // Verify error message is displayed
    cy.contains('Failed to sign in').should('be.visible');
    
    // Verify we're still on the login page
    cy.url().should('include', '/login');
  });
});
