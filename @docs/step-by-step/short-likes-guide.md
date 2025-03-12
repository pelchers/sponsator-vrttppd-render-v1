# Short Guide: Implementing Likes Functionality

This guide outlines the steps to implement a universal likes functionality across different content types in our application, using a component-based approach that can be reused throughout the site.

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

### C. Like Hook (Not Used in Current Implementation)
**Note:** Similar to the posts feature, we won't use a dedicated like hook for the initial implementation. Instead, we'll manage like state directly in the LikeButton and Heart Icon components using React's useState hooks. This direct approach is more straightforward for the like button's needs.

### D. Batch Status Hooks
Create `client/src/hooks/batchHooks.ts`:
- Implement specific hooks for batch operations:
  - `useBatchLikeStatus` - Check like status for multiple entities
  - (Future: `useBatchFollowStatus`, `useBatchWatchStatus`, etc.)
- Each hook handles its specific entity type and status check
- Useful for list views with many items

## 2. API Services

Create `client/src/api/likes.ts`:
- `likeEntity(entityType, entityId)` - Add a like to any content type
- `unlikeEntity(entityType, entityId)` - Remove a like from any content type
- `checkLikeStatus(entityType, entityId)` - Check if current user has liked content
- `getLikeCount(entityType, entityId)` - Get the like count for content

## 3. Component-API Interaction Flow

### State Management and API Interaction
The LikeButton component manages its own internal state and interacts with the API:

1. **Initial State**: The button initializes with `initialLiked` and `initialLikeCount` props
2. **User Interaction**: When a user clicks the button:
   - The component immediately updates its internal state (optimistic update)
   - It changes the heart icon appearance and updates the count
   - It then calls the API service to persist the change
3. **API Response Handling**:
   - If the API call succeeds, the state remains updated
   - If the API call fails, the component reverts to its previous state
   - Loading state prevents multiple clicks during API calls

This approach provides immediate feedback to users while ensuring data consistency with the backend.

### Batch Operations for Lists
For list views with multiple items:
1. The parent component uses `useBatchLikeStatus` to fetch like status for all items at once
2. It passes the appropriate status to each LikeButton
3. Each button then manages its own state and API interactions

## 4. Backend Implementation

### A. Prisma Schema
The schema already includes a likes model:
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
- Entity-specific like count updates

### D. Routes
Create `server/src/routes/likeRoutes.ts`:
- Define API endpoints for like operations
- Apply authentication middleware

### E. Update Main Router
Update `server/src/routes/index.ts` to include like routes

## 5. Integration with Content Components

### A. Post Component Integration
Update `client/src/pages/post/post.tsx`:
- Add like button to post detail page
- Check if user has liked the post
- Display current like count

### B. Post Card Integration
Update `client/src/components/cards/PostCard.tsx`:
- Add like button to post card
- Pass like status from parent component
- Display current like count

### C. Article Component Integration
Update `client/src/pages/article/article.tsx`:
- Add like button to article detail page
- Check if user has liked the article
- Display current like count

### D. Project Component Integration
Update `client/src/pages/project/project.tsx`:
- Add like button to project detail page
- Check if user has liked the project
- Display current like count

## 6. Integration with List Components

Update list components to use batch like status checking:
- `client/src/pages/post/postslist.tsx`
- `client/src/pages/article/articleslist.tsx`
- `client/src/pages/project/projectslist.tsx`

## 7. Data Flow

1. User clicks like button on any content
2. LikeButton component calls `handleLikeToggle`
3. Function makes optimistic UI update (changes icon and count)
4. Function calls `likeEntity` or `unlikeEntity` from API service
5. API service sends HTTP request to backend
6. Request hits `likeRoutes.ts`
7. Router calls appropriate controller method
8. Controller calls service methods
9. Service interacts with database via Prisma
10. Service updates like count on the entity
11. Response flows back through the layers
12. If error occurs, UI reverts optimistic update

## 8. Implementation Steps

1. Create the backend components (controller, service, routes)
2. Create the API service
3. Develop the frontend components (LikeButton, HeartIcon)
4. Create the batch like status hook
5. Integrate like functionality into content components
6. Test the functionality across different content types

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

### Optimistic Updates
Implement optimistic UI updates for better user experience:
- Update UI immediately on like/unlike
- Revert if API call fails
- Show loading state during API call

### Error Handling
Implement proper error handling:
- Log detailed errors for debugging
- Prevent duplicate requests
- Handle network failures gracefully

## 10. Potential Issues and Solutions

### Race Conditions
If a user clicks like button multiple times quickly:
- Disable button during API call
- Track request state to prevent duplicate calls

### Stale Data
If like count gets out of sync with actual likes:
- Implement periodic refresh of like counts
- Use optimistic updates to reduce perceived latency

### Performance Considerations
For content with many likes:
- Use batch status checking for lists
- Cache like counts
- Implement pagination for large lists

## 11. Future Enhancements

1. **Like Animations**: Add animations when liking/unliking content
2. **Like Lists**: Show who liked the content
3. **Notification System**: Notify users when their content is liked
4. **Analytics**: Track like patterns and popular content
5. **Like Categories**: Allow different reaction types (love, laugh, etc.)

This implementation approach creates a flexible, reusable like system that works consistently across all content types in the application.

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

When a user likes content:
1. A record is added to the `likes` table
2. The count field on the specific entity is incremented

When a user unlikes content:
1. The record is deleted from the `likes` table
2. The count field is decremented

For the Likes page, we query the `likes` table to find all content a user has liked, then join with the respective content tables to get the full details.

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
