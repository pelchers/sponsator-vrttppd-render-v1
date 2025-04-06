# Authentication Behavior Explained

This document explains the authentication behavior in our application, particularly why users can view certain pages after logging out but still get redirected for authenticated actions.

## Overview

Our application uses a combination of:
- **Client-side routing** (React Router)
- **Token-based authentication** (JWT)
- **Public and protected routes**
- **Conditional UI rendering**

This creates a user experience where:
1. Users can browse public content without authentication
2. Authenticated actions require login
3. Users aren't abruptly redirected when their session expires

## Authentication Flow

### 1. Login Process

When a user logs in:
```javascript
// client/src/pages/auth/login.tsx
const handleLogin = async (credentials) => {
  try {
    const response = await api.login(credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage or cookies
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    
    // Update auth context
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    // Redirect to dashboard or previous page
    navigate(from || '/');
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### 2. Token Management

The token is:
- Stored in localStorage or cookies
- Added to API requests via an interceptor
- Verified on the server for protected endpoints

```javascript
// client/src/api/api.ts
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
```

### 3. Logout Process

When a user logs out:
```javascript
// client/src/components/header/header.tsx
const handleLogout = () => {
  // Remove token from storage
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  
  // Update auth context
  setCurrentUser(null);
  setIsAuthenticated(false);
  
  // Optionally redirect to home
  navigate('/');
};
```

## Why Users Can Still Access Some Pages After Logout

### 1. Client-Side Routing

React Router handles navigation without full page reloads. When a user logs out:
- The current route/URL doesn't change automatically
- The router doesn't check authentication for initial page loads
- Components remain mounted with their current state

### 2. Public vs. Protected Routes

Our application has different types of routes:

```javascript
// client/src/router/index.tsx
const router = createBrowserRouter([
  // Public routes - accessible to everyone
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  
  // Semi-public routes - public data with authenticated actions
  { path: '/users/:id', element: <Profile /> },
  { path: '/projects/:id', element: <ProjectDetails /> },
  
  // Protected routes - require authentication
  { 
    path: '/users/:id/edit', 
    element: <ProtectedRoute><ProfileEdit /></ProtectedRoute> 
  },
  { 
    path: '/settings', 
    element: <ProtectedRoute><Settings /></ProtectedRoute> 
  }
]);
```

The `ProtectedRoute` component redirects unauthenticated users:

```javascript
// client/src/components/protected-route/protected-route.tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  return children;
};
```

## Authentication Implementation Methods

Our application uses three main methods to protect content and functionality based on authentication status:

### 1. Protected Route Component (Wrapper Method)

The `ProtectedRoute` component is a wrapper that protects entire pages or routes:

```jsx
// Usage in router configuration
{
  path: '/settings',
  element: <ProtectedRoute><Settings /></ProtectedRoute>
}
```

How it works:
- The `children` prop represents the component(s) that should only be rendered if the user is authenticated
- If authenticated, the entire child component tree is rendered (`return children`)
- If not authenticated, the user is redirected to the login page
- This approach is best for routes that should be completely inaccessible to unauthenticated users

**Important**: The `ProtectedRoute` component is only used in the router configuration, not inside page components or other UI elements. It wraps entire page components to protect access to those pages.

Implementation example:

```jsx
// client/src/components/protected-route/protected-route.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';

// This component wraps other components that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login, but remember where they were trying to go
    // The "state" prop passes data to the login page
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // If authenticated, render the children components
  // "children" is whatever was wrapped by ProtectedRoute
  return children;
};

