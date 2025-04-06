# Build and Start Flow Explainer

This document explains the complete flow from running a build command to having a fully connected application, covering both local development and production deployment on Render.

## Table of Contents

1. [Overview of Environments](#overview-of-environments)
2. [Local Development Flow](#local-development-flow)
3. [Production Deployment Flow](#production-deployment-flow)
4. [Configuration Files](#configuration-files)
5. [Connection Flow](#connection-flow)
6. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Overview of Environments

Our application can run in two primary environments:

1. **Local Development**: Running on your local machine during development
2. **Production**: Deployed on Render with separate services for frontend, backend, and database

Each environment has its own configuration, build process, and connection flow.

## Local Development Flow

### Step 1: Starting the Application (`npm run dev`)

When you run `npm run dev` in the root directory, the following happens:

```bash
# In package.json (root)
"scripts": {
  "dev": "turbo run dev",
  // other scripts...
}
```

This command uses Turborepo to run the `dev` script in all packages (client and server) concurrently.

### Step 2: Client Development Server

In the client directory, the `dev` script is executed:

```bash
# In client/package.json
"scripts": {
  "dev": "vite",
  // other scripts...
}
```

This starts Vite's development server, which:

1. **Loads Environment Variables**: Reads from `.env.development` or `.env.local`
2. **Starts Development Server**: Typically on port 5373 (configured in `vite.config.ts`)
3. **Enables Hot Module Replacement**: For instant updates during development

#### Client Configuration (Development)

The client uses environment variables to determine the API URL:

```typescript
// client/src/config.ts
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api', 
  // The || operator is the "logical OR" - it returns the first "truthy" value
  // If VITE_API_URL exists (not undefined, null, empty string, etc.), it uses that
  // Otherwise, it falls back to the hardcoded localhost URL
  // In plain English: "Use the API URL from our environment settings, but if it's not set, use our local development server"
  isProduction: import.meta.env.PROD || false,
  // In plain English: "Check if we're in production mode, and if that setting doesn't exist, assume we're not"
};

console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
// The ? : is the "ternary operator" - a shorthand for if/else
// If config.isProduction is truthy, it returns 'PRODUCTION', otherwise 'DEVELOPMENT'
// In plain English: "Print a message saying whether we're in production or development mode"
console.log('API URL:', config.apiUrl);

export default config;
export const API_URL = config.apiUrl;
```

In development, `VITE_API_URL` typically points to `http://localhost:4100/api`. This configuration allows the frontend to know where to send API requests, with a fallback value ensuring the application works even without environment variables set.

### Step 3: Server Development Process

In the server directory, the `dev` script is executed:

```bash
# In server/package.json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  // other scripts...
}
```

This starts the server using `ts-node-dev`, which:

1. **Loads Environment Variables**: Reads from `.env` in the server directory
2. **Starts TypeScript Server**: Runs the server without pre-compilation
3. **Enables Auto-Restart**: Restarts the server when files change

#### Server Configuration (Development)

The server uses environment variables for configuration:

```typescript
// server/src/index.ts
const PORT = process.env.PORT || 4100; 
// Similar to the || operator above, this sets PORT to the environment variable if it exists,
// or defaults to 4100 if process.env.PORT is undefined, null, or empty string
// In plain English: "Use whatever port number is in the environment settings, but if there isn't one, use port 4100"
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5373';

// CORS configuration for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
  // The === operator checks for strict equality (both value and type must match)
  // For example: 5 === 5 is true, but 5 === '5' is false (different types)
  // This is different from == which would consider 5 == '5' to be true (type coercion)
  // Using === is generally safer as it avoids unexpected type conversions
  // In plain English: "Check if we're running in production mode"
  ? FRONTEND_URL // In production, only allow requests from our deployed frontend
  : ['http://localhost:5173', 'http://localhost:5373'], // In development, allow requests from both Vite default and our custom port
  // In plain English: "If we're in production, only accept requests from our official website URL.
  // If we're in development mode, accept requests from either of the two localhost addresses."
  credentials: true,
}));
```

In development, the server:
- Runs on port 4100 (default)
- Accepts CORS requests from the development frontend URLs
- Connects to a local PostgreSQL database (specified in `.env`)

### Step 4: Database Connection (Development)

The server connects to the database using Prisma:

```typescript
// server/src/index.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  log: ['error', 'info', 'query', 'warn'], // Enables comprehensive logging for database operations
});

// Later in the code
app.get('/api/db-check', async (req, res) => {
  try { 
    // The try/catch block is used for error handling
    // Code in the try block is executed, and if it throws an error,
    // execution jumps to the catch block instead of crashing the application
    const userCount = await prisma.users.count(); // Simple query to verify database connection
    res.json({ status: 'connected', userCount });
  } catch (error) { 
    // This code runs only if an error occurs in the try block
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
```

The database connection string is specified in `server/.env`:

```
DATABASE_URL="postgresql://postgres:2322@localhost:5432/vrttpp-tv1-component-testing"
```

This connection string follows the format: `postgresql://[username]:[password]@[host]:[port]/[database_name]`

### Step 5: API Communication Flow (Development)

Once both client and server are running:

1. **Frontend Makes API Requests**: Using the configured API URL

```typescript
// client/src/api/api.ts
import axios from 'axios';
import config from '../config';

export const api = axios.create({
  baseURL: config.apiUrl, // Uses the API URL from our config (which comes from environment variables)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables sending cookies with cross-origin requests (important for session-based auth)
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // This is a truthiness check - JavaScript considers these values "falsy":
      // false, 0, '', null, undefined, NaN
      // Everything else is considered "truthy"
      // So this if statement runs if token is not null, undefined, or empty string
      // In plain English: "If we have a login token stored..."
      config.headers.Authorization = `Bearer ${token}`; // Automatically adds the JWT token to all requests
      // In plain English: "...add it to every request we send to the server so it knows who we are"
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

2. **Server Processes Requests**: Handles API requests and interacts with the database
3. **Data Flows Back to Client**: Server responds with data that the client renders

## Production Deployment Flow

### Step 1: Deployment Trigger

When you push to your repository or manually trigger a deployment on Render, the build process begins for both frontend and backend services.

### Step 2: Frontend Build Process

Render executes the build command specified in the dashboard:

```bash
# Build command in Render dashboard for frontend
npm install && npm run build
```

This triggers:

1. **Prebuild Script**: Executes before the main build to handle case sensitivity issues

```javascript
// client/prebuild.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create lowercase versions of files to handle case sensitivity issues
// This is important because Windows is case-insensitive but Linux (Render) is case-sensitive
function createLowercaseVersions(dir, extension) {
  // This function scans directories recursively, finds files with uppercase letters in their names,
  // and creates lowercase copies or symlinks to ensure they can be imported correctly on case-sensitive systems
}

// Process all TypeScript and React files
createLowercaseVersions('./src', '.tsx'); // Process React component files
createLowercaseVersions('./src', '.ts');  // Process TypeScript files
// Function calls execute the function with the provided arguments
// Here we're calling the same function twice with different file extensions
}
```

2. **Main Build Process**: Compiles the application for production

```bash
# In client/package.json
"scripts": {
  "prebuild": "node prebuild.mjs", // Runs automatically before the build script
  "build": "npm run prebuild && tsc && vite build", // Compiles TypeScript and then bundles with Vite
  // other scripts...
}
```

The build process:
- Runs TypeScript compilation (`tsc`)
- Bundles the application with Vite (`vite build`)
- Uses production environment variables from `.env.production`
- Optimizes and minifies code for production
- Generates static assets with content hashing for cache busting

#### Frontend Configuration (Production)

In production, the frontend uses different environment variables:

```
# client/.env.production
VITE_API_URL=https://sponsator-vrttppd-render-v1.onrender.com/api
```

This points the frontend to the production API URL.

### Step 3: Backend Build Process

Render executes the build command specified in the dashboard:

```bash
# Build command in Render dashboard for backend
npm install && npm install --no-save @babel/cli @babel/core @babel/preset-env @babel/preset-typescript && npx prisma generate && npx prisma migrate deploy && npx babel src --out-dir dist --extensions ".ts" --presets=@babel/preset-typescript,@babel/preset-env
```

This complex command:

1. **Installs Dependencies**: `npm install`
2. **Installs Build Tools**: `npm install --no-save @babel/cli @babel/core @babel/preset-env @babel/preset-typescript` (the `--no-save` flag prevents these dev dependencies from being added to package.json)
3. **Generates Prisma Client**: `npx prisma generate`
4. **Applies Database Migrations**: `npx prisma migrate deploy` (ensures the production database schema is up to date)
5. **Compiles TypeScript to JavaScript**: `npx babel src --out-dir dist --extensions ".ts" --presets=@babel/preset-typescript,@babel/preset-env` (converts TypeScript to Node.js-compatible JavaScript)

### Step 4: Starting the Services

After the build process completes, Render starts the services:

#### Frontend Service

The frontend is a static site, so Render simply serves the built files from the `dist` directory.

#### Backend Service

Render executes the start command:

```bash
# Start command in Render dashboard for backend
npm start
```

Which runs:

```bash
# In server/package.json
"scripts": {
  "start": "node dist/index.js", // Runs the compiled JavaScript code (not the TypeScript source)
  // other scripts...
}
```

This starts the compiled JavaScript version of the server.

#### Backend Configuration (Production)

In production, the backend uses environment variables set in the Render dashboard:

```
PORT=4100
DATABASE_URL=postgresql://sponsator_vrttppd_db_user:ux5mWfjnPRGQi3C33MszjlmfaL0kP9MY@dpg-cvnl8d95pdvs73b9acag-a.virginia-postgres.render.com/sponsator_vrttppd_db
JWT_SECRET=2322
FRONTEND_URL=https://sponsator-vrttppd-render-v1-1.onrender.com
NODE_ENV=production
```

These variables configure:
- The port the server runs on (must match the port Render exposes)
- The connection to the Render-hosted PostgreSQL database
- The JWT secret for authentication (kept the same as development for token compatibility)
- The URL of the frontend for CORS configuration
- The environment (production)

### Step 5: Database Connection (Production)

In production, the server connects to the Render-hosted PostgreSQL database using the `DATABASE_URL` environment variable.

### Step 6: File Storage (Production)

For file uploads, the server uses Render Disk:

```typescript
// server/src/middleware/upload.ts
const getUploadsDir = () => {
  if (process.env.NODE_ENV === 'production') {
    // Render Disk Storage path (this is where the Render Disk is mounted)
    // In plain English: "If we're running on the production server..."
    return '/opt/render/project/src/server/uploads';
    // In plain English: "...use the special folder on Render's servers for storing files"
  } else {
    // Local development path (relative to the current file)
    // In plain English: "If we're running on a developer's computer..."
    return path.join(__dirname, '../../uploads');
    // In plain English: "...use the uploads folder in our project directory"
  }
};
```

The Render Disk is mounted at `/opt/render/project/src/server/uploads` and provides persistent storage for uploaded files. Without this disk, files would be lost whenever the service restarts or redeploys.

### Step 7: API Communication Flow (Production)

Once all services are running:

1. **Frontend Makes API Requests**: Using the production API URL
2. **Server Processes Requests**: Handles API requests and interacts with the database
3. **Data Flows Back to Client**: Server responds with data that the client renders

## Configuration Files

### Client Configuration Files

#### 1. `client/.env.development`
```
VITE_API_URL=http://localhost:4100/api
```

#### 2. `client/.env.production`
```
VITE_API_URL=https://sponsator-vrttppd-render-v1.onrender.com/api
```

#### 3. `client/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()], // Enables React features like JSX and Fast Refresh
  server: {
    port: 5373 // Custom port to avoid conflicts with other services
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // Enables imports like @/components instead of relative paths
    }
  }
})
```

#### 4. `client/src/config.ts`
```typescript
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api', 
  // The || operator is the "logical OR" - it returns the first "truthy" value
  // If VITE_API_URL exists (not undefined, null, empty string, etc.), it uses that
  // Otherwise, it falls back to the hardcoded localhost URL
  // In plain English: "Use the API URL from our environment settings, but if it's not set, use our local development server"
  isProduction: import.meta.env.PROD || false,
  // In plain English: "Check if we're in production mode, and if that setting doesn't exist, assume we're not"
};

