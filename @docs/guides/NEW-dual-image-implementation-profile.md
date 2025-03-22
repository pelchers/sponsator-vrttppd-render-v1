# Dual Image Implementation Guide (Profile System)

This guide documents the implementation of dual image handling (URL and Upload) for user profiles, with display preference toggling.

## 1. Database Schema Update (Prisma)

### Schema Changes (`server/prisma/schema.prisma`)
```prisma
model users {
  // ... existing fields
  profile_image_url              String?
  profile_image_upload           String?
  profile_image_display          String?   @default("url")
  // ... rest of fields
}

model posts {
  // ... existing fields
  post_image_url               String?
  post_image_upload            String?
  post_image_display           String?   @default("url")
  // ... rest of fields
}

model projects {
  // ... existing fields
  project_image_url            String?
  project_image_upload         String?
  project_image_display        String?   @default("url")
  // ... rest of fields
}

model articles {
  // ... existing fields
  article_image_url            String?
  article_image_upload         String?
  article_image_display        String?   @default("url")
  // ... rest of fields
}
```

### Migration Command
```bash
npx prisma migrate dev --name add_image_display_preferences
```

## 2. Frontend Implementation

### Types Update (`client/src/types/user.ts`)
```typescript
export interface User {
  // ... existing fields
  profile_image_url?: string;
  profile_image_upload?: string;
  profile_image_display?: 'url' | 'upload';
}

export interface UserFormData extends User {
  profile_image_file?: File | null;
}
```

### Form Hook (`client/src/hooks/useProfileForm.ts`)
```typescript
export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState({
    // ... other fields
    profile_image: null as File | null,
    profile_image_url: '',
    profile_image_upload: '',
    profile_image_display: 'url' as 'url' | 'upload',
  });

  // Image upload handler
  const handleImageSelect = async (file: File | null) => {
    try {
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      if (file && userId) {
        const result = await uploadProfileImage(userId, file, token);
        setFormData(prev => ({
          ...prev,
          profile_image: file,
          profile_image_upload: result.path,
          profile_image_url: null,
          profile_image_display: 'upload'
        }));
      }
    } catch (error) {
      console.error('Error handling image select:', error);
    }
  };

  // URL input handler
  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image_url: url || null,
      profile_image_upload: null,
      profile_image: null,
      profile_image_display: 'url'
    }));
  };
}
```

### Edit Form Component (`client/src/components/input/forms/ProfileEditForm.tsx`)
```typescript
<div className="form-section">
  <h2 className="section-title">Profile Image</h2>
  
  {/* Image Display Toggle */}
  <div className="flex items-center space-x-4 mb-6">
    <button
      type="button"
      className={`px-4 py-2 rounded transition-colors ${
        formData.profile_image_display === 'url' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        profile_image_display: 'url',
        profile_image: null,
        profile_image_upload: null 
      }))}
    >
      Use URL Image
    </button>
    <button
      type="button"
      className={`px-4 py-2 rounded ${
        formData.profile_image_display === 'upload' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200'
      }`}
      onClick={() => setFormData(prev => ({ 
        ...prev, 
        profile_image_display: 'upload' 
      }))}
    >
      Use Uploaded Image
    </button>
  </div>

  {/* Image Upload Component */}
  <ImageUpload 
    onImageSelect={handleImageSelect} 
    currentImage={
      formData.profile_image_display === 'url'
        ? formData.profile_image_url
        : formData.profile_image_upload 
          ? `${API_URL.replace('/api', '')}/uploads/${formData.profile_image_upload}` 
          : null
    }
    disabled={formData.profile_image_display === 'url'}
  />
</div>
```

### Profile Display Component (`client/src/pages/profile/profile.tsx`)
```typescript
<img 
  src={
    user.profile_image_display === 'url' 
      ? user.profile_image_url
      : user.profile_image_upload 
        ? `${API_URL.replace('/api', '')}/uploads/${user.profile_image_upload}` 
        : DEFAULT_AVATAR
  }
  alt={`${user.username}'s profile`}
  className="profile-image"
