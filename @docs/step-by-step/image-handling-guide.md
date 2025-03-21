# Image Handling Implementation Guide

> **Important Note**: This implementation integrates into your existing file structure and components. Rather than creating new files, we'll update:
> - Existing types in `types/user.ts`
> - Existing API functions in `api/users.ts`
> - Existing form hooks like `useProfileForm.ts`
> - Existing form components like `ProfileEditForm.tsx`
>
> This ensures we maintain the current architecture and patterns.

This guide explains how to add dual image handling (URL and uploads) to our existing system.

## 1. File Storage Structure

### Directory Setup
```bash
server/
  └── uploads/
      ├── profiles/      # User profile images
      ├── projects/      # Project-related images
      ├── posts/         # Post images
      └── articles/      # Article images
```

### Storage Considerations

1. **File Organization**
   - Each content type has its own directory
   - Files are stored with unique names to prevent collisions
   - Original filenames are preserved in metadata

2. **File Naming Convention**
   ```
   {type}_{userId}_{timestamp}_{originalFileName}
   ```
   Example: `profile_123_1678234567_avatar.jpg`

3. **Size Limits**
   - Profile Images: Max 2MB
   - Post Images: Max 5MB
   - Project Images: Max 5MB
   - Article Images: Max 5MB

4. **Supported Formats**
   - Images: .jpg, .jpeg, .png, .gif, .webp
   - Maximum dimensions: 2048x2048 pixels

5. **Security Considerations**
   - Validate file types using both extension and MIME type
   - Scan for malware (implement virus scanning)
   - Use signed URLs for secure access
   - Implement rate limiting for uploads

## 2. Database Schema

```prisma
model users {
  // ... existing fields ...
  profile_image_url    String?   // For external URLs
  profile_image_upload String?   // For local uploads
  profile_image       String?    // Legacy field
}

// Similar structure for projects, posts, and articles
```

## 3. File Handling Workflow

1. **Upload Process**
   ```typescript
   // Example upload flow
   async function handleImageUpload(file: File, type: 'profile' | 'project' | 'post' | 'article') {
     // 1. Validate file
     validateFileType(file);
     validateFileSize(file, type);
     
     // 2. Generate unique filename
     const filename = generateUniqueFilename(file, type);
     
     // 3. Store file
     await storeFile(file, filename, type);
     
     // 4. Update database
     await updateImageReference(type, filename);
     
     // 5. Return file path
     return `/uploads/${type}s/${filename}`;
   }
   ```

2. **Cleanup Process**
   - Remove old files when new ones are uploaded
   - Implement periodic cleanup for orphaned files
   - Handle deletion when content is removed

## 4. Environment Configuration

```env
# Add to .env
MAX_FILE_SIZE_PROFILE=2097152    # 2MB in bytes
MAX_FILE_SIZE_POST=5242880       # 5MB in bytes
MAX_FILE_SIZE_PROJECT=5242880    # 5MB in bytes
MAX_FILE_SIZE_ARTICLE=5242880    # 5MB in bytes
UPLOAD_PATH=/path/to/uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## 5. Backup Considerations

1. **Regular Backups**
   - Include uploaded files in backup strategy
   - Sync with cloud storage (optional)
   - Maintain file metadata backup

2. **Recovery Process**
   - Document file restoration procedures
   - Keep file-database relationships intact
   - Implement verification after restore

## 6. Performance Optimization

1. **Image Processing**
   - Compress images on upload
   - Generate thumbnails for previews
   - Convert to efficient formats (WebP)

2. **Caching Strategy**
   - Implement CDN for frequently accessed images
   - Use appropriate cache headers
   - Consider browser caching policies

## 7. Migration Strategy

1. **Data Migration**
   ```sql
   -- Example migration for existing data
   UPDATE users 
   SET profile_image_url = profile_image 
   WHERE profile_image LIKE 'http%';
   
   UPDATE users 
   SET profile_image_upload = profile_image 
   WHERE profile_image NOT LIKE 'http%';
   ```

2. **Legacy Support**
   - Maintain backward compatibility
   - Handle both URL and file paths
   - Implement gradual transition

## 8. Monitoring and Maintenance

1. **Storage Monitoring**
   - Track disk usage
   - Monitor upload patterns
   - Set up alerts for capacity issues

2. **Regular Maintenance**
   - Clean up unused files
   - Verify file integrity
   - Update security measures

## 9. Error Handling

```typescript
class FileUploadError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FileUploadError';
  }
}

