# Implementing Conditionally Rendered Pages

This guide explains how to implement pages that show different content based on authentication status, using our Landing page as an example.

## Overview

When implementing conditional rendering for pages, we need to:
1. Check authentication status
2. Show appropriate content based on that status
3. Handle loading states
4. Manage user data and stats

## Implementation Steps

### 1. Authentication Check

First, we need to properly check if a user is authenticated:

```typescript
import { isAuthenticated } from '@/api/auth';

// In your page component
const userId = localStorage.getItem('userId');

// Check both userId existence and authentication status
if (userId && isAuthenticated()) {
  // Show authenticated user content
} else {
  // Show public content
}
```

### 2. User Stats Integration

For authenticated users, we often need to fetch and display their stats:

```typescript
// Create a dedicated API service for user stats
// client/src/api/userstats.ts
import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthHeaders } from '@/utils/auth';

export async function fetchUserStats(userId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    return {
      ...response.data,
      // Transform any nested data if needed
      recentProjects: response.data.recentProjects || [],
      recentArticles: response.data.recentArticles || [],
      recentPosts: response.data.recentPosts || [],
      projects: response.data.projectCount || 0,
      articles: response.data.articleCount || 0,
      posts: response.data.postCount || 0,
      likes: response.data.likeCount || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return default values if the request fails
    return {
      recentProjects: [],
      recentArticles: [],
      recentPosts: [],
      projects: 0,
      articles: 0,
      posts: 0,
      likes: 0
    };
  }
}
```

### 3. Page Component Implementation

Here's how to structure your page component with conditional rendering:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { fetchUserStats } from '@/api/userstats';
import { isAuthenticated } from '@/api/auth';

export default function Landing() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userStats, setUserStats] = useState<any>(null);

  // Fetch user stats when authenticated
  useEffect(() => {
    if (userId && isAuthenticated()) {
      fetchUserStats(userId).then(stats => setUserStats(stats));
    }
  }, [userId]);

  // Show authenticated user dashboard
  if (userId && isAuthenticated() && userStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* User Dashboard Content */}
        <section className="bg-white shadow-sm py-8">
          <div className="max-w-7xl mx-auto px-4">
            {/* User Stats Display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold">{userStats.projects}</div>
                <div className="text-gray-600">Projects</div>
              </div>
              {/* More stat boxes */}
            </div>
          </div>
        </section>

        {/* Quick Access Links */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-semibold mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Quick access links */}
            </div>
          </div>
        </section>

        {/* Recent Content */}
        <section className="py-8 bg-white">
          {/* Recent content display */}
        </section>
      </div>
    );
  }

  // Show public landing page
  return (
    <div className="min-h-screen flex flex-col">
      {/* Public landing page content */}
    </div>
  );
}
```

### 4. Authentication State Management

To ensure proper authentication checks:

```typescript
// In your auth service
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Add any additional token validation logic here
  return true;
}

// In your component
useEffect(() => {
  // Check both userId and authentication
  if (userId && isAuthenticated()) {
    fetchUserStats(userId).then(stats => setUserStats(stats));
  }
}, [userId]);
```

### 5. Loading States

Handle loading states appropriately:

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (userId && isAuthenticated()) {
    setLoading(true);
    fetchUserStats(userId)
      .then(stats => setUserStats(stats))
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, [userId]);

if (loading) {
  return <div>Loading...</div>;
}
```

## Best Practices

1. **Authentication Checks**
   - Always check both userId and authentication status
   - Use a dedicated auth service for consistency
   - Handle token expiration gracefully

2. **State Management**
   - Keep user stats in state
   - Handle loading states
   - Provide default values for missing data

3. **Error Handling**
   - Handle API errors gracefully
   - Provide fallback UI for error states
   - Log errors for debugging

4. **Performance**
   - Only fetch user stats when needed
   - Cache stats when appropriate
   - Use proper dependencies in useEffect

## Common Issues and Solutions

### 1. Flickering Content
**Issue**: Content briefly shows wrong state during auth check
**Solution**: Use loading state

```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return <div>Loading...</div>;
}
```

### 2. Stale Data
**Issue**: User stats don't update after actions
**Solution**: Implement proper data refresh

```typescript
const refreshStats = async () => {
  if (userId && isAuthenticated()) {
    const newStats = await fetchUserStats(userId);
    setUserStats(newStats);
  }
};
```

### 3. Memory Leaks
**Issue**: State updates after component unmount
**Solution**: Use cleanup function

```typescript
useEffect(() => {
  let mounted = true;

  if (userId && isAuthenticated()) {
    fetchUserStats(userId).then(stats => {
      if (mounted) {
        setUserStats(stats);
      }
    });
  }

  return () => {
    mounted = false;
  };
}, [userId]);
```

## Testing Checklist

- [ ] Verify correct content shows for authenticated users
- [ ] Verify correct content shows for non-authenticated users
- [ ] Check loading states display properly
- [ ] Verify user stats update correctly
- [ ] Test error handling
- [ ] Check mobile responsiveness
- [ ] Verify navigation works correctly
- [ ] Test token expiration handling

This implementation provides a robust solution for conditionally rendered pages based on authentication status, with proper handling of user data and loading states. 