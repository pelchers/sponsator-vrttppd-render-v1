# Dual Image Implementation Guide (Articles System)

This guide provides a complete implementation for handling dual image sources in articles, incorporating lessons learned from profiles, projects, and our actual implementation experience.

## File Structure and Components

### Client-Side Files
```bash
client/src/
  ├── components/
  │   ├── ArticleImage.tsx                   # Article image display component
  │   └── input/forms/
  │       ├── ArticleImageUpload.tsx         # Image upload component
  │   └── sections/
  │       └── PageSection.tsx                # Section wrapper component
  ├── api/
  │   └── articles.ts                        # API calls for articles
  └── pages/
      └── article/
          ├── article.tsx                    # Article view page
          └── editarticle.tsx                # Article edit page
```

### Server-Side Files
```bash
server/src/
  ├── controllers/
  │   └── articleController.ts
  ├── services/
  │   └── articleService.ts
  ├── routes/
  │   └── articleRoutes.ts
  └── uploads/
      └── articles/                          # Articles image storage
```

## Common Issues and Solutions

### 1. Section Loading Issues
Problem: Sections not loading properly after save or on edit form reload.

Solution:
```typescript
// In articleService.ts
function transformDbToApi(article: any) {
  if (!article) return null;
  
  return {
    ...article,
    // Transform sections to the expected format
    sections: article.article_sections?.map((section: any) => ({
      id: section.id,
      type: section.type || 'full-width-text',
      title: section.title || '',
      subtitle: section.subtitle || '',
      text: section.text || '',
      mediaUrl: section.media_url || '',
      mediaSubtext: section.media_subtext || '',
      order: section.order ?? 0
    })) || []
  };
}
```

### 2. Image Field Type Safety
Problem: TypeScript errors with image fields.

Solution:
```typescript
// In articles.ts
export interface Article {
  id: string;
  user_id: string;
  title: string;
  article_image_url?: string;
  article_image_upload?: string;
  article_image_display?: 'url' | 'upload';
  sections: ArticleSection[];
  // ... other fields
}

// In articleService.ts
interface ArticleImageUpdate {
  article_image_url: string;
  article_image_upload: string;
  article_image_display: 'url' | 'upload';
}
```

### 3. Section Ordering
Problem: Sections losing order after updates.

Solution:
```typescript
// In articleService.ts
async updateArticle(id: string, userId: string, articleData: any) {
  try {
    // ... auth check ...

    if (sections) {
      await prisma.article_sections.deleteMany({
        where: { article_id: id }
      });

      if (sections.length > 0) {
        await prisma.$transaction(
          sections.map((section, index) => 
            prisma.article_sections.create({
              data: {
                article_id: id,
                type: section.type || 'full-width-text',
                title: section.title || '',
                subtitle: section.subtitle || '',
                text: section.text || '',
                media_url: section.mediaUrl || '',
                media_subtext: section.mediaSubtext || '',
                order: section.order ?? index
              }
            })
          )
        );
      }
    }

    // Fetch with ordered sections
    const completeArticle = await prisma.articles.findUnique({
      where: { id },
      include: {
        article_sections: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return transformDbToApi(completeArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
}
```

### 4. Auth Type Safety
Problem: TypeScript errors with req.user.

Solution:
```typescript
// In articleController.ts
interface AuthRequest extends Request {
  user?: {
    id: string;
    // ... other user fields
  };
}

export const articleController = {
  async updateArticle(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      // ... rest of the handler
    } catch (error) {
      // ... error handling
    }
  }
};
```

### 5. Image Upload Response Format
Problem: Inconsistent image data format between upload and regular fetches.

Solution:
```typescript
// In articleService.ts
async uploadArticleCoverImage(id: string, file: Express.Multer.File) {
  try {
    const relativePath = `articles/${file.filename}`;
    
    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: {
        article_image_upload: relativePath,
        article_image_url: '',
        article_image_display: 'upload',
        updated_at: new Date()
      }
    });
    
    // Return consistent format
    return {
      path: relativePath,
      article: {
        ...updatedArticle,
        article_image: `/uploads/${relativePath}`,
        article_image_url: '',
        article_image_upload: relativePath,
        article_image_display: 'upload'
      }
    };
  } catch (error) {
    console.error('Error uploading article cover image:', error);
    throw error;
  }
}
```

### 6. Form Data Loading
Problem: Form not properly loading existing data.

Solution:
```typescript
// In editarticle.tsx
useEffect(() => {
  if (id && id !== 'new') {
    setLoading(true);
    fetchArticle(id)
      .then(data => {
        if (data) {
          // Make sure sections are properly formatted
          const formattedSections = (data.sections || []).map(section => ({
            type: section.type || 'full-width-text',
            title: section.title || '',
            subtitle: section.subtitle || '',
            text: section.text || '',
            mediaUrl: section.mediaUrl || '',
            mediaSubtext: section.mediaSubtext || '',
            order: section.order ?? 0
          }));
          
          // Sort sections by order
          const sortedSections = [...formattedSections].sort((a, b) => 
            (a.order || 0) - (b.order || 0)
          );
          
          setSections(sortedSections);
          setFormData({
            title: data.title || '',
            article_image_url: data.article_image_url || '',
            article_image_upload: data.article_image_upload || '',
            article_image_display: data.article_image_display || 'url'
          });
        }
      })
      .finally(() => setLoading(false));
  }
}, [id]);
```

## Key Implementation Details

1. **Image Handling**:
   - Always use empty strings instead of null for unused image fields
   - Maintain consistent image path structure
   - Handle both relative and absolute paths properly

2. **Section Management**:
   - Use transactions for section updates
   - Maintain order during CRUD operations
   - Provide defaults for all section fields

3. **Type Safety**:
   - Define proper interfaces for all data structures
   - Handle auth types properly
   - Use type guards where needed

4. **Error Handling**:
   - Validate file sizes (10MB limit for articles)
   - Handle upload errors gracefully
   - Show user feedback for errors

5. **State Management**:
   - Clear unused fields when switching modes
   - Preserve image choice on form reload
   - Handle loading states properly

## Testing Checklist

1. ✅ Image Handling
   - URL input works
   - File upload works
   - Preview displays correctly
   - Mode switching works

2. ✅ Section Management
   - Sections save correctly
   - Order is preserved
   - All fields load properly
   - CRUD operations work

3. ✅ Data Loading
   - Form loads existing data
   - Images display correctly
   - Sections load in order
   - All fields populate

4. ✅ Error States
   - Invalid URLs handled
   - Upload errors handled
   - Auth errors handled
   - Loading states shown

5. ✅ Type Safety
   - No TypeScript errors
   - Proper type definitions
   - Auth types handled
   - Consistent interfaces

This implementation provides a robust solution for handling both article content and images while maintaining type safety and good user experience. 