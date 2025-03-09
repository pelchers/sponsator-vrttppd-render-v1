# Short Guide: Implementing Posts Functionality

This guide outlines the steps to implement the posts functionality in our application, using a direct approach similar to what we used for articles.

## 1. Frontend Components

### A. Post Form Configuration (Not Used in Current Implementation)
~~Create `client/src/components/input/forms/config/postFormConfig.ts`:~~

**Note:** Similar to the articles feature, we won't use a separate form configuration file for posts. Instead, we'll define all form structure directly in the edit component. This simpler approach works well for the less complex post form structure.

### B. Post Form Hook (Not Used in Current Implementation)
~~Create `client/src/hooks/usePostForm.ts`:~~

**Note:** We won't use a dedicated form hook for posts. Instead, we'll manage form state directly in the component using React's useState hooks. This direct approach is more straightforward for the post form's needs.

### C. Post Form Component
Create `client/src/pages/post/editpost.tsx`:
- Implement state management directly in the component
- Handle form submission and validation
- Manage content, tags, media, etc.
- Call API functions directly
- Include a simpler form structure than articles (single content field instead of sections)

### D. Post View Component
Create `client/src/pages/post/post.tsx`:
- Fetch post data from API
- Display post content properly
- Handle media display
- Style the post for optimal readability
- Include comments section

### E. Posts List Component
Create `client/src/pages/post/postslist.tsx`:
- Fetch posts from API
- Display post list with pagination
- Implement delete functionality
- Add links to view and edit pages
- Include filtering options by tags or categories

## 2. API Services

Create `client/src/api/posts.ts`:
- `fetchPosts()` - Get all posts with pagination
- `fetchPost(id)` - Get a single post
- `createPost(data)` - Create a new post
- `updatePost(id, data)` - Update an existing post
- `deletePost(id)` - Delete a post
- `likePost(id)` - Add a like to a post
- `commentOnPost(id, comment)` - Add a comment to a post

## 3. Backend Implementation

### A. Prisma Schema
Update `server/prisma/schema.prisma` to include:
```prisma
model Post {
  id            String   @id @default(uuid())
  user_id       String
  title         String
  content       String   @db.Text
  media_url     String?
  likes         Int      @default(0)
  comments      Json?    // Store comments as JSON
  tags          String[]
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  user User @relation(fields: [user_id], references: [id])
}
```

### B. Controller
Create `server/src/controllers/postController.ts`:
- `createPost` - Handle post creation
- `updatePost` - Handle post updates
- `getPost` - Get a single post
- `getPosts` - Get all posts with pagination
- `deletePost` - Delete a post
- `likePost` - Handle post likes
- `commentOnPost` - Handle post comments

### C. Service
Create `server/src/services/postService.ts`:
- Business logic for post operations
- Data transformation between API and database

### D. Routes
Create `server/src/routes/postRoutes.ts`:
- Define API endpoints for post operations
- Apply authentication middleware

## 4. Data Flow

1. User interacts with `editpost.tsx`
2. Component manages state with useState hooks
3. On submit, component calls `api/posts.ts` directly
4. API service sends HTTP request to backend
5. Request hits `postRoutes.ts`
6. Router calls `postController.ts`
7. Controller calls `postService.ts`
8. Service interacts with database via Prisma
9. Response flows back through the same layers

## 5. Implementation Steps

1. Start with the Prisma schema update
2. Implement backend components (controller, service, routes)
3. Create the API service
4. Develop the frontend components directly (without hooks/config)
5. Test the full flow

## 6. Key Differences from Articles

1. **Simpler Structure**: Posts have a single content field rather than multiple sections
2. **Social Features**: Posts include likes and comments as core functionality
3. **Media Handling**: Posts typically have a single media attachment rather than multiple media sections
4. **Faster Creation**: The post form is designed for quick creation rather than detailed editing
5. **Timeline Display**: Posts are typically displayed in a timeline/feed format in the list view

## 7. Implementation Notes

### Post Content Handling
Unlike articles with their structured sections, posts will use a simpler content approach:
- Single rich text field for content
- Optional media URL field for attaching an image or video
- Tags for categorization

### Media URL Approach
Similar to articles, we'll use a URL-based approach for media:
- Users provide a URL to an image or video
- We'll use placeholder.com for missing or failed images
- No file upload functionality in the initial implementation

### Comments Implementation
Comments will be stored as JSON in the database:
```json
[
  {
    "id": "comment-uuid",
    "user_id": "user-uuid",
    "username": "JohnDoe",
    "content": "Great post!",
    "created_at": "2023-06-15T10:30:00Z"
  }
]
```

### Likes Implementation
Likes will be stored as a simple counter in the database, with the option to expand to a more complex implementation later if needed.

## 8. Potential Issues and Solutions

### API URL Configuration
Ensure API_URL is properly defined and used in all API calls, with a fallback value:

```typescript
// Add fallback value for API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Use absolute URL in all API calls
const response = await axios.post(`${API_URL}/posts`, data, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Authentication Middleware
Make sure to use the correct middleware name in the routes:

```typescript
// Correct
import { authenticate } from '../middlewares/auth';
router.post('/', authenticate, postController.createPost);
```

### Router Configuration
Update the router configuration to include all post routes:

```typescript
// Add post routes to the router
{
  path: '/post',
  element: <Layout><PostsPage /></Layout>,
},
{
  path: '/post/:id',
  element: <Layout><PostViewPage /></Layout>,
},
{
  path: '/post/edit/new',
  element: <Layout><PostEditPage /></Layout>,
},
{
  path: '/post/edit/:id',
  element: <Layout><PostEditPage /></Layout>,
}
```

Note: The order of routes is important. Place more specific routes (like `/post/edit/new`) before more general routes (like `/post/:id`).

## 9. Future Enhancements

1. **Rich Text Editor**: Add a WYSIWYG editor for post content
2. **File Uploads**: Add direct file upload functionality using the ImageUpload component from ProfileEditForm
3. **User Tagging**: Allow tagging other users in posts
4. **Advanced Comments**: Implement nested comments and comment likes
5. **Post Analytics**: Track views, engagement, and other metrics

This implementation approach balances simplicity with functionality, making it easy to get started while leaving room for future enhancements. 