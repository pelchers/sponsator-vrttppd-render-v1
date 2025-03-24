# Dual Image Implementation Guide (Posts System)

This guide extends the dual image implementation to handle post images, following the patterns established in profiles, projects, and articles.

## Goals and Expected Functionality

1. Allow users to choose between two image sources for post images:
   - External URL
   - File upload
2. Maintain image source preference (`url` or `upload`) in the database
3. Clear unused fields when switching modes
4. Show proper preview for both modes
5. Handle image display consistently across:
   - Post feed/list view
   - Post detail view
   - Post creation/edit form
6. Preserve image choice when editing existing posts

## Database Schema

```prisma
model posts {
  // ... existing fields
  post_image_url    String?   // For external URLs
  post_image_upload String?   // For uploaded file paths (relative to uploads/posts)
  post_image_display String?  @default("url")  // Tracks which mode is active
  // ... other fields
}
```

## Directory Structure

```bash
server/
  ├── uploads/
  │   ├── profiles/
  │   ├── projects/
  │   ├── articles/
  │   └── posts/      # New directory for post images
  └── src/
      └── middleware/
          └── upload.ts
```

## Component Implementation

### 1. PostImage Component
```typescript
// client/src/components/PostImage.tsx
export function PostImage({ post, className, fallback }: PostImageProps) {
  const imageUrl = post.post_image_display === 'url'
    ? post.post_image_url
    : post.post_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${post.post_image_upload}`
      : null;

  if (!imageUrl) return fallback || null;

  return (
    <img
      src={imageUrl}
      alt="Post image"
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

### 2. Post Creation/Edit Form Image Section
```typescript
// In PostForm.tsx
<div className="flex flex-col items-center space-y-4">
  {/* Image Toggle Buttons */}
  <div className="flex items-center space-x-4">
    <button
      type="button"
      className={`px-4 py-2 rounded transition-colors ${
        formData.post_image_display === "url" 
          ? "bg-blue-500 text-white" 
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        post_image_display: "url",
        post_image_upload: "" 
      }))}
    >
      Use URL Image
    </button>
    <button
      type="button"
      className={`px-4 py-2 rounded transition-colors ${
        formData.post_image_display === "upload" 
          ? "bg-blue-500 text-white" 
          : "bg-gray-200 hover:bg-gray-300"
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        post_image_display: "upload",
        post_image_url: "" 
      }))}
    >
      Use Uploaded Image
    </button>
  </div>

  {/* URL Input or Upload Component */}
  {formData.post_image_display === "url" ? (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700">
        Image URL
      </label>
      <input
        type="url"
        name="post_image_url"
        value={formData.post_image_url || ''}
        onChange={handleInputChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="https://example.com/image.jpg"
      />
    </div>
  ) : (
    <PostImageUpload 
      onImageSelect={handleImageSelect}
      currentImage={
        formData.post_image_upload 
          ? `${API_URL.replace("/api", "")}/uploads/${formData.post_image_upload}`
          : undefined
      }
      showPreview={true}
    />
  )}

  {/* Preview for URL mode */}
  {formData.post_image_display === "url" && formData.post_image_url && (
    <div className="mt-4 flex justify-center">
      <img
        src={formData.post_image_url}
        alt="Post preview"
        className="w-full max-w-xl object-cover rounded-lg border-2 border-gray-200"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://via.placeholder.com/800x600?text=Invalid+Image+URL';
        }}
      />
    </div>
  )}
</div>
```

### 3. Post Display in Feed
```typescript
// In PostCard.tsx
<div className="post-card rounded-lg border border-gray-200 overflow-hidden">
  <PostImage 
    post={post}
    className="w-full h-48 object-cover"
    fallback={
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    }
  />
  <div className="p-4">
    <div className="post-content">{post.content}</div>
    {/* Other post content */}
  </div>
</div>
```

## Key Implementation Details

1. **Form Data Handling**:
```typescript
// In usePostForm.ts
const transformFormDataForApi = (formData: PostFormData) => {
  const apiData: any = {};
  
  // Handle image fields properly
  apiData.post_image_display = formData.post_image_display || 'url';
  apiData.post_image_url = formData.post_image_display === 'url' 
    ? formData.post_image_url 
    : '';
  apiData.post_image_upload = formData.post_image_display === 'upload' 
    ? formData.post_image_upload 
    : '';

  // ... other fields
  return apiData;
};
```

2. **Server-Side Processing**:
```typescript
// In postService.ts
function mapPostToFrontend(post: any) {
  return {
    ...post,
    post_image: post.post_image_display === 'url' 
      ? post.post_image_url
      : post.post_image_upload 
        ? `/uploads/${post.post_image_upload}`
        : null,
    // Keep original fields
    post_image_url: post.post_image_url || '',
    post_image_upload: post.post_image_upload || '',
    post_image_display: post.post_image_display || 'url'
  };
}
```

## Testing Checklist

1. ✅ Image Upload
   - File size limits (5MB for posts)
   - File type validation
   - Upload progress
   - Error handling

2. ✅ URL Images
   - URL validation
   - Preview loading
   - Error states
   - Fallback display

3. ✅ Display Consistency
   - Feed/list view
   - Post detail view
   - Edit form preview
   - Responsive sizing

4. ✅ Mode Switching
   - Clear unused fields
   - Maintain state
   - Preview updates

5. ✅ Feed Performance
   - Image loading optimization
   - Lazy loading
   - Proper sizing
   - Cache handling

This implementation provides a consistent user experience for handling post images, matching the patterns established in the profile, project, and article systems while considering the specific needs of a social feed-style display. 