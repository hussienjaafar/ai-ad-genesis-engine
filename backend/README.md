
# AI Ad Genesis Engine - Backend

This is the backend API for the AI Ad Genesis Engine application.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (or Docker for containerized development)

### Local Development

1. Copy the environment variables example file:

```bash
cd backend && cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The API will be available at http://localhost:4000 with API documentation at http://localhost:4000/docs

4. Create the TTL index for refresh tokens (only needed once):

```bash
npm run migrate-indexes
```

### Cookie-Based Authentication

The application uses a secure cookie-based authentication system:

- Access tokens are short-lived (15 minutes by default) and stored only in memory
- Refresh tokens are long-lived (7 days by default) and stored as HTTP-only cookies
- CORS is configured to allow credentials from whitelisted origins (set via FRONTEND_URL env variable)
- The frontend uses `withCredentials: true` for all API requests to ensure cookies are sent

### Connecting ad accounts

The application supports connecting to ad platforms using OAuth:

1. **Setup Environment Variables**:
   - `FB_APP_ID` and `FB_APP_SECRET` - Create an app at https://developers.facebook.com
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - Create credentials at https://console.developers.google.com
   - `OAUTH_ENCRYPTION_KEY` - Generate a 32+ character random string for encrypting tokens

2. **Connecting Facebook/Meta Ads**:
   - Navigate to the Platform Integration page
   - Click "Connect" on the Facebook/Meta card
   - Authenticate with Facebook and grant permissions
   - Select the ad account to connect

3. **Connecting Google Ads**:
   - Navigate to the Platform Integration page
   - Click "Connect" on the Google card
   - Authenticate with Google and grant permissions

4. **Token Refresh**:
   - Facebook tokens expire after 60 days
   - A nightly job checks for tokens expiring within 15 days
   - When a token nears expiration, the system marks it for reauth

5. **Security**:
   - All OAuth tokens are encrypted with AES-256-GCM before storage
   - CSRF protection is implemented for all OAuth flows
   - Sensitive operations require authentication and proper authorization

### Using Docker Compose

To run both the backend and MongoDB in Docker containers:

```bash
# From the project root
docker compose up --build
```

Visit http://localhost:4000/docs to access the API documentation.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linting
- `npm run seed` - Seed the database with initial data
- `npm run migrate-indexes` - Create database indexes (run once after setup)
- `npm run etl` - Run the ETL job manually

## Running ETL locally

The ETL (Extract, Transform, Load) process can be run locally for testing:

1. Ensure your .env file has the necessary platform credentials
2. Run the ETL job manually with:

```bash
npm run etl
```

For development, you can also modify the cron schedule in .env:

```
CRON_ETL_SCHEDULE=*/30 * * * * # Run every 30 minutes
```

## API Endpoints

- **Authentication**:
  - POST `/api/auth/register` - Register a new user
  - POST `/api/auth/login` - Log in
  - POST `/api/auth/refresh` - Refresh access token
  - POST `/api/auth/logout` - Log out (invalidates refresh token)
  - GET `/api/auth/me` - Get current user profile

- **Businesses**:
  - GET `/api/businesses` - Get all businesses (admin only)
  - POST `/api/businesses` - Create a business (admin only)
  - GET `/api/businesses/:id` - Get a business by ID
  - PUT `/api/businesses/:id` - Update a business
  - POST `/api/businesses/:id/offerings` - Add offerings to a business
  - POST `/api/businesses/:id/platforms/:platform` - Store platform credentials

- **Content**:
  - POST `/api/businesses/:id/content/generate` - Generate content for a business
  - GET `/api/businesses/:id/content` - Get content for a business
  - GET `/api/content/:id` - Get content by ID

- **OAuth**:
  - GET `/api/oauth/meta/init` - Initialize Meta OAuth flow
  - GET `/api/oauth/meta/callback` - Handle Meta OAuth callback
  - GET `/api/oauth/google/init` - Initialize Google OAuth flow
  - GET `/api/oauth/google/callback` - Handle Google OAuth callback

- **Analytics**:
  - GET `/api/businesses/:id/analytics/performance` - Get performance metrics
  - GET `/api/businesses/:id/analytics/insights` - Get performance insights
