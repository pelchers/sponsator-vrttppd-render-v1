# Likes Page Implementation Guide

## Overview
This guide outlines the steps to implement a comprehensive Likes page that displays all content a user has liked across multiple content types (Posts, Articles, Projects) with filtering options and a consistent layout.

## User Interface Components

### 1. Filters and Results Layout
- Page title "Likes" with description
- "Show" filter checkboxes (Posts, Articles, Projects)
- Results display area with content-specific cards
- Empty state handling for no likes
- Pagination controls

### 2. Card Display
- Equal-sized card containers for consistent layout
- Content-specific content based on type
- Dynamic loading with pagination
- Empty state handling

## Data Flow

1. User navigates to Likes page
2. Component initializes with all content types selected
3. Component fetches liked content from API
4. User can filter by content type
5. Results update based on selected filters
6. Pagination controls allow browsing through results

## Implementation Steps

### 1. Frontend Components

#### A. Likes Page Container
Create `client/src/pages/likes/Likes.tsx`:
- Main container for the likes page
- Manages filter states
- Handles API calls and result processing
- Shows content based on selected filters (all selected by default)

```typescript
"use client" 

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FilterGroup from '@/components/filters/FilterGroup';
import ResultsGrid from '@/components/results/ResultsGrid';
import { fetchUserLikes } from '@/api/userContent';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@/components/icons/HeartIcon';

// Define content types for "Show" filter
const contentTypes = [
  { id: 'posts', label: 'Posts' },
  { id: 'articles', label: 'Articles' },
  { id: 'projects', label: 'Projects' }
];

export default function LikesPage() {
  const navigate = useNavigate();
  
  // State for selected filters - all selected by default
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['posts', 'articles', 'projects']);
  
  // State for results
  const [results, setResults] = useState({
    posts: [],
    articles: [],
    projects: []
  });
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Handle content type filter change
  const handleContentTypeChange = (selected: string[]) => {
    setSelectedContentTypes(selected);
    setPage(1); // Reset to first page when filters change
  };
  
  // Fetch results based on filters
  const fetchResults = async () => {
    setLoading(true);
    try {
      // Call API
      const data = await fetchUserLikes({
        contentTypes: selectedContentTypes,
        page,
        limit: 12
      });
      
      setResults(data.results);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching liked content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch results when filters or page changes
  useEffect(() => {
    fetchResults();
  }, [selectedContentTypes, page]);
  
  // Check if there are any results
  const hasResults = results.posts.length > 0 || 
                     results.articles.length > 0 || 
                     results.projects.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Likes</h1>
      
      {/* Filters */}
      <div className="mb-8">
        <FilterGroup 
          title="Show" 
          options={contentTypes} 
          selected={selectedContentTypes} 
          onChange={handleContentTypeChange} 
        />
      </div>
      
      {/* No selection message */}
      {selectedContentTypes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Select content to display</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the "Show" filter to select what type of content you want to see.
          </p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && selectedContentTypes.length > 0 && !hasResults && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No liked content found</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't liked any {selectedContentTypes.length === 1 
              ? selectedContentTypes[0].replace('s', '') 
              : 'content'} yet.
          </p>
          <Button 
            onClick={() => navigate('/explore')} 
            className="mt-4"
          >
            Explore Content
          </Button>
        </div>
      )}
      
      {/* Results */}
      {selectedContentTypes.length > 0 && (
        <ResultsGrid 
          results={results} 
          loading={loading} 
          contentTypes={selectedContentTypes}
        />
      )}
      
      {/* Pagination */}
      {totalPages > 1 && hasResults && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>
          <Button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

#### B. Filter Components
Reuse `client/src/components/filters/FilterGroup.tsx` from Explore page:
- Checkbox group component for content type filters
- Visual indication of active filters

#### C. Result Card Components
Reuse card components from the Explore page:
- `client/src/components/cards/PostCard.tsx`
- `client/src/components/cards/ArticleCard.tsx`
- `client/src/components/cards/ProjectCard.tsx`

#### D. Results Container
Reuse `client/src/components/results/ResultsGrid.tsx` from Explore page:
- Grid layout for displaying results
- Handles empty states and loading
- Supports different content types

### 2. API Services

Create `client/src/api/userContent.ts`:
- `fetchUserLikes(filters)` - Get all content liked by the current user
- Handles API requests to the backend
- Formats query parameters for content types

```typescript
import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchUserLikes = async (filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/user/likes`, {
      params: {
        contentTypes: filters.contentTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user likes:', error);
    // Return empty results on error
    return {
      results: {
        posts: [],
        articles: [],
        projects: []
      },
      totalPages: 1,
      page: 1
    };
  }
};
```

### 3. Backend Implementation

#### A. Controller
Create `server/src/controllers/userContentController.ts`:
- Handles HTTP requests for likes functionality
- Parses query parameters
- Calls appropriate service methods based on selected content types
- Combines results and sends response

```typescript
import { Request, Response } from 'express';
import * as userContentService from '../services/userContentService';

export const getUserLikes = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = '1', limit = '12' } = req.query;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    // Parse content types filter (comma-separated string to array)
    const contentTypesParam = req.query.contentTypes ? String(req.query.contentTypes) : '';
    const contentTypes = contentTypesParam ? contentTypesParam.split(',') : ['posts', 'articles', 'projects'];
    
    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Prepare results object
    const results: any = {
      posts: [],
      articles: [],
      projects: []
    };
    
    // Fetch liked content based on selected types
    const fetchPromises = [];
    
    if (contentTypes.includes('posts')) {
      fetchPromises.push(
        userContentService.getUserLikedPosts(userId, { skip, limit: limitNum })
          .then(posts => { results.posts = posts; })
      );
    }
    
    if (contentTypes.includes('articles')) {
      fetchPromises.push(
        userContentService.getUserLikedArticles(userId, { skip, limit: limitNum })
          .then(articles => { results.articles = articles; })
      );
    }
    
    if (contentTypes.includes('projects')) {
      fetchPromises.push(
        userContentService.getUserLikedProjects(userId, { skip, limit: limitNum })
          .then(projects => { results.projects = projects; })
      );
    }
    
    // Wait for all fetches to complete
    await Promise.all(fetchPromises);
    
    // Get total counts for pagination
    const counts = await userContentService.getLikedContentCounts(userId, contentTypes);
    
    // Calculate total pages
    const totalItems = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const totalPages = Math.ceil(totalItems / limitNum);
    
    // Send response
    return res.json({
      results,
      page: pageNum,
      totalPages,
      counts
    });
  } catch (error) {
    console.error('Error in getUserLikes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

#### B. Service
Create `server/src/services/userContentService.ts`:
- Business logic for fetching user likes
- Database interactions via Prisma
- Joins likes table with content tables

```typescript
import { prisma } from '../lib/prisma';

// Get posts liked by a user
export const getUserLikedPosts = async (userId: string, pagination: { skip: number, limit: number }) => {
  const { skip, limit } = pagination;
  
  try {
    const likedPosts = await prisma.likes.findMany({
      where: {
        user_id: userId,
        entity_type: 'post'
      },
      include: {
        // Join with posts table to get post details
        posts: {
          select: {
            id: true,
            title: true,
            description: true,
            mediaUrl: true,
            tags: true,
            likes: true,
            comments: true,
            created_at: true,
            users: {
              select: {
                id: true,
                username: true,
                profile_image: true
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });
    
    // Transform the results
    return likedPosts
      .filter(like => like.posts) // Filter out any null posts
      .map(like => ({
        ...like.posts,
        userHasLiked: true // Always true since these are liked items
      }));
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return [];
  }
};

// Similar functions for getUserLikedArticles and getUserLikedProjects

// Get counts of liked content by type
export const getLikedContentCounts = async (userId: string, contentTypes: string[]) => {
  const counts = {
    posts: 0,
    articles: 0,
    projects: 0
  };
  
  try {
    // Run count queries in parallel
    const countPromises = [];
    
    if (contentTypes.includes('posts')) {
      countPromises.push(
        prisma.likes.count({
          where: {
            user_id: userId,
            entity_type: 'post'
          }
        }).then(count => { counts.posts = count; })
      );
    }
    
    if (contentTypes.includes('articles')) {
      countPromises.push(
        prisma.likes.count({
          where: {
            user_id: userId,
            entity_type: 'article'
          }
        }).then(count => { counts.articles = count; })
      );
    }
    
    if (contentTypes.includes('projects')) {
      countPromises.push(
        prisma.likes.count({
          where: {
            user_id: userId,
            entity_type: 'project'
          }
        }).then(count => { counts.projects = count; })
      );
    }
    
    await Promise.all(countPromises);
    return counts;
  } catch (error) {
    console.error('Error getting liked content counts:', error);
    return counts;
  }
};
```

#### C. Routes
Create `server/src/routes/userContentRoutes.ts`:
- Define API endpoints for likes functionality
- Apply authentication middleware

```typescript
import { Router } from 'express';
import * as userContentController from '../controllers/userContentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get user likes (requires authentication)
router.get('/likes', authenticate, userContentController.getUserLikes);

export default router;
```

#### D. Register Routes
Update `server/src/index.ts` to include the user content routes:

```typescript
import userContentRoutes from './routes/userContentRoutes';

// Add this with the other route registrations
app.use('/api/user', userContentRoutes);
```

### 4. Navbar Integration

Update `client/src/components/navigation/Sidebar.tsx` to include a link to the Likes page:

```typescript
<NavItem 
  to="/likes" 
  icon={<HeartIcon className="w-5 h-5" />}
  label="Likes"
/>
```

## Implementation Details

### 1. Content Type Filtering

The content type filtering should support:
- Default to showing all content types on initial load
- Allow users to filter by specific content types
- Update results when filters change
- Reset pagination when filters change

### 2. Database Queries

The database queries should:
- Filter by user_id and entity_type
- Join with content tables to get full details
- Order by created_at to show most recently liked content first
- Include pagination parameters

### 3. Card Display

Each card should have:
- Consistent size and padding
- Type-specific content layout
- Preview image (if available)
- Title
- Brief description or excerpt
- Author/creator information
- Type indicators (visual cues for content type)
- Like button already in "liked" state

### 4. State Management

The likes page should manage:
- Active content type filters
- Loading states
- Pagination state
- Results by content type

## Common Issues and Solutions

### 1. Entity Type Filtering

**Issue**: Likes for different entity types are mixed up

**Solution**: Always filter by entity_type in your queries:

```typescript
const where = {
  user_id: userId,
  entity_type: 'post' // Ensure this is set correctly for each query
};
```

### 2. Authentication Issues

**Issue**: Unauthorized errors when fetching likes

**Solution**: Ensure auth headers are properly set:

```typescript
const response = await axios.get(`${API_URL}/user/likes`, {
  params: { /* ... */ },
  headers: getAuthHeaders() // Make sure this includes the token
});
```

### 3. Empty Results Handling

**Issue**: Poor user experience when no likes exist

**Solution**: Implement a friendly empty state:

```typescript
{!loading && selectedContentTypes.length > 0 && !hasResults && (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
    <h3 className="mt-4 text-lg font-medium text-gray-900">No liked content found</h3>
    <p className="mt-2 text-sm text-gray-500">
      You haven't liked any content yet.
    </p>
    <Button 
      onClick={() => navigate('/explore')} 
      className="mt-4"
    >
      Explore Content
    </Button>
  </div>
)}
```

### 4. Relation Field Names

**Issue**: Errors when trying to access related data

**Solution**: Use the correct relation field names:

```typescript
// Incorrect
include: {
  post: {
    select: { /* ... */ }
  }
}

// Correct
include: {
  posts: {
    select: { /* ... */ }
  }
}
```

## Testing Strategy

1. Test with users who have liked different content types
2. Test with users who have no likes
3. Test filter combinations
4. Test pagination
5. Test performance with large result sets

## Future Enhancements

1. Advanced filtering options (date range, tags, etc.)
2. Activity timeline view (chronological display of likes)
3. Collections/categories for organizing liked content
4. Bulk actions (unlike multiple items, share collection)
5. Recommendations based on liked content

## Implementation Checklist

- [ ] Create frontend components
- [ ] Implement API services
- [ ] Create backend controller and routes
- [ ] Implement database queries in services
- [ ] Add router configuration
- [ ] Update navigation
- [ ] Style components
- [ ] Test all functionality
- [ ] Optimize for performance

---

## REMINDER: How Our Likes System Works

Our likes system uses a hybrid approach for tracking likes:

1. **Source of Truth**: The `likes` table stores all like relationships:
   ```
   model likes {
     id          String   @id @default(uuid())
     user_id     String   // Who liked it
     entity_type String   // What type of content (post, project, etc.)
     entity_id   String   // Which specific content item
     created_at  DateTime @default(now())
     users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)
   }
   ```

2. **Cached Counts**: Content tables have denormalized count fields for performance:
   - `posts.likes` - Number of likes on a post
   - `projects.project_followers` - Number of likes on a project
   - `comments.likes_count` - Number of likes on a comment

**Important realization**: We're primarily using the `likes` table as the source of truth, not any like fields that might exist in other tables. The count fields in content tables are just cached values for performance.

## The Two Parts of the Likes System

1. **The `likes` table**: This is the source of truth for all like relationships. It stores:
   - Who liked what (user_id)
   - What type of content was liked (entity_type)
   - Which specific content item was liked (entity_id)

2. **The count fields on content tables**: These are just cached counts for performance:
   - `posts.likes`
   - `projects.project_followers`
   - `comments.likes_count`

## How They Work Together

- The `likes` table tells you **who** has liked **what**
- The count fields tell you **how many** likes something has

When building the Likes page, you'll primarily query the `likes` table to find all content a user has liked. The count fields are just for display purposes when showing content.

For example, to show all posts a user has liked:

```typescript
// Query the likes table to find all posts this user has liked
const likedPosts = await prisma.likes.findMany({
  where: {
    user_id: userId,
    entity_type: 'post'
  },
  select: {
    entity_id: true
  }
});

// Then get the actual post data
const postIds = likedPosts.map(like => like.entity_id);
const posts = await prisma.posts.findMany({
  where: {
    id: { in: postIds }
  }
});
```

The count fields are maintained automatically by the `incrementLikeCount` and `decrementLikeCount` functions in the like service, but they're not used for determining what a user has liked - that comes from the `likes` table.

When building the Likes page:
1. We query the `likes` table to find all content a user has liked
2. We join with the respective content tables to get the full details
3. We group by content type for filtering

This approach gives us both performance (fast count lookups) and flexibility (knowing exactly who liked what).

## Why We Need Like Count Fields

**Question**: Do we technically need the like count fields in the content tables to get the count on a user's profile page or elsewhere?

**Answer**: Technically, no - we don't absolutely need them. We could always count likes from the `likes` table:

```typescript
// We could always do this instead of using a stored count
const postLikeCount = await prisma.likes.count({
  where: {
    entity_type: 'post',
    entity_id: postId
  }
});
```

### Why We Have Them Anyway

We keep these denormalized count fields for several important reasons:

1. **Performance**: Counting records in the `likes` table becomes slow as the table grows. For popular content with thousands of likes, this would create a performance bottleneck.

2. **Reduced Database Load**: When displaying lists of content (like on a profile page), we'd need to make separate count queries for each item if we didn't have the count fields.

3. **Sorting Efficiency**: Having the count stored makes it much faster to sort content by popularity (e.g., "most liked posts").

4. **Caching Strategy**: The count fields act as a form of database-level caching, reducing the need for application-level caching.

### Real-World Example

On a user's profile page where we show their posts with like counts:

**With count fields:**
```typescript
// One simple query
const userPosts = await prisma.posts.findMany({
  where: { user_id: userId },
  orderBy: { likes: 'desc' } // Easy sorting by popularity
});
// Each post already has post.likes available
```

**Without count fields:**
```typescript
// First get the posts
const userPosts = await prisma.posts.findMany({
  where: { user_id: userId }
});

// Then for EACH post, make another query
for (const post of userPosts) {
  post.likeCount = await prisma.likes.count({
    where: {
      entity_type: 'post',
      entity_id: post.id
    }
  });
}

// Sort manually after all counts are fetched
userPosts.sort((a, b) => b.likeCount - a.likeCount);
```

The second approach would be significantly slower and put more load on the database.

### Conclusion

While we technically don't need the count fields, they provide significant performance benefits that make them worth maintaining. The small overhead of updating these counts when likes change is far outweighed by the performance gains when reading the data, which happens much more frequently than writing.
