# Dual Image Handling Implementation Guide

This guide explains how to implement both image upload and URL input for content images, starting with user profiles and then extending to other content types.

## 1. Database Updates

First, let's modify our schema to support both types:

```prisma:server/prisma/schema.prisma
model users {
  // ... existing fields
  profile_image_url String?  // For direct URLs
  profile_image_upload String?  // For local storage keys
  // ... other fields
}

// Later we'll add similar fields to other content types:
model projects {
  project_image_url String?
  project_image_upload String?
}

model articles {
  article_image_url String?
  article_image_upload String?
}

model posts {
  post_image_url String?
  post_image_upload String?
}
```

Create migration:
```bash
npx prisma migrate dev --name add_dual_image_fields
```

Note: The `*_image_upload` fields will store localStorage keys instead of file paths.

## 2. Frontend Form Component

Update the form to handle both image types:

```typescript:client/src/components/forms/ImageInputGroup.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface ImageInputGroupProps {
  imageUrl: string | null;
  onImageUrlChange: (url: string) => void;
  onImageUpload: (file: File) => void;
  defaultTab?: 'url' | 'upload';
  label?: string;
  urlPlaceholder?: string;
  uploadAccept?: string;
}

export function ImageInputGroup({
  imageUrl,
  onImageUrlChange,
  onImageUpload,
  defaultTab = 'url',
  label = 'Image',
  urlPlaceholder = 'Enter image URL',
  uploadAccept = 'image/*'
}: ImageInputGroupProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            type="url"
            placeholder={urlPlaceholder}
            value={imageUrl || ''}
            onChange={(e) => onImageUrlChange(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2">
          <Input
            type="file"
            accept={uploadAccept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
          />
        </TabsContent>
      </Tabs>

      {imageUrl && (
        <div className="mt-2">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-[200px] rounded-md"
          />
        </div>
      )}
    </div>
  );
}
```

## 3. Integration with Existing Forms

### A. Standalone Page Form
If your form is built directly into the page:

```typescript:client/src/pages/profile/ProfileEdit.tsx
import { ImageInputGroup } from '@/components/forms/ImageInputGroup';

export default function ProfileEdit() {
  const [imageUrl, setImageUrl] = useState(user?.profile_image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Replace existing image input with ImageInputGroup
  return (
    <form onSubmit={handleSubmit}>
      {/* Replace existing image input */}
      <ImageInputGroup
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        onImageUpload={setImageFile}
        label="Profile Image"
        urlPlaceholder="Enter profile image URL"
      />
      {/* ... rest of form ... */}
    </form>
  );
}
```

### B. Separate Form Component
If using a separate form component:

```typescript:client/src/components/forms/ProfileEditForm.tsx
interface ProfileEditFormProps {
  user: {
    profile_image_url?: string | null;
    // ... other user fields
  };
  onSubmit: (data: FormData) => Promise<void>;
}

export function ProfileEditForm({ user, onSubmit }: ProfileEditFormProps) {
  // Replace existing image state with dual handling
  const [imageUrl, setImageUrl] = useState(user.profile_image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        {/* Replace existing image input */}
        <ImageInputGroup
          imageUrl={imageUrl}
          onImageUrlChange={setImageUrl}
          onImageUpload={setImageFile}
          label="Profile Image"
          urlPlaceholder="Enter profile image URL"
        />
        {/* ... other fields ... */}
      </form>
    </Form>
  );
}
```

### C. Parent Page Integration
When using the form component:

```typescript:client/src/pages/profile/ProfileEdit.tsx
export default function ProfileEdit() {
  const handleSubmit = async (formData: FormData) => {
    // formData will include both image types from ImageInputGroup
    await updateProfile(formData);
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <ProfileEditForm 
        user={user}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

Note: This pattern replaces any existing image upload or URL input fields with our new `ImageInputGroup` component, which handles both types of image inputs. The component can be used either directly in a page or within a separate form component, with the appropriate props being passed through.

## 4. API Route Handler

```typescript:server/src/controllers/userController.ts
import { uploadToStorage } from '../utils/storage';

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    const imageFile = req.file;  // From multer

    let imageUpdate = {};

    // Handle image upload if present
    if (imageFile) {
      const uploadPath = await uploadToStorage(imageFile);
      imageUpdate = { profile_image_upload: uploadPath };
    }
    // Handle image URL if present
    else if (data.profile_image_url) {
      imageUpdate = { profile_image_url: data.profile_image_url };
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...data,
        ...imageUpdate
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};
```

## 5. Storage Utility

```typescript:server/src/utils/storage.ts
export const uploadToLocalStorage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        // Convert to base64 string
        const base64String = reader.result as string;
        
        // Store in localStorage with a unique key
        const key = `image_${Date.now()}_${file.name}`;
        localStorage.setItem(key, base64String);
        
        // Return the key as the "path"
        resolve(key);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const getImageFromStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removeFromStorage = (key: string): void => {
  localStorage.removeItem(key);
};
```

## 6. Model/Service Layer

```typescript:server/src/services/userService.ts
import { uploadToLocalStorage, getImageFromStorage, removeFromStorage } from '../utils/storage';