console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
// The ? : is the "ternary operator" - a shorthand for if/else
// If config.isProduction is truthy, it returns 'PRODUCTION', otherwise 'DEVELOPMENT'
// In plain English: "Print a message saying whether we're in production or development mode"
console.log('API URL:', config.apiUrl);

export default config;
export const API_URL = config.apiUrl;
```

### Server Configuration Files

#### 1. `server/.env`
```
DATABASE_URL="postgresql://postgres:2322@localhost:5432/vrttpp-tv1-component-testing"
JWT_SECRET="2322"
```

#### 2. Environment Variables in Render Dashboard
```
PORT=4100
DATABASE_URL=postgresql://sponsator_vrttppd_db_user:ux5mWfjnPRGQi3C33MszjlmfaL0kP9MY@dpg-cvnl8d95pdvs73b9acag-a.virginia-postgres.render.com/sponsator_vrttppd_db
JWT_SECRET=2322
FRONTEND_URL=https://sponsator-vrttppd-render-v1-1.onrender.com
NODE_ENV=production
```

## Connection Flow

### Local Development Connection Flow

1. **User Runs Command**: `npm run dev` in the root directory
2. **Turborepo**: Executes `dev` script in both client and server packages
3. **Client Development Server**:
   - Starts on port 5373
   - Loads environment variables from `.env.development`
   - Sets API URL to `http://localhost:4100/api`