export default ProtectedRoute;
```

### 2. Conditional Rendering (Component-Level Method)

This approach conditionally renders UI elements based on authentication status:

```jsx
// client/src/components/profile/profile-actions.tsx
const ProfileActions = ({ userId }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const isOwner = isAuthenticated && currentUser?.id === userId;
  
  return (
    <div className="profile-actions">
      {isOwner ? (
        <button onClick={() => navigate(`/users/${userId}/edit`)}>
          Edit Profile
        </button>
      ) : isAuthenticated ? (
        <>
          <FollowButton userId={userId} />
          <LikeButton entityType="user" entityId={userId} />
        </>
      ) : (
        <button onClick={() => navigate('/login')}>
          Login to interact
        </button>
      )}
    </div>
  );
};
```

How it works:
- Uses the authentication context directly within the component
- Renders different UI based on authentication status and user identity
- Combines authentication checks with ownership checks for fine-grained control
- Best for pages that have both public and protected elements

**Important**: This is the method you'll use most frequently inside your page components. You access the authentication state using the `useAuth` hook and then conditionally render different UI elements based on that state.

```jsx
// Example usage inside a page component
const ProjectPage = () => {
  // Get authentication state from the auth context
  const { isAuthenticated, currentUser } = useAuth();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  
  // Determine if the current user is the owner
  const isOwner = isAuthenticated && project && currentUser?.id === project.userId;
  
  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      const response = await api.getProject(id);
      setProject(response.data);
    };
    
    fetchProject();
  }, [id]);
  
  return (
    <div className="project-page">
      {/* Public content - visible to everyone */}
      <h1>{project?.title}</h1>
      <p>{project?.description}</p>
      
      {/* Conditional rendering based on authentication */}
      {isAuthenticated ? (
        <div className="authenticated-actions">
          <LikeButton projectId={id} />
          <CommentForm projectId={id} />
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to interact with this project</p>
          <button onClick={() => navigate('/login')}>Log In</button>
        </div>
      )}
      
      {/* Owner-only actions */}
      {isOwner && (
        <div className="owner-actions">
          <button onClick={() => navigate(`/projects/${id}/edit`)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};
```

Additional implementation example:

```jsx
// client/src/pages/project/project-details.tsx
import { useAuth } from '../../contexts/auth-context';

const ProjectDetails = ({ project }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const isOwner = isAuthenticated && currentUser?.id === project.userId;
  
  // This function is only called if the user is authenticated and is the owner
  const handleDelete = async () => {
    if (!isAuthenticated || !isOwner) return;
    // Delete project logic
  };
  
  return (
    <div className="project-details">
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      
      {/* Public content - visible to everyone */}
      <div className="project-content">
        {project.content}
      </div>
      
      {/* Authenticated actions - visible only to authenticated users */}
      {isAuthenticated && (
        <div className="project-interactions">
          <button onClick={() => handleLike(project.id)}>
            {isLiked ? 'Unlike' : 'Like'}
          </button>
          <button onClick={() => handleWatch(project.id)}>
            {isWatched ? 'Unwatch' : 'Watch'}
          </button>
        </div>
      )}
      
      {/* Owner-only actions - visible only to the project owner */}
      {isOwner && (
        <div className="owner-actions">
          <button onClick={() => navigate(`/projects/${project.id}/edit`)}>
            Edit Project
          </button>
          <button onClick={handleDelete} className="danger">
            Delete Project
          </button>
        </div>
      )}
      
      {/* Call-to-action for unauthenticated users */}
      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>Log in to interact with this project</p>
          <button onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      )}
    </div>
  );
};
```

### 3. Server-Side Authentication (API-Level Method)

On the server, authentication is enforced using middleware:

```javascript
// server/src/middleware/auth.ts
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

Protected endpoints use this middleware:

```javascript
// server/src/routes/userRoutes.ts
router.get('/:id', getUserById); // Public endpoint
router.put('/:id', authenticate, updateUser); // Protected endpoint
```

How it works:
- The `authenticate` middleware extracts and verifies the JWT token from the request headers
- If valid, it adds the decoded user information to the request object and allows the request to proceed
- If invalid or missing, it returns a 401 Unauthorized response
- This approach ensures that protected API endpoints cannot be accessed without proper authentication

Additional implementation example with ownership check:

```javascript
// server/src/middleware/ownership.ts
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      // The authenticate middleware should run before this one
      // to ensure req.user exists
      const userId = req.user.id;
      const resourceId = req.params.id;
      
      let isOwner = false;
      
      // Check ownership based on resource type
      switch (resourceType) {
        case 'project':
          const project = await prisma.projects.findUnique({
            where: { id: resourceId }
          });
          isOwner = project && project.user_id === userId;
          break;
          
        case 'post':
          const post = await prisma.posts.findUnique({
            where: { id: resourceId }
          });
          isOwner = post && post.user_id === userId;
          break;
          
        // Add other resource types as needed
      }
      
      if (!isOwner) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// Usage in routes:
// server/src/routes/projectRoutes.ts
router.put('/:id', authenticate, checkOwnership('project'), updateProject);
router.delete('/:id', authenticate, checkOwnership('project'), deleteProject);
```

## Combining Authentication Methods

For the most robust protection, we combine these methods:

1. **Server-side middleware** protects API endpoints
2. **Protected Route components** prevent access to sensitive pages
3. **Conditional rendering** adapts the UI based on authentication status

This multi-layered approach ensures that:

- Unauthenticated users can't access protected API endpoints (server-side security)
- Unauthenticated users are redirected from protected pages (route-level security)
- UI elements adapt based on authentication status (component-level security)

## Practical Implementation Guide

Here's a step-by-step guide to implementing authentication in your components:

### Step 1: Set Up the Auth Context and Hook

```jsx
// src/contexts/auth-context.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    return user;
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

### Step 2: Create the Protected Route Component

```jsx
// src/components/protected-route.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
```

### Step 3: Set Up Router with Protected Routes

```jsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/protected-route';

// Pages
import Home from '../pages/home';
import Login from '../pages/auth/login';
import Signup from '../pages/auth/signup';
import Profile from '../pages/profile';
import ProfileEdit from '../pages/profile/edit';
import Dashboard from '../pages/dashboard';

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/profile/:id', element: <Profile /> },
  
  // Protected routes
  { 
    path: '/profile/:id/edit', 
    element: <ProtectedRoute><ProfileEdit /></ProtectedRoute> 
  },
  { 
    path: '/dashboard', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute> 
  }
]);

