
declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      createTestBusiness(): Chainable<string>;
      createChatSession(businessId: string): Chainable<string>;
      cleanup(businessId: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  // Stub the auth token
  localStorage.setItem('accessToken', 'test-token');
  
  // Stub the auth endpoint to return a mock user
  cy.intercept('GET', '/api/auth/me', {
    statusCode: 200,
    body: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client'
    }
  });
});

Cypress.Commands.add('createTestBusiness', () => {
  return cy.request({
    method: 'POST',
    url: '/api/businesses',
    body: {
      name: 'Test Business',
      businessType: 'test',
      contact: { email: 'test@example.com' }
    }
  }).then((response) => response.body._id);
});

Cypress.Commands.add('createChatSession', (businessId: string) => {
  return cy.request({
    method: 'POST',
    url: `/api/businesses/${businessId}/chat-sessions`,
    body: {
      contentType: 'videoScript',
      originalContentId: 'test-content-id'
    }
  }).then((response) => response.body.sessionId);
});

Cypress.Commands.add('cleanup', (businessId: string) => {
  cy.request({
    method: 'DELETE',
    url: `/api/businesses/${businessId}`
  });
});
