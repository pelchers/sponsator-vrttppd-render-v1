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

## 11. Final Configuration After Deployment

After your application is deployed on Render, you'll need to update several environment variables with Render-specific values:

1. **Update FRONTEND_URL**:
   - Go to your Render dashboard
   - Find your deployed web service
   - Copy the service URL (e.g., `https://your-app-name.onrender.com`)
   - Go to the Environment tab in your service settings
   - Set `FRONTEND_URL` to this URL

2. **Update Stripe Webhook Endpoints** (if using Stripe):
   - Log in to your Stripe dashboard
   - Go to Developers → Webhooks
   - Add a new endpoint with your Render URL:
     `https://your-app-name.onrender.com/api/webhooks/stripe`
   - Select the events you need to listen for
   - Save and copy the signing secret
   - Add this as `STRIPE_WEBHOOK_SECRET` in your Render environment variables

3. **Test the Deployed Application**:
   - Visit your Render URL
   - Test authentication flows
   - Verify database connections using the `/api/db-test` endpoint
   - Test Stripe integration if applicable

4. **Monitor Logs**:
   - Check the Render logs for any errors
   - Address any configuration issues that appear
   - Verify CORS is working correctly between your frontend and backend

These final configuration steps ensure your application is properly connected to all services and working correctly in the Render environment.

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

In plain English: This guide provides a streamlined approach to deploying our monorepo application to Render.com using a single database and our existing development commands.

## Backend Setup

### 1. Configure CORS

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 4100;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5373';

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5373'],
  credentials: true,
}));
```

In plain English: This code sets up the basic server and its security settings:
- It creates a web server using Express
- It sets the port number (4100 for local development, or whatever is set on Render)
- It determines which website can talk to our server (CORS security)
- In production, it only allows our official website to connect
- In development, it allows connections from our local development servers
- The "credentials" setting allows login information to be included in requests

### 2. Update File Upload Paths

```typescript
// server/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get the uploads directory path based on environment
const getUploadsDir = () => {
  return process.env.NODE_ENV === 'production'
    ? '/opt/render/project/src/server/uploads'
    : path.join(__dirname, '../../uploads');
};

// Ensure the uploads directory exists
const uploadsDir = getUploadsDir();
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
```

In plain English: This code handles where uploaded files (like profile pictures) are stored:
- It decides where to save files based on whether we're in production or development
- In production (on Render), it uses a special persistent storage folder
- In development (on your computer), it uses a folder in your project
- It checks if the upload folder exists, and creates it if it doesn't
- This ensures files are saved in the right place and don't get lost when the server restarts

### 3. Configure Static File Serving

```typescript
// server/src/index.ts
// Serve static files from the uploads directory
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/server/uploads'
  : path.join(__dirname, '../uploads');