// Usage
try {
  await handleImageUpload(file, 'profile');
} catch (error) {
  if (error instanceof FileUploadError) {
    // Handle specific upload errors
  }
  // Handle other errors
}
```

## 10. Testing Considerations

1. **Unit Tests**
   - File validation
   - Name generation
   - Error handling

2. **Integration Tests**
   - Upload process
   - File cleanup
   - Storage limits

3. **Security Tests**
   - File type validation
   - Access control
   - Upload limits

## 1. Database Schema Update

```prisma:server/prisma/schema.prisma
// Update each model to support both URL and upload paths
model users {
  // ... existing fields
  profile_image_url String?    // For external URLs
  profile_image_upload String? // For local uploads
}

model projects {
  // ... existing fields
  project_image_url String?    // For external URLs
  project_image_upload String? // For local uploads
}

model articles {
  // ... existing fields
  article_image_url String?    // For external URLs
  article_image_upload String? // For local uploads
}

model posts {
  // ... existing fields
  post_image_url String?      // For external URLs
  post_image_upload String?   // For local uploads
}
```

## 2. Backend Implementation

### A. Update Service Layer

```typescript:server/src/services/userService.ts
// Add to existing service
export const updateUserWithImage = async (
  id: string,
  data: {
    profile_image_url?: string;
    profile_image_upload?: string;
    [key: string]: any;
  }
) => {
  try {
    return await prisma.users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user with image:', error);
    throw error;
  }
};

// Similar updates for other services...
```

### B. Update Existing Controllers

```typescript:server/src/controllers/userController.ts
// Add to existing updateUser function
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { profile_image_url, ...data } = req.body;
    
    // Handle file upload if provided
    const profile_image_upload = req.file?.path;

    // Update user with both image fields
    const user = await prisma.users.update({
      where: { id },
      data: {
        ...data,
        profile_image_url,
        profile_image_upload
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};
```

### C. Update Existing Routes

```typescript:server/src/routes/userRoutes.ts
// Add multer to existing routes
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Update existing route to handle file upload
router.patch('/:id', upload.single('profile_image'), updateUser);
```

## 3. Frontend Implementation

### A. Update API Types

```typescript:client/src/types/user.ts
export interface User {
  // ... existing fields
  profile_image_url?: string;
  profile_image_upload?: string;
}

export interface UserFormData extends User {
  profile_image?: File | null;
}
```

### B. Update API Service

```typescript:client/src/api/users.ts
import { api } from './api';
import { User, UserFormData } from '@/types/user';

// Update existing fetchUserProfile
export async function fetchUserProfile(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update existing updateUserProfile
export async function updateUserProfile(userId: string, data: FormData) {
  try {
    const response = await api.patch(`/users/${userId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
```

### C. Update useProfileForm Hook

```typescript:client/src/hooks/useProfileForm.ts
import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '@/api/users';
import type { UserFormData } from '@/types/user';

export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState<UserFormData>({
    // ... existing fields
    profile_image: null,
    profile_image_url: '',
    profile_image_upload: ''
  });

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await fetchUserProfile(userId);
        
        setFormData(prev => ({
          ...prev,
          profile_image: null,
          profile_image_url: userData.profile_image_url || '',
          profile_image_upload: userData.profile_image_upload || ''
        }));
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  // Handle image selection
  const handleImageSelect = async (file: File) => {
    setFormData(prev => ({
      ...prev,
      profile_image: file,
      profile_image_url: '',  // Clear URL when file is selected
      profile_image_upload: ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      
      // Handle image upload
      if (formData.profile_image instanceof File) {
        form.append('profile_image', formData.profile_image);
      } else if (formData.profile_image_url) {
        form.append('profile_image_url', formData.profile_image_url);
      }

      // Add other fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && 
            key !== 'profile_image' && 
            key !== 'profile_image_url' && 
            key !== 'profile_image_upload') {
          form.append(key, value.toString());
        }
      });

      await updateUserProfile(userId!, form);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    loading,
    saving,
    error,
    success,
    handleImageSelect,
    handleSubmit
  };
}
```

### D. Update Profile Edit Form

```typescript:client/src/components/input/forms/ProfileEditForm.tsx
import { useProfileForm } from '@/hooks/useProfileForm';

export default function ProfileEditForm() {
  const { id } = useParams<{ id: string }>();
  const {
    formData,
    handleImageSelect,
    handleSubmit,
    loading,
    saving,
    error
  } = useProfileForm(id);

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="image-upload-container">
        <ImageUpload 
          onImageSelect={handleImageSelect}
          initialImage={formData.profile_image_url || formData.profile_image_upload}
        />
      </div>

      {/* Rest of form fields */}
    </form>
  );
}
```

This implementation:
1. Uses our existing api.ts for requests
2. Updates types in user.ts
3. Uses useProfileForm hook
4. Maintains proper type safety
5. Follows our existing patterns

Would you like me to expand on any part? 