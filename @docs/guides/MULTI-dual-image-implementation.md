# Multi-Entity Dual Image Implementation Guide

This guide extends the profile dual image implementation to projects, articles, and posts, ensuring consistent image handling across all content types.

## 1. Database Schema (Already Updated)

The schema already includes the necessary fields for all entities:

```prisma
model posts {
  // ... existing fields
  post_image_url               String?
  post_image_upload            String?
  post_image_display           String?   @default("url")
}

model projects {
  // ... existing fields
  project_image_url            String?
  project_image_upload         String?
  project_image_display        String?   @default("url")
}

model articles {
  // ... existing fields
  article_image_url            String?
  article_image_upload         String?
  article_image_display        String?   @default("url")
}
```

## 2. Frontend Types

### Common Image Interface
```typescript
// types/shared.ts
export interface DualImageFields {
  image_url?: string;
  image_upload?: string;
  image_display?: 'url' | 'upload';
}

export interface ImageFormData {
  image_file?: File | null;
}
```

### Entity Types
```typescript
// types/project.ts
export interface Project extends DualImageFields {
  // ... other fields
}

// types/article.ts
export interface Article extends DualImageFields {
  // ... other fields
}

// types/post.ts
export interface Post extends DualImageFields {
  // ... other fields
}
```

## 3. Shared Image Hook

Create a reusable hook for image handling:

```typescript
// hooks/useDualImage.ts
export function useDualImage(entityId: string, entityType: 'project' | 'article' | 'post') {
  const [imageState, setImageState] = useState({
    image_url: '',
    image_upload: '',
    image_display: 'url' as 'url' | 'upload',
    image_file: null as File | null,
  });

  const handleImageSelect = async (file: File) => {
    if (!entityId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await uploadEntityImage(entityType, entityId, file, token);
      
      setImageState(prev => ({
        ...prev,
        image_file: file,
        image_upload: result.path,
        image_url: '',
        image_display: 'upload'
      }));
    } catch (error) {
      console.error(`Error uploading ${entityType} image:`, error);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageState(prev => ({
      ...prev,
      image_url: url,
      image_upload: '',
      image_display: 'url'
    }));
  };

  return {
    imageState,
    setImageState,
    handleImageSelect,
    handleImageUrlChange
  };
}
```

## 4. Entity Form Components

Example implementation for projects (similar for articles and posts):

```typescript
// components/forms/ProjectForm.tsx
export function ProjectForm({ projectId }: { projectId?: string }) {
  const {
    imageState,
    handleImageSelect,
    handleImageUrlChange
  } = useDualImage(projectId, 'project');

  return (
    <form>
      <div className="form-section">
        <h2 className="section-title">Project Image</h2>
        
        <ImageToggleButtons
          display={imageState.image_display}
          onToggle={(display) => {
            if (display === 'url') {
              handleImageUrlChange('');
            } else {
              setImageState(prev => ({
                ...prev,
                image_url: '',
                image_display: 'upload'
              }));
            }
          }}
        />
        
        {imageState.image_display === 'url' ? (
          <URLInput
            value={imageState.image_url}
            onChange={handleImageUrlChange}
          />
        ) : (
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={
              imageState.image_upload
                ? `${API_URL.replace('/api', '')}/uploads/${imageState.image_upload}`
                : null
            }
          />
        )}
      </div>
    </form>
  );
}
```

## 5. Display Components

Shared image display component:

```typescript
// components/shared/EntityImage.tsx
export function EntityImage({ 
  display,
  urlImage,
  uploadImage,
  alt,
  className
}: EntityImageProps) {
  const imageSrc = display === 'url'
    ? urlImage
    : uploadImage
      ? `${API_URL.replace('/api', '')}/uploads/${uploadImage}`
      : '/placeholder.svg';

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
    />
  );
}
```

Usage in entity components:

```typescript
// In ProjectView/ArticleView/PostView
<EntityImage
  display={entity.image_display}
  urlImage={entity.image_url}
  uploadImage={entity.image_upload}
  alt={entity.title}
  className="entity-image"
/>
```

## 6. API Services

Shared image upload service:

```typescript
// api/shared.ts
export async function uploadEntityImage(
  entityType: 'project' | 'article' | 'post',
  entityId: string,
  file: File,
  token: string
) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `${API_URL}/${entityType}s/${entityId}/image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }
  );

  return response.json();
}
```

## 7. Backend Implementation

Shared controller logic:

```typescript
// controllers/shared.ts
export const uploadEntityImage = (entityType: string) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadImage(entityType, id, file);

    res.json({
      success: true,
      data: {
        path: result.path,
        display: 'upload'
      }
    });
  } catch (error) {
    console.error(`Error uploading ${entityType} image:`, error);
    res.status(500).json({ error: `Failed to upload ${entityType} image` });
  }
};
```

## 8. Path Handling

The same path handling fix applies to all entities:

```typescript
// In any component displaying entity images
const imageUrl = entity.image_display === 'url'
  ? entity.image_url
  : entity.image_upload
    ? `${API_URL.replace('/api', '')}/uploads/${entity.image_upload}`
    : '/placeholder.svg';
```

## Best Practices

1. **Consistent Field Names**
   - Use the same field structure across all entities
   - Keep display preference naming consistent
   - Use shared interfaces where possible

2. **Shared Components**
   - Create reusable image handling components
   - Share toggle buttons and upload components
   - Use consistent styling across entities

3. **Error Handling**
   - Implement consistent error handling
   - Validate files and URLs uniformly
   - Provide clear error messages

4. **State Management**
   - Use shared hooks for image state
   - Keep state updates consistent
   - Clear unused fields when switching modes

5. **Path Construction**
   - Use consistent path handling
   - Keep static file serving separate
   - Handle URLs consistently

This implementation ensures consistent image handling across all content types while maintaining clean, reusable code. 