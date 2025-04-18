
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

## A/B Testing

The platform includes a robust A/B testing system to compare and optimize ad variants:

### Key Features
- Compare performance between original content and variants
- Flexible traffic splitting (50/50, 60/40, etc.)
- Real-time performance metrics with statistical significance
- Automatic lift calculation and confidence scoring

### How It Works
1. Create an experiment by selecting original and variant content
2. Set traffic distribution and experiment duration
3. Traffic is automatically split between variants
4. Performance metrics are tracked and analyzed
5. Statistical significance is calculated to validate results

### Statistical Analysis
- The system calculates lift percentage between variants
- P-value indicates statistical confidence (target: p < 0.05)
- Results are updated daily to help make informed decisions

![A/B Testing Flow](path/to/ab-testing-demo.gif)

### Uplift Measurement
- Content generated from insights are tracked through the full funnel
- Performance attribution connects variants back to their source insights
- This creates a continuous improvement loop driven by real data

## Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
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
