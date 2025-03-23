# Dual Image Implementation Guide (Projects System)

This guide extends the profile image implementation to handle project images, with notes for articles and posts following the same pattern.

## Directory Structure Extension

First, extend the uploads directory structure:

```bash
server/
  ├── uploads/
  │   ├── profiles/    # From previous implementation
  │   ├── projects/    # New directory for project images
  │   ├── articles/    # New directory for article images
  │   └── posts/       # New directory for post images
  └── src/
      └── middleware/
          └── upload.ts
```

## 1. Update Upload Middleware

Extend the upload middleware to handle multiple content types:

```typescript:server/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure all upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const projectsDir = path.join(uploadsDir, 'projects');
const articlesDir = path.join(uploadsDir, 'articles');
const postsDir = path.join(uploadsDir, 'posts');

// Create directories if they don't exist
[uploadsDir, profilesDir, projectsDir, articlesDir, postsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// Create storage configurations for each content type
const createStorage = (directory: string, prefix: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, directory);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });
};

// Export upload middleware for each content type
export const uploadProfile = multer({ 
  storage: createStorage(profilesDir, 'profile'),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export const uploadProject = multer({ 
  storage: createStorage(projectsDir, 'project'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB for projects
});

export const uploadArticle = multer({ 
  storage: createStorage(articlesDir, 'article'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadPost = multer({ 
  storage: createStorage(postsDir, 'post'),
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

## 2. Update Static File Serving

Add routes for each content type in Express:

```typescript:server/src/index.ts
import path from 'path';
import express from 'express';

// ... other imports and setup ...

// Serve static files for all content types
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));
app.use('/uploads/projects', express.static(path.join(__dirname, '../uploads/projects')));
app.use('/uploads/articles', express.static(path.join(__dirname, '../uploads/articles')));
app.use('/uploads/posts', express.static(path.join(__dirname, '../uploads/posts')));

// ... rest of server setup
```

## 3. Project Service Implementation

Create a dedicated image handling service for projects:

```typescript:server/src/services/projectService.ts
export async function uploadProjectImage(id: string, file: Express.Multer.File) {
  try {
    // Store the path relative to the uploads directory
    const relativePath = `projects/${file.filename}`;
    
    const updatedProject = await prisma.projects.update({
      where: { id },
      data: {
        project_image_upload: relativePath,
        project_image_url: null,
        project_image_display: 'upload' as 'url' | 'upload'
      }
    });
    
    return {
      path: relativePath,
      project: mapProjectToFrontend(updatedProject)
    };
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
}

function mapProjectToFrontend(project: any) {
  // Ensure proper image path is set based on display preference
  const processedProject = {
    ...project,
    project_image: project.project_image_display === 'url' 
      ? project.project_image_url
      : project.project_image_upload 
        ? `/uploads/${project.project_image_upload}`
        : null
  };

  return processedProject;
}
```

## 4. Frontend Components

### Project Image Component

```typescript:client/src/components/ProjectImage.tsx
interface ProjectImageProps {
  project: {
    project_image_display?: 'url' | 'upload';
    project_image_url?: string | null;
    project_image_upload?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function ProjectImage({ project, className, fallback }: ProjectImageProps) {
  const imageUrl = project.project_image_display === 'url'
    ? project.project_image_url
    : project.project_image_upload
      ? `/uploads/${project.project_image_upload}`
      : null;

  if (!imageUrl) {
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="Project"
      className={className}
      onError={(e) => {
        console.error('Image failed to load:', imageUrl);
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

### Project Form Implementation

```typescript:client/src/hooks/useProjectForm.ts
export function useProjectForm(projectId?: string) {
  const [formData, setFormData] = useState({
    // ... other fields
    project_image_file: null as File | null,
    project_image_url: '',
    project_image_upload: '',
    project_image_display: 'url' as 'url' | 'upload',
  });

  const handleImageSelect = async (file: File | null) => {
    try {
      if (!projectId || !file) return;

      const result = await uploadProjectImage(projectId, file);
      
      setFormData(prev => ({
        ...prev,
        project_image_file: file,
        project_image_upload: result.path,
        project_image_url: null,
        project_image_display: 'upload'
      }));
    } catch (error) {
      console.error('Error handling project image:', error);
    }
  };

  // ... rest of form logic
}
```

## 5. Usage in Components

```typescript:client/src/components/ProjectCard.tsx
import { ProjectImage } from './ProjectImage';

export function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <ProjectImage
        project={project}
        className="w-full h-48 object-cover rounded-t-lg"
        fallback={
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        }
      />
      {/* ... rest of card content ... */}
    </div>
  );
}
```

## Implementation Notes

### For Articles and Posts

Follow the same pattern but:
1. Use the appropriate directory (`articles/` or `posts/`)
2. Update field names accordingly:
   - `article_image_url`, `article_image_upload`, `article_image_display`
   - `post_image_url`, `post_image_upload`, `post_image_display`
3. Create corresponding components (`ArticleImage.tsx`, `PostImage.tsx`)

### Key Differences from Profile Implementation

1. **Storage Limits**:
   - Projects/Articles: 10MB (larger for high-quality images)
   - Posts/Profiles: 5MB (standard web images)

2. **Directory Structure**:
   - Each content type has its own directory
   - Prevents filename collisions
   - Easier cleanup and management

3. **Naming Conventions**:
   - Each file type has its own prefix
   - Makes file origin immediately clear
   - Helps with debugging and monitoring

### Best Practices

1. **Path Handling**:
   ```typescript
   // Good - Use relative paths in database
   project_image_upload: 'projects/project-123456.jpg'
   
   // Bad - Store absolute paths
   project_image_upload: '/var/www/uploads/projects/project-123456.jpg'
   ```

2. **Component Reuse**:
   ```typescript
   // Create a base component for reuse
   interface ContentImageProps {
    contentType: 'project' | 'article' | 'post';
    content: {
      [key: string]: any;
    };
    // ... other props
   }
   ```

3. **Error Handling**:
   ```typescript
   // Add specific error types
   class ImageUploadError extends Error {
     constructor(contentType: string, message: string) {
       super(`${contentType} image upload failed: ${message}`);
     }
   }
   ```

### Testing Checklist

1. ✅ Directory Creation
   - All content type directories exist
   - Proper permissions set

2. ✅ Upload Functionality
   - Each content type uploads to correct directory
   - File size limits enforced
   - Proper error handling

3. ✅ Path Resolution
   - Static files served correctly
   - Images load in all contexts
   - No 404 errors

4. ✅ Component Integration
   - Preview works in forms
   - Display works in cards/pages
   - Fallbacks show correctly

This implementation provides a scalable solution for handling images across different content types while maintaining consistency with the profile image implementation. 