# Explore Page Implementation Guide

## Overview
This guide outlines the steps to implement a comprehensive Explore page that allows users to search and filter across multiple content types (Users, Projects, Articles, Posts) with additional filtering by user types.

## User Interface Components

### 1. Search Bar and Filters
- Search bar with magnifying glass icon button
- "Show" filter checkboxes (Users, Projects, Articles, Posts)
- "Type" filter checkboxes (Creator, Brand, Freelancer, Contractor)
- Results display area with content-specific cards

### 2. Card Display
- Equal-sized card containers for consistent layout
- Content-specific content based on type
- Dynamic loading with pagination
- Empty state handling

## Data Flow

1. User interacts with search bar and filters
2. Component manages filter state and search query
3. On search/filter change, component calls API with parameters
4. API service sends requests to backend endpoints
5. Backend controller processes the request with filters
6. Service layer performs the search across multiple tables
7. Results are returned to frontend
8. UI updates to display filtered results in appropriate card formats

## Implementation Steps

### 1. Frontend Components

#### A. Explore Page Container
Create `client/src/pages/explore/Explore.tsx`:
- Main container for the explore page
- Manages search and filter states
- Handles API calls and result processing
- Shows content based on selected filters (nothing shown by default)

```typescript
// Key implementation details
const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);

// Only fetch if at least one content type is selected
if (selectedContentTypes.length === 0) {
  setResults({
    users: [],
    projects: [],
    articles: [],
    posts: []
  });
  return;
}

// Show message when no content types are selected
{selectedContentTypes.length === 0 && (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <h3 className="text-lg font-medium text-gray-900">Select content to display</h3>
    <p className="mt-2 text-sm text-gray-500">
      Use the "Show" filter to select what type of content you want to see.
    </p>
  </div>
)}
```

#### B. Search Component
Create `client/src/components/search/SearchBar.tsx`:
- Input field for search text
- Search button with magnifying glass icon
- Handles search submission

#### C. Filter Components
Create `client/src/components/filters/FilterGroup.tsx`:
- Checkbox group component for filters
- Support for "Show" and "Type" filter categories
- Visual indication of active filters

#### D. Result Card Components
Create card components for each content type:
- `client/src/components/cards/UserCard.tsx`
- `client/src/components/cards/ProjectCard.tsx`
- `client/src/components/cards/ArticleCard.tsx`
- `client/src/components/cards/PostCard.tsx`

#### E. Results Container
Create `client/src/components/results/ResultsGrid.tsx`:
- Grid layout for displaying results
- Handles empty states and loading
- Supports pagination

### 2. API Services

Create `client/src/api/explore.ts`:
- `searchAll(query, filters)` - Search across all content types with filters
- Handles API requests to the backend
- Formats query parameters for content types and user types

