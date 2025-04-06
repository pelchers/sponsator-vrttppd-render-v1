# Local Development vs. Hosted Production Guide

This guide explains how our application handles different environments - local development (`npm run dev`) versus hosted production on Render. It covers the entire flow from configuration to execution, highlighting the conditional code that directs connections based on the environment.

## Environment Detection

The application detects whether it's running in development or production mode through several mechanisms:

### 1. Environment Variables

```typescript
// server/src/index.ts
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Using database:', process.env.DATABASE_URL ? 'Production DB' : 'Local DB');
```

In plain English: This code prints out information about where the app is running:
- It shows whether we're in development or production mode
- It shows what website URL will be allowed to connect to our server
- It tells us if we're using the online database or the local one on our computer

- In local development: `NODE_ENV` is undefined or set to `development`
- In production: `NODE_ENV` is set to `production` (configured in Render)

### 2. Frontend Environment Detection

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

// Log the environment
console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
console.log('API URL:', config.apiUrl);
```

- In local development: Vite sets `import.meta.env.PROD` to `false`
- In production: Vite sets `import.meta.env.PROD` to `true`
- In plain English: This code sets up the configuration for our frontend app:
- It decides where to send API requests based on our environment settings
- If no setting is provided, it defaults to our local development server
- It checks if we're running in production (on the internet) or development (on our computer)
- It prints out this information so we can verify it's using the right settings

## Connection Flow

### Local Development Flow

1. **Start Commands**:
   - Frontend: `npm run dev` (runs Vite dev server on port 5373)
   - Backend: `npm run dev` (runs ts-node-dev on port 4100)

2. **API URL Configuration**:
   ```typescript
   // client/.env.development
   VITE_API_URL=http://localhost:4100/api
   ```

3. **Database Connection**:
   ```typescript
   // server/.env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/sponsator_db"
   ```

4. **CORS Configuration**:
   ```typescript
   // server/src/index.ts
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? process.env.FRONTEND_URL 
       : ['http://localhost:5173', 'http://localhost:5373'],
     credentials: true,
   }));
   ```

In plain English: This code controls which websites are allowed to talk to our server:
- If we're running in production (on the internet), it only allows our official website to connect
- If we're running in development (on our computer), it allows connections from our local development servers
- This is a security feature that prevents random websites from accessing our server
- The "credentials" setting allows the connection to include login information

5. **File Storage**:
   ```typescript
   // server/src/middleware/upload.ts
   const getUploadsDir = () => {
     return process.env.NODE_ENV === 'production'
       ? '/opt/render/project/src/server/uploads'
       : path.join(__dirname, '../../uploads');
   };
   ```

In plain English: This code decides where to store uploaded files:
- If we're running in production (on the internet), it uses a special folder on the Render server
- If we're running in development (on our computer), it uses a folder in our project directory
- This ensures files are saved in the right place regardless of where the app is running
- The production path is specific to Render's file storage system

### Hosted Production Flow

1. **Build & Start Commands**:
   - **Script Locations**:
     - Frontend scripts are defined in `client/package.json`
     - Backend scripts are defined in `server/package.json`
     - Build commands are configured in the Render dashboard for each service

   - Frontend Build Script in package.json:
     ```json
     "scripts": {
       "dev": "vite",
       "prebuild": "node prebuild.mjs",
       "build": "npm run prebuild && tsc && vite build",
       "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
       "preview": "vite preview"
     }
     ```
     - *The prebuild script creates lowercase versions of files and fixes imports to handle case sensitivity issues on Linux-based servers*
     - *The actual prebuild script is defined in `client/prebuild.mjs` and runs before the build script automatically*
     - *The build process: 1) runs prebuild to fix case sensitivity, 2) compiles TypeScript with tsc, 3) bundles with Vite*

   - Frontend: `npm install && npm run build` (builds static files)
     - *This command first installs dependencies and then runs the build script which includes our prebuild script to fix case sensitivity issues in imports*

   - Backend Scripts in package.json:
     ```json
     "scripts": {
       "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js",
       "seed": "ts-node prisma/seed.ts"
     }
     ```
     - *The dev script uses ts-node-dev to run TypeScript directly with hot reloading*
     - *The build script compiles TypeScript to JavaScript using tsc*
     - *The start script runs the compiled JavaScript code from the dist directory*

   - Backend: `npm install && npm install --no-save @babel/cli @babel/core @babel/preset-env @babel/preset-typescript && npx prisma generate && npx prisma migrate deploy && npx babel src --out-dir dist --extensions ".ts" --presets=@babel/preset-typescript,@babel/preset-env` (builds JS files)
     - *This complex command installs dependencies, adds Babel packages temporarily, generates Prisma client, applies database migrations, and transpiles TypeScript to JavaScript to avoid TypeScript compilation issues on Render*
     - *We use Babel instead of tsc for transpilation because it handles certain TypeScript features better in the Render environment*

   - Start: `npm start` (runs Node.js on compiled JS)
     - *Uses the simple start script that runs the compiled JavaScript code instead of TypeScript, avoiding runtime TypeScript errors*

   - **Why Different Approaches for Development vs Production**:
     - In development (`npm run dev`):
       - We use `ts-node-dev` to run TypeScript directly without compilation
       - This provides faster development with hot reloading
       - No build step is needed, changes are reflected immediately
     - In production:
       - We pre-compile everything to JavaScript
       - This eliminates TypeScript runtime dependencies
       - Provides better performance and smaller deployment size
       - Avoids TypeScript compilation issues in the Render environment

   - **Understanding the Compilation Process**:
     - TypeScript files (`.ts`, `.tsx`) are transpiled to JavaScript (`.js`) files
     - The compiled files are placed in the `dist` directory, maintaining the same structure as the `src` directory
     - For example, `server/src/index.ts` becomes `server/dist/index.js`
     - All imports are updated to reference the compiled JavaScript files
     - The `dist` directory is what actually runs in production, not the original TypeScript files
     - This compilation step is crucial because:
       1. It catches type errors before deployment
       2. It optimizes the code for production
       3. It eliminates the need for TypeScript runtime dependencies in production
       4. It creates a clean, consistent build that works reliably on the server

   - **Alternative Launch Modes**:
     - **Note**: These alternative methods are provided for special cases and do not replace our standard deployment approach. You can use these methods alongside our existing setup without modifying any configuration files.

     - **Using Environment Files for Better Separation**:
       - Our application already uses separate environment files for different contexts:
         - `client/.env.development` - Local development settings
         - `client/.env.production` - Production settings
         - `server/.env` - Server environment variables
       - We can extend this approach for our alternative launch modes by creating additional environment files:
         - `client/.env.local-production` - For running production mode locally
         - `server/.env.local-production` - For running production mode locally
       - This keeps our configuration clean and prevents accidental mixing of environments

     - If we wanted to use development mode in production:
       ```bash
       # On the server
       npm install -g ts-node-dev typescript
       npm install
       npm run dev
       ```
       - This would run the application with hot reloading and without pre-compilation
       - However, this is **not recommended** for production because:
         1. It requires additional dependencies (TypeScript, ts-node-dev)
         2. It uses more memory and CPU resources
         3. It's slower to start up and respond to requests
         4. It's more prone to runtime errors that would have been caught during compilation
       - **How to add this capability without changing existing setup**:
         - In the Render dashboard, create a new Web Service with the same repository
         - Name it something like "Development Mode Backend"
         - Use these exact commands in the Render dashboard:
           - Build Command: `npm install`
           - Start Command: `npm install -g ts-node-dev typescript && NODE_ENV=production FRONTEND_URL=https://your-frontend-url.onrender.com npm run dev`
           - Add the same environment variables as your production service, especially `DATABASE_URL`
         - This creates a separate service that runs in development mode while keeping your main production service unchanged
     
     - If we wanted to use production mode locally:
       ```bash
       # Locally
       npm run build
       npm start
       ```
       - This would build the application and run it in production mode
       - This is useful for testing the production build before deployment
       - It helps catch issues that might only appear in the compiled code
       - **Exact terminal commands to run production mode locally**:
         - First, create environment files for local-production mode:
           - `client/.env.local-production`:
             ```
             VITE_API_URL=http://localhost:4100/api
             ```
           - `server/.env.local-production`:
             ```
             NODE_ENV=production
             PORT=4100
             DATABASE_URL=your_local_or_production_db_url
             FRONTEND_URL=http://localhost:5000
             JWT_SECRET=2322
             ```

         - For the server (run these commands in the server directory):
           ```bash
           # Step 1: Install required build tools temporarily
           npm install --no-save @babel/cli @babel/core @babel/preset-env @babel/preset-typescript
           
           # Step 2: Generate Prisma client
           npx prisma generate
           
           # Step 3: Transpile TypeScript to JavaScript
           npx babel src --out-dir dist --extensions ".ts" --presets=@babel/preset-typescript,@babel/preset-env
           
           # Step 4: Start the server with the local-production environment
           # For Windows:
           set NODE_ENV=production
           set ENV_FILE=.env.local-production
           npm start
           
           # For Mac/Linux:
           NODE_ENV=production ENV_FILE=.env.local-production npm start
           ```
         
         - For the client (run these commands in the client directory):
           ```bash
           # Step 1: Build the client with local-production environment
           npm run build -- --mode local-production
           
           # Step 2: Install serve to run the static files
           npm install -g serve
           
           # Step 3: Serve the built files
           serve -s dist -l 5000
           ```
           - The `serve` command creates a static file server on port 5000, which matches the `FRONTEND_URL` in our local-production environment
           - This ensures that CORS and other environment-specific configurations work correctly
         
         - **Does `serve` address the production-to-local transition?**
           - Yes, `serve` is a lightweight static file server that mimics how static files are served in production
           - It serves the compiled frontend files just like Render's static site hosting
           - The key is to ensure the API URL in the environment file points to your local server
           - This setup allows you to test the production build flow while still connecting to a local or remote backend

