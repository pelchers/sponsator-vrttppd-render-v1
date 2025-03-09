# Short Guide: Implementing Articles Functionality

This guide outlines the steps to implement the articles functionality in our application, following the same pattern we used for projects.

## 1. Frontend Components

### A. Article Form Configuration
Create `client/src/components/input/forms/config/articleFormConfig.ts`:
- Define section types (full-width-text, full-width-media, etc.)
- Define default form state
- Define validation rules

### B. Article Form Hook
Create `client/src/hooks/useArticleForm.ts`:
- Manage form state
- Handle form submission
- Transform data between frontend and backend formats
- Handle file uploads for media

### C. Article Form Component
Update `client/src/pages/article/editarticle.tsx`:
- Use the hook for state management
- Implement proper form validation
- Handle media uploads
- Fix Next.js imports (Image, Link)

### D. Article View Component
Update `client/src/pages/article/article.tsx`:
- Fix Next.js imports
- Fetch article data from API
- Display article sections properly

### E. Articles List Component
Update `client/src/pages/article/articleslist.tsx`:
- Fix Next.js imports
- Fetch articles from API
- Add pagination and filtering

## 2. API Services

Create `client/src/api/articles.ts`:
- `fetchArticles()` - Get all articles with pagination
- `fetchArticle(id)` - Get a single article
- `createArticle(data)` - Create a new article
- `updateArticle(id, data)` - Update an existing article
- `deleteArticle(id)` - Delete an article
- `uploadArticleMedia(id, file)` - Upload media for an article

## 3. Backend Implementation

### A. Prisma Schema
Update `server/prisma/schema.prisma` to include:
```prisma
model Article {
  id            String   @id @default(uuid())
  user_id       String
  title         String
  sections      Json     // Store sections as JSON
  citations     String[]
  contributors  String[]
  related_media String[]
  tags          String[]
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  user User @relation(fields: [user_id], references: [id])
}
```

### B. Controller
Create `server/src/controllers/articleController.ts`:
- `createArticle` - Handle article creation
- `updateArticle` - Handle article updates
- `getArticle` - Get a single article
- `getArticles` - Get all articles with pagination
- `deleteArticle` - Delete an article
- `uploadArticleMedia` - Handle media uploads

### C. Service
Create `server/src/services/articleService.ts`:
- Business logic for article operations
- Data transformation between API and database

### D. Routes
Create `server/src/routes/articleRoutes.ts`:
- Define API endpoints for article operations
- Apply authentication middleware

## 4. Data Flow

1. User interacts with `editarticle.tsx`
2. Form uses `useArticleForm.ts` hook
3. On submit, hook calls `api/articles.ts`
4. API service sends HTTP request to backend
5. Request hits `articleRoutes.ts`
6. Router calls `articleController.ts`
7. Controller calls `articleService.ts`
8. Service interacts with database via Prisma
9. Response flows back through the same layers

## 5. Implementation Steps

1. Start with the Prisma schema update
2. Implement backend components (controller, service, routes)
3. Create the API service
4. Develop the form hook
5. Update the frontend components
6. Test the full flow

## 6. Lessons from Project Implementation

1. **Data Transformation**: Ensure proper transformation between frontend and backend formats
2. **Type Safety**: Use TypeScript to catch potential type mismatches
3. **Error Handling**: Add robust error handling for JSON parsing and API calls
4. **Logging**: Add detailed logging to track data flow through the system
5. **Field Mapping**: Explicitly map all fields between frontend and backend
6. **Array Handling**: Be careful with arrays, especially when they need to be stringified for storage
7. **Nested Objects**: When using nested objects in the UI, make sure they're properly flattened for the database
8. **Optional Chaining**: Use optional chaining (`?.`) when accessing potentially undefined properties
9. **Default Values**: Always provide default values for fields that might be missing

## 7. Common Issues and Solutions

During implementation, we encountered several issues that required specific fixes:

### Authentication Middleware Naming
**Issue**: Server failed to start with error `Route.post() requires a callback function but got a [object Undefined]`
**Solution**: The middleware was imported with the wrong name. Changed from `authMiddleware` to `authenticate` to match the actual export name in the auth.ts file.

```typescript
// Wrong
import { authMiddleware } from '../middlewares/auth';
router.post('/', authMiddleware, articleController.createArticle);

// Correct
import { authenticate } from '../middlewares/auth';
router.post('/', authenticate, articleController.createArticle);
```

### API URL Configuration
**Issue**: API calls were going to the wrong URL (`http://localhost:5373/article/edit/undefined/articles` instead of `http://localhost:4100/api/articles`)
**Solution**: Ensure API_URL is properly defined and used in all API calls, with a fallback value:

```typescript
// Add fallback value for API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Use absolute URL in all API calls
const response = await axios.post(`${API_URL}/articles`, data, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Missing UI Components
**Issue**: Import errors for UI components that don't exist in the project
**Solution**: Replace missing UI components with basic HTML elements:

```typescript
// Instead of importing non-existent UI components
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Use basic HTML elements
<div className="bg-white shadow rounded-lg p-4 mb-4">
  <div className="p-4">
    {/* Content here */}
  </div>
</div>

<input 
  type="text"
  className="w-full p-2 border rounded"
/>

<textarea 
  className="w-full p-2 border rounded"
  rows={4}
/>
```

### Router Configuration
**Issue**: 404 errors when navigating to article routes
**Solution**: Update the router configuration to include all article routes:

```typescript
// Add article routes to the router
{
  path: '/article',
  element: <Layout><ArticlesPage /></Layout>,
},
{
  path: '/article/:id',
  element: <Layout><ArticleViewPage /></Layout>,
},
{
  path: '/article/edit/new',
  element: <Layout><ArticleEditPage /></Layout>,
},
{
  path: '/article/edit/:id',
  element: <Layout><ArticleEditPage /></Layout>,
}
```

Note: The order of routes is important. Place more specific routes (like `/article/edit/new`) before more general routes (like `/article/:id`).

### Form Submission
**Issue**: Form data not being properly submitted to the API
**Solution**: Ensure the form data structure matches what the backend expects:

```typescript
// Prepare data for API
const articleData = {
  title,
  sections,
  citations,
  contributors,
  related_media: relatedMedia,  // Note the snake_case for API
  tags
};
```

These solutions should help troubleshoot common issues when implementing similar functionality in the future. 