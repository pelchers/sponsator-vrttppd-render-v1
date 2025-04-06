# Render Setup Guide: Fixes for Case Sensitivity and Build Issues

This guide documents the fixes implemented to resolve deployment issues on Render for both the frontend and backend services.

## Key Insights and Lessons Learned

Before diving into specific fixes, here are the key insights from our deployment process:

1. **Environment Detection**: Properly detecting whether the application is running in development or production is crucial.
2. **CORS Configuration**: CORS must be configured to accept requests from both development and production environments.
3. **JWT Secret Consistency**: Using the same JWT secret in development and production ensures authentication tokens work consistently.
4. **Enhanced Logging**: Detailed logging helps diagnose issues in production environments.
5. **Database Connection**: Verifying database connections early helps identify configuration issues.
6. **Static Assets**: Properly configuring static asset paths ensures images and other assets load correctly.
7. **Diagnostic Endpoints**: Adding simple diagnostic endpoints helps verify API connectivity.

## Frontend Fixes

### 1. Case Sensitivity Issues

The primary issue with the frontend deployment was case sensitivity. Windows is case-insensitive for filenames, but Linux (which Render uses) is case-sensitive. This caused imports to fail when the case didn't match exactly.

#### Solution: Prebuild Script

We created a prebuild script that:
1. Creates lowercase versions of all files with uppercase names
2. Fixes imports in all files to use the correct case
3. Creates symlinks for critical files like Layout.tsx

```javascript
// client/prebuild.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting prebuild process...");

// Function to create lowercase symlinks/copies
function createLowercaseVersions(dir, extension) {
  console.log(`Processing ${extension} files in ${dir}...`);
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  // Create a map of original filenames to lowercase versions
  const fileMap = {};
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      createLowercaseVersions(fullPath, extension);
    } else if (file.name.endsWith(extension)) {
      const baseName = file.name;
      const lowerBaseName = baseName.toLowerCase();
      
      // Only create a copy if the case differs
      if (baseName !== lowerBaseName) {
        console.log(`Creating lowercase version: ${dir}/${lowerBaseName} -> ${baseName}`);
        
        // Read the original file and write to lowercase filename
        const content = fs.readFileSync(fullPath, 'utf8');
        fs.writeFileSync(path.join(dir, lowerBaseName), content);
        
        // Add to map for import fixing
        fileMap[baseName.replace(extension, '')] = lowerBaseName.replace(extension, '');
      }
    }
  }
  
  return fileMap;
}

// Function to fix imports in a file
function fixImportsInFile(filePath, fileMap) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix imports like: import X from './Path'
  for (const [original, lowercase] of Object.entries(fileMap)) {
    const regex = new RegExp(`from\\s+['"]\\.\\/([^'\"/]*/)*${original}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, (match) => {
        return match.replace(original, lowercase);
      });
      modified = true;
    }
  }
  
  if (modified) {
    console.log(`Fixed imports in: ${filePath}`);
    fs.writeFileSync(filePath, content);
  }
}

// Process .tsx and .ts files
const srcDir = path.join(__dirname, 'src');

// First create lowercase versions of all files
const tsxFileMap = createLowercaseVersions(srcDir, '.tsx');
const tsFileMap = createLowercaseVersions(srcDir, '.ts');

// Combine the maps
const fileMap = { ...tsxFileMap, ...tsFileMap };

// Now fix imports in router file specifically
console.log("Fixing imports in router file...");
fixImportsInFile(path.join(srcDir, 'router', 'index.tsx'), fileMap);

// Fix imports in all .tsx files
console.log("Fixing imports in all .tsx files...");
function processFilesForImportFixes(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processFilesForImportFixes(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      fixImportsInFile(fullPath, fileMap);
    }
  }
}

processFilesForImportFixes(srcDir);

