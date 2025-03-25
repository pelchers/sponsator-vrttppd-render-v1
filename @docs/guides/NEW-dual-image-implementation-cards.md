# Dual Image Implementation for Project, Post, and Article Cards

This guide documents how to implement the dual image system (URL/Upload) for project, post, and article cards, following the same pattern as the user image implementation.

## Key Insight
The implementation is nearly identical to the user image system, just with different field names:
1. Include image fields in explore service queries
2. Pass them through the results grid
3. Create entity-specific image components using same pattern as UserImage

## Implementation Steps

### 1. Create Entity Image Components

Create reusable image components for each entity type:

```typescript:client/src/components/ProjectImage.tsx
import { DefaultProjectImage } from '@/components/icons/DefaultProjectImage';

interface ProjectImageProps {
  project: {
    project_image_url?: string | null;
    project_image_upload?: string | null;
    project_image_display?: 'url' | 'upload';
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function ProjectImage({ project, className, fallback }: ProjectImageProps) {
  const imageUrl = project.project_image_display === 'upload' 
    ? project.project_image_upload 
    : project.project_image_url;

  if (!imageUrl) {
    return fallback || <DefaultProjectImage className={className} />;
  }

  return <img src={imageUrl} alt="Project" className={className} />;
}
```

Create similar components for posts and articles (`PostImage.tsx` and `ArticleImage.tsx`).

### 2. Update Card Components

Update each card component to use the new image components:

```typescript:client/src/components/cards/ProjectCard.tsx
import { ProjectImage } from '@/components/ProjectImage';

interface ProjectCardProps {
  project: {
    // ... existing fields ...
    project_image_url?: string | null;
    project_image_upload?: string | null;
    project_image_display?: 'url' | 'upload';
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <ProjectImage
        project={project}
        className="w-full h-48 object-cover rounded-t-lg"
        fallback={<DefaultProjectImage className="w-full h-48" />}
      />
      {/* Rest of card content */}
    </Card>
  );
}
```

Similar updates for PostCard and ArticleCard:

```typescript:client/src/components/cards/PostCard.tsx
<PostImage
  post={post}
  className="w-full h-48 object-cover rounded-t-lg"
  fallback={<DefaultPostImage className="w-full h-48" />}
/>
```

```typescript:client/src/components/cards/ArticleCard.tsx
<ArticleImage
  article={article}
  className="w-full h-48 object-cover rounded-t-lg"
  fallback={<DefaultArticleImage className="w-full h-48" />}
/>
```

### 3. Update ExploreService Queries

In `server/src/services/exploreService.ts`, add image fields to each entity query:

```typescript
// For projects
const projects = await prisma.projects.findMany({
  where,
  select: {
    // ... existing fields ...
    project_image_url: true,
    project_image_upload: true,
    project_image_display: true
  }
});

// For posts
const posts = await prisma.posts.findMany({
  where,
  select: {
    // ... existing fields ...
    post_image_url: true,
    post_image_upload: true,
    post_image_display: true
  }
});

// For articles
const articles = await prisma.articles.findMany({
  where,
  select: {
    // ... existing fields ...
    article_image_url: true,
    article_image_upload: true,
    article_image_display: true
  }
});
```

### 4. Update ResultsGrid

In `client/src/components/results/ResultsGrid.tsx`, ensure image fields are passed through:

```typescript
{showProjects && sortedResults.projects.map((project, index) => (
  <div key={`project-${project.id || index}`} className="col-span-1">
    <ProjectCard
      project={{
        ...project,
        project_image_url: project.project_image_url,
        project_image_upload: project.project_image_upload,
        project_image_display: project.project_image_display
      }}
    />
  </div>
))}

{showPosts && sortedResults.posts.map((post, index) => (
  <div key={`post-${post.id || index}`} className="col-span-1">
    <PostCard
      post={{
        ...post,
        post_image_url: post.post_image_url,
        post_image_upload: post.post_image_upload,
        post_image_display: post.post_image_display
      }}
    />
  </div>
))}

{showArticles && sortedResults.articles.map((article, index) => (
  <div key={`article-${article.id || index}`} className="col-span-1">
    <ArticleCard
      article={{
        ...article,
        article_image_url: article.article_image_url,
        article_image_upload: article.article_image_upload,
        article_image_display: article.article_image_display
      }}
    />
  </div>
))}
```

