# Short Guide: Implementing Follows Functionality

This guide outlines the steps to implement a universal follows functionality across different content types in our application, using a component-based approach that can be reused throughout the site.

## 1. Frontend Components

### A. Follow Button Component
Create `client/src/components/buttons/FollowButton.tsx`:
- Implement a reusable button component for following content
- Handle follow/unfollow toggle functionality
- Display current follow count (optional)
- Support different visual styles for cards vs. full content pages

### B. Follow Icon Component (Optional)
Create `client/src/components/icons/FollowIcon.tsx`:
- Create a simple follow icon component (e.g., bookmark or star)
- Support filled and outline states

### C. Card Components with Follow Functionality
Update card components to include follow functionality:
- `client/src/components/cards/UserCard.tsx` (for following users)
- `client/src/components/cards/ProjectCard.tsx` (for following projects)
- `client/src/components/cards/ArticleCard.tsx` (for following articles)

Each card component should:
- Initialize follow state from props or API
- Fetch current follow status on mount
- Handle follow/unfollow toggle
- Display appropriate button state

### D. Batch Status Hooks
Update `client/src/hooks/batchHooks.ts`:
- Implement specific hooks for batch operations:
  - `useBatchFollowStatus` - Check follow status for multiple entities
- Each hook handles its specific entity type and status check
- Useful for list views with many items

## 2. API Services

Create `client/src/api/follows.ts`:
- `followEntity(entityType, entityId)` - Follow any content type
  - Check if already following before attempting to follow
  - If already following, unfollow instead (toggle behavior)
  - Handle 409 Conflict errors gracefully
- `unfollowEntity(entityType, entityId)` - Unfollow any content type
- `checkFollowStatus(entityType, entityId)` - Check if current user is following content
- `getFollowCount(entityType, entityId)` - Get the follow count for content
- `getUserFollowsCount(entityType)` - Get the count of entities of a specific type that the current user follows

## 3. Component-API Interaction Flow

### State Management and API Interaction
The card components manage their own internal state and interact with the API:

1. **Initial State**: 
   - Initialize with `userIsFollowing` prop if available
   - Fetch current follow status on component mount
   - Update state with accurate data from API

2. **User Interaction**: When a user clicks the follow button:
   - Prevent default behavior and event bubbling
   - Set loading state to prevent multiple clicks
   - Call appropriate API function based on current state
   - Update UI state after API response

3. **API Response Handling**:
   - If the API call succeeds, update the state accordingly
   - If the API returns 409 (already following), set following state to true
   - Handle errors gracefully with appropriate UI feedback
   - Reset loading state when complete

This approach provides accurate feedback to users while ensuring data consistency with the backend.

### Batch Operations for Lists
For list views with multiple items:
1. The parent component uses `useBatchFollowStatus` to fetch follow status for all items at once
2. It passes the appropriate status to each card component
3. Each component then manages its own state and API interactions

## 4. Backend Implementation

### A. Prisma Schema
Create or update the follows model:
```prisma
model follows {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "user", "project", "article"
  entity_id   String   // The ID of the item being followed

  created_at  DateTime @default(now())

  // The user performing the "follow"
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("follows")
}
```

### B. Controller
Create `server/src/controllers/followController.ts`:
- `createFollow` - Handle follow creation
- `deleteFollow` - Handle follow removal
- `getFollowStatus` - Check if a user is following content
- `getFollowCount` - Get follow count for content
- `getUserFollowsCount` - Get count of entities a user is following by type

### C. Service
Create `server/src/services/followService.ts`:
- Business logic for follow operations
- Database interactions via Prisma
- Entity-specific follow count updates using the correct field names:
  - `users.followers_count` for users
  - `projects.follows_count` for projects
  - `articles.follows_count` for articles
- Proper error handling and logging
- Functions to get counts of entities a user is following:
  ```typescript
  // Get count of entities a user is following by type
  export const getUserFollowsCount = async (userId: string, entityType: string) => {
    const count = await prisma.follows.count({
      where: {
        user_id: userId,
        entity_type: entityType
      }
    });
    return count;
  };
  ```

### D. Routes
Create `server/src/routes/followRoutes.ts`:
- Define API endpoints for follow operations
- Apply authentication middleware
- Add endpoint for getting user follows count:
  ```typescript
  // Get count of entities a user is following by type
  router.get('/user-count', authenticate, followController.getUserFollowsCount);
  ```

## 5. Key Implementation Details

### A. Correct Field Names
- Use `followers_count` for users
- Use `follows_count` for projects and articles
- Update console logs to reference the correct field names

### B. Prevent Duplicate Follows
- Check if user is already following content before creating a new follow
- In the frontend, check follow status before attempting to follow
- If already following, toggle to unfollow instead
- Handle 409 Conflict errors gracefully

### C. Accurate Follow Counts
- Fetch current follow count on component mount
- Update UI with accurate count from API
- Handle edge cases (e.g., count below 0)

### D. Error Handling
- Proper error handling in API services
- Graceful UI updates on error
- Prevent UI from getting out of sync with backend

### E. Loading States
- Prevent multiple clicks during API calls
- Visual feedback during loading

## 6. User Follows Page

Create `client/src/pages/follows/Follows.tsx`:
- Display all content followed by the current user
- Filter by content type (users, projects, articles)
- Fetch followed content using API
- Handle empty states and loading
- Support pagination
- Show counts of different entity types the user is following

## 7. API Service for User Follows

Update `client/src/api/userContent.ts`:
- `fetchUserFollows` - Fetch all content followed by the current user
- Support filtering by content type
- Support pagination
- Handle errors gracefully
- Include counts of different entity types:
  ```typescript
  // Example response structure
  {
    results: {
      users: [...],
      projects: [...],
      articles: [...]
    },
    counts: {
      users: 5,
      projects: 12,
      articles: 8
    },
    totalPages: 3
  }
  ```

## 8. Implementation Steps

1. Create the backend components (controller, service, routes)
2. Create the API service
3. Develop the frontend components (FollowButton)
4. Create the batch follow status hook
5. Integrate follow functionality into content components
6. Create the user follows page
7. Test the functionality across different content types

## 9. Key Considerations

### Entity Type Standardization
Use consistent entity type strings across the application:
- "user" for users
- "project" for projects
- "article" for articles

### Authentication Handling
- All follow/unfollow operations require authentication
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
If a user clicks follow button multiple times quickly:
- Disable button during API call
- Track request state to prevent duplicate calls

### Stale Data
If follow count gets out of sync with actual follows:
- Fetch current count on component mount
- Use API to get accurate count
- Handle errors gracefully

### Performance Considerations
For content with many follows:
- Use batch status checking for lists
- Implement pagination for large lists
- Handle empty states appropriately

This implementation approach creates a flexible, reusable follow system that works consistently across all content types in the application. 