// Add this function to specifically fix the ProfileEditForm.tsx file
function fixProfileEditFormImports() {
  const filePath = path.join(__dirname, 'src', 'components', 'input', 'forms', 'ProfileEditForm.tsx');
  if (fs.existsSync(filePath)) {
    console.log("Fixing imports in ProfileEditForm.tsx...");
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Layout import with lowercase
    content = content.replace(
      /import Layout from ['"]@\/components\/layout\/Layout['"]/g,
      "import Layout from '@/components/layout/layout'"
    );
    
    // Also replace any other uppercase imports
    content = content.replace(
      /import Layout from ['"]\.\.\/\.\.\/\.\.\/components\/layout\/Layout['"]/g,
      "import Layout from '../../../components/layout/layout'"
    );
    
    fs.writeFileSync(filePath, content);
    console.log("Fixed imports in ProfileEditForm.tsx");
  }
}

// Call this function after processing all files
fixProfileEditFormImports();

// Add this function to fix Layout imports in all files
function fixLayoutImportsInAllFiles() {
  console.log("Fixing Layout imports in all files...");
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Fix Layout imports
        if (content.includes('layout/Layout')) {
          content = content.replace(
            /from ['"](@\/components\/layout\/Layout|\.\.\/\.\.\/\.\.\/components\/layout\/Layout)['"]/g,
            (match) => match.replace('Layout', 'layout')
          );
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log(`Fixed Layout imports in: ${fullPath}`);
        }
      }
    }
  }
  
  processDirectory(path.join(__dirname, 'src'));
}

// Call this function after processing all files
fixLayoutImportsInAllFiles();

// Create a symlink for Layout.tsx
function createLayoutSymlink() {
  const layoutDir = path.join(__dirname, 'src', 'components', 'layout');
  const layoutFile = path.join(layoutDir, 'layout.tsx');
  const layoutUpperFile = path.join(layoutDir, 'Layout.tsx');
  
  if (fs.existsSync(layoutFile) && !fs.existsSync(layoutUpperFile)) {
    console.log("Creating symlink for Layout.tsx...");
    fs.copyFileSync(layoutFile, layoutUpperFile);
    console.log("Created symlink for Layout.tsx");
  }
}

// Call this function after processing all files
createLayoutSymlink();

