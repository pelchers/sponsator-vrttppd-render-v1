# Explore Page Grid and List View Implementation Guide

## Overview

This guide documents how to implement a view toggle feature for the Explore page that allows users to switch between:

1. **Grid View** - The current card-based layout
2. **List View** - A new list-based layout showing the same content

The implementation uses conditional rendering within existing components rather than duplicating components, maintaining all existing functionality while adding display flexibility.

## Implementation Approach

We'll use a conditional rendering approach that:
- Adds a view mode toggle to the Explore page
- Modifies the ResultsGrid component to support both display modes
- Updates card components to render differently based on view mode
- Preserves all existing functionality (filtering, sorting, interactions)

## Key Benefits

1. **No Code Duplication** - Reuses existing components with conditional styling
2. **Single Source of Truth** - Maintains one implementation for core functionality
3. **Consistent Data Flow** - Uses the same data pipeline for both views
4. **Easier Maintenance** - Changes to functionality only need to be made once

## Implementation Steps

### 1. Add View Mode State to Explore Page

```typescript
// In client/src/pages/explore/Explore.tsx

// Add view mode state
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

// Add toggle function
const toggleViewMode = () => {
  setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
};

// Add toggle UI near the filters
<div className="flex justify-end mb-4">
  <div className="inline-flex rounded-md shadow-sm" role="group">
    <button
      type="button"
      onClick={() => setViewMode('grid')}
      className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
        viewMode === 'grid'
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      }`}
      aria-current={viewMode === 'grid' ? 'page' : undefined}
    >
      <GridIcon className="w-5 h-5" />
    </button>
    <button
      type="button"
      onClick={() => setViewMode('list')}
      className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
        viewMode === 'list'
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
      }`}
      aria-current={viewMode === 'list' ? 'page' : undefined}
    >
      <ListIcon className="w-5 h-5" />
    </button>
  </div>
</div>

// Pass viewMode to ResultsGrid
<ResultsGrid 
  results={results} 
  loading={loading} 
  contentTypes={selectedContentTypes}
  likeStatuses={{
    articles: articleLikeStatuses,
    projects: projectLikeStatuses,
    posts: postLikeStatuses
  }}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={handleSortChange}
  onSortOrderChange={handleSortOrderChange}
  viewMode={viewMode} // Add this prop
/>
```

### 2. Update ResultsGrid Component

```typescript
// In client/src/components/results/ResultsGrid.tsx

// Update interface
interface ResultsGridProps {
  // ... existing props
  viewMode?: 'grid' | 'list';
}

// Default to grid view if not specified
const ResultsGrid = ({ 
  results, 
  loading, 
  contentTypes,
  likeStatuses,
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  viewMode = 'grid' // Default to grid
}: ResultsGridProps) => {
  
  // ... existing code

  return (
    <div className="space-y-6">
      {/* Sorting controls */}
      <div className="flex justify-between items-center">
        {/* ... existing sorting controls ... */}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* ... loading skeletons ... */}
        </div>
      )}

      {/* Results container - conditional classes based on viewMode */}
      {!loading && (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" 
          : "flex flex-col space-y-4"
        }>
          {/* Users */}
          {showUsers && sortedResults.users.map((user, index) => (
            <UserCard 
              key={`user-${user.id || index}`} 
              user={user} 
              viewMode={viewMode} // Pass viewMode to card
            />
          ))}

          {/* Projects */}
          {showProjects && sortedResults.projects.map((project, index) => (
            <ProjectCard 
              key={`project-${project.id || index}`} 
              project={project}
              viewMode={viewMode} // Pass viewMode to card
            />
          ))}

          {/* Articles */}
          {showArticles && sortedResults.articles.map((article, index) => (
            <ArticleCard 
              key={`article-${article.id || index}`} 
              article={article}
              viewMode={viewMode} // Pass viewMode to card
            />
          ))}

          {/* Posts */}
          {showPosts && sortedResults.posts.map((post, index) => (
            <PostCard 
              key={`post-${post.id || index}`} 
              post={post}
              viewMode={viewMode} // Pass viewMode to card
            />
          ))}
        </div>
      )}

      {/* No results message */}
      {!loading && totalResults === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found</p>
        </div>
      )}
    </div>
  );
};
```

### 3. Update Card Components

#### Conditional Rendering Pattern

When updating card components, we'll use a consistent pattern:

1. Add the `viewMode` prop to the component interface
2. Create an `isList` boolean variable for readability
3. Wrap existing grid layout with `{!isList && (...)}` 
4. Add list layout with `{isList && (...)}` right below it
5. Share common elements between both layouts when possible

This approach allows us to:
- Keep the existing grid layout code mostly untouched
- Add the list layout as a conditional alternative
- Maintain all functionality in both views
- Easily toggle between views without duplicating logic

#### UserCard Example

