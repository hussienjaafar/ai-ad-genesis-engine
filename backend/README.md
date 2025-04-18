
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
