
# AI Ad Engine

An AI-powered advertising platform for generating and optimizing ad content.

## Features

### Content Generation
AI-assisted ad copy and creative generation based on business profiles.

### Analytics Dashboard
Track performance metrics for your ads with detailed analytics.

### Platform Integrations
Connect to major ad platforms like Facebook and Google Ads.

### A/B Testing
Run controlled experiments to optimize your ad performance.

### Media Asset Management
Retrieve, analyze, and leverage video and image assets from connected ad platforms.

## Security & Ownership Checks

The platform implements a comprehensive security model to protect user data:

### Authentication & Authorization
- JWT-based authentication with short-lived access tokens (15 minutes) and secure refresh tokens
- Refresh tokens are securely hashed (SHA-256) before storage
- Automatic token refresh when expiration is approaching
- Role-based authorization (admin, agencyAdmin, client)

### Business & Agency Ownership
- Every business-related endpoint enforces ownership verification
- Business owners can only access their own business data
- Agency admins can only access businesses explicitly linked to their agency
- Ownership checks are enforced at the middleware level for consistent protection

### Data Privacy
- Clear separation of client data in multi-tenant architecture
- API rate limiting to prevent abuse
- Input validation and sanitization to prevent injection attacks

## Reliability & Retry Policies

The system is designed for production-grade reliability:

### API Resilience
- Timeouts on all external API calls (30s default)
- Automatic retry with exponential backoff for transient errors
- Graceful degradation when third-party services are unavailable

### Job Processing
- BullMQ-based job queues with persistence
- Configurable retry policies (3 attempts with exponential backoff)
- Dead letter queues for failed jobs requiring manual intervention
- Parallel processing of businesses during ETL to maximize throughput

### Quota Management
- Atomic quota checks to prevent race conditions
- Redis-based token reservation system
- Proactive quota warning at 90% threshold
- Graceful handling of quota exceeded conditions

## Statistical Accuracy

The platform uses rigorous statistical methods for insights and experiment evaluation:

### A/B Testing
- Chi-squared significance testing for conversion metrics
- Wilson score confidence intervals for proportion estimation
- Lift calculation with proper confidence bounds
- Automated experiment results computation and statistical validation

### Pattern Analysis
- Pre-aggregation of metrics for performance
- Business-scoped pattern discovery
- Statistically significant insights (p < 0.05)
- Dimensionality reduction to identify key performance drivers

## Media Ingestion & Processing

### Architecture
The platform implements a scalable, platform-agnostic media ingestion and processing subsystem:

1. **Retrieval Connectors**:
   - Connects to Meta (Facebook) and Google Ads to fetch video and image assets
   - Stores metadata in a unified MediaAsset MongoDB collection
   - Extensible to more platforms (TikTok, LinkedIn) through the same interface

2. **Processing Pipeline**:
   - Transcribes audio from video assets (AWS Transcribe)
   - Detects text and objects in images (AWS Rekognition)
   - Analyzes tone and sentiment in transcribed content (AWS Comprehend/OpenAI)

3. **Asynchronous Processing**:
   - Distributed job queues using BullMQ
   - Resilient to failures with automatic retries
   - Parallel processing across businesses and assets

### Media Gallery
The platform provides a comprehensive media management UI:

- Filterable gallery of all media assets
- Detailed view of assets, transcripts, and analysis results
- Status tracking for media processing

### Setting Up Media Processing

#### AWS Services Configuration
To use the media processing features, set the following environment variables:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-media-assets-bucket
```

#### Optional OpenAI Configuration
For enhanced tone analysis:

```
USE_AWS_COMPREHEND=false
OPENAI_API_KEY=your_openai_key
```

## Uplift Measurement
- Content generated from insights are tracked through the full funnel
- Performance attribution connects variants back to their source insights
- This creates a continuous improvement loop driven by real data

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
- Redis
- Facebook Developer Account (for Facebook Ads integration)
- Google Developer Account (for Google Ads integration)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

## Testing

Run automated tests: `npm test`

### Test Coverage
- Unit tests: Jest
- E2E tests: Cypress
- Coverage target: ≥80%

## Notes
- Charts display once at least one day of performance data is ingested.
- For best A/B test results, run experiments for at least 14 days.