4. **Server Development Process**:
   - Starts on port 4100
   - Loads environment variables from `.env`
   - Connects to local PostgreSQL database
   - Configures CORS to accept requests from development frontend
5. **API Communication**:
   - Frontend makes requests to `http://localhost:4100/api`
   - Server processes requests and interacts with the database
   - Server responds with data
   - Frontend renders the data

### Production Connection Flow

1. **Deployment Trigger**: Push to repository or manual trigger
2. **Build Process**:
   - Frontend: Prebuild script, TypeScript compilation, Vite build
   - Backend: Install dependencies, generate Prisma client, apply migrations, compile TypeScript
3. **Service Start**:
   - Frontend: Serve static files from `dist` directory
   - Backend: Run compiled JavaScript with `node dist/index.js`
4. **Configuration**:
   - Frontend: Use production API URL from `.env.production`
   - Backend: Use environment variables from Render dashboard
5. **API Communication**:
   - Frontend makes requests to production API URL
   - Server processes requests and interacts with the database
   - Server responds with data
   - Frontend renders the data

## Common Issues and Troubleshooting

### 1. Case Sensitivity Issues

**Problem**: Files that work on Windows fail on Render due to case sensitivity differences.

**Solution**: The prebuild script creates lowercase versions of files to ensure consistency.

