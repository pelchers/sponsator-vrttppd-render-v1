# Short Guide: Implementing Likes Functionality (Updated)

This guide outlines the steps to implement a universal likes functionality across different content types in our application, with recent fixes and improvements.

## 1. Frontend Components

### A. Like Button Component
Create `client/src/components/buttons/LikeButton.tsx`:
- Implement a reusable button component for liking content
- Handle like/unlike toggle functionality
- Display current like count
- Support different visual styles for cards vs. full content pages

### B. Heart Icon Component
Create `client/src/components/icons/HeartIcon.tsx`:
- Create a simple heart icon component
- Support filled and outline states

### C. Card Components with Like Functionality
Update card components to include like functionality:
- `client/src/components/cards/PostCard.tsx`
- `client/src/components/cards/ArticleCard.tsx`
- `client/src/components/cards/ProjectCard.tsx`

Each card component should:
- Initialize like state from props or API
- Fetch current like count and status on mount
- Handle like/unlike toggle
- Display current like count
- Show appropriate heart icon state

### D. Batch Status Hooks
Create `client/src/hooks/batchHooks.ts`:
- Implement specific hooks for batch operations:
  - `useBatchLikeStatus` - Check like status for multiple entities
- Each hook handles its specific entity type and status check
- Useful for list views with many items

## 2. API Services

Create `client/src/api/likes.ts`:
- `likeEntity(entityType, entityId)` - Add a like to any content type
  - Check if already liked before attempting to like
  - If already liked, unlike instead (toggle behavior)
  - Handle 409 Conflict errors gracefully
- `unlikeEntity(entityType, entityId)` - Remove a like from any content type
- `checkLikeStatus(entityType, entityId)` - Check if current user has liked content
- `getLikeCount(entityType, entityId)` - Get the like count for content

## 3. Component-API Interaction Flow

### State Management and API Interaction
The card components manage their own internal state and interact with the API:

1. **Initial State**: 
   - Initialize with `userHasLiked` prop if available
   - Fetch current like count and status on component mount
   - Update state with accurate data from API

2. **User Interaction**: When a user clicks the like button:
   - Prevent default behavior and event bubbling
   - Set loading state to prevent multiple clicks
   - Call appropriate API function based on current state
   - Update UI state after API response

3. **API Response Handling**:
   - If the API call succeeds, update the state accordingly
   - If the API returns 409 (already liked), set liked state to true
   - Handle errors gracefully with appropriate UI feedback
   - Reset loading state when complete

This approach provides accurate feedback to users while ensuring data consistency with the backend.

### Batch Operations for Lists
For list views with multiple items:
1. The parent component uses `useBatchLikeStatus` to fetch like status for all items at once
2. It passes the appropriate status to each card component
3. Each component then manages its own state and API interactions

## 4. Backend Implementation

### A. Prisma Schema
The schema includes a likes model:
```prisma
model likes {
  id          String   @id @default(uuid())
  user_id     String
  entity_type String   // e.g., "post", "project", "article", "comment", "user"
  entity_id   String   // The ID of the item being liked

  created_at  DateTime @default(now())

  // The user performing the "like"
  users       users?   @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("likes")
}
```

### B. Controller
Create `server/src/controllers/likeController.ts`:
- `createLike` - Handle like creation
- `deleteLike` - Handle like removal
- `getLikeStatus` - Check if a user has liked content
- `getLikeCount` - Get like count for content

### C. Service
Create `server/src/services/likeService.ts`:
- Business logic for like operations
- Database interactions via Prisma
- Entity-specific like count updates using the correct field names:
  - `posts.likes_count` (not `posts.likes`)
  - `articles.likes_count` (not `articles.likes`)
  - `projects.project_followers` (for historical reasons)
- Proper error handling and logging

### D. Routes
Create `server/src/routes/likeRoutes.ts`:
- Define API endpoints for like operations
- Apply authentication middleware

## 5. Key Fixes and Improvements

### A. Correct Field Names
- Use `likes_count` instead of `likes` for posts and articles
- Use `project_followers` for projects (for historical reasons)
- Update console logs to reference the correct field names

### B. Prevent Duplicate Likes
- Check if user has already liked content before creating a new like
- In the frontend, check like status before attempting to like
- If already liked, toggle to unlike instead
- Handle 409 Conflict errors gracefully

### C. Accurate Like Counts
- Fetch current like count on component mount
- Update UI with accurate count from API
- Handle edge cases (e.g., count below 0)

### D. Error Handling
- Proper error handling in API services
- Graceful UI updates on error
- Prevent UI from getting out of sync with backend

### E. Loading States
- Prevent multiple clicks during API calls
- Visual feedback during loading

## 6. User Likes Page

Create `client/src/pages/likes/Likes.tsx`:
- Display all content liked by the current user
- Filter by content type (posts, articles, projects)
- Fetch liked content using API
- Handle empty states and loading
- Support pagination

## 7. API Service for User Likes

Update `client/src/api/userContent.ts`:
- `fetchUserLikes` - Fetch all content liked by the current user
- Support filtering by content type
- Support pagination
- Handle errors gracefully

## 8. Implementation Steps

1. Create the backend components (controller, service, routes)
2. Create the API service
3. Develop the frontend components (LikeButton, HeartIcon)
4. Create the batch like status hook
5. Integrate like functionality into content components
6. Create the user likes page
7. Test the functionality across different content types

## 9. Key Considerations

### Entity Type Standardization
Use consistent entity type strings across the application:
- "post" for posts
- "article" for articles
- "project" for projects
- "comment" for comments

### Authentication Handling
- All like/unlike operations require authentication
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
If a user clicks like button multiple times quickly:
- Disable button during API call
- Track request state to prevent duplicate calls

### Stale Data
If like count gets out of sync with actual likes:
- Fetch current count on component mount
- Use API to get accurate count
- Handle errors gracefully

### Performance Considerations
For content with many likes:
- Use batch status checking for lists
- Implement pagination for large lists
- Handle empty states appropriately

This implementation approach creates a flexible, reusable like system that works consistently across all content types in the application. 