# Implementing Sort Feature in ResultsGrid Component

This guide explains how to add sorting functionality to the ResultsGrid component that's used across MyStuff, Portfolio, and Explore pages.

## Overview

The sort feature needs to:
1. Work independently of existing filters
2. Handle both alphabetical and interaction count sorting
3. Layer on top of existing filtered results
4. Support ascending/descending order
5. Work with all content types (users, projects, articles, posts)

## Implementation Steps

### 1. Add Sort Options Interface

```typescript
// New types for sorting
type SortOrder = 'asc' | 'desc';

interface SortOption {
  id: string;
  label: string;
  field: string;
  type: 'string' | 'number' | 'date';
}

const sortOptions: SortOption[] = [
  { id: 'alpha', label: 'Alphabetical', field: 'title', type: 'string' },
  { id: 'likes', label: 'Likes', field: 'likes_count', type: 'number' },
  { id: 'follows', label: 'Follows', field: 'follows_count', type: 'number' },
  { id: 'watches', label: 'Watches', field: 'watches_count', type: 'number' },
  { id: 'created', label: 'Date Created', field: 'created_at', type: 'date' },
  { id: 'updated', label: 'Last Updated', field: 'updated_at', type: 'date' }
];
```

### 2. Update ResultsGrid Props

```typescript
interface ResultsGridProps {
  results: {
    users: any[];
    projects: any[];
    articles: any[];
    posts: any[];
  };
  loading: boolean;
  contentTypes: string[];
  likeStatuses?: {
    posts: Record<string, boolean>;
    articles: Record<string, boolean>;
    projects: Record<string, boolean>;
  };
  followStatuses?: {
    users: Record<string, boolean>;
    articles: Record<string, boolean>;
    projects: Record<string, boolean>;
  };
  watchStatuses?: {
    posts: Record<string, boolean>;
    articles: Record<string, boolean>;
    projects: Record<string, boolean>;
  };
  interactionCounts?: {
    users: Record<string, { likes: number; follows: number; watches: number }>;
    posts: Record<string, { likes: number; follows: number; watches: number }>;
    articles: Record<string, { likes: number; follows: number; watches: number }>;
    projects: Record<string, { likes: number; follows: number; watches: number }>;
  };
  // Primary field mapping for alphabetical sorting
  primaryFields: {
    users: 'username';
    posts: 'title';
    articles: 'title';
    projects: 'project_name';
  };
  // Date fields for temporal sorting
  dateFields: {
    created: 'created_at';
    updated: 'updated_at';
  };
  sortBy?: string;
  sortOrder?: SortOrder;
}
```

### 3. Add Sort Function

```typescript
function sortResults(
  allResults: {
    users: any[];
    projects: any[];
    articles: any[];
    posts: any[];
  },
  sortBy: string,
  sortOrder: SortOrder,
  primaryFields: Record<string, string>,
  dateFields: Record<string, string>
): any[] {
  if (!sortBy) return allResults;

  // Flatten all results into a single array with type information
  const flattenedResults = [
    ...allResults.users.map(item => ({ ...item, contentType: 'users' })),
    ...allResults.projects.map(item => ({ ...item, contentType: 'projects' })),
    ...allResults.articles.map(item => ({ ...item, contentType: 'articles' })),
    ...allResults.posts.map(item => ({ ...item, contentType: 'posts' }))
  ];

  return flattenedResults.sort((a, b) => {
    let aValue, bValue;

    if (sortBy === 'alpha') {
      // Use primary fields for alphabetical sorting
      aValue = a[primaryFields[a.contentType]] || '';
      bValue = b[primaryFields[b.contentType]] || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } 
    else if (sortBy === 'created' || sortBy === 'updated') {
      // Use date fields for temporal sorting
      const dateField = dateFields[sortBy];
      aValue = a[dateField] ? new Date(a[dateField]).getTime() : 0;
      bValue = b[dateField] ? new Date(b[dateField]).getTime() : 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    else {
      // Use interaction counts or other numeric fields
      aValue = a[sortBy] || 0;
      bValue = b[sortBy] || 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });
}
```

### 4. Update ResultsGrid Component

```typescript
export default function ResultsGrid({ 
  results, 
  loading, 
  contentTypes, 
  likeStatuses,
  followStatuses,
  watchStatuses,
  interactionCounts,
  primaryFields,
  dateFields,
  sortBy,
  sortOrder = 'desc'
}: ResultsGridProps) {
  // ... existing code ...

  // Sort each content type separately
  const sortedResults = {
    users: showUsers ? sortResults(safeResults, sortBy, sortOrder, primaryFields, dateFields) : [],
    projects: showProjects ? sortResults(safeResults, sortBy, sortOrder, primaryFields, dateFields) : [],
    articles: showArticles ? sortResults(safeResults, sortBy, sortOrder, primaryFields, dateFields) : [],
    posts: showPosts ? sortResults(safeResults, sortBy, sortOrder, primaryFields, dateFields) : []
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {showUsers && sortedResults.users.map((user, index) => (
        // ... existing user card code ...
      ))}
      {showProjects && sortedResults.projects.map((project, index) => (
        <ProjectCard 
          key={`project-${project.id || index}`}
          project={project}
          userHasLiked={likeStatuses?.projects[project.id] || false}
          userIsFollowing={followStatuses?.projects[project.id] || false}
          userIsWatching={watchStatuses?.projects[project.id] || false}
          interactionCounts={{
            likes: project.likes_count || 0,
            follows: project.follows_count || 0,
            watches: project.watches_count || 0
          }}
        />
      ))}
      {/* ... other content types ... */}
    </div>
  );
}
```

