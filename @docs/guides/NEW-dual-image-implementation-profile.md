# Dual Image Implementation Guide (Profile System)

This guide documents the implementation of dual image handling (URL and Upload) for user profiles, with display preference toggling.

## 1. Database Schema Update (Prisma)

### Schema Changes (`server/prisma/schema.prisma`)
```prisma
model users {
  // ... existing fields
  profile_image_url              String?   // For external URLs
  profile_image_upload           String?   // For uploaded file paths (relative to uploads/profiles)
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
  profile_image_url?: string | null;    // External URL
  profile_image_upload?: string | null;  // Path like 'profiles/profile-123456.jpg'
  profile_image_display?: 'url' | 'upload';
}

export interface UserFormData extends User {
  profile_image_file?: File | null;  // For handling file uploads
}
```

### Form Hook (`client/src/hooks/useProfileForm.ts`)
```typescript
export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState({
    // ... other fields
    profile_image_file: null as File | null,
    profile_image_url: '',
    profile_image_upload: '',  // Will store relative path like 'profiles/profile-123456.jpg'
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
          profile_image_file: file,
          profile_image_upload: result.path,  // Will be like 'profiles/profile-123456.jpg'
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
          ? `/uploads/${formData.profile_image_upload}`
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
        ? `/uploads/${user.profile_image_upload}`
        : DEFAULT_AVATAR
  }
  alt={`${user.username}'s profile`}
  className="profile-image"
/>
```

### API Service (`client/src/api/users.ts`)
```typescript
export const uploadProfileImage = async (userId: string, file: File, token: string) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    // data.path will be like 'profiles/profile-123456.jpg'
    return data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
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
    ? `/uploads/${user.profile_image_upload}` // Show upload if selected and exists
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
      profile_image_display: 'upload' // Switch to upload display
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

## Preview Handling Fix

When implementing the dual image system, a common issue arises with duplicate previews when both the ImageUpload component and the parent form component try to display previews. Here's how to handle it correctly:

### The Problem
```typescript
// BAD: Shows two previews in upload mode
<ImageUpload 
  showPreview={false}  // Still shows preview from parent
  // ... other props
/>

{/* Duplicate preview logic */}
{(formData.profile_image_url || formData.profile_image_upload) && (
  <div className="mt-4 flex justify-center">
    <img src={/* ... */} />
  </div>
)}
```

### The Solution
Let each mode handle its own preview:

```typescript
// In ProfileEditForm.tsx
{formData.profile_image_display === 'url' ? (
  // URL Input Mode
  <div className="mb-4">
    <input type="url" /* ... */ />
    {/* URL preview only shown in URL mode */}
    {formData.profile_image_url && (
      <div className="mt-4 flex justify-center">
        <img
          src={formData.profile_image_url}
          alt="Profile preview"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
        />
      </div>
    )}
  </div>
) : (
  // Upload Mode - Let ImageUpload handle its own preview
  <ImageUpload 
    onImageSelect={handleImageSelect}
    currentImage={
      formData.profile_image_upload 
        ? `${API_URL.replace('/api', '')}/uploads/${formData.profile_image_upload}`
        : null
    }
    showPreview={true}  // Let ImageUpload handle preview in upload mode
  />
)}
```

### Why This Works Better
1. **Clear Responsibility**:
   - URL mode handles its own preview
   - Upload mode delegates preview to ImageUpload component
   - No overlap in preview logic

2. **Simpler State Management**:
   - Each mode only looks at its own relevant state
   - URL mode only checks `profile_image_url`
   - Upload mode only checks `profile_image_upload`

3. **Consistent Styling**:
   ```typescript
   // Same styling applied in both places
   const previewImageClasses = "w-32 h-32 rounded-full object-cover border-2 border-gray-200";
   ```

4. **Better Maintainability**:
   - Easier to modify preview behavior for each mode independently
   - Clearer code organization
   - Reduced chance of conflicts

### Implementation Checklist
- [ ] Remove shared preview section
- [ ] Enable preview in ImageUpload component (`showPreview={true}`)
- [ ] Add conditional preview for URL mode only
- [ ] Ensure consistent styling between both previews
- [ ] Test preview in both modes

This approach provides a cleaner implementation with clear separation of concerns and no duplicate previews. 

## Critical Path Resolution Fix

When implementing the dual image system, a common issue arises with image paths not being found. Here's the exact fix:

### 1. Server Directory Structure
```bash
server/
  ├── uploads/
  │   └── profiles/  # Dedicated directory for profile images
  └── src/
      └── middleware/
          └── upload.ts
```

