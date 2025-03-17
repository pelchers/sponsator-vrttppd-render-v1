# Implementing Conditionally Filtered Results

This guide explains how we implemented the MyStuff page to show only content that the logged-in user has interacted with, using proper backend filtering instead of frontend filtering.

## Overview

When implementing filtered results for user interactions, we need to:
1. Pass the user ID to the API
2. Filter at the database level
3. Return only relevant content
4. Handle the filtered results in the frontend

## Implementation Steps

### 1. Frontend Component Setup

First, we set up the MyStuff page component to get the user ID and pass it to our API:

```typescript
export default function MyStuffPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Get the logged-in user's ID
  
  // State for filters
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([
    'users', 'posts', 'articles', 'projects'
  ]);
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState<string[]>([
    'likes', 'follows', 'watches'
  ]);
  
  // Add user ID check in fetch function
  const fetchResults = async () => {
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUserInteractions({
        contentTypes: selectedContentTypes,
        interactionTypes: selectedInteractionTypes,
        page,
        limit: 12,
        userId // Pass the userId to filter interactions
      });
      
      setResults({
        users: data.results.users || [],
        posts: data.results.posts || [],
        articles: data.results.articles || [],
        projects: data.results.projects || []
      });
      setTotalPages(data.totalPages);
    } catch (error) {
      // Error handling...
    }
  };
}
```

### 2. API Service Implementation

Create a properly typed interface and update the API service to handle user-specific filtering:

```typescript
// In userContent.ts

interface FetchUserInteractionsOptions {
  contentTypes: string[];
  interactionTypes: string[];
  page: number;
  limit: number;
  userId: string; // Required field for filtering
}

export const fetchUserInteractions = async (options: FetchUserInteractionsOptions) => {
  try {
    const params = new URLSearchParams();
    
    if (options.contentTypes?.length > 0) {
      params.append('contentTypes', options.contentTypes.join(','));
    }
    
    if (options.interactionTypes?.length > 0) {
      params.append('interactionTypes', options.interactionTypes.join(','));
    }
    
    params.append('page', options.page.toString());
    params.append('limit', options.limit.toString());
    params.append('userId', options.userId);
    
    const response = await axios.get(`${API_URL}/users/interactions?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    return response.data;
  } catch (error) {
    // Error handling with default empty results...
  }
};
```

### 3. Backend Implementation

In your backend controller/service:

```typescript
// Example backend pseudo-code
async function getUserInteractions(userId: string, filters: any) {
  // Filter likes table
  const likes = await prisma.likes.findMany({
    where: {
      user_id: userId,
      entity_type: { in: filters.contentTypes }
    }
  });

  // Filter follows table
  const follows = await prisma.follows.findMany({
    where: {
      user_id: userId,
      entity_type: { in: filters.contentTypes }
    }
  });

  // Filter watches table
  const watches = await prisma.watches.findMany({
    where: {
      user_id: userId,
      entity_type: { in: filters.contentTypes }
    }
  });

  // Join with content tables and return results
  return {
    results: {
      users: [...], // Only users this user has interacted with
      posts: [...], // Only posts this user has interacted with
      articles: [...], // Only articles this user has interacted with
      projects: [...] // Only projects this user has interacted with
    },
    totalPages: calculateTotalPages(totalResults, limit)
  };
}
```

## Key Concepts

### 1. Database-Level Filtering
Instead of filtering in the frontend or API layer, we filter at the database level by:
- Querying interaction tables with the user's ID
- Joining with content tables to get full content data
- Only returning content the user has actually interacted with

### 2. Type Safety
We ensure type safety by:
- Defining clear interfaces for API options
- Using TypeScript to catch potential errors
- Properly typing state and props

### 3. Error Handling
We implement proper error handling:
```typescript
try {
  // API call...
} catch (error) {
  console.error('Error fetching user interactions:', error);
  return {
    results: {
      users: [],
      posts: [],
      articles: [],
      projects: []
    },
    totalPages: 1
  };
}
```

### 4. Empty States
We handle empty states appropriately:
```typescript
const getEmptyStateMessage = () => {
  if (selectedInteractionTypes.length === 0 || selectedContentTypes.length === 0) {
    return "Select content and interaction types to display";
  }
  
  // Dynamic message based on selected filters...
};
```

## Best Practices

1. **Filter at the Database Level**
   - More efficient than frontend filtering
   - Reduces data transfer
   - Ensures data security

2. **Type Safety**
   - Use TypeScript interfaces
   - Define clear data structures
   - Prevent runtime errors

3. **Error Handling**
   - Provide fallback values
   - Log errors appropriately
   - Show user-friendly messages

4. **Performance**
   - Use pagination
   - Only fetch needed data
   - Cache results when appropriate

## Common Issues and Solutions

### 1. Missing User ID
**Issue**: API calls made without user ID
**Solution**: Add early return if no user ID

```typescript
if (!userId) {
  console.error('No user ID found');
  return;
}
```

### 2. Empty Results
**Issue**: No results shown when filters change
**Solution**: Ensure default arrays when data is missing

```typescript
setResults({
  users: data.results.users || [],
  posts: data.results.posts || [],
  articles: data.results.articles || [],
  projects: data.results.projects || []
});
```

### 3. Stale Data
**Issue**: Results don't update when interactions change
**Solution**: Add proper dependencies to useEffect

```typescript
useEffect(() => {
  fetchResults();
}, [selectedContentTypes, selectedInteractionTypes, page]);
```

## Testing Checklist

- [ ] Verify only user's interactions are shown
- [ ] Check all filter combinations work
- [ ] Test pagination with filtered results
- [ ] Verify empty states show correct messages
- [ ] Test error handling
- [ ] Check loading states
- [ ] Verify interaction type filtering
- [ ] Test content type filtering

This implementation ensures that users only see content they've actually interacted with, while maintaining good performance and user experience. 