## Key Points
1. No changes needed to:
   - Database schema (fields already exist)
   - API routes (already passing data)
   - Controllers (already handling data)

2. Only needed to:
   - Create entity-specific image components
   - Update card components to use new image components
   - Include fields in explore service
   - Pass fields through results grid

## Why This Works
1. Image fields already exist in database
2. Pattern matches existing user image implementation
3. Components follow same structure
4. Explore service already handles these entities

## Testing Checklist
1. ✅ Project cards show correct images
2. ✅ Post cards show correct images
3. ✅ Article cards show correct images
4. ✅ Both URL and uploaded images work
5. ✅ Fallback to default images works
6. ✅ Images consistent across views

Remember: This implementation mirrors the user image system, just with different field names for each entity type.

## Troubleshooting Checklist

If images aren't displaying correctly after implementing the above steps, check each component in the flow:

### Database Layer
- [ ] Verify fields exist in prisma schema for each entity:
  - projects: project_image_url, project_image_upload, project_image_display
  - posts: post_image_url, post_image_upload, post_image_display
  - articles: article_image_url, article_image_upload, article_image_display
- [ ] Check database records have correct values in these fields

### API Layer
- [ ] Confirm exploreService is selecting image fields in queries
- [ ] Verify API responses include image fields
- [ ] Check network tab for correct data structure
- [ ] Validate image URLs are accessible

### Component Layer
- [ ] Verify Image components are exported correctly:
  ```typescript
  // Check exports in index.ts or component files
  export { ProjectImage } from './ProjectImage';
  export { PostImage } from './PostImage';
  export { ArticleImage } from './ArticleImage';
  ```
- [ ] Confirm default images exist and are imported:
  ```typescript
  import { DefaultProjectImage } from '@/components/icons/DefaultProjectImage';
  import { DefaultPostImage } from '@/components/icons/DefaultPostImage';
  import { DefaultArticleImage } from '@/components/icons/DefaultArticleImage';
  ```

### Props Flow
- [ ] Check ResultsGrid is receiving data:
  ```typescript
  console.log('Projects:', sortedResults.projects);
  console.log('Posts:', sortedResults.posts);
  console.log('Articles:', sortedResults.articles);
  ```
- [ ] Verify props in each card component:
  ```typescript
  console.log('ProjectCard props:', project);
  console.log('PostCard props:', post);
  console.log('ArticleCard props:', article);
  ```
- [ ] Confirm image URLs in Image components:
  ```typescript
  console.log('ProjectImage URL:', imageUrl);
  ```

### Common Issues
1. **Missing Fields**
   - Check prisma schema
   - Verify API select statements
   - Confirm component interfaces

2. **Undefined Values**
   - Check optional chaining
   - Verify default values
   - Confirm prop drilling

3. **Image Display Issues**
   - Verify URL accessibility
   - Check CORS settings
   - Confirm image dimensions

4. **Type Errors**
   - Validate interface definitions
   - Check prop types
   - Verify import/export types

### Quick Fixes
1. If images don't load:
   ```typescript
   // Add error handling to image components
   <img 
     src={imageUrl} 
     alt="Entity"
     className={className}
     onError={(e) => {
       console.error('Image load error:', imageUrl);
       e.currentTarget.onerror = null;
       e.currentTarget.src = '/path/to/fallback.png';
     }}
   />
   ```

2. If types are mismatched:
   ```typescript
   // Add type guards
   const getImageUrl = (entity: any) => {
     if (!entity) return null;
     return entity.image_display === 'upload' 
       ? entity.image_upload 
       : entity.image_url;
   };
   ```

3. If data is missing:
   ```typescript
   // Add default values
   const defaultImageProps = {
     image_url: null,
     image_upload: null,
     image_display: 'url' as const
   };
   
   const safeEntity = {
     ...defaultImageProps,
     ...entity
   };
   ``` 