### 2. Configure Upload Middleware
```typescript:server/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store profile images in the profiles subdirectory
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    // Include 'profile-' prefix for clarity
    const uniqueSuffix = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
```

### 3. Configure Static File Serving
```typescript:server/src/index.ts
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// For profile images specifically
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));
```

### 4. Update User Service
```typescript:server/src/services/userService.ts
export async function uploadProfileImage(id: string, file: Express.Multer.File) {
  try {
    // Store the path relative to the uploads directory
    const relativePath = `profiles/${file.filename}`;
    
    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        profile_image_upload: relativePath,
        profile_image_url: null,
        profile_image_display: 'upload' as 'url' | 'upload'
      }
    });
    
    return {
      path: relativePath,
      user: mapUserToFrontend(updatedUser)
    };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}
```

### Why This Fix Works
1. **Dedicated Directory**: Creates a specific `profiles` directory for profile images, preventing path conflicts
2. **Consistent Path Structure**: Uses relative paths (`profiles/filename.ext`) in the database
3. **Multiple Static Routes**: Serves files from both `/uploads` and `/uploads/profiles`, ensuring backward compatibility
4. **Path Construction**: Properly constructs file paths for both storage and retrieval

### Common Pitfalls Avoided
1. ❌ Storing absolute paths in database
2. ❌ Mixing path formats between upload and retrieval
3. ❌ Using single static file route
4. ❌ Not handling directory creation

### Testing the Fix
1. Upload a profile image
2. Check the stored path in database (should be like `profiles/profile-1234567890.jpg`)
3. Verify image loads in both profile view and edit form
4. Confirm path in browser dev tools (should be `/uploads/profiles/profile-1234567890.jpg`)

This fix ensures consistent path handling throughout the application and resolves the common "404 Not Found" errors for uploaded images. 

## Layout Organization Fix

When implementing the dual image system, proper layout organization is crucial for consistent UI. Here's how to structure the image section:

### The Problem
```typescript
// BAD: Scattered layout with inconsistent centering
<div className="form-section">
  <h2 className="section-title">Basic Information</h2>
  <div className="image-upload-container">
    <ImageToggleButtons />
  </div>
  
  {/* URL/Upload inputs floating without proper alignment */}
  {formData.profile_image_display === 'url' ? (
    <div className="mb-4">
      <input type="url" /* ... */ />
    </div>
  ) : (
    <ImageUpload /* ... */ />
  )}
  
  {/* Preview floating separately */}
  {formData.profile_image_url && (
    <div className="mt-4">
      <img /* ... */ />
    </div>
  )}
</div>
```

### The Solution
Group all image-related elements in a centered flex container:

```typescript
{/* Basic Information */}
<div className="form-section">
  <h2 className="section-title">Basic Information</h2>
  
  {/* Image section container */}
  <div className="flex flex-col items-center space-y-4">
    {/* Image Toggle Buttons */}
    <div className="flex items-center space-x-4">
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
          profile_image_upload: null 
        }))}
      >
        Use URL Image
      </button>
      <button /* ... similar for upload button ... */ />
    </div>

    {/* URL Input or Upload Component */}
    {formData.profile_image_display === 'url' ? (
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          name="profile_image_url"
          value={formData.profile_image_url}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            profile_image_url: e.target.value
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    ) : (
      <ImageUpload 
        onImageSelect={handleImageSelect}
        currentImage={/* ... */}
        showPreview={true}
      />
    )}
  </div>
</div>
```

### Why This Works Better
1. **Consistent Centering**:
   - All image-related elements are centered using flex layout
   - Toggle buttons and inputs maintain alignment
   - Consistent spacing with `space-y-4`

2. **Contained Width**:
   - URL input has `max-w-md` to prevent stretching
   - Maintains readability and form aesthetics

3. **Logical Grouping**:
   - All image controls are grouped in one container
   - Preview is handled separately for each mode
   - Clear visual hierarchy

4. **Responsive Design**:
   - Flex layout adjusts to different screen sizes
   - Maintains center alignment at all breakpoints
   - Consistent spacing regardless of content

### Implementation Checklist
- [ ] Create main flex container with `flex-col` and `items-center`
- [ ] Group toggle buttons with proper spacing
- [ ] Add width constraints to URL input
- [ ] Ensure consistent preview styling
- [ ] Test responsive behavior

This layout organization provides a clean, centered interface that works well across different screen sizes and maintains visual consistency between URL and upload modes. 