/>
```

### API Service (`client/src/api/users.ts`)
```typescript
export const updateUserProfile = async (userId: string, data: any, token: string) => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // ... error handling and response processing
  } catch (error) {
    console.error('API: Error updating user profile:', error);
    throw error;
  }
};
```

## 3. Backend Implementation

### User Controller (`server/src/controllers/userController.ts`)
```typescript
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        // ... other fields
        profile_image_url: true,
        profile_image_upload: true,
        profile_image_display: true,
      }
    });

    // ... response handling
  } catch (error) {
    // ... error handling
  }
};
```

### User Service (`server/src/services/userService.ts`)
```typescript
export const updateUserProfile = async (userId: string, data: any) => {
  try {
    // Define allowed fields
    const allowedFields = [
      // ... other fields
      'profile_image_url',
      'profile_image_upload',
      'profile_image_display'
    ];

    // Filter data
    const filteredData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    // Update user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: filteredData,
      select: {
        // ... other fields
        profile_image_url: true,
        profile_image_upload: true,
        profile_image_display: true,
      }
    });

    return updatedUser;
  } catch (error) {
    // ... error handling
  }
};

export const handleProfileImageUpload = async (userId: string, filePath: string) => {
  try {
    const relativePath = path.relative(
      path.join(__dirname, '../../uploads'),
      filePath
    ).replace(/\\/g, '/');

    const fullPath = `/uploads/${relativePath}`;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        profile_image_upload: fullPath,
        profile_image_url: null
      }
    });

    return {
      path: fullPath,
      user: updatedUser
    };
  } catch (error) {
    // ... error handling
  }
};
```

### Static File Serving (`server/src/index.ts`)
```typescript
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## Implementation Flow

1. Database schema updated to support dual image sources and display preference
2. Backend updated to handle both image types and serve static files
3. Frontend components updated to:
   - Toggle between image sources
   - Display correct image based on preference
   - Handle image uploads and URL inputs
   - Maintain state across page reloads
4. API services updated to handle authentication and image uploads properly

## Usage

Users can now:
1. Toggle between URL and uploaded image
2. Input image URLs
3. Upload local images
4. See their chosen image source in both edit and profile views
5. Have their preference persisted across sessions 

## Detailed Implementation Notes

### Image Selection Strategy

1. **State Management**
```typescript
// Initial state includes both image sources and display preference
const [formData, setFormData] = useState({
  profile_image: null as File | null,
  profile_image_url: '',
  profile_image_upload: '',
  profile_image_display: 'url' as 'url' | 'upload', // Controls which source to display
});
```

2. **Toggle Implementation**
```typescript
// Toggle buttons with visual feedback
<div className="flex items-center space-x-4 mb-6">
  <button
    type="button"
    className={`px-4 py-2 rounded transition-colors ${
      formData.profile_image_display === 'url' 
        ? 'bg-blue-500 text-white' // Active state
        : 'bg-gray-200 hover:bg-gray-300' // Inactive state
    }`}
    onClick={() => setFormData(prev => ({ 
      ...prev, 
      profile_image_display: 'url',
      // Clear upload when switching to URL
      profile_image: null,
      profile_image_upload: null 
    }))}
  >
    Use URL Image
  </button>
  {/* Similar for Upload button */}
</div>
```

### Rendering Fixes

1. **Conditional Image Display**
```typescript
// In Profile component
const displayImage = user.profile_image_display === 'url'
  ? user.profile_image_url // Show URL if selected
  : user.profile_image_upload 
    ? `${API_URL.replace('/api', '')}/uploads/${user.profile_image_upload}` // Show upload if selected and exists
    : DEFAULT_AVATAR; // Fallback if no image

<img 
  src={displayImage}
  alt={`${user.username}'s profile`}
  className="profile-image"
