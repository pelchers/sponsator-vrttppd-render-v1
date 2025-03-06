# Adapting shadcn Components: Full Setup for a User Profile Edit Page

## Document Organization
1. Overview & Prerequisites - Environment setup and required dependencies
2. Creating/Importing v0 Form Components - Adapting shadcn components for Vite + React
3. Creating the Profile Edit Page - Building the profile edit UI
4. Implementing the Form State Management - Custom hooks for form handling
5. Creating API Services - Frontend API functions for CRUD operations
6. Backend Implementation - Controllers, services, models, and routes
7. Wiring Up & Testing - End-to-end functionality testing
8. Visual Testing & Adjustments - UI refinements and validation

## User Action Flow: Updating a User Profile
When a user edits and saves their profile, here's the complete file flow:

1. User interacts with **`ProfileEditForm.tsx`** (UI component with form fields)
2. Form uses **`useProfileForm.ts`** (Custom hook for state and validation)
3. On submit, hook calls **`api/users.ts`** (API service with user CRUD functions)
4. API service sends HTTP requests to backend endpoints
5. Request hits **`server/src/routes/userRoutes.ts`** (API route definitions)
6. Router calls **`server/src/controllers/userController.ts`** (Request/response handler)
7. Controller validates request and calls **`server/src/services/userService.ts`** (Business logic)
8. Service processes data and uses **Prisma client** to interact with the database
9. Response flows back through the same layers:
   - **Database → Service**: Prisma returns updated user data to `userService.ts`
   - **Service → Controller**: `userService.ts` formats and returns data to `userController.ts`
   - **Controller → Route**: `userController.ts` constructs HTTP response and sends to client
   - **Backend → Frontend**: Response data arrives at the `api/users.ts` function
   - **API → Hook**: `api/users.ts` resolves the Promise with the response data to `useProfileForm.ts`
10. UI updates based on the response (success/error states)

This architecture ensures separation of concerns, maintainability, and scalability of your application.

## 1. Overview & Prerequisites

- **Monorepo**: You have a `client/` folder for your Vite + React frontend and a `server/` folder for your Express + Prisma (or Sequelize) backend.
- **Dependencies**:  
  ```bash
  cd client
  npm install @radix-ui/react-slot @radix-ui/react-label tailwind-merge class-variance-authority react-router-dom
  ```
- **Existing v0 Components**: You have a form component (e.g., `form.tsx`) and a page component (e.g., `ProfileEdit.tsx`) **already built** from your old Next.js project. We'll adapt them to match **your** Prisma schema fields.

***---ADDED---***
- **Current Status Assessment**:
  - ✅ Profile Edit Page (`editprofile.tsx`)
  - ✅ Profile Display Page (`profile.tsx`)
  - ✅ Profile Edit Form (`ProfileEditForm.tsx`)
  - ⬜ API Service Functions (`api/users.ts`)
  - ⬜ Custom Hooks (`hooks/useProfileForm.ts`)
  - ⬜ Router Configuration (`router/index.tsx`)
  - ⬜ Missing shadcn components (button, form, input, etc.)

  **Backend Components**:
  - ✅ Prisma Schema (`schema.prisma`)
  - ✅ Prisma Client (`lib/prisma.ts`)
  - ⬜ User Controller (`controllers/userController.ts`)
  - ⬜ User Service (`services/userService.ts`)
  - ⬜ User Routes (`routes/userRoutes.ts`)
  - ⬜ Authentication Middleware (`middlewares/auth.ts`) - if needed
  - ⬜ Express App Configuration (`index.ts`)

  **Additional Requirements**:
  - ⬜ Install necessary dependencies (`axios`, `react-router-dom`, `multer`, etc.)
  - ⬜ Set up environment variables (API URL, JWT secret, etc.)
  - ⬜ Configure CORS on the backend
  - ⬜ Set up error handling and validation
  - ⬜ Create uploads directory for profile images
***-------------***

## 2. Installing Missing shadcn Components

First, let's install the missing shadcn components that your forms might be using:

```bash
cd client

# Install shadcn CLI if not already installed
npm install -D @shadcn/ui

# Install core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card

# Install additional components that might be needed for the profile form
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
```

## 3. Creating the Frontend API Service

Create a file at `client/src/api/users.ts`:

```typescript
// client/src/api/users.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Fetch user profile
export async function fetchUserProfile(userId: string) {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, userData: any) {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using token auth
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_URL}/users/${userId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}
```

## 4. Creating Custom Hooks for Form Handling

***---ADDED---***
Create a file at `client/src/hooks/useProfileForm.ts`:

```typescript
// client/src/hooks/useProfileForm.ts
import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '@/api/users';

export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState({
    // Basic Information
    profile_image: null as File | null,
    username: "",
    email: "",
    bio: "",
    user_type: "",
    // ... other fields from your form
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await fetchUserProfile(userId);
        
        // Map API response to form fields
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          user_type: userData.user_type || '',
          // ... map all other fields
        });
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateUserProfile(userId, formData);
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleSubmit
  };
}
```
***-------------***

## 5. Updating the Profile Edit Form

Update your ProfileEditForm component to use the API service:

```typescript
// client/src/components/input/forms/ProfileEditForm.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileForm } from '@/hooks/useProfileForm';

// ... existing imports

export default function ProfileEditForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleSubmit
  } = useProfileForm(id);

  // Handle success - redirect to profile page
  useEffect(() => {
    if (success && id) {
      navigate(`/profile/${id}`);
    }
  }, [success, id, navigate]);

  if (loading) return <div className="text-center py-8">Loading profile data...</div>;

  // ... rest of the component with your existing form UI
  // Just replace the form handlers with the ones from the hook
}
```

## 6. Setting Up React Router

Create or update your router configuration:

```typescript
// client/src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import ProfilePage from '../pages/profile/profile';
import ProfileEditPage from '../pages/profile/editprofile';
import Layout from '../components/layout/layout'; // If you have a layout component

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // ... other routes
      {
        path: "profile/:id",
        element: <ProfilePage />,
      },
      {
        path: "profile/:id/edit",
        element: <ProfileEditPage />,
      },
    ]
  }
]);
```

## 7. Implementing the Backend Logic

### 7.1 Controller

```typescript
// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    // Validate input
    if (Object.keys(userData).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    // Check if the user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user
    const updatedUser = await userService.updateUser(id, userData);
    
    // Return the updated user
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
}

export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Check if the user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Upload the image and update the user
    const imageUrl = await userService.uploadProfileImage(id, file);
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image' });
  }
}
```

### 7.2 Service

```typescript
// server/src/services/userService.ts
import prisma from '../lib/prisma';

export async function getUserById(id: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        user_work_experience: true,
        user_education: true,
        user_certifications: true,
        user_accolades: true,
        user_endorsements: true,
        user_featured_projects: true,
        user_case_studies: true
      }
    });
    
    if (!user) return null;
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: any) {
  try {
    // Extract related data from the main update
    const {
      user_work_experience,
      user_education,
      user_certifications,
      user_accolades,
      user_endorsements,
      user_featured_projects,
      user_case_studies,
      password_hash,
      created_at,
      ...updateData
    } = data;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    // Start a transaction to update the user and related data
    const result = await prisma.$transaction(async (tx) => {
      // Update the main user record
      const updatedUser = await tx.users.update({
        where: { id },
        data: updateData,
        include: {
          user_work_experience: true,
          user_education: true,
          user_certifications: true,
          user_accolades: true,
          user_endorsements: true,
          user_featured_projects: true,
          user_case_studies: true
        }
      });
      
      // Update related records if provided
      // This is a simplified example - you would need to handle creates, updates, and deletes
      
      return updatedUser;
    });
    
    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = result;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

export async function uploadProfileImage(id: string, file: Express.Multer.File) {
  // This would typically involve:
  // 1. Uploading the file to a storage service (S3, etc.)
  // 2. Getting the URL of the uploaded file
  // 3. Updating the user's profile_image field with the URL
  
  // For this example, we'll assume the file is saved locally and we just store the path
  const imagePath = `/uploads/${file.filename}`;
  
  await prisma.users.update({
    where: { id },
    data: {
      profile_image: imagePath
    }
  });
  
  return imagePath;
}
```

### Step 8: Create Backend Routes