```typescript
// Example API service implementation
export const searchAll = async (query: string, filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/explore/search`, {
      params: {
        q: query,
        contentTypes: filters.contentTypes?.join(','),
        userTypes: filters.userTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching all content:', error);
    // Return empty results on error
    return {
      results: {
        users: [],
        projects: [],
        articles: [],
        posts: []
      },
      totalPages: 1
    };
  }
};
```

### 3. Backend Implementation

#### A. Controller
Create `server/src/controllers/exploreController.ts`:
- Handles HTTP requests for search functionality
- Parses query parameters
- Calls appropriate service methods based on selected content types
- Combines results and sends response

```typescript
// Example controller implementation
export const searchAll = async (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', limit = '12' } = req.query;
    const searchQuery = String(q);
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    // Parse content types filter (comma-separated string to array)
    const contentTypesParam = req.query.contentTypes ? String(req.query.contentTypes) : '';
    const contentTypes = contentTypesParam ? contentTypesParam.split(',') : [];
    
    // Parse user types filter (comma-separated string to array)
    const userTypesParam = req.query.userTypes ? String(req.query.userTypes) : '';
    const userTypes = userTypesParam ? userTypesParam.split(',') : [];
    
    // Prepare results object
    const results: any = {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
    
    // Execute searches in parallel based on selected content types
    const searchPromises = [];
    
    // Only search for content types that are explicitly selected
    if (contentTypes.includes('users')) {
      searchPromises.push(
        exploreService.searchUsers(searchQuery, userTypes, pageNum, limitNum)
          .then(data => { results.users = data.users; })
      );
    }
    
    // Similar blocks for projects, articles, and posts
    
    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    // Return results
    return res.status(200).json({
      results,
      totalPages: 1, // Simplified for now
      page: pageNum
    });
  } catch (error) {
    console.error('Error in searchAll:', error);
    return res.status(500).json({ 
      message: 'Error searching content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

#### B. Service
Create `server/src/services/exploreService.ts`:
- Business logic for search operations
- Implements search functions for each content type
- Uses Prisma to query the database

```typescript
// Example service implementation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const searchUsers = async (query: string, userTypes: string[], page: number, limit: number) => {
  try {
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided
    if (userTypes.length > 0) {
      where.user_type = { in: userTypes };
    }
    
    // Execute query using Prisma directly
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        username: true,
        bio: true,
        profile_image: true,
        user_type: true,
        created_at: true
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return { users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { users: [] };
  }
};

// Similar functions for searchProjects, searchArticles, and searchPosts
```

#### C. Routes
Create `server/src/routes/exploreRoutes.ts`:
- Defines API routes for explore functionality
- Maps routes to controller methods

```typescript
import { Router } from 'express';
import * as exploreController from '../controllers/exploreController';

const router = Router();

// Search across all content types
router.get('/search', exploreController.searchAll);

export default router;
```

#### D. Register Routes
Update `server/src/index.ts` to include the explore routes:

```typescript
import exploreRoutes from './routes/exploreRoutes';

// Add this with the other route registrations
app.use('/api/explore', exploreRoutes);
```

### 4. Navbar Integration

Update `client/src/components/navigation/navbar.tsx` to include a link to the Explore page:

```typescript
<Button variant="ghost" onClick={() => navigate('/explore')}>
  Explore
</Button>
```

## Implementation Details

### 1. Search Implementation

The search should support:
- Partial text matches
- Case-insensitive search
- Searching across relevant fields for each content type:
  - Users: username, bio
  - Projects: project_name, project_description
  - Articles: title
  - Posts: title, description

### 2. Filter Implementation

#### Show Filters
- When no content types are selected, show a message prompting the user to select content
- When specific content types are selected, only show those types
- Multiple selections show results from all selected types

#### Type Filters
- When no user types are selected, show content from all user types
- When specific user types are selected, filter content by the creator's type
- Multiple selections show results from all selected user types

### 3. Card Display

Each card should have:
- Consistent size and padding
- Type-specific content layout
- Preview image (if available)
- Title
- Brief description or excerpt
- Author/creator information
- Type indicators (visual cues for content type)
- Action buttons appropriate to the content type

### 4. State Management

The explore page should manage:
- Current search query
- Active filters for both categories
- Loading states
- Pagination state
- Results by content type

## Common Issues and Solutions

### 1. Prisma Client Import

**Issue**: Error "Cannot read properties of undefined (reading 'users')"

**Solution**: Import the Prisma client correctly in the explore service:

```typescript
// Incorrect
import { prisma } from '../lib/prisma';

// Correct
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### 2. Field Name Mismatches

**Issue**: Errors when trying to query fields that don't match the schema

**Solution**: Use the correct field names from the schema:

```typescript
// Incorrect
where.OR = [
  { title: { contains: query, mode: 'insensitive' } },
  { description: { contains: query, mode: 'insensitive' } }
];

// Correct
where.OR = [
  { project_name: { contains: query, mode: 'insensitive' } },
  { project_description: { contains: query, mode: 'insensitive' } }
];
```

### 3. Relation Field Names

**Issue**: Errors when trying to filter by user type

**Solution**: Use the correct relation field name:

```typescript
// Incorrect
where.user = {
  user_type: { in: userTypes }
};

// Correct
where.users = {
  user_type: { in: userTypes }
};
```

### 4. Data Transformation

**Issue**: Inconsistent field names between database and API

**Solution**: Transform the data to use consistent field names:

```typescript
const transformedProjects = projects.map(project => ({
  id: project.id,
  title: project.project_name,
  description: project.project_description,
  project_image: project.project_image,
  project_type: project.project_type,
  tags: project.project_tags,
  created_at: project.created_at,
  user_id: project.user_id,
  username: project.users?.username,
  user_type: project.users?.user_type
}));
```

## Testing Strategy

1. Test search functionality with various queries
2. Test filter combinations
3. Test pagination
4. Test empty states and error handling
5. Test performance with large result sets

## Future Enhancements

1. Advanced filtering options (date range, popularity, etc.)
2. Saved searches
3. Filter presets
4. Infinite scroll instead of pagination
5. Real-time search suggestions

## Implementation Checklist

- [x] Create frontend components
- [x] Implement API services
- [x] Create backend controller and routes
- [x] Implement search functionality in services
- [x] Add router configuration
- [x] Style components
- [x] Test all functionality
- [x] Optimize for performance 