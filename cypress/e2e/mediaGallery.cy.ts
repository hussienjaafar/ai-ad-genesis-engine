
describe('Media Gallery', () => {
  beforeEach(() => {
    // Mock the authentication
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        user: {
          _id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'clientOwner'
        }
      }
    });
    
    cy.intercept('GET', '/api/auth/me', {
      statusCode: 200,
      body: {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'clientOwner',
        businesses: ['business123']
      }
    });
    
    // Mock the business data
    cy.intercept('GET', '/api/businesses/business123', {
      statusCode: 200,
      body: {
        _id: 'business123',
        name: 'Test Business',
        businessType: 'ecommerce',
        status: 'active'
      }
    });
    
    // Mock the media assets data
    cy.intercept('GET', '/api/businesses/business123/media*', {
      statusCode: 200,
      body: {
        assets: [
          {
            _id: 'media1',
            businessId: 'business123',
            assetType: 'video',
            platform: 'meta',
            assetId: 'video123',
            url: 'https://example.com/video.mp4',
            processingStatus: 'complete',
            metadata: {
              name: 'Test Video',
              thumbnailUrl: 'https://example.com/thumbnail.jpg',
              createdTime: '2023-01-01T12:00:00Z'
            },
            transcript: 'This is a test transcript for the video.',
            createdAt: '2023-01-01T12:30:00Z',
            updatedAt: '2023-01-01T12:35:00Z'
          },
          {
            _id: 'media2',
            businessId: 'business123',
            assetType: 'image',
            platform: 'google',
            assetId: 'image123',
            url: 'https://example.com/image.jpg',
            processingStatus: 'complete',
            metadata: {
              name: 'Test Image',
              width: 800,
              height: 600,
              createdTime: '2023-01-02T12:00:00Z'
            },
            detectedText: ['Hello', 'World'],
            labels: [
              { name: 'Person', confidence: 98.5 },
              { name: 'Car', confidence: 87.3 }
            ],
            createdAt: '2023-01-02T12:30:00Z',
            updatedAt: '2023-01-02T12:35:00Z'
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 20,
          pages: 1
        },
        stats: {
          types: { video: 1, image: 1 },
          platforms: { meta: 1, google: 1 },
          statuses: { complete: 2 }
        }
      }
    });
    
    // Mock specific media asset response
    cy.intercept('GET', '/api/businesses/business123/media/media1', {
      statusCode: 200,
      body: {
        _id: 'media1',
        businessId: 'business123',
        assetType: 'video',
        platform: 'meta',
        assetId: 'video123',
        url: 'https://example.com/video.mp4',
        processingStatus: 'complete',
        metadata: {
          name: 'Test Video',
          thumbnailUrl: 'https://example.com/thumbnail.jpg',
          createdTime: '2023-01-01T12:00:00Z',
          duration: 63
        },
        transcript: 'This is a test transcript for the video.',
        toneAnalysis: {
          sentiment: 'positive',
          sentimentScore: {
            positive: 0.85,
            negative: 0.05,
            neutral: 0.10
          },
          tones: [
            { name: 'Excited', score: 0.75 },
            { name: 'Professional', score: 0.65 }
          ]
        },
        createdAt: '2023-01-01T12:30:00Z',
        updatedAt: '2023-01-01T12:35:00Z'
      }
    });
    
    // Login and navigate to media gallery
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.visit('/businesses/business123/media');
  });

  it('displays the media gallery with assets', () => {
    // Check page title
    cy.get('h1').should('contain', 'Media Gallery');
    
    // Check if assets are displayed
    cy.get('.grid').children().should('have.length', 2);
    
    // Check first asset details
    cy.contains('Test Video').should('be.visible');
    cy.contains('meta').should('be.visible');
    
    // Check second asset details
    cy.contains('Test Image').should('be.visible');
    cy.contains('google').should('be.visible');
  });

  it('opens asset details when clicking on an asset', () => {
    // Click on the first asset
    cy.contains('Test Video').click();
    
    // Check if modal opens with asset details
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').within(() => {
      cy.contains('Test Video').should('be.visible');
      cy.contains('Transcript').should('be.visible');
      cy.contains('This is a test transcript').should('be.visible');
    });
    
    // Close the modal
    cy.get('body').type('{esc}');
  });

  it('allows filtering assets by type and platform', () => {
    // Mock filtered results
    cy.intercept('GET', '/api/businesses/business123/media?type=video*', {
      statusCode: 200,
      body: {
        assets: [
          {
            _id: 'media1',
            businessId: 'business123',
            assetType: 'video',
            platform: 'meta',
            assetId: 'video123',
            url: 'https://example.com/video.mp4',
            processingStatus: 'complete',
            metadata: {
              name: 'Test Video',
              thumbnailUrl: 'https://example.com/thumbnail.jpg'
            },
            createdAt: '2023-01-01T12:30:00Z',
            updatedAt: '2023-01-01T12:35:00Z'
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          pages: 1
        },
        stats: {
          types: { video: 1 },
          platforms: { meta: 1 },
          statuses: { complete: 1 }
        }
      }
    });
    
    // Select video filter
    cy.get('button').contains('All Types').click();
    cy.get('[role="option"]').contains('Videos').click();
    
    // Check if only video asset is displayed
    cy.get('.grid').children().should('have.length', 1);
    cy.contains('Test Video').should('be.visible');
    cy.contains('Test Image').should('not.exist');
  });
  
  it('shows error when media retrieval fails', () => {
    // Mock retrieval error
    cy.intercept('POST', '/api/businesses/business123/media/retrieve', {
      statusCode: 500,
      body: {
        error: 'Failed to trigger media retrieval'
      }
    });
    
    // Click retrieve button
    cy.contains('button', 'Retrieve Media').click();
    
    // Check if error toast is shown
    cy.contains('Failed to start media retrieval job').should('be.visible');
  });
});
