# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b6b9f7f6-d756-4f72-afe8-a43c50fd2299

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b6b9f7f6-d756-4f72-afe8-a43c50fd2299) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b6b9f7f6-d756-4f72-afe8-a43c50fd2299) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Authentication

This application uses a secure cookie-based authentication system:

### How it works:
1. Access tokens are short-lived (15 minutes) and stored only in memory
2. Refresh tokens are long-lived (7 days) and stored as HTTP-only cookies
3. When the access token expires, the system automatically refreshes it using the cookie

### Using Swagger UI:
1. Navigate to `/docs` endpoint
2. Click the "Authorize" button at the top
3. Under "cookieAuth", the refresh token cookie will be automatically included
4. Protected endpoints will now work with your authentication

### Security Features:
- Access tokens are never stored in localStorage
- Refresh tokens are HttpOnly cookies (not accessible via JavaScript)
- CORS is configured to allow credentials only from whitelisted origins
- Rate limiting prevents brute force attempts
