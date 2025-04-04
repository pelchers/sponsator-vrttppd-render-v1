# Simple Render.com Setup Guide

This guide provides a streamlined approach to deploying our monorepo application to Render.com using a single database and our existing development commands.

## 1. Prerequisites

Before starting, ensure you have:
- A GitHub repository with your code
- A Render.com account
- Admin access to your Render account
- Two branches in your repository:
  - `main`: For local development and testing
  - `production`: For deployment to Render.com

**Important:** This guide is designed to maintain complete separation between your local development environment and the Render deployment. You'll be using different databases, environment variables, and potentially different Stripe configurations for each environment to avoid conflicts.

## Important Note About Local Development

This implementation is designed to keep your local development environment completely unchanged. You will:

- Continue using your local database for development
- Keep all local environment variables as they are
- Use the same commands for local development
- Only use the Render database and environment for production

The goal is to have a separate production environment that doesn't interfere with your local setup.

## Prepare Your Repository

Before creating any services on Render, it's crucial to prepare your repository since Render automatically attempts to build your application immediately after service creation:

1. Ensure all your code is working correctly locally
2. Commit all changes to your `main` branch
3. Create and set up your `production` branch:
   ```bash
   git checkout -b production
   git push -u origin production
   ```
4. Make any production-specific adjustments if needed
5. Push all changes to the production branch:
   ```bash
   git push origin production
   ```

This preparation ensures your code is ready to build as soon as you create the Render service, preventing initial build failures.

## 2. Database Setup

First, create a PostgreSQL database on Render:

1. Log in to your Render dashboard at [dashboard.render.com](https://dashboard.render.com)
2. Click on "New +" in the top right corner
3. Select "PostgreSQL" from the dropdown menu
4. Configure your database:
   - **Name**: Choose a descriptive name (e.g., `vrttpp-db`)
   - **Database**: Leave as default or customize
   - **User**: Leave as default or customize
   - **Region**: Choose the region closest to your users
   - **PostgreSQL Version**: Select version 12 or higher
   - **Plan Type**: Select appropriate plan (Free tier for development)
5. Click "Create Database"

After creation, save the provided credentials:
- Internal Database URL
- External Database URL
- Username
- Password

**Database Isolation Note:** This Render database will be completely separate from your local development database. This separation ensures that:
- Your local development won't affect production data
- Production changes won't interfere with local testing
- You can have different data in each environment

## 3. Web Service Setup

Next, set up the web service for our monorepo:

1. From your Render dashboard, click "New +" again
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure your web service:
   - **Name**: Choose a descriptive name (e.g., `vrttpp-app`)
   - **Root Directory**: Leave blank for monorepo root
   - **Environment**: Select "Node"
   - **Region**: Choose the same region as your database
   - **Branch**: `production`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan Type**: Select appropriate plan

5. Add environment variables:
   - `DATABASE_URL`: Paste the Internal Database URL from your PostgreSQL setup
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or your preferred port)
   - Add any other required environment variables (Stripe keys, etc.)

6. Click "Create Web Service"

**Environment Variables Note:** These environment variables will only apply to your Render deployment and won't affect your local setup. Your local environment will continue to use the variables in your local `.env` file.

## 4. Database Migration

After setting up the service, migrate your schema to the Render database:

```bash
# Create a temporary .env.render file with Render database URL
echo "DATABASE_URL=your_render_postgres_url" > .env.render

# Run migration using the temporary file
cd server
npx prisma migrate deploy --schema=./prisma/schema.prisma --env-file=../.env.render

# Remove the temporary file when done
rm ../.env.render
```

**Schema Consistency Note:** When making schema changes in the future:
1. Always develop and test migrations locally first
2. After testing, deploy to production and run migrations there
3. This ensures both environments maintain consistent schemas while keeping data separate

## 5. Setting Up Your Branch Structure

If not already done, set up your branch structure:

```bash
# Create production branch
git checkout -b production
git push -u origin production

# Return to main for local development
git checkout main
```

## 6. Deployment Workflow

For our simplified approach, we'll use a two-branch strategy:

1. **Local Development and Testing** (`main` branch):
   - All development and testing happens on `main` branch
   - Use your local environment for all testing, including Stripe test mode

2. **Production Deployment** (`production` branch):
   - When ready to deploy, merge changes from `main` to `production`:
     ```bash
     git checkout production
     git merge main
     git push origin production
     ```
   - Render will automatically deploy the changes to your web service

3. **Configure Auto-Deployment**:
   - In your Render web service settings, go to "Build & Deploy"
   - Set "Auto-Deploy" to "Yes"

4. **Return to Local Development**:
   - After deployment, return to `main` for continued development:
     ```bash
     git checkout main
     ```

**Workflow Note:** This workflow ensures that your local development and production environments remain separate, while making it easy to deploy changes when ready.

## 7. Testing Your Deployed Application

After deployment, Render will provide a URL like `https://vrttpp-app.onrender.com`. Use this to:

1. Verify the site loads correctly
2. Test basic functionality
3. Test Stripe integration using test mode
4. Monitor logs in the Render dashboard for any issues

**Testing Note:** You can safely test your Render deployment without affecting your local development environment. Both can run simultaneously with their own separate databases and configurations.

## 8. Troubleshooting Common Issues

### Build Failures
- Check Render logs for specific error messages
- Verify Node.js version compatibility
- Ensure all dependencies are properly installed

### Database Connection Issues
- Verify the DATABASE_URL environment variable is correct
- Check if your database is in the same region as your web service
- Ensure your schema migration was successful
- Confirm you're not accidentally connecting to your local database

## 9. Custom Domain Setup (Optional)

To use a custom domain:
1. Go to your web service in the Render dashboard
2. Click on "Settings" > "Custom Domain"
3. Add your domain and follow the verification steps
4. Update DNS records with your domain provider

## 10. Environment Variables for Stripe Integration

For Stripe integration, add these environment variables to your Render service:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (test key for now)
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events
- `FRONTEND_URL`: URL of your frontend for CORS and redirects

**Stripe Configuration Note:** 
- Set up separate webhook endpoints in the Stripe dashboard:
  - Local: Point to your local server (using ngrok if needed)
  - Production: Point to your Render URL
- Use different webhook signing secrets for each environment
- Both environments can use Stripe test mode with test cards
- Events will be isolated to their respective environments

Remember to never commit sensitive information like database credentials to your repository. Always use environment variables for configuration.

## Avoiding Conflicts Between Local and Render Environments

Since we're maintaining separate environments for local development and Render deployment, it's important to avoid conflicts:

### Database Isolation

1. **Separate Connection Strings**:
   - Your local `.env` file contains your local database connection
   - Render environment variables contain the Render database connection
   - The application uses whichever environment it's running in

2. **Schema Consistency**:
   - When making schema changes, always run migrations locally first
   - After testing locally, deploy to production and run migrations there
   - Use `npx prisma migrate deploy` on Render to apply migrations safely

3. **Data Independence**:
   - Local and Render databases contain separate data
   - You can seed test data differently in each environment
   - Production data stays isolated from development

### Stripe Integration

1. **Test vs Live Keys**:
   - Local environment: Always use Stripe test keys
   - Render environment: Use Stripe test keys for now (can switch to live keys later)
   - Different webhook secrets for each environment

2. **Webhook Configuration**:
   - Set up separate webhook endpoints in Stripe dashboard:
     - Local: Point to your local server (using ngrok if needed)
     - Production: Point to your Render URL
   - Use different webhook signing secrets for each

3. **Testing Payments**:
   - Both environments can use Stripe test mode
   - Test cards work in both environments
   - Events are isolated to their respective environments

This separation ensures you can develop locally without affecting your production environment, and vice versa. 