### 2. CORS Errors

**Problem**: API requests fail due to CORS restrictions.

**Solution**: Ensure the server's CORS configuration includes the correct frontend URL:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
  // The === operator checks for strict equality (both value and type must match)
  // For example: 5 === 5 is true, but 5 === '5' is false (different types)
  // This is different from == which would consider 5 == '5' to be true (type coercion)
  // Using === is generally safer as it avoids unexpected type conversions
  // In plain English: "Is the application running on our production servers (not a developer's computer)?"
  ? process.env.FRONTEND_URL // In production, only allow the specific frontend domain
  // In plain English: "If yes, only accept requests from our official website address"
  : ['http://localhost:5173', 'http://localhost:5373'], // In development, allow both default and custom Vite ports
  // In plain English: "If no, accept requests from the developer's local computer addresses"
  credentials: true, // This is a simple property assignment, setting the credentials option to true
  // In plain English: "Allow requests to include cookies and login information"
}));
```

### 3. Database Connection Issues

**Problem**: Server can't connect to the database.

**Solution**: 
- In development: Ensure PostgreSQL is running locally and the connection string is correct (check port, username, password, and database name)
- In production: Verify the `DATABASE_URL` environment variable in the Render dashboard

### 4. File Upload Issues

**Problem**: File uploads work locally but fail in production.

**Solution**: Ensure the Render Disk is properly configured and mounted at the correct path.
- Check that the disk is created in the Render dashboard
- Verify the mount path matches what's in the code (`/opt/render/project/src/server/uploads`)
- Ensure the service has write permissions to the disk

### 5. Environment Variable Issues

**Problem**: Application uses incorrect configuration values.

**Solution**: 
- Check that environment variables are set correctly in all environments
- Verify that the application is loading the correct environment variables (check for typos in variable names)
- Use the diagnostic endpoints to check the current configuration
- Add console logs to debug environment variable loading

## Conclusion

Understanding the build and start flow is crucial for effective development and troubleshooting. This document has explained the complete process from running a build command to having a fully connected application, covering both local development and production deployment on Render.

By following this guide, you should be able to understand how the different components of the application connect and interact in different environments. 