2. **API URL Configuration**:
   ```typescript
   // client/.env.production
   VITE_API_URL=https://sponsator-vrttppd-render-v1.onrender.com/api
   ```

In plain English: This setting tells our production app where to find the server:
- When running on the internet, the app needs to know the exact web address of our API
- This URL points to our server running on Render's hosting service
- The frontend will use this address for all its API requests
- This is different from development, where we use localhost addresses

3. **Database Connection**:
   ```
   // Render Environment Variable
   DATABASE_URL=postgresql://sponsator_vrttppd_db_user:ux5mWfjnPRGQi3C33MszjlmfaL0kP9MY@dpg-cvnl8d95pdvs73b9acag-a.virginia-postgres.render.com/sponsator_vrttppd_db
   ```

In plain English: This setting tells our server how to connect to the online database:
- It contains all the information needed: username, password, server address, and database name
- This is a connection string for PostgreSQL, our database system
- In production, we use Render's hosted database instead of a local one
- This string is kept secret and set in the Render dashboard, not in our code files

4. **CORS Configuration**:
   ```typescript
   // server/src/index.ts
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? process.env.FRONTEND_URL // Your Render frontend URL
       : ['http://localhost:5173', 'http://localhost:5373'],
     credentials: true,
   }));
   ```

5. **File Storage**:
   ```typescript
   // server/src/middleware/upload.ts
   const getUploadsDir = () => {
     return process.env.NODE_ENV === 'production'
       ? '/opt/render/project/src/server/uploads'
       : path.join(__dirname, '../../uploads');
   };
   ```

