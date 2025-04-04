# Render Setup Guide: Fixes for Case Sensitivity and Build Issues

This guide documents the fixes implemented to resolve deployment issues on Render for both the frontend and backend services.

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

## Troubleshooting Common Issues

1. **White Screen**: Check for case sensitivity issues in imports.
2. **404 Not Found**: Verify API routes and CORS configuration.
3. **Build Failures**: Check for missing dependencies and build script configuration.
4. **API Connection Issues**: Ensure environment variables are correctly set.

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

### 3. Configuration Module

Create a configuration module to handle environment-specific settings:

```typescript
// client/src/config.ts
interface Config {
  apiUrl: string;
  // Add other environment-specific variables here
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4100/api',
};

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