# Render.com Setup Guide

This guide walks through the process of deploying our monorepo application to Render.com, including setting up the PostgreSQL database, web service, and environment configuration.

## 1. Prerequisites

Before starting, ensure you have:
- A GitHub repository with your code (we're using `https://github.com/pelchers/vrttpp-tv1-component-testing-stripe.git`)
- A Render.com account
- Admin access to your Render account
- Three branches in your repository:
  - `main`: For local development only
  - `develop`: For staging environment
  - `production`: For production environment

## 2. Database Setup

First, we'll create a PostgreSQL database on Render:

1. Log in to your Render dashboard at [dashboard.render.com](https://dashboard.render.com)
2. Click on "New +" in the top right corner
3. Select "PostgreSQL" from the dropdown menu
4. Configure your database:
   - **Name**: Choose a descriptive name (e.g., `vrttpp-db-production`)
   - **Database**: Leave as default or customize
   - **User**: Leave as default or customize
   - **Region**: Choose the region closest to your users
   - **PostgreSQL Version**: Select the version compatible with your application (12 or higher recommended)
   - **Plan Type**: Select appropriate plan (Free tier for development)
5. Click "Create Database"

After creation, Render will provide you with:
- Internal Database URL
- External Database URL
- Username
- Password

Save these credentials securely - you'll need them for your application configuration.

6. Repeat this process to create a separate staging database (e.g., `vrttpp-db-staging`)

## 3. Web Service Setup

Next, we'll set up the web service for our monorepo:

### Production Service

1. From your Render dashboard, click "New +" again
2. Select "Web Service"
3. Connect your GitHub repository:
   - Select "GitHub" as the deployment option
   - Connect your GitHub account if not already connected
   - Search for and select your repository (`pelchers/vrttpp-tv1-component-testing-stripe`)
4. Configure your web service:
   - **Name**: Choose a descriptive name (e.g., `vrttpp-app-production`)
   - **Root Directory**: Leave blank for monorepo root
   - **Environment**: Select "Node"
   - **Region**: Choose the same region as your database
   - **Branch**: `production` (this is your production branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan Type**: Select appropriate plan

5. Add environment variables (click "Advanced" then "Add Environment Variable"):
   - `DATABASE_URL`: Paste the Internal Database URL from your production PostgreSQL setup
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or your preferred port)
   - Add any other environment variables your application needs

6. Click "Create Web Service"

### Staging Service

7. Repeat steps 1-6 to create a staging service with these differences:
   - **Name**: Use a staging suffix (e.g., `vrttpp-app-staging`)
   - **Branch**: `develop` (this is your staging branch)
   - **DATABASE_URL**: Point to your staging database
   - For Stripe-related variables, use test keys

## 4. Database Migration

After setting up both services, we need to migrate our schema to the Render databases:

### Option 1: Using Prisma Migrate

1. For the production database:
   ```bash
   # Update .env file with production database URL
   echo "DATABASE_URL=your_production_postgres_url" > .env
   
   # Run migration
   cd server
   npx prisma migrate deploy
   ```

2. For the staging database:
   ```bash
   # Update .env file with staging database URL
   echo "DATABASE_URL=your_staging_postgres_url" > .env
   
   # Run migration
   cd server
   npx prisma migrate deploy
   ```

3. Return to local development configuration:
   ```bash
   # Restore local database URL
   echo "DATABASE_URL=your_local_postgres_url" > .env
   ```

### Option 2: Manual Schema Import

If you have an existing schema dump:

1. Connect to your Render PostgreSQL databases using a tool like pgAdmin
2. Import your schema to both production and staging databases
3. Verify all tables and relationships are correctly created

## 5. Configuring Monorepo for Render

For a monorepo setup, we need to ensure Render can properly build and run our application:

1. Create or update `render.yaml` in your project root:

```yaml
services:
  # Production service
  - type: web
    name: vrttpp-app-production
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    branch: production
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: vrttpp-db-production
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000

  # Staging service
  - type: web
    name: vrttpp-app-staging
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    branch: develop
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: vrttpp-db-staging
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: ENVIRONMENT
        value: staging
      - key: PORT
        value: 10000

databases:
  - name: vrttpp-db-production
    databaseName: vrttpp_production
    user: vrttpp
  
  - name: vrttpp-db-staging
    databaseName: vrttpp_staging
    user: vrttpp
```

2. Ensure your `package.json` has the correct scripts:

```json
"scripts": {
  "build": "turbo run build",
  "start": "node server/dist/index.js",
  "dev": "turbo run dev"
}
```

3. Set up your branch structure if not already done:

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Create production branch
git checkout -b production
git push -u origin production

# Return to main for local development
git checkout main
```

## 6. Setting Up CI/CD for Staging and Production

Continuous Integration and Continuous Deployment (CI/CD) is crucial for maintaining a stable application, especially when implementing payment processing with Stripe. This section explains how to set up a proper CI/CD workflow for your Render environments.

### Understanding CI/CD in Context

CI/CD consists of two main components:

1. **Continuous Integration (CI)**
   - Automatically tests code when pushed to the repository
   - Ensures new code integrates properly with existing codebase
   - Catches errors early in the development process

2. **Continuous Deployment (CD)**
   - Automates the deployment process to different environments
   - Ensures consistent deployment procedures
   - Reduces human error in the deployment process

### Setting Up Dual Environment CI/CD with Three-Branch Strategy

For our Stripe integration, we'll implement a three-branch approach:

- `main`: Used exclusively for local development, never deployed
- `develop`: Deployed to staging environment for testing
- `production`: Deployed to production environment

#### 1. Configure Staging Environment

1. From your Render dashboard, go to your staging web service:
   - Click on the `vrttpp-app-staging` service
   - Go to "Settings" > "Build & Deploy"
   - Set "Auto-Deploy" to "Yes"
   - Ensure branch is set to `develop`

2. This ensures that whenever you push to the `develop` branch, changes are automatically deployed to staging.

#### 2. Configure Manual Deployments for Production

1. In your production web service settings:
   - Go to "Build & Deploy"
   - Set "Auto-Deploy" to "No"
   - Ensure branch is set to `production`
   - This prevents automatic deployments when you push to your production branch

2. Create a deploy hook for production:
   - Still in "Build & Deploy", scroll to "Deploy Hooks"
   - Click "Create Deploy Hook"
   - Name it "production-deploy"
   - Copy the generated URL and save it securely

#### 3. Set Up Deployment Documentation

Create a deployment log template in your project documentation:

1. Create a file named `deployment-log.md` with the following structure:
   ```markdown
   # Deployment Log

   ## [YYYY-MM-DD] - Version X.Y.Z

   **Commit Hash**: [full commit hash]
   
   **Deployed By**: [name]
   
   **Changes Included**:
   - Feature: [description]
   - Fix: [description]
   - Update: [description]
   
   **Testing Performed**:
   - [Test case 1]
   - [Test case 2]
   - [Stripe payment flow tested with cards: X, Y, Z]
   
   **Issues Encountered**:
   - [Issue 1] - [Resolution]
   - [Issue 2] - [Resolution]
   
   **Rollback Plan**:
   In case of critical issues, roll back to commit [previous stable commit hash]
   ```

#### 4. Three-Branch CI/CD Workflow Implementation

The complete CI/CD workflow using our three-branch strategy:

1. **Local Development Phase** (`main` branch):
   - All active development happens on `main` or feature branches
   - Run and test locally using local database
   - `main` branch is never deployed to Render
   - Local environment uses development configuration

2. **Staging Phase** (`develop` branch):
   - When features are ready for testing, merge to `develop` branch:
     ```bash
     git checkout develop
     git merge feature/your-feature
     git push origin develop
     ```
   - Render automatically deploys to staging environment
   - Staging uses test Stripe keys and staging database
   - Test thoroughly in staging environment

3. **Production Phase** (`production` branch):
   - After successful testing in staging, merge to `production`:
     ```bash
     git checkout production
     git merge develop
     git push origin production
     ```
   - Fill out the deployment log
   - Manually trigger deployment to production using:
     - Render dashboard: "Manual Deploy" > "Deploy latest commit"
     - Deploy hook: `curl -X POST [your-deploy-hook-url]`

4. **Return to Local Development**:
   - After deployment, return to `main` for continued development:
     ```bash
     git checkout main
     ```

This workflow ensures:
- Local development remains unaffected by deployment configurations
- Staging environment receives automatic updates for testing
- Production deployments are controlled and documented
- Each environment has its own database and configuration

## 7. Setting Up a Production-Ready Deployment Workflow

For our Stripe integration project, we need a robust deployment workflow that ensures stability and proper testing. Here's a step-by-step guide to implement the recommended workflow:

### Step 1: Create a Staging Environment

1. From your Render dashboard, create a second web service:
   - Click "New +" > "Web Service"
   - Connect to the same repository
   - Name it with a "staging" suffix (e.g., `vrttpp-app-staging`)
   - Use the same configuration as your production service
   - Set the same environment variables, but use Stripe test keys
   - Set branch to `develop`

2. Configure auto-deployment for staging:
   - In the staging service settings, go to "Build & Deploy"
   - Set "Auto-Deploy" to "Yes"
   - Ensure branch is set to `develop`

3. Create a separate database for staging:
   - Click "New +" > "PostgreSQL"
   - Name it with a "staging" suffix (e.g., `vrttpp-db-staging`)
   - Update the staging service's `DATABASE_URL` to point to this database
   - Run migrations on this database

### Step 2: Configure Manual Deployments for Production

1. In your production web service settings:
   - Go to "Build & Deploy"
   - Set "Auto-Deploy" to "No"
   - Ensure branch is set to `production`
   - This prevents automatic deployments when you push to your production branch

2. Create a deploy hook for production:
   - Still in "Build & Deploy", scroll to "Deploy Hooks"
   - Click "Create Deploy Hook"
   - Name it "production-deploy"
   - Copy the generated URL and save it securely

3. Document your manual deployment process:
   - Create a `DEPLOYMENT.md` file in your repository
   - Include the steps for triggering a manual deployment
   - Do NOT include the actual deploy hook URL in this file

### Step 3: Set Up Deployment Documentation System

Create a deployment log template in your project documentation:

1. Create a file named `deployment-log.md` with the following structure:
   ```markdown
   # Deployment Log

   ## [YYYY-MM-DD] - Version X.Y.Z

   **Commit Hash**: [full commit hash]
   
   **Deployed By**: [name]
   
   **Changes Included**:
   - Feature: [description]
   - Fix: [description]
   - Update: [description]
   
   **Testing Performed**:
   - [Test case 1]
   - [Test case 2]
   - [Stripe payment flow tested with cards: X, Y, Z]
   
   **Issues Encountered**:
   - [Issue 1] - [Resolution]
   - [Issue 2] - [Resolution]
   
   **Rollback Plan**:
   In case of critical issues, roll back to commit [previous stable commit hash]
   ```

2. Fill out this template for each production deployment
3. Store these logs in a secure location accessible to the team

### Step 4: Implement the Three-Branch Deployment Workflow

Follow this workflow for each feature or fix:

1. **Local Development Phase** (`main` branch):
   - Develop features on `main` or feature branches
   - Test locally with your local database
   - When ready for staging, merge to `develop` branch

2. **Staging Testing** (`develop` branch):
   - Push changes to `develop` branch to trigger automatic deployment
   - Test the feature thoroughly in the staging environment
   - Use Stripe test mode and test cards
   - Verify all payment flows and webhook handling
   - Document any issues and fixes

3. **Production Deployment** (`production` branch):
   - When staging testing is complete, merge `develop` to `production` branch
   - Fill out the deployment log template
   - Trigger manual deployment using one of these methods:
     - Use the Render dashboard: Go to your production service and click "Manual Deploy" > "Deploy latest commit"
     - Use the deploy hook: `curl -X POST [your-deploy-hook-url]`

4. **Production Verification**:
   - Immediately after deployment, verify critical functionality
   - Test payment flows with Stripe test mode
   - Monitor logs for any errors
   - Be prepared to roll back if necessary

5. **Rollback Procedure** (if needed):
   - In the Render dashboard, go to your production service
   - Click "Manual Deploy" > "Deploy specific commit"
   - Enter the last known stable commit hash
   - Verify functionality after rollback

6. **Return to Local Development**:
   - After successful deployment, return to `main` branch for continued development

### Step 5: Accessing and Testing Your Environments

#### Accessing Your Environments

Both staging and production environments will have unique URLs provided by Render:

1. **Production Environment**:
   - After deployment, Render assigns a URL like `https://vrttpp-app-production.onrender.com`
   - This is your main application URL for production
   - You can find this URL in the Render dashboard under your production web service

2. **Staging Environment**:
   - Similarly, your staging environment will have a URL like `https://vrttpp-app-staging.onrender.com`
   - This URL is used exclusively for testing before deploying to production
   - You can find this URL in the Render dashboard under your staging web service

3. **Local Environment**:
   - Your local development server typically runs at `http://localhost:3000`
   - This environment is only accessible on your machine
   - Uses your local database for development

#### Testing in Staging Environment

The staging environment is your pre-production testing ground:

1. **Accessing the Staging Environment**:
   - Open your browser and navigate to your staging URL (e.g., `https://vrttpp-app-staging.onrender.com`)
   - Log in with test credentials
   - The staging environment should look identical to production but with test data

2. **Comprehensive Testing Process**:
   - **User Flows**: Test all user journeys from start to finish
   - **Stripe Integration**: 
     - Use Stripe test cards (e.g., `4242 4242 4242 4242` for successful payments)
     - Test different scenarios (successful payment, declined card, etc.)
     - Verify webhooks are received and processed correctly
   - **Database Operations**: Test all CRUD operations
   - **Responsive Design**: Test on multiple devices and screen sizes
   - **Error Handling**: Deliberately trigger errors to test recovery

3. **Monitoring Staging Logs**:
   - In the Render dashboard, go to your staging service
   - Click on "Logs" to view real-time application logs
   - Look for errors, warnings, or unexpected behavior
   - Use these logs to diagnose and fix issues before production deployment

4. **Documenting Test Results**:
   - Keep a record of all tests performed
   - Document any issues found and their resolutions
   - Create a checklist of critical functionality that must work before production deployment

#### Testing in Production Environment

After deploying to production, verification testing is crucial:

1. **Accessing the Production Environment**:
   - Open your browser and navigate to your production URL (e.g., `https://vrttpp-app-production.onrender.com`)
   - If you've set up a custom domain, use that instead
   - Verify the site loads correctly and appears as expected

2. **Smoke Testing**:
   - Perform quick tests of critical functionality
   - Verify that the application is responsive and loads correctly
   - Check that authentication works
   - Test the most important user flows

3. **Stripe Payment Verification**:
   - Even in production, use Stripe's test mode for verification
   - Process test transactions using Stripe test cards
   - Verify that payment intents are created correctly
   - Check that webhooks are being received and processed
   - Confirm that the Stripe dashboard shows test transactions

4. **Monitoring Production Logs**:
   - In the Render dashboard, go to your production service
   - Click on "Logs" to view real-time application logs
   - Set up alerts for critical errors
   - Monitor the logs closely for the first few hours after deployment

5. **Database Verification**:
   - Verify that database connections are working
   - Check that data is being stored and retrieved correctly
   - Monitor database performance metrics in the Render dashboard

6. **User Experience Verification**:
   - Test the application on different browsers
   - Verify mobile responsiveness
   - Check loading times and performance
   - Ensure all images and assets are loading correctly

By following this structured approach to testing in both staging and production environments, you can minimize the risk of issues affecting your users and ensure a smooth deployment process for your Stripe integration.

## 8. Troubleshooting Common Issues

### Build Failures

If your build fails, check:
- Render logs for specific error messages
- Node.js version compatibility
- Dependencies that might need to be installed globally
- Build script configuration

### Database Connection Issues

If your application can't connect to the database:
- Verify the DATABASE_URL environment variable is correct for each environment
- Check if your database is in the same region as your web service
- Ensure your schema migration was successful
- Verify your Prisma configuration

### Branch-Related Issues

If you encounter issues with the three-branch strategy:
- Ensure you're on the correct branch for your current task
- Verify that the correct branch is configured for each Render service
- Check that you've properly merged changes between branches
- Use `git branch` to confirm your current branch

### Static File Serving

For proper static file serving:
- Ensure your server is configured to serve the client build directory
- Check paths in your server code for serving static files
- Verify that the build process correctly generates client assets

## 9. Monitoring and Scaling

After deployment:
1. Set up monitoring in the Render dashboard for both staging and production
2. Configure auto-scaling if needed
3. Set up alerts for performance issues
4. Monitor database usage and scale as necessary

## 10. Custom Domain Setup (Optional)

To use a custom domain:
1. Go to your production web service in the Render dashboard
2. Click on "Settings" and scroll to "Custom Domain"
3. Add your domain and follow the verification steps
4. Update DNS records with your domain provider

## 11. Deployment and Testing Strategy

### 11.1 Automatic vs. Manual Deployments with Three-Branch Strategy

Our three-branch strategy implements different deployment approaches for different environments:

#### Local Development (`main` branch)
- Never deployed to Render
- Used exclusively for local development
- Contains the most recent work-in-progress code
- Connects to local database

#### Automatic Deployments (`develop` branch)

The `develop` branch is automatically deployed to staging whenever changes are pushed:

- Ideal for testing new features before production
- Provides a shared environment for team testing
- Uses test Stripe keys and staging database
- Allows for rapid iteration and feedback

**How Automatic Deployments Work:**
1. You push code to your `develop` branch
2. Render detects the change via GitHub webhooks
3. A new build is triggered automatically
4. If the build succeeds, the new version is deployed to staging

**To Configure Automatic Deployments:**
1. Go to your staging web service in the Render dashboard
2. Click "Settings"
3. Under "Build & Deploy" > "Auto-Deploy", select "Yes"
4. Set branch to `develop`

#### Manual Deployments (`production` branch)

The `production` branch is manually deployed to production:

- Provides control over when updates go live
- Ensures thorough testing before deployment
- Allows for scheduled deployments during low-traffic periods
- Uses production database and can use live Stripe keys

**How Manual Deployments Work:**
1. You merge from `develop` to `production` branch
2. You push the changes to GitHub
3. No automatic deployment is triggered
4. You manually initiate a deployment when ready

**To Configure Manual Deployments:**
1. Go to your production web service in the Render dashboard
2. Click "Settings"
3. Under "Build & Deploy" > "Auto-Deploy", select "No"
4. Set branch to `production`
5. To deploy, go to the service dashboard and click "Manual Deploy" > "Deploy latest commit"

#### Deploy Hooks

For more flexibility, you can create deploy hooks - unique URLs that trigger deployments when called:

1. Go to your production web service settings
2. Under "Build & Deploy" > "Deploy Hooks", click "Create Deploy Hook"
3. Name your hook (e.g., "production-deploy")
4. Copy the generated URL

You can trigger a deployment by making a POST request to this URL:
```bash
curl -X POST https://api.render.com/deploy/srv-abc123?key=your-deploy-key
```

This allows you to integrate deployments with CI/CD pipelines or other automation tools.

### 11.2 Testing in Production Environment

For our Stripe integration, thorough testing in the production environment is crucial:

1. **Initial Deployment Testing**:
   - After your first deployment, verify the application loads correctly
   - Check that static assets are served properly
   - Confirm database connections are working
   - Test basic functionality before proceeding to payment flows

2. **Stripe-Specific Testing**:
   - Use Stripe test mode with test API keys
   - Test the complete payment flow with Stripe test cards
   - Verify webhook handling for various event types
   - Test error scenarios and edge cases
   - Confirm proper handling of payment intents and sessions

3. **Rollback Plan**:
   If issues are discovered:
   - Use Render's "Manual Deploy" to revert to a previous working commit
   - Check Render's automatic backup system for database rollbacks if needed
   - Document any issues for future prevention

4. **Monitoring During Testing**:
   - Watch application logs in real-time via the Render dashboard
   - Monitor Stripe dashboard for test events and webhooks
   - Check for any error reports or unexpected behaviors

### 11.3 Recommended Deployment Workflow for Our Project

Given the financial nature of our Stripe integration and our three-branch strategy, we recommend:

1. Develop on `main` branch for local development only
2. Push to `develop` branch for automatic deployment to staging
3. Test thoroughly in staging environment
4. Merge to `production` branch when ready
5. Manually deploy to production after final review
6. Document each production deployment with:
   - Commit hash deployed
   - Date and time
   - Features or fixes included
   - Testing performed
   - Any issues encountered

This approach balances development speed with the stability required for payment processing applications while maintaining a clean separation between local development, staging, and production environments.

## 12. Specific Configuration for Our Project

For our Stripe testing project, we need these additional environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key for the API (test key for staging, live key for production)
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events (different for staging and production)
- `FRONTEND_URL`: URL of your frontend for CORS and redirects (different for each environment)
- `ENVIRONMENT`: Set to `staging` for staging environment, `production` for production environment

## 13. Next Steps

After successful deployment:
1. Test all features in the production environment
2. Set up proper logging and monitoring
3. Configure backup strategies for your database
4. Document your deployment process for team members
5. Establish a regular merge schedule from `develop` to `production`

Remember to never commit sensitive information like database credentials to your repository. Always use environment variables for configuration.