```typescript
// server/src/routes/userRoutes.ts
import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth'; // If using authentication

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Get user by ID
router.get('/:id', userController.getUserById);

// Update user (protected route if using auth)
router.put('/:id', authenticate, userController.updateUser);

// Upload profile image
router.post('/:id/image', authenticate, upload.single('image'), userController.uploadProfileImage);

export default router;
```

### Step 9: Register Routes in Express App

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 7.4 Authentication Middleware (if needed)

```typescript
// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
```

## 8. Updating the Profile Page

Update your Profile Page to fetch user data and add an edit button:

```typescript
// client/src/pages/profile/profile.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchUserProfile } from '@/api/users';

// ... existing imports

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      
      try {
        setLoading(true);
        const userData = await fetchUserProfile(id);
        setUser(userData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

  // Add an Edit button to navigate to the edit page
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your existing profile display code */}
      
      {/* Add Edit button */}
      <div className="mt-8 flex justify-end">
        <Link 
          to={`/profile/${id}/edit`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}
```

## 9. Wiring Up & Testing the Final Flow

1. **Start** the backend:  
   ```bash
   cd server
   npm run dev
   ```
   (Or however you start your Express/Node server.)
2. **Start** the frontend:  
   ```bash
   cd client
   npm run dev
   ```
3. **Navigate** to `http://localhost:5173/profile/:id` (assuming 5173 is your Vite dev port).
4. **View** your profile and click the **Edit** button.
5. **Fill out** the form fields and click **Save**.
6. **Check** the server logs. The request should arrive at `PUT /api/users/:id`, go through the controller → service → model, then update the DB with Prisma.
7. **Verify** the updated data in your DB (e.g., using Prisma Studio or a DB tool).
8. **Front End** should redirect back to the profile page showing the updated information.

***---ADDED---***
## 10. Implementation Checklist

Before you begin implementing, make sure you have:

1. **Frontend Components**:
   - ✅ Profile Edit Page (`editprofile.tsx`)
   - ✅ Profile Display Page (`profile.tsx`)
   - ✅ Profile Edit Form (`ProfileEditForm.tsx`)
   - ⬜ API Service Functions (`api/users.ts`)
   - ⬜ Custom Hooks (`hooks/useProfileForm.ts`)
   - ⬜ Router Configuration (`router/index.tsx`)
   - ⬜ Missing shadcn components (button, form, input, etc.)

2. **Backend Components**:
   - ✅ Prisma Schema (`schema.prisma`)
   - ✅ Prisma Client (`lib/prisma.ts`)
   - ⬜ User Controller (`controllers/userController.ts`)
   - ⬜ User Service (`services/userService.ts`)
   - ⬜ User Routes (`routes/userRoutes.ts`)
   - ⬜ Authentication Middleware (`middlewares/auth.ts`) - if needed
   - ⬜ Express App Configuration (`index.ts`)

3. **Additional Requirements**:
   - ⬜ Install necessary dependencies (`axios`, `react-router-dom`, `multer`, etc.)
   - ⬜ Set up environment variables (API URL, JWT secret, etc.)
   - ⬜ Configure CORS on the backend
   - ⬜ Set up error handling and validation
   - ⬜ Create uploads directory for profile images

## 11. Implementation Steps

1. Start by installing missing shadcn components
2. Create the frontend API service and custom hooks
3. Update the ProfileEditForm to use these hooks
4. Set up the router configuration
5. Implement the backend components (controller, service, routes)
6. Test the full flow

## 12. File Flow Architecture Overview

The implementation follows the File Flow architecture:

1. **Frontend (client/)**:
   - **Pages**: Container components that render UI and manage state
   - **Components**: Reusable UI elements (including shadcn components)
   - **API Services**: Functions that communicate with the backend
   - **Hooks**: Custom hooks for state management and logic reuse

2. **Backend (server/)**:
   - **Controllers**: Handle HTTP requests and responses
   - **Services**: Contain business logic
   - **Models**: Handle database operations
   - **Routes**: Define API endpoints
   - **Middlewares**: Handle cross-cutting concerns like authentication

3. **Data Flow**:
   - User interacts with a form in the UI
   - Form submission triggers an API call
   - Backend controller receives the request
   - Controller calls a service
   - Service performs business logic
   - Service calls a model to interact with the database
   - Response flows back through the same layers
   - UI updates based on the response

This architecture ensures separation of concerns, maintainability, and scalability of your application.
***-------------*** 