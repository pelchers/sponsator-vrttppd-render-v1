# Error Boundary and Display Fixes Guide

This document outlines common error boundary issues encountered in our React application and their solutions, with a focus on routing and component display problems.

## 1. Missing Routes Error

### Issue
When adding new features like Posts, we encountered the following error:

```
Error handled by React Router default ErrorBoundary: 
ErrorResponseImpl {status: 404, statusText: 'Not Found', internal: true, data: 'Error: No route matches URL "/post"', error: Error: No route matches URL "/post"
    at getInternalRouterError (http://localhost:5373/node_modul…}
```

This occurred because we added navigation links in the navbar to routes that didn't exist in our router configuration.

### Root Cause
1. We added UI elements (navbar links) that pointed to new routes (`/post`, `/post/edit/new`, etc.)
2. However, we didn't define these routes in our router configuration
3. The router import in `main.tsx` was pointing to `./router/index` but we were modifying `./routes.tsx`

### Solution
1. Add the missing routes to the correct router file (`client/src/router/index.tsx`):

```typescript
// Post routes in correct order
{
  path: '/post',
  element: <Layout><PostsPage /></Layout>,
},
{
  path: '/post/edit/new',  // More specific route first
  element: <Layout><PostEditPage /></Layout>,
},
{
  path: '/post/edit/:id',  // More specific parameterized route next
  element: <Layout><PostEditPage /></Layout>,
},
{
  path: '/post/:id',       // General parameterized route last
  element: <Layout><PostPage /></Layout>,
},
```

2. Ensure the routes are in the correct order (more specific routes before more general ones)
3. Import the necessary components at the top of the router file

### Key Insights
1. **Route Order Matters**: Always place more specific routes (like `/post/edit/new`) before more general routes (like `/post/:id`). Otherwise, React Router will interpret "edit" as an ID parameter.

2. **File Location Awareness**: Be aware of which router file is actually being used by your application. Check imports in `main.tsx` to confirm.

3. **Component Existence**: Ensure all components referenced in routes actually exist and are properly imported.

## 2. Component Import Case Sensitivity

### Issue
We encountered errors related to component imports with inconsistent casing:

```
Already included file name 'Layout.tsx' differs from file name 'layout.tsx' only in casing.
```

### Root Cause
Different operating systems handle file casing differently:
- Windows is case-insensitive (Layout.tsx and layout.tsx are the same)
- macOS is case-insensitive by default but preserves case
- Linux is case-sensitive (Layout.tsx and layout.tsx are different files)

This creates inconsistencies when importing components across different systems.

### Solution
1. Standardize component naming conventions (PascalCase for components)
2. Ensure imports match the actual file names exactly
3. Update all imports to use the correct casing

```typescript
// Incorrect - mixed casing
import Layout from '@/components/layout/layout';
import Layout from '@/components/layout/Layout';

// Correct - consistent PascalCase for components
import Layout from '@/components/layout/Layout';
```

## 3. Route Parameter Handling

### Issue
When implementing dynamic routes like `/post/:id`, we encountered issues with parameter extraction and component rendering.

### Root Cause
1. Incorrect parameter access in components
2. Missing null/undefined checks for parameters
3. Async data loading without proper loading states

### Solution
1. Use the `useParams` hook correctly:

```typescript
import { useParams } from 'react-router-dom';

export default function PostPage() {
  const { id } = useParams();
  
  // Always check if id exists before using it
  if (!id) {
    return <div>Invalid post ID</div>;
  }
  
  // Rest of component...
}
```

2. Add proper loading states:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  if (!id) return;
  
  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await fetchPost(id);
      setPost(data);
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };
  
  loadPost();
}, [id]);

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
```

## 4. API URL Configuration

### Issue
API calls were failing because the URL was incorrectly configured or missing.

### Root Cause
1. Missing or incorrect API_URL environment variable
2. Inconsistent URL formatting across different API calls
3. No fallback value for API_URL

### Solution
1. Ensure API_URL is properly defined with a fallback:

```typescript
// api/posts.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Use consistent URL format in all API calls
export const fetchPost = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
};
```

2. Create a centralized API configuration:

```typescript
// api/config.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const API_ROUTES = {
  POSTS: {
    LIST: '/posts',
    DETAIL: '/posts/:id',
    CREATE: '/posts',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
  },
  // Other API routes...
};
```

## 5. Debug Techniques

When troubleshooting routing and display issues, these techniques can be helpful:

### 1. Add a Debug Route
Add a simple debug route to verify the router is working:

```typescript
{
  path: '/debug',
  element: <div>Debug Route Working</div>,
},
```

### 2. Check Router Configuration
Print the router configuration to the console:

```typescript
console.log('Router configuration:', router);
```

### 3. Add Route Logging Middleware
Add middleware to log route access:

```typescript
// server/src/index.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### 4. Test with Minimal Components
Replace complex components with minimal versions to isolate issues:

```typescript
{
  path: '/post',
  element: <div>Posts List Page</div>,
},
```

## Best Practices

1. **Route Organization**: Keep related routes together and in the correct order (specific to general)

2. **Component Naming**: Use consistent PascalCase for component files and imports

3. **Error Boundaries**: Implement custom error boundaries to catch and display errors gracefully:

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

4. **Loading States**: Always implement proper loading states for async operations

5. **Consistent API Calls**: Use a consistent pattern for API calls with proper error handling

6. **Environment Variables**: Always provide fallback values for environment variables

By following these practices and learning from the issues we've encountered, we can build more robust and maintainable React applications with fewer routing and display errors. 