# Dual Image Implementation Guide (Articles System)

This guide extends the dual image implementation to handle article images, following the patterns established in profiles and projects.

## Goals and Expected Functionality

1. Allow users to choose between two image sources for article cover/header images:
   - External URL
   - File upload
2. Maintain image source preference (`url` or `upload`) in the database
3. Clear unused fields when switching modes
4. Show proper preview for both modes
5. Handle image display consistently across:
   - Article list view
   - Article detail page
   - Article edit form
6. Preserve image choice when editing existing articles

## Database Schema

```prisma
model articles {
  // ... existing fields
  article_image_url    String?   // For external URLs
  article_image_upload String?   // For uploaded file paths (relative to uploads/articles)
  article_image_display String?  @default("url")  // Tracks which mode is active
  // ... other fields
}
```

## Directory Structure

```bash
server/
  ├── uploads/
  │   ├── profiles/
  │   ├── projects/
  │   └── articles/    # New directory for article images
  └── src/
      └── middleware/
          └── upload.ts
```

## Component Implementation

### 1. ArticleImage Component
```typescript
// client/src/components/ArticleImage.tsx
export function ArticleImage({ article, className, fallback }: ArticleImageProps) {
  const imageUrl = article.article_image_display === 'url'
    ? article.article_image_url
    : article.article_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${article.article_image_upload}`
      : null;

  if (!imageUrl) return fallback || null;

  return (
    <img
      src={imageUrl}
      alt="Article cover"
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (fallback && target.parentElement) {
          target.parentElement.appendChild(fallback as Node);
        }
      }}
    />
  );
}
```

### 2. Article Edit Form Image Section
```typescript
// In ArticleEditPage.tsx
<div className="flex flex-col items-center space-y-4">
  {/* Image Toggle Buttons */}
  <div className="flex items-center space-x-4">
    <button
      type="button"
      className={`px-4 py-2 rounded transition-colors ${
        formData.article_image_display === "url" 
          ? "bg-blue-500 text-white" 
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        article_image_display: "url",
        article_image_upload: "" 
      }))}
    >
      Use URL Image
    </button>
    <button
      type="button"
      className={`px-4 py-2 rounded transition-colors ${
        formData.article_image_display === "upload" 
          ? "bg-blue-500 text-white" 
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        article_image_display: "upload",
        article_image_url: "" 
      }))}
    >
      Use Uploaded Image
    </button>
  </div>

  {/* URL Input or Upload Component */}
  {formData.article_image_display === "url" ? (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700">
        Image URL
      </label>
      <input
        type="url"
        name="article_image_url"
        value={formData.article_image_url || ''}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="https://example.com/image.jpg"
      />
    </div>
  ) : (
    <ArticleImageUpload 
      onImageSelect={handleImageSelect}
      currentImage={
        formData.article_image_upload 
          ? `${API_URL.replace("/api", "")}/uploads/${formData.article_image_upload}`
          : undefined
      }
      showPreview={true}
    />
  )}

  {/* Preview for URL mode */}
  {formData.article_image_display === "url" && formData.article_image_url && (
    <div className="mt-4 flex justify-center">
      <img
        src={formData.article_image_url}
        alt="Article preview"
        className="w-full max-w-2xl object-cover rounded-lg border-2 border-gray-200"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/1200x630?text=Invalid+Image+URL';
        }}
      />
    </div>
  )}
</div>
```

### 3. Article Detail Display
```typescript
// In ArticlePage.tsx
<div className="article-header relative">
  <ArticleImage 
    article={article}
    className="w-full h-[400px] object-cover rounded-t-lg"
    fallback={
      <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-t-lg">
        <span className="text-gray-500">No cover image</span>
      </div>
    }
  />
  <div className="article-title-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
    <h1 className="text-4xl font-bold text-white">{article.title}</h1>
  </div>
</div>
```

## Key Implementation Details

1. **Form Data Handling**:
```typescript
// In useArticleForm.ts
const transformFormDataForApi = (formData: ArticleFormData) => {
  const apiData: any = {};
  
  // Handle image fields properly
  apiData.article_image_display = formData.article_image_display || 'url';
  apiData.article_image_url = formData.article_image_display === 'url' 
    ? formData.article_image_url 
    : '';
  apiData.article_image_upload = formData.article_image_display === 'upload' 
    ? formData.article_image_upload 
    : '';

  // ... other fields
  return apiData;
};
```

2. **Server-Side Processing**:
```typescript
// In articleService.ts
function mapArticleToFrontend(article: any) {
  return {
    ...article,
    article_image: article.article_image_display === 'url' 
      ? article.article_image_url
      : article.article_image_upload 
        ? `/uploads/${article.article_image_upload}`
        : null,
    // Keep original fields
    article_image_url: article.article_image_url || '',
    article_image_upload: article.article_image_upload || '',
    article_image_display: article.article_image_display || 'url'
  };
}
```

## Testing Checklist

1. ✅ Image Upload
   - File size limits (10MB)
   - File type validation
   - Upload progress
   - Error handling

2. ✅ URL Images
   - URL validation
   - Preview loading
   - Error states
   - Fallback display

3. ✅ Display Consistency
   - List view thumbnails
   - Detail page header
   - Edit form preview
   - Responsive sizing

4. ✅ Mode Switching
   - Clear unused fields
   - Maintain state
   - Preview updates

This implementation provides a consistent user experience for handling article images, matching the patterns established in the profile and project systems. 