/>
```

2. **Form Preview Handling**
```typescript
// In ImageUpload component
const [preview, setPreview] = useState<string | null>(null);

// Update preview when currentImage changes
useEffect(() => {
  setPreview(currentImage || null);
}, [currentImage]);

// Preview display
{(preview || currentImage) ? (
  <div className="relative w-32 h-32">
    <img
      src={preview || currentImage}
      alt="Preview"
      className="w-full h-full object-cover rounded-lg"
    />
    {/* Remove button */}
  </div>
) : (
  <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
    <span className="text-gray-400">No image selected</span>
  </div>
)}
```

### State Persistence

1. **Database Storage**
```prisma
model users {
  profile_image_url    String?   // Store URL if using external image
  profile_image_upload String?   // Store upload path if using local image
  profile_image_display String?  @default("url") // Remember user's preference
}
```

2. **Loading Saved State**
```typescript
useEffect(() => {
  async function loadUserData() {
    const userData = await fetchUserProfile(userId, token);
    
    setFormData(prev => ({
      ...prev,
      profile_image_url: userData.profile_image_url || '',
      profile_image_upload: userData.profile_image_upload || '',
      profile_image_display: userData.profile_image_display || 'url',
    }));
  }
  
  loadUserData();
}, [userId]);
```

### Input Handling

1. **URL Input**
```typescript
const handleImageUrlChange = (url: string) => {
  setFormData(prev => ({
    ...prev,
    profile_image_url: url || null,
    profile_image_upload: null, // Clear upload when URL is set
    profile_image: null,        // Clear file when URL is set
    profile_image_display: 'url' // Switch to URL display
  }));
};
```

2. **File Upload**
```typescript
const handleImageSelect = async (file: File | null) => {
  if (file && userId) {
    const result = await uploadProfileImage(userId, file, token);
    setFormData(prev => ({
      ...prev,
      profile_image: file,
      profile_image_upload: result.path,
      profile_image_url: null,    // Clear URL when upload is set
      profile_image_display: 'upload' // Switch to upload display
    }));
  }
};
```

### Component Interaction

1. **Disabled States**
```typescript
// Disable upload component when URL is selected
<ImageUpload 
  disabled={formData.profile_image_display === 'url'}
  // ...
/>

// Disable URL input when upload is selected
<input
  type="url"
  disabled={formData.profile_image_display !== 'url'}
  // ...
/>
```

2. **Visual Feedback**
```typescript
// Show active state for selected option
const buttonClass = (isActive: boolean) => cn(
  "px-4 py-2 rounded transition-colors",
  isActive 
    ? "bg-blue-500 text-white" 
    : "bg-gray-200 hover:bg-gray-300"
);
```

### Error Handling

1. **Upload Validation**
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  setError(null);

  if (file) {
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  }
};
```

2. **URL Validation**
```typescript
const validateImageUrl = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};
```

These improvements ensure:
1. Clear separation between image sources
2. Proper state management
3. Consistent display across components
4. Smooth transitions between options
5. Proper error handling
6. Clear visual feedback
7. Persistent user preferences 

## Important Path Handling Fix

When implementing the dual image system, a critical path handling issue needs to be addressed:

### The Problem
The server serves static files (uploads) from the root path `/uploads`, but the API endpoints are served under `/api`. This mismatch causes image loading issues when using `API_URL` directly.

### The Solution

1. Server Configuration (already correct):
```typescript
// server/src/index.ts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// NOT /api/uploads - files are served from root /uploads
```

2. Frontend Path Correction:
```typescript
// In components that display images, remove /api from the path
const imageUrl = `${API_URL.replace('/api', '')}/uploads/${filename}`;
```

Example implementation:

```typescript
// profile.tsx
<img 
  src={
    user.profile_image_display === 'url'
      ? user.profile_image_url
      : user.profile_image_upload
        ? `${API_URL.replace('/api', '')}/uploads/${user.profile_image_upload}`
        : '/placeholder.svg'
  } 
  alt="Profile" 
  className="profile-image"
/>

// ProfileEditForm.tsx
<ImageUpload 
  onImageSelect={handleImageSelect}
  currentImage={
    formData.profile_image_upload 
      ? `${API_URL.replace('/api', '')}/uploads/${formData.profile_image_upload}`
      : null
  }
/>
```

### Why This Works
- API endpoints are served at: `http://localhost:4100/api/*`
- Static files are served at: `http://localhost:4100/uploads/*`
- By removing `/api` from `API_URL`, we get the correct base URL for static files

### Best Practices
1. Store only filenames in the database, not full paths
2. Construct full URLs on the frontend
3. Keep static file serving separate from API routes
4. Use consistent path handling across all components

This fix ensures that uploaded images display correctly both immediately after upload and on subsequent page loads. 

## Form State Management Fix

When implementing the dual image system in forms, proper state management is crucial. Here's how to handle it:

### Form State Structure
```typescript
// In useProfileForm.ts or similar hook
const [formData, setFormData] = useState({
  // ... other fields
  profile_image: null as File | null,
  profile_image_url: '',
  profile_image_upload: '',
  profile_image_display: 'url' as 'url' | 'upload',
});
```

### Loading Initial State
```typescript
useEffect(() => {
  async function loadUserData() {
    const userData = await fetchUserProfile(userId, token);
    
    setFormData(prev => ({
      ...prev,
      profile_image_url: userData.profile_image_url || '',
      profile_image_upload: userData.profile_image_upload || '',
      profile_image_display: userData.profile_image_display || 'url',
    }));
  }
  
  loadUserData();
}, [userId]);
```

### Image Upload Handler
```typescript
const handleImageSelect = async (file: File) => {
  if (!userId) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const result = await uploadProfileImage(userId, file, token);
    
    setFormData(prev => ({
      ...prev,
      profile_image: file,
      profile_image_upload: result.path,
      profile_image_url: '', // Clear URL when upload is set
      profile_image_display: 'upload'
    }));
  } catch (error) {
    console.error('Error handling image select:', error);
  }
};
```

### URL Input Handler
```typescript
const handleImageUrlChange = (url: string) => {
  setFormData(prev => ({
    ...prev,
    profile_image_url: url,
    profile_image_upload: '', // Clear upload when URL is set
    profile_image_display: 'url'
  }));
};
```

### Toggle Buttons Implementation
```typescript
<button
  type="button"
  className={`px-4 py-2 rounded transition-colors ${
    formData.profile_image_display === 'url' 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-200 hover:bg-gray-300'
  }`}
  onClick={() => setFormData(prev => ({ 
    ...prev, 
    profile_image_display: 'url',
    profile_image_upload: '' // Clear upload when switching to URL
  }))}
>
  Use URL Image
</button>

<button
  type="button"
  className={`px-4 py-2 rounded transition-colors ${
    formData.profile_image_display === 'upload' 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-200 hover:bg-gray-300'
  }`}
  onClick={() => setFormData(prev => ({ 
    ...prev, 
    profile_image_display: 'upload',
    profile_image_url: '' // Clear URL when switching to upload
  }))}
>
  Use Uploaded Image
</button>
```

### Key Points
1. **State Initialization**
   - Initialize all image-related fields
   - Set default display preference to 'url'
   - Handle both null and undefined cases

2. **State Updates**
   - Clear alternative field when switching modes
   - Update display preference with mode changes
   - Maintain file reference for uploads

3. **Form Submission**
   - Send correct image data based on display preference
   - Handle file uploads before form submission
   - Update database with new paths

4. **Error Handling**
   - Validate file uploads
   - Check for missing tokens
   - Handle API errors gracefully

This implementation ensures:
- Clean state transitions between URL and upload modes
- Proper clearing of unused fields
- Consistent state management
- Smooth user experience when switching modes 