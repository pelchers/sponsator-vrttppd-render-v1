# Dual Image Implementation Guide (Articles System)

This guide extends the dual image implementation to handle article images, following the same patterns established in the profile and project implementations.

## Key Differences from Profile/Project Implementation

1. **Directory Structure**:
   ```bash
   server/
     ├── uploads/
     │   ├── profiles/    # From previous implementation
     │   ├── projects/    # From previous implementation
     │   ├── articles/    # New directory for article images
     │   └── posts/       # For post implementation
     └── src/
         └── middleware/
             └── upload.ts
   ```

2. **Field Names**:
   ```prisma
   model articles {
     article_image_url    String?   // For external URLs
     article_image_upload String?   // For uploaded file paths (relative to uploads/articles)
     article_image_display String?  @default("url")
   }
   ```

3. **File Size Limits**:
   - Articles: 10MB (for high-quality article header images)
   - Consistent with project image limits

## 1. Type Definitions

```typescript:client/src/types/article.ts
export interface Article {
  // ... existing fields
  article_image_url?: string | null;    // External URL
  article_image_upload?: string | null;  // Path like 'articles/article-123456.jpg'
  article_image_display?: 'url' | 'upload';
}

export interface ArticleFormData extends Article {
  article_image_file?: File | null;  // For handling file uploads
}
```

// ... rest of implementation following same pattern as projects guide ... 