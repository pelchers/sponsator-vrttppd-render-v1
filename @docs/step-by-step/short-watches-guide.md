# Short Guide: Implementing Watches Functionality

This guide outlines the steps to implement a universal watches functionality across different content types in our application, using a component-based approach that can be reused throughout the site.

## 1. Frontend Components

### A. Watch Button Component
Create `client/src/components/buttons/WatchButton.tsx`:
- Implement a reusable button component for watching content
- Handle watch/unwatch toggle functionality
- Display current watch count (optional)
- Support different visual styles for cards vs. full content pages

### B. Watch Icon Component
Create `client/src/components/icons/WatchIcon.tsx`:
- Create a simple watch icon component (e.g., eye)
- Support filled and outline states

### C. Card Components with Watch Functionality
Update card components to include watch functionality:
- `client/src/components/cards/ProjectCard.tsx` (for watching projects)
- `client/src/components/cards/ArticleCard.tsx` (for watching articles)

Each card component should:
- Initialize watch state from props or API
- Fetch current watch status on mount
- Handle watch/unwatch toggle
- Display appropriate button state

### D. Batch Status Hooks
Update `client/src/hooks/batchHooks.ts`:
- Implement specific hooks for batch operations:
  - `useBatchWatchStatus` - Check watch status for multiple entities
- Each hook handles its specific entity type and status check
- Useful for list views with many items

## 2. API Services

Create `client/src/api/watches.ts`:
- `watchEntity(entityType, entityId)` - Watch any content type
  - Check if already watching before attempting to watch
  - If already watching, unwatch instead (toggle behavior)
  - Handle 409 Conflict errors gracefully
- `unwatchEntity(entityType, entityId)` - Unwatch any content type
- `checkWatchStatus(entityType, entityId)` - Check if current user is watching content
- `getWatchCount(entityType, entityId)` - Get the watch count for content
- `getUserWatchesCount(entityType)` - Get the count of entities of a specific type that the current user is watching

## 3. Component-API Interaction Flow

### State Management and API Interaction
The card components manage their own internal state and interact with the API:

1. **Initial State**: 
   - Initialize with `userIsWatching` prop if available
   - Fetch current watch status on component mount
   - Update state with accurate data from API

2. **User Interaction**: When a user clicks the watch button:
   - Prevent default behavior and event bubbling
   - Set loading state to prevent multiple clicks
   - Call appropriate API function based on current state
   - Update UI state after API response

3. **API Response Handling**:
   - If the API call succeeds, update the state accordingly
   - If the API returns 409 (already watching), set watching state to true
   - Handle errors gracefully with appropriate UI feedback
   - Reset loading state when complete

This approach provides accurate feedback to users while ensuring data consistency with the backend.

### Batch Operations for Lists
For list views with multiple items:
1. The parent component uses `useBatchWatchStatus` to fetch watch status for all items at once
2. It passes the appropriate status to each card component
3. Each component then manages its own state and API interactions

## 4. Backend Implementation

### A. Prisma Schema
Create or update the watches model:
```prisma
model watches {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "project", "article"
  entity_id   String   // The ID of the item being watched

  created_at  DateTime @default(now())

  // The user performing the "watch"
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("watches")
}
```

### B. Controller
Create `server/src/controllers/watchController.ts`:
- `createWatch` - Handle watch creation
- `deleteWatch` - Handle watch removal
- `getWatchStatus` - Check if a user is watching content
- `getWatchCount` - Get watch count for content
- `getUserWatchesCount` - Get count of entities a user is watching by type

### C. Service
Create `server/src/services/watchService.ts`:
- Business logic for watch operations
- Database interactions via Prisma
- Entity-specific watch count updates using the correct field names:
  - `projects.watches_count` for projects
  - `articles.watches_count` for articles
- Proper error handling and logging
- Functions to get counts of entities a user is watching:
  ```typescript
  // Get count of entities a user is watching by type
  export const getUserWatchesCount = async (userId: string, entityType: string) => {
    const count = await prisma.watches.count({
      where: {
        user_id: userId,
        entity_type: entityType
      }
    });
    return count;
  };
  ```

### D. Routes
Create `server/src/routes/watchRoutes.ts`:
- Define API endpoints for watch operations
- Apply authentication middleware
- Add endpoint for getting user watches count:
  ```typescript
  // Get count of entities a user is watching by type
  router.get('/user-count', authenticate, watchController.getUserWatchesCount);
  ```

## 5. Key Implementation Details

### A. Correct Field Names
- Use `watches_count` for projects and articles
- Update console logs to reference the correct field names

### B. Prevent Duplicate Watches
- Check if user is already watching content before creating a new watch
- In the frontend, check watch status before attempting to watch
- If already watching, toggle to unwatch instead
- Handle 409 Conflict errors gracefully

### C. Accurate Watch Counts
- Fetch current watch count on component mount
- Update UI with accurate count from API
- Handle edge cases (e.g., count below 0)

### D. Error Handling
- Proper error handling in API services
- Graceful UI updates on error
- Prevent UI from getting out of sync with backend

### E. Loading States
- Prevent multiple clicks during API calls
- Visual feedback during loading

## 6. User Watches Page

Create `client/src/pages/watches/Watches.tsx`:
- Display all content watched by the current user
- Filter by content type (projects, articles)
- Fetch watched content using API
- Handle empty states and loading
- Support pagination
- Show counts of different entity types the user is watching

## 7. API Service for User Watches

Update `client/src/api/userContent.ts`:
- `fetchUserWatches` - Fetch all content watched by the current user
- Support filtering by content type
- Support pagination
- Handle errors gracefully
- Include counts of different entity types:
  ```typescript
  // Example response structure
  {
    results: {
      projects: [...],
      articles: [...]
    },
    counts: {
      projects: 7,
      articles: 15
    },
    totalPages: 2
  }
  ```

## 8. Implementation Steps

1. Create the backend components (controller, service, routes)
2. Create the API service
3. Develop the frontend components (WatchButton, WatchIcon)
4. Create the batch watch status hook
5. Integrate watch functionality into content components
6. Create the user watches page
7. Test the functionality across different content types

## 9. Key Considerations

### Entity Type Standardization
Use consistent entity type strings across the application:
- "project" for projects
- "article" for articles

### Authentication Handling
- All watch/unwatch operations require authentication
- Status check requires authentication
- Count check is public

### Error Handling
Implement proper error handling:
- Log detailed errors for debugging
- Prevent duplicate requests
- Handle network failures gracefully
- Handle 409 Conflict errors appropriately

## 10. Potential Issues and Solutions

### Race Conditions
If a user clicks watch button multiple times quickly:
- Disable button during API call
- Track request state to prevent duplicate calls

### Stale Data
If watch count gets out of sync with actual watches:
- Fetch current count on component mount
- Use API to get accurate count
- Handle errors gracefully

### Performance Considerations
For content with many watches:
- Use batch status checking for lists
- Implement pagination for large lists
- Handle empty states appropriately

## 11. Watch Notifications (Future Enhancement)

A key feature of watches is to notify users of updates:
- When a watched project is updated
- When a watched article is updated
- Allow users to configure notification preferences
- Implement notification delivery (email, in-app)

This implementation approach creates a flexible, reusable watch system that works consistently across all content types in the application. 