export const getUserImage = (user: any) => {
  if (user.profile_image_upload) {
    return getImageFromStorage(user.profile_image_upload) || user.profile_image_url || null;
  }
  return user.profile_image_url || null;
};

export const updateUserImage = async (userId: string, imageData: {
  file?: File,
  url?: string
}) => {
  if (!imageData.file && !imageData.url) {
    return null;
  }

  // Remove old image from storage if exists
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { profile_image_upload: true }
  });

  if (user?.profile_image_upload) {
    removeFromStorage(user.profile_image_upload);
  }

  if (imageData.file) {
    const storagePath = await uploadToLocalStorage(imageData.file);
    return prisma.users.update({
      where: { id: userId },
      data: { 
        profile_image_upload: storagePath,
        profile_image_url: null  // Clear URL when using uploaded file
      }
    });
  }

  return prisma.users.update({
    where: { id: userId },
    data: { 
      profile_image_url: imageData.url,
      profile_image_upload: null  // Clear upload when using URL
    }
  });
};
```

## 7. Frontend Display Component

```typescript:client/src/components/UserImage.tsx
interface UserImageProps {
  user: {
    profile_image_upload?: string | null;
    profile_image_url?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function UserImage({ user, className, fallback }: UserImageProps) {
  const imageUrl = user.profile_image_upload || user.profile_image_url;

  if (!imageUrl) {
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="User profile"
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

## 8. Usage in Components

```typescript:client/src/components/UserCard.tsx
import { UserImage } from './UserImage';

export function UserCard({ user }) {
  return (
    <div>
      <UserImage
        user={user}
        className="w-10 h-10 rounded-full"
        fallback={<DefaultAvatar className="w-10 h-10" />}
      />
      {/* ... rest of card ... */}
    </div>
  );
}
```

## 9. Profile Page Integration

Update the profile page to use our new image handling:

```typescript:client/src/pages/profile/Profile.tsx
import { UserImage } from '@/components/UserImage';
import { PLACEHOLDERS } from '@/constants/placeholders';

export default function Profile() {
  // ... existing state and effects ...

  return (
    <div className="profile-container">
      <div className="profile-sections-container">
        {/* Basic Information */}
        <div className="profile-section">
          <div className="flex justify-between items-center">
            <h1 className="profile-header">{user.username}'s Profile</h1>
            {/* ... buttons ... */}
          </div>
          
          <div className="image-container">
            <UserImage 
              user={user}
              className="profile-image"
              fallback={
                <div className="profile-image flex items-center justify-center bg-gray-100 text-4xl">
                  {PLACEHOLDERS.USER}
                </div>
              }
            />
            
            <div className="flex justify-center items-center space-x-6 mt-4">
              {/* ... interaction buttons ... */}
            </div>
          </div>
          
          {/* ... rest of profile content ... */}
        </div>
      </div>
    </div>
  );
}
```

Add the necessary CSS:

```css:client/src/pages/profile/Profile.css
.profile-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto;
  display: block;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.image-container {
  margin: 2rem 0;
  text-align: center;
}
```

## Best Practices for Local Storage

1. **Size Management**
   - Set maximum file size limits (localStorage has limits)
   - Compress images before storing
   - Clean up old images periodically

2. **Performance**
   - Cache retrieved images in memory
   - Use proper image compression
   - Consider implementing a cleanup strategy

3. **Error Handling**
   - Handle storage quota exceeded errors
   - Provide fallbacks for failed loads
   - Clear invalid entries

4. **Security**
   - Validate file types
   - Sanitize file names
   - Consider encryption for sensitive images

Example cleanup utility:

```typescript:client/src/utils/storageCleanup.ts
export const cleanupStorage = (maxAge = 7 * 24 * 60 * 60 * 1000) => {
  const now = Date.now();
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('image_')) {
      const timestamp = parseInt(key.split('_')[1]);
      if (now - timestamp > maxAge) {
        localStorage.removeItem(key);
      }
    }
  });
};
```

This implementation provides a simpler, client-side solution while maintaining the flexibility to switch to a server-based storage solution later if needed.

## Extension to Other Content Types

Once the user implementation is working, we can extend this pattern to other content types:

1. Update schema for each content type
2. Create similar form components
3. Update API endpoints to handle both types
4. Update display components

The pattern remains the same, just with different field names and contexts.

## Best Practices

1. **Validation**
   - Validate file types and sizes
   - Validate URLs (ensure they're images)
   - Handle failed uploads gracefully

2. **Storage**
   - Use appropriate storage solution (S3, Cloud Storage, etc.)
   - Implement proper file cleanup
   - Handle storage quotas

3. **Performance**
   - Implement image optimization
   - Use proper caching headers
   - Consider using image CDN

4. **Security**
   - Sanitize URLs
   - Validate file contents
   - Implement proper access controls

This implementation provides a flexible solution for handling both uploaded images and image URLs across all content types. 