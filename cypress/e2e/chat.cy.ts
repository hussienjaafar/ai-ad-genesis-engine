
describe('Chat Refinement Flow', () => {
  let businessId: string;
  let sessionId: string;

  before(() => {
    cy.login();
    cy.createTestBusiness().then(id => {
      businessId = id;
      cy.createChatSession(id).then(sid => {
        sessionId = sid;
      });
    });
  });

  after(() => {
    if (businessId) {
      cy.cleanup(businessId);
    }
  });

  it('should display chat sessions and allow message interaction', () => {
    // Visit chat sessions list
    cy.visit(`/businesses/${businessId}/chat-sessions`);
    cy.get('[data-cy="chat-session-card"]').should('be.visible');
    
    // Open chat session
    cy.get('[data-cy="continue-chat"]').first().click();
    cy.url().should('include', `/chat/${sessionId}`);

    // Stub the AI response
    cy.intercept('POST', `/api/businesses/${businessId}/chat-sessions/${sessionId}/message`, {
      statusCode: 200,
      body: {
        role: 'assistant',
        message: 'Here is a shorter version...',
        timestamp: new Date().toISOString()
      }
    }).as('sendMessage');

    // Type and send message
    cy.get('[data-cy="chat-input"]')
      .type('Shorten this script');
    cy.get('[data-cy="send-message"]').click();

    // Wait for response and verify messages
    cy.wait('@sendMessage');
    
    // Assert user message appears
    cy.get('[data-cy="chat-message-user"]')
      .should('be.visible')
      .and('contain', 'Shorten this script');

    // Assert AI response appears
    cy.get('[data-cy="chat-message-assistant"]')
      .should('be.visible')
      .and('contain', 'Here is a shorter version...');

    // Check content revisions
    cy.visit(`/businesses/${businessId}/content/test-content-id`);
    cy.get('[data-cy="revisions-tab"]').click();
    cy.get('[data-cy="revision-content"]')
      .should('contain', 'Here is a shorter version...');
  });
});