## Conditional Code by Feature

### 1. API Client Configuration

```typescript
// client/src/api/api.ts
import axios from 'axios';
import config from '../config';

// Create an axios instance with environment-specific config
export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

In plain English: This code sets up our system for making API requests:
- It creates a pre-configured tool for talking to our server
- It uses the API URL we determined earlier (either local or production)
- It sets up the proper format for sending data (JSON)
- The "withCredentials" setting ensures login information is included with requests
- This same code works in both development and production because it uses our config settings

- In development: `baseURL` is `http://localhost:4100/api`
- In production: `baseURL` is `https://sponsator-vrttppd-render-v1.onrender.com/api`

### 2. Static File Serving

```typescript
// server/src/index.ts
// Update the uploads directory path
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/server/uploads'
  : path.join(__dirname, '../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Update static file serving
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads/profiles', express.static(path.join(uploadsDir, 'profiles')));
// ... other static paths
```

- In development: Serves files from `server/uploads/`
- In production: Serves files from `/opt/render/project/src/server/uploads`
In plain English: This code handles serving uploaded files like images:
- It decides where to find uploaded files based on our environment
- It makes sure the upload folders exist, creating them if needed
- It sets up routes so files can be accessed through web URLs
- For example, a file at "/uploads/profiles/photo.jpg" can be accessed in a browser
- This works the same way in both development and production, just with different file locations

### 3. File Upload Middleware

```typescript
// server/src/middleware/upload.ts
// Create storage engine based on environment
const storage = process.env.NODE_ENV === 'production'
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        // Production storage logic using Render Disk
        let uploadPath = getUploadsDir();
        
        // Determine subdirectory based on route
        if (req.originalUrl.includes('/profiles')) {
          uploadPath = path.join(uploadPath, 'profiles');
        }
        // ... other subdirectories
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    })
  : multer.diskStorage({
      // Local storage logic (similar to production but with different base path)
    });
```

- In development: Stores uploaded files in local directories
- In production: Stores uploaded files on the Render Disk
- In plain English: This code handles file uploads from users:
- It creates a system for storing files that users upload
- In production, it saves files to Render's persistent storage
- In development, it saves files to our local project folder
- It organizes files into subfolders based on what they're for (profiles, projects, etc.)
- It generates unique filenames to prevent overwriting existing files
- The core logic is the same in both environments, just with different storage locations

### 4. JWT Authentication