console.log("Prebuild process completed successfully!");
```

### 2. Missing Dependencies

We added missing dependencies to the package.json file:

```diff
{
  "dependencies": {
    // existing dependencies...
+   "uuid": "^9.0.1",
  },
  "devDependencies": {
    // existing devDependencies...
+   "@types/uuid": "^9.0.8",
  }
}
```

### 3. Updated Build Process

We modified the build script in package.json to run the prebuild script before building:

```diff
"scripts": {
  "dev": "vite",
- "build": "tsc && vite build",
+ "prebuild": "node prebuild.mjs",
+ "build": "npm run prebuild && tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
},
```

### 4. Render Configuration for Frontend

In the Render dashboard:
1. Set the **Root Directory** to `client`
2. Set the **Build Command** to `npm install && npm run build`
3. Set the **Publish Directory** to `dist`

## Backend Fixes

### 1. Express Route Handlers

Fixed the route handlers in server/src/index.ts:

```diff
- app.post('/api/register', async (req, res) => {
+ router.post('/register', async (req, res) => {
  // handler code
});

- app.post('/api/login', async (req, res) => {
+ router.post('/login', async (req, res) => {
  // handler code
});

- app.get('/api/users/:id', async (req, res) => {
+ router.get('/users/:id', async (req, res) => {
  // handler code
});
```

### 2. Render Configuration for Backend

In the Render dashboard:
1. Set the **Root Directory** to `server`
2. Set the **Build Command** to `npm install && npm install --no-save @babel/cli @babel/core @babel/preset-env @babel/preset-typescript && npx prisma generate && npx prisma migrate deploy && npx babel src --out-dir dist --extensions ".ts" --presets=@babel/preset-typescript,@babel/preset-env`
3. Set the **Start Command** to `npm start`
4. Add environment variables:
   - `PORT`: 4100
   - `DATABASE_URL`: `postgresql://sponsator_vrttppd_db_user:ux5mWfjnPRGQi3C33MszjlmfaL0kP9MY@dpg-cvnl8d95pdvs73b9acag-a.virginia-postgres.render.com/sponsator_vrttppd_db`
   - `JWT_SECRET`: `2322`
   - `FRONTEND_URL`: `https://sponsator-vrttppd-render-v1-1.onrender.com`

### 3. Server-side TypeScript Compilation

For the server, we needed to compile TypeScript to JavaScript for production. We used Babel for this purpose:

```json
// server/package.json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "babel src --out-dir dist --extensions \".ts\" --presets=@babel/preset-typescript,@babel/preset-env"
  },
  "devDependencies": {
    "@babel/cli": "^7.23.4",
    "@babel/core": "^7.23.5",
    "@babel/preset-env": "^7.23.5",
    "@babel/preset-typescript": "^7.23.3",
    // other devDependencies...
  }
}
```

### 4. Prisma Database Setup

We included Prisma migration and generation steps in our build process:

```bash
npx prisma generate && npx prisma migrate deploy
```

This ensures that the database schema is properly set up and the Prisma client is generated before the application starts.

## Monorepo Configuration

For proper monorepo support, we followed Render's guidelines:

1. Set the root directory for each service
2. Used separate build commands for each service
3. Added build filters to only rebuild when relevant files change

## Lessons Learned

1. **Case Sensitivity Matters**: Windows is case-insensitive for filenames, but Linux (which Render uses) is case-sensitive.
2. **Prebuild Scripts**: Use prebuild scripts to handle environment-specific issues.
3. **Monorepo Configuration**: Follow Render's monorepo guidelines for proper deployment.
4. **Path Aliases**: Use path aliases (@/) consistently to avoid relative path issues.
5. **Barrel Files**: Create barrel files (index.ts) to export components with consistent naming.
6. **Environment Detection**: Properly detect and log the current environment.
7. **Detailed Logging**: Add comprehensive logging for easier debugging.
8. **Diagnostic Endpoints**: Create simple endpoints to verify connectivity.
9. **Static Asset Management**: Properly configure static asset paths.
10. **Error Handling**: Implement robust error handling with detailed error messages.

## Troubleshooting Common Issues

1. **White Screen**: Check for case sensitivity issues in imports.
2. **404 Not Found**: Verify API routes and CORS configuration.
3. **Build Failures**: Check for missing dependencies and build script configuration.
4. **API Connection Issues**: Ensure environment variables are correctly set.
5. **Authentication Failures**: Verify JWT secret and token handling.
6. **Missing Assets**: Check static asset paths and file existence.
7. **Database Errors**: Verify database connection string and permissions.

By implementing these fixes, we were able to successfully deploy both the frontend and backend services on Render.

## Environment Configuration

### 1. CORS Configuration

Ensure your server's CORS configuration accepts requests from both development and production environments:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL // Your Render frontend URL
    : ['http://localhost:5173', 'http://localhost:5373'], // Your local development frontend URLs
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

### 2. Environment Variables

Create environment-specific configuration files:

1. For development (`.env.development`):
```
VITE_API_URL=http://localhost:4100/api
```

2. For production (`.env.production`):
```
VITE_API_URL=https://sponsator-vrttppd-render-v1.onrender.com/api
```

In plain English: These files contain environment-specific settings:
- The development file tells the app to use your local server during development
- The production file tells the app to use your Render-hosted server in production
- The frontend automatically uses the right file based on whether you're building for development or production
- This means you don't have to change any code when deploying - just build with the right environment
- These environment variables are accessed through the config.ts file we saw earlier

### 3. Configuration Module

Create a configuration module to handle environment-specific settings:

```typescript
// client/src/config.ts
interface Config {
  apiUrl: string;
  // Add other environment-specific variables here
  isProduction: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
  isProduction: import.meta.env.PROD || false,
};

// Log the environment
console.log('Running in', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT', 'mode');
console.log('API URL:', config.apiUrl);

export default config;
```

### 4. API Client

Update your API client to use the environment-specific configuration:

```typescript
// client/src/api/api.ts
import axios from 'axios';
import config from '../config';

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Handle unauthorized errors (redirect to login)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Export API methods
export default {
  // Auth
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  // Users
  getUser: (id) => api.get(`/users/${id}`),
  // Add other API methods...
};
```

## Enhanced Logging and Diagnostics

### 1. Request Logging

Add detailed request logging to help diagnose issues:

```typescript
// Add logging middleware
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

### 2. Authentication Logging

Add detailed logging for authentication:

```typescript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password validation result:', isPasswordValid);
    
    // ... rest of the login logic
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    return res.status(500).json({ message: 'Server error' });
  }
});
```

### 3. JWT Authentication Middleware

Enhance the JWT authentication middleware with better logging:

```typescript
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth header:', authHeader);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
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

### 4. Diagnostic Endpoints

Add diagnostic endpoints to verify API connectivity and database connections:

```typescript
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

// Add a test route to verify API connectivity
app.get('/api/ping', (req, res) => {
  res.json({
    message: 'API is working',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});
```

In plain English: This code creates special testing endpoints to check if everything is working:
- The "/api/ping" endpoint lets you verify the server is running and responding
- It tells you which environment it's running in and the current time
- The "/api/db-check" endpoint tests if the database connection is working
- It tries to count the users in the database and returns the result
- If there's a problem connecting to the database, it returns an error message
- These endpoints are extremely helpful for troubleshooting deployment issues

## Static Assets Configuration

Ensure static assets are properly served:

```typescript
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// For specific subdirectories
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));
app.use('/uploads/projects', express.static(path.join(__dirname, '../uploads/projects')));
app.use('/uploads/articles', express.static(path.join(__dirname, '../uploads/articles')));
app.use('/uploads/posts', express.static(path.join(__dirname, '../uploads/posts')));

// Serve static assets like SVGs
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
```

## File Upload Configuration

### Option 1: Using Render Disk Storage

For persistent file storage on Render, create a disk:

1. Go to your backend service in the Render dashboard
2. Navigate to "Disks" in the left sidebar
3. Click "Create Disk"
4. Configure the disk:
    - Name: `uploads-disk`
    - Mount Path: `/opt/render/project/src/server/uploads`
    - Size: Choose an appropriate size (e.g., 1 GB)
5. Click "Create"

Then update your server code to use this path:

```typescript
// Update the uploads directory path
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/server/uploads'
  : path.join(__dirname, '../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories if they don't exist
const subdirs = ['profiles', 'projects', 'articles', 'posts'];
for (const subdir of subdirs) {
  const subdirPath = path.join(uploadsDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
}

// Update static file serving
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads/profiles', express.static(path.join(uploadsDir, 'profiles')));
app.use('/uploads/projects', express.static(path.join(uploadsDir, 'projects')));
app.use('/uploads/articles', express.static(path.join(uploadsDir, 'articles')));
app.use('/uploads/posts', express.static(path.join(uploadsDir, 'posts')));
```

In plain English: This creates persistent storage for uploaded files:
- Render Disk is like an external hard drive for your application
- Without it, any uploaded files would be lost when your service restarts
- The mount path tells Render where to make this storage available to your app
- This path matches what we configured in the upload middleware
- The size limit prevents runaway storage usage (you can increase it later if needed)

### Option 2: Using Cloud Storage (Recommended)

For a more scalable solution, use a cloud storage service like Cloudinary:

1. Install the necessary packages:

```bash
npm install cloudinary multer-storage-cloudinary
```

2. Configure the upload middleware:

```typescript
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary (only in production)
if (process.env.NODE_ENV === 'production') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Create storage engine based on environment
const storage = process.env.NODE_ENV === 'production'
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'sponsator',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1200, crop: 'limit' }]
      }
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // Local storage logic
        let uploadPath = path.join(__dirname, '../../uploads');
        
        // Determine subdirectory based on route
        if (req.originalUrl.includes('/profiles')) {
          uploadPath = path.join(uploadPath, 'profiles');
        } else if (req.originalUrl.includes('/projects')) {
          uploadPath = path.join(uploadPath, 'projects');
        } else if (req.originalUrl.includes('/articles')) {
          uploadPath = path.join(uploadPath, 'articles');
        } else if (req.originalUrl.includes('/posts')) {
          uploadPath = path.join(uploadPath, 'posts');
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

export const upload = multer({ storage });
```

3. Add the necessary environment variables to Render:
    - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
    - `CLOUDINARY_API_KEY`: Your Cloudinary API key
    - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

This approach ensures that your file uploads work in both development (storing files locally) and production (storing files in the cloud).

## Troubleshooting Common Issues

### 1. Missing SVG Files

If you see 404 errors for SVG files, ensure the files exist in the correct directory:

```bash
# Create the public/assets directory on the server
mkdir -p server/public/assets

# Add SVG files to this directory
# Example: copy SVG files from your local project
cp -r client/src/assets/*.svg server/public/assets/
```

### 2. Database Connection Issues

If you're experiencing database connection issues:

1. Verify the `DATABASE_URL` environment variable is correctly set in Render
2. Check that the database user has the correct permissions
3. Ensure the database is accessible from Render's IP addresses
4. Use the `/api/db-check` endpoint to verify connectivity

### 3. Authentication Issues

If users can't log in:

1. Verify the `JWT_SECRET` is set to `2322` in both environments
2. Check the logs for login attempts and password validation results
3. Ensure the CORS configuration allows credentials
4. Verify the token is being properly stored and sent with requests

By implementing these fixes, we were able to successfully deploy both the frontend and backend services on Render. 