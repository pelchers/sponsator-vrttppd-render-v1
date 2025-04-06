# Authentication Implementation: Practical Guide

This guide provides practical examples for implementing authentication in your React application, with a focus on redirecting unauthenticated users from specific pages.

## Quick Reference

### 1. Protecting Routes in Router Configuration

```jsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/protected-route';

const router = createBrowserRouter([
  // Public routes - anyone can access
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  
  // Protected routes - require authentication
  { 
    path: '/profile/:id', 
    element: <ProtectedRoute><Profile /></ProtectedRoute> 
  },
  { 
    path: '/dashboard', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute> 
  }
]);
```

### 2. Implementing the ProtectedRoute Component

```jsx
// src/components/protected-route.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    // Save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  return children;
};

export default ProtectedRoute;
```

### 3. Redirecting from Profile Pages

If you want to redirect unauthenticated users from profile pages (instead of showing limited content), simply wrap the Profile component with ProtectedRoute in your router:

```jsx
// Change this:
{ path: '/profile/:id', element: <Profile /> }

// To this:
{ path: '/profile/:id', element: <ProtectedRoute><Profile /></ProtectedRoute> }
```

## Detailed Implementation

### Step 1: Set Up Authentication Context

```jsx
// src/contexts/auth-context.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    return user;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

### Step 2: Create Different Types of Protected Routes

You might want different levels of protection for different routes. Here are three variations:

#### Basic Protected Route (Redirects to Login)

```jsx
// src/components/protected-route.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  return children;
};
```

#### Owner-Only Route (Redirects Non-Owners)

```jsx
// src/components/owner-route.tsx
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useEffect, useState } from 'react';
import api from '../api/api';