### 5. Count Fields in Card Components

```typescript
interface CardInteractionProps {
  userHasLiked: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
  interactionCounts: {
    likes: number;
    follows: number;
    watches: number;
  };
}

interface ProjectCardProps extends CardInteractionProps {
  project: {
    id: string;
    project_name: string;
    likes_count: number;
    follows_count: number;
    watches_count: number;
    created_at: string;
    updated_at: string;
    // ... other fields
  };
}

interface ArticleCardProps extends CardInteractionProps {
  article: {
    id: string;
    title: string;
    likes_count: number;
    follows_count: number;
    watches_count: number;
    created_at: string;
    updated_at: string;
    // ... other fields
  };
}

// Similar for PostCard and UserCard
```

### 6. Display Interaction Counts

Add count displays next to each interaction icon:

```typescript
// In your card components
function ProjectCard({ project, userHasLiked }) {
  return (
    <div>
      {/* ... other card content ... */}
      <div className="flex items-center gap-4">
        {/* Like count */}
        <div className="flex items-center gap-1">
          <HeartIcon filled={userHasLiked} />
          <span className="text-sm text-gray-600">
            {project.likes_count || 0}
          </span>
        </div>

        {/* Follow count */}
        <div className="flex items-center gap-1">
          <FollowIcon filled={userIsFollowing} />
          <span className="text-sm text-gray-600">
            {project.follows_count || 0}
          </span>
        </div>

        {/* Watch count */}
        <div className="flex items-center gap-1">
          <WatchIcon filled={userIsWatching} />
          <span className="text-sm text-gray-600">
            {project.watches_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
```

Ensure consistent styling across all card types:

```typescript
// Common styles for interaction counts
const interactionCountClass = "flex items-center gap-1 text-sm text-gray-600";
const iconClass = "w-5 h-5"; // Consistent icon sizing

// Usage in cards
<div className={interactionCountClass}>
  <HeartIcon className={iconClass} filled={userHasLiked} />
  <span>{count}</span>
</div>
```

## Usage in Parent Components

```typescript
// In MyStuff, Portfolio, or Explore pages
const [sortBy, setSortBy] = useState<string>('');
const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

return (
  <>
    {/* Existing filters */}
    
    {/* Add sort controls */}
    <div className="flex gap-4 mb-4">
      <select 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Sort by...</option>
        {sortOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      
      <button
        onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
        className="border rounded p-2"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>

    <ResultsGrid
      results={results}
      loading={loading}
      contentTypes={selectedContentTypes}
      likeStatuses={likeStatuses}
      followStatuses={followStatuses}
      watchStatuses={watchStatuses}
      interactionCounts={interactionCounts}
      primaryFields={{
        users: 'username',
        posts: 'title',
        articles: 'title',
        projects: 'project_name'
      }}
      dateFields={{
        created: 'created_at',
        updated: 'updated_at'
      }}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  </>
);
```

## Key Considerations

1. **Field Name Mapping**
   - Different content types use different field names for titles
   - Count fields should be consistent across content types
   - Handle missing count values gracefully (default to 0)

2. **Performance**
   - Sort happens after filtering
   - Sort is performed on each content type separately
   - Results are only sorted when needed

3. **Type Safety**
   - Define proper interfaces for all props
   - Use TypeScript to catch potential errors
   - Handle edge cases with null checks

4. **Maintainability**
   - Sort logic is isolated in a separate function
   - Easy to add new sort options
   - Consistent across all pages using ResultsGrid

5. **Cross-Content-Type Sorting**
   - Alphabetical sorting uses primary fields specific to each content type
   - Date sorting works consistently across all content types
   - Results are flattened and sorted together for consistent ordering
   - Content type information is preserved for rendering

## Testing Checklist

- [ ] Test alphabetical sorting for each content type
- [ ] Verify count-based sorting works correctly
- [ ] Check ascending and descending orders
- [ ] Test with empty/null count values
- [ ] Verify sorting works with filtered results
- [ ] Test performance with large result sets
- [ ] Check sort persists through pagination
- [ ] Verify sort works independently of other filters
- [ ] Test alphabetical sorting across all content types simultaneously
- [ ] Verify date sorting works consistently across content types
- [ ] Check primary field mapping for each content type
- [ ] Test sorting with mixed content types selected
- [ ] Verify all interaction counts display correctly
- [ ] Check count formatting (thousands separator, etc.)
- [ ] Test count updates after interactions
- [ ] Verify count display on mobile layouts
- [ ] Verify cards receive and display all interaction props
- [ ] Check interaction counts update when sorting changes
- [ ] Test interaction status updates reflect in sorting
- [ ] Verify card props match sorted order

