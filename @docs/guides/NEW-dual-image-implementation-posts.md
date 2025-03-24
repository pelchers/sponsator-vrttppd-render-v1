# Dual Image Implementation Guide (Posts System)

This guide provides a complete implementation for handling dual image sources in posts, incorporating lessons learned from profiles, projects, and articles implementations.

## File Structure and Components

### Client-Side Files
```bash
client/src/
  ├── components/
  │   ├── PostImage.tsx                      # Post image display component
  │   └── input/forms/
  │       ├── PostImageUpload.tsx            # Image upload component
  │       └── PostEditForm.tsx               # Post edit form
  ├── api/
  │   └── posts.ts                           # API calls for posts
  └── pages/
      └── post/
          ├── post.tsx                       # Post view page
          └── edit.tsx                       # Post edit page
```

### Server-Side Files
```bash
server/src/
  ├── controllers/
  │   └── postController.ts
  ├── services/
  │   └── postService.ts
  ├── routes/
  │   └── postRoutes.ts
  └── uploads/
      └── posts/                             # Posts image storage
```

## Implementation Steps

### 1. Database Schema (Prisma)
```prisma
model posts {
  id                  String    @id @default(uuid())
  user_id             String
  content             String?
  post_image_url      String?   // For external URLs
  post_image_upload   String?   // For uploaded file paths
  post_image_display  String?   @default("url")
  // ... other fields
}
```

### 2. Client-Side Components

#### PostImage Component
```typescript:client/src/components/PostImage.tsx
import React from 'react';
import { API_URL } from '@/config';

interface PostImageProps {
  post: {
    post_image_display?: 'url' | 'upload';
    post_image_url?: string | null;
    post_image_upload?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

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

#### PostImageUpload Component
```typescript:client/src/components/input/forms/PostImageUpload.tsx
import React, { useState, useEffect } from 'react';

interface PostImageUploadProps {
  onImageSelect: (file: File) => Promise<void>;
  currentImage?: string;
  showPreview?: boolean;
}

const PostImageUpload: React.FC<PostImageUploadProps> = ({ 
  onImageSelect, 
  currentImage,
  showPreview = false
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validate file size (5MB limit for posts)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <div className="flex flex-col items-center">
        {showPreview && preview ? (
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Post preview"
              className="w-full max-w-xl object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
        ) : (
          <div className="w-full max-w-xl h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4">
            <span className="text-gray-500">No image selected</span>
          </div>
        )}
        
        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
          Select Image
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default PostImageUpload;
```

### 3. API Integration

#### Posts API
```typescript:client/src/api/posts.ts
export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_image_url?: string;
  post_image_upload?: string;
  post_image_display?: 'url' | 'upload';
  // ... other fields
}

export const uploadPostCoverImage = async (postId: string, file: File) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(
      `${API_URL}/posts/${postId}/cover-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading post image:', error);
    throw error;
  }
};
```

### 4. Server-Side Implementation

#### Post Service
```typescript:server/src/services/postService.ts
export const postService = {
  async uploadPostImage(id: string, file: Express.Multer.File) {
    try {
      const relativePath = `posts/${file.filename}`;
      
      const updatedPost = await prisma.posts.update({
        where: { id },
        data: {
          post_image_upload: relativePath,
          post_image_url: '',
          post_image_display: 'upload',
          updated_at: new Date()
        }
      });
      
      return {
        path: relativePath,
        post: {
          ...updatedPost,
          post_image: `/uploads/${relativePath}`,
          post_image_url: '',
          post_image_upload: relativePath,
          post_image_display: 'upload'
        }
      };
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  },

  // Helper function to map post data for frontend
  mapPostToFrontend(post: any) {
    return {
      ...post,
      post_image: post.post_image_display === 'url' 
        ? post.post_image_url
        : post.post_image_upload 
          ? `/uploads/${post.post_image_upload}`
          : null,
      post_image_url: post.post_image_url || '',
      post_image_upload: post.post_image_upload || '',
      post_image_display: post.post_image_display || 'url'
    };
  }
};
```

### 5. Key Considerations

1. **File Paths**:
   - Client uploads go to: `/uploads/posts/`
   - Server stores relative paths: `posts/filename.jpg`
   - Frontend displays: `${API_URL}/uploads/posts/filename.jpg`

2. **Data Transformation**:
   - Always transform data consistently between frontend and backend
   - Use helper functions for mapping data
   - Maintain proper types throughout

3. **Error Handling**:
   - Validate file sizes (5MB limit for posts)
   - Handle upload errors gracefully
   - Show user feedback for errors

4. **State Management**:
   - Clear unused fields when switching modes
   - Preserve image choice on form reload
   - Handle loading states properly

5. **Type Safety**:
   - Define proper interfaces for all components
   - Use type guards where necessary
   - Maintain consistent types across the application

### 6. Testing Checklist

1. ✅ Image Upload
   - File size validation
   - File type validation
   - Upload progress
   - Error handling

2. ✅ URL Images
   - URL validation
   - Preview loading
   - Error states
   - Fallback display

3. ✅ Mode Switching
   - URL to Upload
   - Upload to URL
   - Clear unused fields
   - Preserve selected mode

4. ✅ Edit Form
   - Load existing image
   - Show correct mode
   - Update image
   - Preserve choices

5. ✅ Display
   - Feed view
   - Post detail view
   - Edit form preview
   - Responsive sizing

### 7. Image Display Considerations

When displaying images in the post view, consider these key aspects:

```typescript
// Post image container with adaptive height
<div className="relative w-full max-h-[600px] min-h-[300px]">
  <PostImage
    post={post}
    className="w-full h-full max-h-[600px] object-contain bg-gray-100"
    fallback={
      <div className="w-full h-full min-h-[300px] bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No image available</span>
      </div>
    }
  />
</div>
```

**Key Styling Decisions:**
1. **Adaptive Height**:
   - Use `max-h-[600px]` to prevent overly tall images
   - Set `min-h-[300px]` to maintain visual consistency

2. **Image Containment**:
   - Use `object-contain` instead of `object-cover` to show full image
   - Add `bg-gray-100` for a clean background behind non-filling images

3. **Responsive Design**:
   - Container adapts to image dimensions while respecting max/min bounds
   - Maintains aspect ratio without cropping

4. **Fallback Handling**:
   - Consistent height with actual images
   - Clear visual indication when no image is available

These considerations ensure:
- No image cropping or distortion
- Consistent layout across different image sizes
- Clean presentation of both landscape and portrait images
- Proper fallback for missing images

This implementation ensures consistent image handling across the application while maintaining good user experience and proper error handling. 