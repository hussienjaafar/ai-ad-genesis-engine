
describe('A/B Test Variant Assignment', () => {
  beforeEach(() => {
    // Reset state before each test
    cy.clearCookies();
  });
  
  it('should consistently assign the same variant to the same user', () => {
    // Set a consistent user ID cookie
    const testUserId = 'test-user-123';
    cy.setCookie('fp_cookie', testUserId);
    
    // Visit the experiments page
    cy.visit('/experiments');
    
    // Find an active experiment
    cy.get('tbody tr').first().click();
    
    // Record which variant was assigned (from the badge or some indicator)
    cy.get('[data-test="assigned-variant"]').invoke('text').as('firstVariant');
    
    // Leave the page
    cy.visit('/dashboard');
    
    // Return to the experiment
    cy.visit('/experiments');
    cy.get('tbody tr').first().click();
    
    // Verify the same variant is shown
    cy.get('[data-test="assigned-variant"]').invoke('text').then((secondVariant) => {
      cy.get('@firstVariant').then((firstVariant) => {
        expect(secondVariant).to.equal(firstVariant);
      });
    });
  });
  
  it('should assign different variants to different users', () => {
    // Store variants assigned to different user IDs
    const variants: Record<string, string> = {};
    let differentVariantsFound = false;
    
    // Test with 5 different user IDs
    const userIds = [
      'user-1-abcdef',
      'user-2-ghijkl',
      'user-3-mnopqr',
      'user-4-stuvwx',
      'user-5-yzabcd'
    ];
    
    // For each user ID, record the variant assigned
    userIds.forEach((userId, index) => {
      cy.clearCookies();
      cy.setCookie('fp_cookie', userId);
      cy.visit('/experiments');
      cy.get('tbody tr').first().click();
      
      cy.get('[data-test="assigned-variant"]').invoke('text').then((variant) => {
        variants[userId] = variant;
        
        // After all users are processed, check if we found any different assignments
        if (index === userIds.length - 1) {
          const uniqueVariants = new Set(Object.values(variants));
          differentVariantsFound = uniqueVariants.size > 1;
          
          // We expect at least some users to get different variants
          // NOTE: This is probabilistic - with a 50/50 split there's a small chance
          // all 5 users get the same variant, but it's very unlikely (~3%)
          expect(differentVariantsFound).to.be.true;
        }
      });
    });
  });
  
  it('should persist variant assignment across sessions', () => {
    const userId = 'persistent-user-123';
    
    // First visit with user ID
    cy.setCookie('fp_cookie', userId);
    cy.visit('/experiments');
    cy.get('tbody tr').first().click();
    cy.get('[data-test="assigned-variant"]').invoke('text').as('initialVariant');
    
    // Simulate closing browser & restarting - clear cookies except fp_cookie
    cy.getCookie('fp_cookie').then((cookie) => {
      cy.clearCookies();
      if (cookie) {
        cy.setCookie('fp_cookie', cookie.value);
      }
    });
    
    // Revisit the experiment
    cy.visit('/experiments');
    cy.get('tbody tr').first().click();
    
    // Verify the same variant is assigned
    cy.get('[data-test="assigned-variant"]').invoke('text').then((newVariant) => {
      cy.get('@initialVariant').then((initialVariant) => {
        expect(newVariant).to.equal(initialVariant);
      });
    });
  });
});
