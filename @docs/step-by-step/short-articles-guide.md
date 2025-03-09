# Short Guide: Implementing Articles Functionality

This guide outlines the steps to implement the articles functionality in our application, using a more direct approach than what we used for projects.

## 1. Frontend Components

### A. Article Form Configuration (Not Used in Current Implementation)
~~Create `client/src/components/input/forms/config/articleFormConfig.ts`:~~

**Note:** Unlike the projects feature, we don't use a separate form configuration file for articles. Instead, we define all form structure directly in the edit component. This simpler approach works well for the less complex article form structure.

### B. Article Form Hook (Not Used in Current Implementation)
~~Create `client/src/hooks/useArticleForm.ts`:~~

**Note:** We don't use a dedicated form hook for articles. Instead, we manage form state directly in the component using React's useState hooks. This direct approach is more straightforward for the article form's needs.

### C. Article Form Component
Update `client/src/pages/article/editarticle.tsx`:
- Implement state management directly in the component
- Handle form submission and validation
- Manage sections, citations, contributors, etc.
- Call API functions directly

### D. Article View Component
Update `client/src/pages/article/article.tsx`:
- Fetch article data from API
- Display article sections properly
- Handle different section types (text, media, mixed layouts)
- Style the article for optimal readability

### E. Articles List Component
Update `client/src/pages/article/articleslist.tsx`:
- Fetch articles from API
- Display article list with pagination
- Implement delete functionality
- Add links to view and edit pages

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
2. Component manages state with useState hooks
3. On submit, component calls `api/articles.ts` directly
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
4. Develop the frontend components directly (without hooks/config)
5. Test the full flow

## 6. Lessons from Project Implementation

1. **Direct vs. Abstracted Approach**: For simpler forms, a direct implementation in the component can be cleaner than abstracting to hooks and config files
2. **State Management**: React's useState is powerful enough for many form scenarios
3. **Type Safety**: Use TypeScript to catch potential type mismatches
4. **Error Handling**: Add robust error handling for JSON parsing and API calls
5. **Logging**: Add detailed logging to track data flow through the system
6. **Field Mapping**: Explicitly map all fields between frontend and backend
7. **Array Handling**: Be careful with arrays, especially when they need to be stringified for storage
8. **Nested Objects**: When using nested objects in the UI, make sure they're properly flattened for the database
9. **Optional Chaining**: Use optional chaining (`?.`) when accessing potentially undefined properties

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