```typescript
// In client/src/components/cards/UserCard.tsx

interface UserCardProps {
  user: {
    // ... existing user props
  };
  variant?: string;
  viewMode?: 'grid' | 'list'; // Add viewMode prop
}

const UserCard = ({ user, variant = 'default', viewMode = 'grid' }: UserCardProps) => {
  // Determine if we're in list or grid mode
  const isList = viewMode === 'list';
  
  return (
    <>
      {/* GRID VIEW - Existing layout wrapped in conditional */}
      {!isList && (
        <div className={`flex flex-col bg-white rounded-lg shadow hover:shadow-md transition-shadow ${variant === 'white' ? 'bg-white' : ''}`}>
          {/* Existing grid layout code */}
          <div className="w-full">
            <div className="aspect-square w-full">
              <UserImage 
                user={user}
                className="w-full h-full aspect-square rounded-t-lg object-cover"
                fallback={<DefaultAvatar className="w-full h-full" />}
              />
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg">
              <Link to={`/profile/${user.username}`} className="hover:text-blue-600">
                {user.username}
              </Link>
            </h3>
            <p className="text-gray-600 text-sm">{user.career_title}</p>
            
            <p className="text-gray-600 mt-2 line-clamp-3">
              {user.bio}
            </p>
            
            {user.skills && user.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {user.skills.slice(0, 5).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {user.skills.length > 5 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                    +{user.skills.length - 5}
                  </span>
                )}
              </div>
            )}
            
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>❤️ {user.likes_count || 0}</span>
              <span>👥 {user.follows_count || 0}</span>
              <span>👁️ {user.watches_count || 0}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* LIST VIEW - New horizontal layout */}
      {isList && (
        <div className={`flex flex-row items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow ${variant === 'white' ? 'bg-white' : ''}`}>
          {/* Left side - Image */}
          <div className="mr-4 flex-shrink-0">
            <div className="w-16 h-16">
              <UserImage 
                user={user}
                className="w-16 h-16 rounded-full object-cover"
                fallback={<DefaultAvatar className="w-16 h-16" />}
              />
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  <Link to={`/profile/${user.username}`} className="hover:text-blue-600">
                    {user.username}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm">{user.career_title}</p>
              </div>
              
              <div className="flex space-x-3 text-sm text-gray-500">
                <span>❤️ {user.likes_count || 0}</span>
                <span>👥 {user.follows_count || 0}</span>
                <span>👁️ {user.watches_count || 0}</span>
              </div>
            </div>
            
            <p className="text-gray-600 mt-2 line-clamp-1">
              {user.bio}
            </p>
            
            {user.skills && user.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {user.skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                    +{user.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
```

#### ProjectCard Example (Similar Pattern)

```typescript
// In client/src/components/cards/ProjectCard.tsx

interface ProjectCardProps {
  project: {
    // ... existing project props
  };
  variant?: string;
  viewMode?: 'grid' | 'list'; // Add viewMode prop
}

const ProjectCard = ({ project, variant = 'default', viewMode = 'grid' }: ProjectCardProps) => {
  const isList = viewMode === 'list';
  
  return (
    <>
      {/* GRID VIEW - Existing layout */}
      {!isList && (
        <div className="existing-grid-layout-classes">
          {/* Existing grid layout code */}
        </div>
      )}
      
      {/* LIST VIEW - New horizontal layout */}
      {isList && (
        <div className="list-layout-classes">
          {/* List layout code */}
        </div>
      )}
    </>
  );
};
```

### 4. Create Icon Components

```typescript
// In client/src/components/icons/GridIcon.tsx
export const GridIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
    />
  </svg>
);

// In client/src/components/icons/ListIcon.tsx
export const ListIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 6h16M4 12h16M4 18h16" 
    />
  </svg>
);
```

## List View Design Guidelines

When implementing list view for each card type, follow these guidelines:

### 1. Layout Structure
- Use `flex flex-row` for horizontal layout
- Place image/thumbnail on the left
- Place content on the right
- Use appropriate spacing between elements

### 2. Content Prioritization
- Show less content in list view
- Truncate descriptions more aggressively
- Show fewer tags/skills
- Prioritize the most important information

### 3. Image Sizing
- Use smaller, fixed-size images in list view
- Maintain aspect ratio appropriate to content type
- Use consistent image sizes across all card types

### 4. Responsive Considerations
- List view should stack on mobile
- Consider horizontal scrolling for tags on mobile
- Ensure touch targets remain accessible

## Testing Checklist

1. **Functionality**
   - [ ] Toggle switches correctly between grid and list views
   - [ ] All content types display properly in both views
   - [ ] Sorting works in both views
   - [ ] Filtering works in both views
   - [ ] Pagination works in both views

2. **Visual Consistency**
   - [ ] Cards maintain consistent styling in both views
   - [ ] Images display properly in both views
   - [ ] Text is readable in both views
   - [ ] Interactive elements are accessible in both views

3. **Responsive Behavior**
   - [ ] Both views work on mobile devices
   - [ ] Both views work on tablets
   - [ ] Both views work on desktop
   - [ ] Transitions between views are smooth

4. **Edge Cases**
   - [ ] Empty states display correctly in both views
   - [ ] Loading states display correctly in both views
   - [ ] Error states display correctly in both views
   - [ ] Cards with missing data display correctly in both views

## Best Practices

1. **State Persistence**
   - Consider saving the user's view preference in localStorage
   - Restore the preferred view when returning to the page

2. **Performance**
   - Use React.memo for card components to prevent unnecessary re-renders
   - Consider virtualization for long lists

3. **Accessibility**
   - Ensure toggle buttons have proper aria attributes
   - Maintain sufficient contrast in both views
   - Provide keyboard navigation support

4. **Code Organization**
   - Keep view-specific logic contained in components
   - Use consistent naming conventions for view modes
   - Document conditional rendering patterns

By following this implementation approach, you'll create a flexible, maintainable view toggle system that enhances the user experience without duplicating code. 