## Common Issues and Solutions

### 1. Missing Count Fields
**Issue**: Some content items don't have count fields
**Solution**: Use nullish coalescing in sort function
```typescript
aValue = a[sortOption.field] ?? 0;
```

### 2. Inconsistent Field Names
**Issue**: Different content types use different field names
**Solution**: Use content type-specific field mapping
```typescript
const fieldMap = {
  users: { 
    title: 'username',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  projects: { 
    title: 'project_name',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  articles: { 
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  posts: { 
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  }
};
```

### 3. Sort Performance
**Issue**: Sorting large datasets is slow
**Solution**: Consider implementing server-side sorting
```typescript
// Add sort params to API calls
const params = new URLSearchParams({
  sortBy: sortOption.field,
  sortOrder: order
});
```

### 4. Date Format Consistency
**Issue**: Inconsistent date formats from different sources
**Solution**: Normalize dates before comparison
```typescript
const normalizeDate = (dateStr: string) => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 0 : date.getTime();
};

// Use in sort function
case 'date':
  const dateA = normalizeDate(aValue);
  const dateB = normalizeDate(bValue);
  return sortOrder === 'asc' 
    ? dateA - dateB
    : dateB - dateA;
```

### 5. Timezone Considerations
**Issue**: Dates may be stored in different timezones
**Solution**: Convert to UTC before comparison
```typescript
const toUTC = (dateStr: string) => {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  return date.getTime() - (date.getTimezoneOffset() * 60000);
};
```

### 6. Count Display Formatting
**Issue**: Large numbers need formatting
**Solution**: Add a format utility
```typescript
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Usage in components
<span className="text-sm text-gray-600">
  {formatCount(project.likes_count)}
</span>
```

### 7. Card Props Synchronization
**Issue**: Card interaction states don't match sorted order
**Solution**: Ensure all interaction props are passed and updated:
```typescript
// In ResultsGrid
const getInteractionProps = (item: any, type: string) => ({
  userHasLiked: likeStatuses?.[type][item.id] || false,
  userIsFollowing: followStatuses?.[type][item.id] || false,
  userIsWatching: watchStatuses?.[type][item.id] || false,
  interactionCounts: {
    likes: item.likes_count || 0,
    follows: item.follows_count || 0,
    watches: item.watches_count || 0
  }
});

// Usage
<ProjectCard 
  project={project}
  {...getInteractionProps(project, 'projects')}
/>
```

## Database Schema Reference

Our content tables have consistent count fields and timestamps:

```prisma
// Common fields across content tables
model BaseContentFields {
  likes_count    Int      @default(0)
  follows_count  Int      @default(0)
  watches_count  Int      @default(0)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
}

// Example content table structure
model posts {
  id            String   @id @default(uuid())
  title         String
  likes_count   Int      @default(0)
  follows_count Int      @default(0)
  watches_count Int      @default(0)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
}
```

These fields are consistently named across our content tables (posts, articles, projects), making our sorting implementation more straightforward.

### Field Name Consistency

```typescript
// Update field mapping to match our schema
const fieldMap = {
  users: { 
    title: 'username',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  projects: { 
    title: 'project_name',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  articles: { 
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  posts: { 
    title: 'title',
    likes_count: 'likes_count',
    follows_count: 'follows_count',
    watches_count: 'watches_count',
    created_at: 'created_at',
    updated_at: 'updated_at'
  }
};
```

Update the sort function to use this mapping:

```typescript
function sortResults(
  results: any[], 
  sortBy: string, 
  sortOrder: SortOrder,
  contentType: string
): any[] {
  if (!sortBy) return results;

  const sortOption = sortOptions.find(opt => opt.id === sortBy);
  if (!sortOption) return results;

  const mapping = fieldMap[contentType as keyof typeof fieldMap];
  if (!mapping) return results;

  return [...results].sort((a, b) => {
    // Use mapped field names
    const field = sortBy === 'alpha' ? mapping.title : mapping[sortOption.field];
    let aValue = a[field];
    let bValue = b[field];

    // Handle different types of sorting
    switch (sortOption.type) {
      case 'string':
        return sortOrder === 'asc' 
          ? (aValue || '').localeCompare(bValue || '')
          : (bValue || '').localeCompare(aValue || '');
      case 'number':
        return sortOrder === 'asc' 
          ? (aValue || 0) - (bValue || 0)
          : (bValue || 0) - (aValue || 0);
      case 'date':
        const dateA = aValue ? new Date(aValue).getTime() : 0;
        const dateB = bValue ? new Date(bValue).getTime() : 0;
        return sortOrder === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      default:
        return 0;
    }
  });
}
```

This implementation provides a flexible, maintainable sorting solution that works across all pages using the ResultsGrid component while maintaining independence from existing filters and functionality. 