app.use('/uploads', express.static(uploadsDir));
```

In plain English: This code makes uploaded files available through web URLs:
- It determines where uploaded files are stored based on the environment
- It sets up a route so files can be accessed through web addresses
- For example, a file saved as "profile.jpg" can be accessed at "/uploads/profile.jpg"
- This allows the frontend to display images and other files that users have uploaded
- The same code works in both development and production, just with different file locations

### 4. Add Environment Detection Logging

```typescript
// server/src/index.ts
// Log environment information on startup
console.log('Server starting...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Frontend URL:', FRONTEND_URL);
console.log('Port:', PORT);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set (production)' : 'Not set (local)');
```

In plain English: This code prints helpful information when the server starts:
- It shows whether we're running in development or production mode
- It displays the frontend website URL that's allowed to connect
- It shows which port number the server is using
- It tells us if we're using the production database or a local one
- This information helps diagnose problems and verify the server is using the right settings

### 5. Add Diagnostic Endpoints

```typescript
// server/src/index.ts
// Add a test route to verify API connectivity
app.get('/api/ping', (req, res) => {
  res.json({
    message: 'API is working',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Add a database connection check
app.get('/api/db-check', async (req, res) => {
  try {
    // Try to query the database
    const userCount = await prisma.user.count();
    res.json({ status: 'connected', userCount });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

In plain English: This code creates special testing endpoints to check if everything is working:
- The "/api/ping" endpoint lets you verify the server is running and responding
- It tells you which environment it's running in and the current time
- The "/api/db-check" endpoint tests if the database connection is working
- It tries to count the users in the database and returns the result
- If there's a problem connecting to the database, it returns an error message
- These endpoints are extremely helpful for troubleshooting deployment issues

### 6. Add File System Check Endpoint

```typescript
// server/src/index.ts
// Add a test endpoint to verify file uploads
app.get('/api/test-disk', (req, res) => {
  try {
    const testFile = path.join(uploadsDir, 'test.txt');
    fs.writeFileSync(testFile, 'Test file created at ' + new Date().toISOString());
    
    res.json({ 
      message: 'Test file created successfully',
      path: testFile,
      uploadsDir,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating test file',
      error: error.message,
      stack: error.stack,
      uploadsDir
    });
  }
});
```

In plain English: This code creates a test endpoint to check if file uploads will work:
- It tries to create a simple text file in the uploads directory
- If successful, it tells you the file was created and where it's located
- If there's a problem (like permission issues), it returns detailed error information
- This helps diagnose file storage problems, which are common when deploying to Render
- It's especially useful for verifying that the Render Disk is properly configured and mounted

## Frontend Setup

### 7. Update Frontend API Configuration

```typescript
// client/src/config.ts
interface Config {
  apiUrl: string;
  isProduction: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
  isProduction: import.meta.env.PROD || false,
};

console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
console.log('API URL:', config.apiUrl);

export default config;
```

In plain English: This code configures where the frontend should send API requests:
- It looks for an environment variable that specifies the API URL
- If it can't find one, it defaults to the local development server
- It also checks if we're running in production or development mode
- It logs this information to the console so you can verify it's using the right settings
- This configuration is used throughout the frontend to communicate with the backend
- The same code works in both environments because it adapts based on environment variables

### 8. Create Environment Files

```
# client/.env.development
VITE_API_URL=http://localhost:4100/api
```

```
# client/.env.production
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

In plain English: These files contain environment-specific settings:
- The development file tells the app to use your local server during development
- The production file tells the app to use your Render-hosted server in production
- The frontend automatically uses the right file based on whether you're building for development or production
- This means you don't have to change any code when deploying - just build with the right environment
- These environment variables are accessed through the config.ts file we saw earlier

### 9. Add Case Sensitivity Fix

```javascript
// client/prebuild.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createLowercaseVersions(dir, extension) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      createLowercaseVersions(fullPath, extension);
    } else if (file.name.endsWith(extension) && file.name !== file.name.toLowerCase()) {
      const lowercasePath = path.join(dir, file.name.toLowerCase());
      console.log(`Creating lowercase version: ${lowercasePath}`);
      
      // Create a copy with lowercase name
      fs.copyFileSync(fullPath, lowercasePath);
    }
  }
}

// Process all TypeScript and React files
createLowercaseVersions(path.join(__dirname, 'src'), '.tsx');
createLowercaseVersions(path.join(__dirname, 'src'), '.ts');

console.log('Prebuild script completed');
```

In plain English: This code fixes a common problem with case sensitivity between Windows and Linux:
- Windows treats "Home.tsx" and "home.tsx" as the same file (case-insensitive)
- Linux (used by Render) treats them as different files (case-sensitive)
- This script finds all files with uppercase letters in their names
- It creates lowercase copies of these files
- This ensures that when your code imports a file like "Home.tsx" but writes "home.tsx", it still works on Render
- The script runs automatically before building the production version of your app
- This prevents mysterious "file not found" errors that only happen in production

### 10. Update Package.json Scripts

```json
// client/package.json
"scripts": {
  "dev": "vite",
  "prebuild": "node prebuild.mjs",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

In plain English: These scripts define the commands for developing and building the app:
- "dev" starts the development server for local work
- "prebuild" runs automatically before "build" to fix case sensitivity issues
- "build" compiles TypeScript and bundles the app for production
- "lint" checks your code for potential problems
- "preview" lets you preview the production build locally
- Render uses the "build" script when deploying your frontend

## Render Configuration

### 11. Configure Render Services

#### Backend Web Service

- **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: 4100
  - `DATABASE_URL`: Your Render PostgreSQL connection string
  - `FRONTEND_URL`: Your Render frontend URL
  - `NODE_ENV`: production
  - `JWT_SECRET`: Your secret key

In plain English: These settings tell Render how to build and run your backend:
- The build command installs dependencies, sets up the database, and compiles the code
- The start command runs the compiled application
- Environment variables provide crucial configuration information:
  * PORT tells the server which port to listen on
  * DATABASE_URL connects to your Render-hosted database
  * FRONTEND_URL specifies which website can make API requests
  * NODE_ENV tells the app it's running in production mode
  * JWT_SECRET is used for encrypting authentication tokens

#### Frontend Static Site

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your Render backend URL with `/api` suffix

In plain English: These settings tell Render how to build and serve your frontend:
- The build command installs dependencies and creates a production version of your app
- The publish directory tells Render where to find the built files (Vite puts them in "dist")
- The VITE_API_URL environment variable tells your frontend where to find the backend API
- Render automatically serves these static files when users visit your website

#### Render Disk (for file uploads)

- Create a Disk resource in Render
- Mount it to your backend service at `/opt/render/project/src/server/uploads`
- Set an appropriate size (e.g., 1 GB)

In plain English: This creates persistent storage for uploaded files:
- Render Disk is like an external hard drive for your application
- Without it, any uploaded files would be lost when your service restarts
- The mount path tells Render where to make this storage available to your app
- This path matches what we configured in the upload middleware
- The size limit prevents runaway storage usage (you can increase it later if needed)

### 12. Verify Deployment

After deploying, test the following endpoints:

1. Frontend: Visit your Render frontend URL
2. Backend API: Visit `https://your-backend-url.onrender.com/api/ping`
3. Database Connection: Visit `https://your-backend-url.onrender.com/api/db-check`
4. File System: Visit `https://your-backend-url.onrender.com/api/test-disk`

In plain English: These steps help you verify that everything is working correctly:
- Checking the frontend confirms that your website is accessible
- The ping test verifies that your backend server is running
- The database check confirms that your server can connect to the database
- The disk test ensures that file uploads will work properly
- If any of these tests fail, you'll need to check the corresponding configuration
- Render also provides logs that can help diagnose any issues

## Troubleshooting Common Issues

### 1. Case Sensitivity Issues

If you're seeing errors like "Module not found" or "Cannot find module", it's likely due to case sensitivity issues. The prebuild script should fix most of these, but you might need to manually check for:

- Inconsistent import paths (e.g., `import Layout from './Layout'` vs `import Layout from './layout'`)
- Component names that don't match their file names
- Barrel files (index.ts) that use incorrect casing

In plain English: This issue happens because Windows doesn't care about uppercase vs lowercase in filenames, but Linux (used by Render) does:
- Your code might work perfectly on your Windows computer
- But when deployed to Render, it fails because "Home.tsx" and "home.tsx" are different files
- The prebuild script creates lowercase copies of files to fix this
- If you're still having issues, check your import statements for inconsistent capitalization
- This is one of the most common reasons for deployment failures

### 2. Environment Variable Issues

If your application is not connecting to the correct API or database, check your environment variables:

- Verify that all environment variables are correctly set in the Render dashboard
- Check that your frontend is using the correct API URL
- Ensure your backend is connecting to the correct database

In plain English: Environment variables are settings that change based on where your app is running:
- They're like configuration switches that tell your app how to behave
- If these settings are wrong, your app won't know where to find the database or API
- Double-check all the settings in the Render dashboard
- Make sure your frontend knows the correct address of your backend
- Verify that your backend can connect to your database
- These connection issues are common but usually easy to fix once identified

### 3. Database Migration Issues

If your database tables are not being created:

- Check that the `npx prisma migrate deploy` command is included in your build command
- Verify that your `DATABASE_URL` environment variable is correctly set
- Check the Render logs for any migration errors

In plain English: Database migrations are instructions for setting up your database tables:
- They tell the database what tables to create and how they should be structured
- If migrations aren't running, your database will be empty
- Make sure the migration command is included in your build process
- Check that your database connection string is correct
- Look at the logs for any error messages during migration
- Without proper migrations, your app won't be able to store or retrieve data

### 4. File Upload Issues

If file uploads are not working:

- Verify that the Render Disk is created and mounted correctly
- Check that the upload paths match between your code and the Render configuration
- Test the `/api/test-disk` endpoint to verify file system access

In plain English: File upload issues usually happen because of storage or permission problems:
- Files need to be saved somewhere permanent, or they'll disappear when the server restarts
- The Render Disk provides this permanent storage
- Make sure it's created and connected to your app at the right location
- Check that your code is trying to save files to the same location
- Use the test endpoint to see if your app can write files to the disk
- File upload problems are common but can be fixed by ensuring the paths match

### 5. CORS Issues

If you're seeing CORS errors in your browser console:

- Verify that your CORS configuration includes the correct frontend URL
- Check that the `credentials` option is set to `true`
- Ensure your frontend is making requests to the correct backend URL

In plain English: CORS is a security feature that prevents random websites from accessing your API:
- It's like a bouncer that only lets authorized websites talk to your server
- If the CORS settings are wrong, even your own frontend can't access your backend
- Make sure your server knows the exact address of your frontend website
- The "credentials" option must be enabled if you're sending login information
- CORS errors show up in the browser console and block your app from working
- These errors are common but can be fixed by updating your CORS configuration 