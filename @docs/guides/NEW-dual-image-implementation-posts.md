# Dual Image Implementation Guide (Posts System)

This guide extends the dual image implementation to handle post images, following the same patterns established in the profile, project, and article implementations.

## Key Differences from Other Implementations

1. **Directory Structure**:
   ```bash
   server/
     ├── uploads/
     │   ├── profiles/    # From previous implementation
     │   ├── projects/    # From previous implementation
     │   ├── articles/    # From previous implementation
     │   └── posts/       # New directory for post images
     └── src/
         └── middleware/
             └── upload.ts
   ```

2. **Field Names**:
   ```prisma
   model posts {
     post_image_url    String?   // For external URLs
     post_image_upload String?   // For uploaded file paths (relative to uploads/posts)
     post_image_display String?  @default("url")
   }
   ```

3. **File Size Limits**:
   - Posts: 5MB (optimized for social-style post images)
   - Smaller than projects/articles as posts are typically more lightweight

## 1. Type Definitions

```typescript:client/src/types/post.ts
export interface Post {
  // ... existing fields
  post_image_url?: string | null;    // External URL
  post_image_upload?: string | null;  // Path like 'posts/post-123456.jpg'
  post_image_display?: 'url' | 'upload';
}

export interface PostFormData extends Post {
  post_image_file?: File | null;  // For handling file uploads
}
```

// ... rest of implementation following same pattern as projects guide ... 