export const OwnerRoute = ({ children, resourceType }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const [isOwner, setIsOwner] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  
  useEffect(() => {
    const checkOwnership = async () => {
      if (!isAuthenticated || !id) {
        setCheckingOwnership(false);
        return;
      }
      
      try {
        let resource;
        
        switch (resourceType) {
          case 'profile':
            // For profiles, just check if the ID matches the current user
            setIsOwner(currentUser.id === id);
            break;
            
          case 'project':
            resource = await api.get(`/projects/${id}`);
            setIsOwner(resource.data.user_id === currentUser.id);
            break;
            
          case 'post':
            resource = await api.get(`/posts/${id}`);
            setIsOwner(resource.data.user_id === currentUser.id);
            break;
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
      
      setCheckingOwnership(false);
    };
    
    checkOwnership();
  }, [isAuthenticated, currentUser, id, resourceType]);
  
  if (loading || checkingOwnership) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  if (!isOwner) {
    // Redirect to view-only page if not the owner
    return <Navigate to={`/${resourceType}s/${id}`} />;
  }
  
  return children;
};
```

#### Role-Based Route (Requires Specific Role)

```jsx
// src/components/admin-route.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  if (currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

### Step 3: Configure Router with Protected Routes

```jsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/protected-route';
import { OwnerRoute } from '../components/owner-route';
import { AdminRoute } from '../components/admin-route';

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  
  // Protected routes (require authentication)
  { 
    path: '/profile/:id', 
    element: <ProtectedRoute><Profile /></ProtectedRoute> 
  },
  { 
    path: '/dashboard', 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute> 
  },
  
  // Owner-only routes
  { 
    path: '/profile/:id/edit', 
    element: <OwnerRoute resourceType="profile"><ProfileEdit /></OwnerRoute> 
  },
  { 
    path: '/projects/:id/edit', 
    element: <OwnerRoute resourceType="project"><ProjectEdit /></OwnerRoute> 
  },
  
  // Admin-only routes
  { 
    path: '/admin', 
    element: <AdminRoute><AdminDashboard /></AdminRoute> 
  }
]);

export default router;
```

### Step 4: Implement Login with Redirect

```jsx
// src/pages/login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page the user was trying to access
  const from = location.state?.from || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login({ email, password });
      
      // Redirect to the page they were trying to access
      navigate(from, { replace: true });
    } catch (error) {
      setError('Invalid email or password');
    }
  };
  
  return (
    <div className="login-page">
      <h1>Login</h1>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit">Login</button>
      </form>
      
      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
```

## Practical Examples

### Example 1: Making Profile Pages Require Authentication

If you want to make profile pages completely private (requiring login to view):

```jsx
// In your router configuration
{
  path: '/profile/:id',
  element: <ProtectedRoute><Profile /></ProtectedRoute>
}
```

This will redirect unauthenticated users to the login page when they try to access any profile.

### Example 2: Conditional Content in Profile Pages

If you want to show limited content to unauthenticated users:

```jsx
// src/pages/profile.tsx
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const Profile = () => {
  const { id } = useParams();
  const { isAuthenticated, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  if (!profile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="profile-page">
      {/* Basic info - visible to everyone */}
      <h1>{profile.username}</h1>
      <p>{profile.bio}</p>
      
      {isAuthenticated ? (
        // Full profile content for authenticated users
        <>
          <div className="profile-details">
            <h2>Contact Information</h2>
            <p>Email: {profile.email}</p>
            <p>Phone: {profile.phone}</p>
          </div>
          
          <div className="profile-actions">
            {currentUser?.id === profile.id ? (
              <button onClick={() => navigate(`/profile/${id}/edit`)}>
                Edit Profile
              </button>
            ) : (
              <>
                <FollowButton userId={id} />
                <MessageButton userId={id} />
              </>
            )}
          </div>
        </>
      ) : (
        // Limited view with login prompt for unauthenticated users
        <div className="auth-prompt">
          <p>Log in to view full profile details and interact with this user</p>
          <button onClick={() => navigate('/login', { 
            state: { from: `/profile/${id}` } 
          })}>
            Log In
          </button>
        </div>
      )}
    </div>
  );
};
```

### Example 3: Hybrid Approach with Automatic Redirect

If you want to automatically redirect unauthenticated users after a certain time:

```jsx
// src/pages/profile.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const Profile = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [redirectTimer, setRedirectTimer] = useState(null);
  
  // Set up redirect timer for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login after 5 seconds
      const timer = setTimeout(() => {
        navigate('/login', { state: { from: `/profile/${id}` } });
      }, 5000);
      
      setRedirectTimer(timer);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, id, navigate]);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [id]);
  
  if (!profile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="profile-page">
      <h1>{profile.username}</h1>
      
      {!isAuthenticated && (
        <div className="auth-warning">
          <p>You will be redirected to the login page in a few seconds...</p>
          <button onClick={() => {
            clearTimeout(redirectTimer);
            navigate('/login', { state: { from: `/profile/${id}` } });
          }}>
            Log in now
          </button>
        </div>
      )}
      
      {/* Rest of the profile content */}
    </div>
  );
};
```

## Best Practices

1. **Use ProtectedRoute for truly private pages**: Pages that should never be accessible to unauthenticated users.

2. **Use conditional rendering for mixed-access pages**: Pages that show different content based on authentication status.

3. **Always provide clear login prompts**: When showing limited content to unauthenticated users, make it clear what they're missing and how to access it.

4. **Save the current location**: When redirecting to login, save the current URL so users can be redirected back after authentication.

5. **Handle loading states**: Always show loading indicators while checking authentication status to prevent flickering.

6. **Implement proper error handling**: Handle API errors gracefully, especially for authentication-related requests.

7. **Use role-based protection when needed**: For admin or moderator-only pages, check user roles in addition to authentication.

## Conclusion

By implementing these patterns, you can create a robust authentication system that:

- Protects sensitive pages and actions
- Provides a smooth user experience
- Clearly communicates authentication requirements
- Handles redirects and return navigation elegantly

This approach gives you flexibility to decide which pages require authentication and which can show limited content to unauthenticated users.

## Alternate Approach: Component-Level Authentication Checks

Looking at your current implementation in `editprofile.tsx`, you're using a different approach that performs authentication checks directly within the component rather than using a wrapper component in the router. This is a valid alternative that offers some advantages:

### Example: Current Implementation in EditProfile

```tsx
// client/src/pages/profile/editprofile.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ProfileEditForm from "@/components/input/forms/ProfileEditForm"

export default function ProfileEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // If no ID is provided in the URL, use the logged-in user's ID
    if (!id) {
      navigate(`/profile/${userId}/edit`);
      return;
    }
    
    // If trying to edit someone else's profile, redirect to own profile
    if (id !== userId) {
      navigate(`/profile/${userId}/edit`);
      return;
    }
  }, [id, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <ProfileEditForm />
    </div>
  )
}
```

### Benefits of This Approach

1. **Simplicity**: No need to create separate wrapper components
2. **Flexibility**: Can implement custom logic specific to each page
3. **Ownership Checks**: Combines authentication and ownership checks in one place
4. **No Context Required**: Works without setting up an auth context

### How to Apply This Approach to Profile Pages

If you want to make profile pages require authentication using this approach:

```tsx
// client/src/pages/profile/profile.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ProfileDisplay from "@/components/profile/ProfileDisplay";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // No additional checks needed for viewing profiles
    // Unlike edit page, users can view any profile if they're logged in
  }, [id, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <ProfileDisplay id={id} />
    </div>
  );
}
```

### Handling Profile Button in Navbar

To ensure the profile button in the navbar also redirects to login when a user is not authenticated:

```tsx
// client/src/components/navigation/Navbar.tsx
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }
    
    // Navigate to the user's profile if logged in
    navigate(`/profile/${userId}`);
  };
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold">App Name</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleProfileClick}
              className="px-4 py-2 rounded-md bg-blue-500 text-white"
            >
              Profile
            </button>
            {/* Other navbar items */}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

This approach ensures that:
1. The profile page itself requires authentication
2. The profile button in the navbar redirects to login if the user is not authenticated
3. The implementation remains simple and consistent with your existing code

### Hybrid Approach: Limited Content with Delayed Redirect

You can also combine approaches to show limited content briefly before redirecting:

```tsx
// client/src/pages/profile/profile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/api';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isAuth = !!token;
    setIsAuthenticated(isAuth);
    
    // Set up redirect timer for unauthenticated users
    if (!isAuth) {
      const timer = setTimeout(() => {
        navigate('/login', { state: { from: `/profile/${id}` } });
      }, 5000);
      
      setRedirectTimer(timer);
      return () => clearTimeout(timer);
    }
    
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await api.getUser(id);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id, navigate]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="profile-page">
      {/* Basic info - visible to everyone */}
      <h1>{user?.username}</h1>
      <p>{user?.bio}</p>
      
      {!isAuthenticated && (
        <div className="auth-warning bg-yellow-100 p-4 rounded-md my-4">
          <p className="text-yellow-800">
            You will be redirected to the login page in a few seconds...
          </p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              clearTimeout(redirectTimer);
              navigate('/login', { state: { from: `/profile/${id}` } });
            }}
          >
            Log in now
          </button>
        </div>
      )}
      
      {/* Full content only shown to authenticated users */}
      {isAuthenticated && (
        <div className="profile-details">
          {/* ... detailed profile content ... */}
        </div>
      )}
    </div>
  );
}
```

### Comparing the Two Approaches

| Feature | Router-Level Protection | Component-Level Checks |
|---------|-------------------------|------------------------|
| **Setup Complexity** | Requires ProtectedRoute component | Simpler, direct implementation |
| **Code Organization** | Authentication logic centralized | Logic distributed in components |
| **Flexibility** | Same behavior for all protected routes | Can customize per component |
| **Maintenance** | Change one component to update all routes | Need to update each component |
| **State Management** | Typically uses context API | Can use local state or context |
| **URL Access** | Prevents direct URL access | Still handles direct URL access |

### When to Use Each Approach

**Use Router-Level Protection When:**
- You have many routes that need the same protection logic
- You want centralized authentication management
- You're using a context-based auth system

**Use Component-Level Checks When:**
- You need custom authentication logic for specific pages
- You want to combine authentication with other checks (like ownership)
- You prefer keeping related logic within the component
- You're not using a context-based auth system

### Best Practice: Consistent Approach

While both approaches work, it's generally best to choose one approach and use it consistently throughout your application to maintain code predictability and ease of maintenance.

If you're already using the component-level approach in `editprofile.tsx`, it might make sense to continue with this pattern for other protected pages as well. 