```typescript
// server/src/middleware/auth.ts
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // ... token extraction logic
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '2322');
    console.log('Token verified for user:', decoded.userId);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

- In both environments: Uses `JWT_SECRET` environment variable with fallback to `'2322'`
- In production: `JWT_SECRET` is set in Render environment variables
- In plain English: This code checks if a user is properly logged in:
- It examines the authentication token sent with the request
- It uses a secret key to verify the token is legitimate
- If the token is valid, it identifies the user and allows the request to proceed
- If the token is invalid or missing, it rejects the request
- It uses the same secret key in both development and production (from environment settings)
- This ensures only authenticated users can access protected features

### 5. Database Connection

```typescript
// server/src/index.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    
    // ... additional database checks
  } catch (error) {
    console.error('Database connection error:', error);
  }
}
```

- In development: Connects to local PostgreSQL database
- In production: Connects to Render PostgreSQL database using the `DATABASE_URL` environment variable
- In plain English: This code sets up our connection to the database:
- It creates a client that can talk to our PostgreSQL database
- It enables logging so we can see database operations for debugging
- It tests the connection when the server starts up
- It reports whether the connection was successful
- The same code works in both environments because the connection details come from environment settings
- In development it connects to our local database, in production it connects to Render's database

## File Path Handling for Uploads

One of the most complex aspects is handling file paths correctly in both environments:

```typescript
// server/src/routes/userRoutes.ts
router.post('/:id/profile-image', upload.single('image'), async (req, res) => {
  try {
    // ... validation logic
    
    // Handle both Windows and Unix paths
    const uploadsDir = process.env.NODE_ENV === 'production'
      ? '/opt/render/project/src/server/uploads'
      : path.join(__dirname, '../../uploads');
    
    const relativePath = path.relative(uploadsDir, file.path);
    const filePath = relativePath.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
    
    // Update the user's profile image in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        profile_image: `/uploads/${filePath}`
      }
    });
    
    // ... response handling
  } catch (error) {
    // ... error handling
  }
});
```

This code:
1. Determines the base uploads directory based on environment
2. Calculates the relative path from the uploads directory to the file
3. Normalizes path separators (important for Windows development environments)
4. Stores the normalized path in the database
5. In plain English: This code handles profile picture uploads:
- It receives an image file from the user
- It figures out where the file is stored based on our environment
- It calculates the relative path to the file (how to find it from the base uploads folder)
- It converts any Windows-style backslashes to forward slashes for web URLs
- It saves the path to the database so we can find the image later
- This ensures file paths work correctly regardless of operating system or environment
- The same image URL format works in both development and production

## Diagnostic Tools

We've added several diagnostic endpoints to help troubleshoot environment-specific issues:

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
    const userCount = await prisma.user.count();
    res.json({ status: 'connected', userCount });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Add a test endpoint to verify file uploads
app.get('/api/test-disk', (req, res) => {
  try {
    const isWritable = checkDiskAccess();
    const testFile = path.join(uploadsDir, 'test.txt');
    fs.writeFileSync(testFile, 'Test file created at ' + new Date().toISOString());
    
    res.json({ 
      message: 'Test file created successfully',
      path: testFile,
      isWritable,
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

These endpoints provide valuable information about the current environment, database connectivity, and file system access.
In plain English: This code creates special testing endpoints:
- The "/api/ping" endpoint lets us check if the server is running
- It tells us which environment it's running in and when we made the request
- The "/api/db-check" endpoint tests if the database connection is working
- It counts the number of users in the database to verify it can read data
- These endpoints help us quickly identify problems in either environment
- They're especially useful when deploying to production to verify everything is working

## Environment-Specific Logging

We've enhanced logging to provide more context in different environments:

```typescript
// server/src/index.ts
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
  console.log('Using database:', process.env.DATABASE_URL ? 'Production DB' : 'Local DB');
  next();
});
```

This logging helps identify which environment the code is running in and what configuration is being used.

## Summary of Environment Differences

| Feature | Local Development | Hosted Production |
|---------|-------------------|-------------------|
| **Frontend URL** | http://localhost:5373 | https://sponsator-vrttppd-render-v1-1.onrender.com |
| **Backend URL** | http://localhost:4100 | https://sponsator-vrttppd-render-v1.onrender.com |
| **Database** | Local PostgreSQL | Render PostgreSQL |
| **File Storage** | server/uploads/ | /opt/render/project/src/server/uploads |
| **Environment** | development | production |
| **Build Process** | On-the-fly compilation | Pre-built static files & compiled JS |
| **CORS Origin** | localhost URLs | Frontend URL |

## Conclusion

Our application uses a combination of environment variables, conditional code, and configuration files to handle the differences between local development and hosted production environments. This approach allows developers to work efficiently in their local environment while ensuring the application runs correctly when deployed to Render.

The key to this system is the consistent use of environment detection throughout the codebase, allowing different parts of the application to adapt their behavior based on where they're running. 