export default router;
```

### Step 4: Use Authentication in Components

```jsx
// src/pages/profile.tsx
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const Profile = () => {
  const { id } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Check if the current user is the profile owner
  const isOwner = isAuthenticated && currentUser?.id === id;
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.get(`/users/${id}`);
      setProfile(response.data);
    };
    
    fetchProfile();
  }, [id]);
  
  if (!profile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="profile-page">
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      
      {/* Owner-only actions */}
      {isOwner && (
        <div className="owner-actions">
          <button onClick={() => navigate(`/profile/${id}/edit`)}>
            Edit Profile
          </button>
        </div>
      )}
      
      {/* Authenticated-only actions */}
      {isAuthenticated && !isOwner && (
        <div className="user-actions">
          <FollowButton userId={id} />
          <MessageButton userId={id} />
        </div>
      )}
      
      {/* Unauthenticated user prompt */}
      {!isAuthenticated && (
        <div className="auth-prompt">
          <p>Log in to interact with this user</p>
          <button onClick={() => navigate('/login')}>Log In</button>
        </div>
      )}
    </div>
  );
};
```

### Step 5: Handle Authentication in API Calls

```jsx
// src/api/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Auto-logout on 401 responses
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

Example of all three working together:

```jsx
// 1. Protected Route (route-level)
const router = createBrowserRouter([
  {
    path: '/projects/:id/edit',
    element: <ProtectedRoute><ProjectEdit /></ProtectedRoute>
  }
]);

// 2. Component with conditional rendering (component-level)
const ProjectEdit = () => {
  const { id } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    // Fetch project data
    const fetchProject = async () => {
      try {
        const response = await api.getProject(id);
        setProject(response.data);
        
        // Check ownership
        if (isAuthenticated && currentUser?.id === response.data.user_id) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    
    fetchProject();
  }, [id, isAuthenticated, currentUser]);
  
  const handleSubmit = async (formData) => {
    try {
      // 3. API call that uses server-side authentication (API-level)
      await api.updateProject(id, formData);
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };
  
  // Additional ownership check at component level
  if (project && !isOwner) {
    return <Navigate to={`/projects/${id}`} />;
  }
  
  return (
    <div className="project-edit">
      <h1>Edit Project</h1>
      {project ? (
        <ProjectForm 
          initialValues={project}
          onSubmit={handleSubmit}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
```

In this example:
1. The `ProtectedRoute` component prevents unauthenticated users from accessing the edit page
2. The component itself checks ownership and redirects non-owners
3. The API call to update the project is protected by server-side authentication middleware

This comprehensive approach ensures that authentication and authorization are enforced at every level of the application.

## Benefits of This Approach

This authentication approach provides several benefits:

1. **Progressive disclosure**: Users can see public content without being forced to log in
2. **Seamless experience**: Users aren't abruptly redirected when their session expires
3. **Clear boundaries**: Authentication is enforced at the action level, not just the page level
4. **Reduced friction**: Users can browse freely and only need to authenticate for specific actions
5. **Security**: Sensitive operations still require proper authentication

## Common Scenarios

### Scenario 1: Viewing a Profile After Logout

1. User logs out → Auth token is removed
2. User stays on or navigates to a profile page
3. The page loads and makes API calls:
   - Public data calls succeed (basic profile info)
   - Authenticated calls fail (watch/like/follow status) → 401 errors
4. UI adapts to show only public information and login prompts for actions

### Scenario 2: Attempting to Edit After Logout

1. User logs out → Auth token is removed
2. User clicks "Edit Profile" button
3. The protected route component checks authentication
4. Finding no valid token, it redirects to the login page
5. After login, the user is redirected back to the edit page

## Troubleshooting

If you're experiencing authentication issues:

1. **Check token storage**: Ensure tokens are being properly stored and removed
2. **Verify token expiration**: JWTs have an expiration time that might cause unexpected logouts
3. **Inspect API requests**: Look for 401 errors in the network tab
4. **Check protected routes**: Ensure they're properly checking authentication
5. **Review server middleware**: Confirm it's correctly validating tokens

## Conclusion

The authentication behavior in our application is designed to balance security with user experience. By allowing access to public content while protecting sensitive actions, we create a seamless experience that respects authentication boundaries without unnecessary friction. 