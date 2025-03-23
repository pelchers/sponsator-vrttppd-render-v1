# Dual Image Implementation Guide (Projects System)

This guide extends the profile image implementation to handle project images, incorporating all fixes and improvements from the profile system.

## Key Differences from Profile Implementation

1. **Directory Structure**:
   ```bash
   server/
     ├── uploads/
     │   ├── profiles/    # From previous implementation
     │   └── projects/    # New directory for project images
     └── src/
         └── middleware/
             └── upload.ts
   ```

2. **Field Names**:
   ```prisma
   model projects {
     project_image_url    String?   // For external URLs
     project_image_upload String?   // For uploaded file paths (relative to uploads/projects)
     project_image_display String?  @default("url")
   }
   ```

3. **File Size Limits**:
   - Projects: 10MB (larger for high-quality project images)
   - Profiles: 5MB (standard profile photos)

## 1. Type Definitions

```typescript:client/src/types/project.ts
export interface Project {
  // ... existing fields
  project_image_url?: string | null;    // External URL
  project_image_upload?: string | null;  // Path like 'projects/project-123456.jpg'
  project_image_display?: 'url' | 'upload';
}

export interface ProjectFormData extends Project {
  project_image_file?: File | null;  // For handling file uploads
}
```

## 2. Upload Middleware Configuration

```typescript:server/src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const projectsDir = path.join(uploadsDir, 'projects');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, projectsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `project-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadProject = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for project images
  }
});
```

## 3. Static File Serving

```typescript:server/src/index.ts
// Add to existing static file serving
app.use('/uploads/projects', express.static(path.join(__dirname, '../uploads/projects')));
```

## 4. Project Service Implementation

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

## 5. Frontend Components

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

```typescript:client/src/components/input/forms/ProjectEditForm.tsx
export function ProjectEditForm() {
  // ... other form setup ...

  return (
    <div className="form-section">
      <h2 className="section-title">Project Image</h2>
      
      {/* Image section container */}
      <div className="flex flex-col items-center space-y-4">
        {/* Image Toggle Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className={`px-4 py-2 rounded transition-colors ${
              formData.project_image_display === 'url' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              project_image_display: 'url',
              project_image_upload: null 
            }))}
          >
            Use URL Image
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded transition-colors ${
              formData.project_image_display === 'upload' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              project_image_display: 'upload',
              project_image_url: '' 
            }))}
          >
            Use Uploaded Image
          </button>
        </div>

        {/* URL Input or Upload Component */}
        {formData.project_image_display === 'url' ? (
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="project_image_url"
              value={formData.project_image_url}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                project_image_url: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {/* URL preview */}
            {formData.project_image_url && (
              <div className="mt-4 flex justify-center">
                <img
                  src={formData.project_image_url}
                  alt="Project preview"
                  className="w-full max-w-md rounded-lg object-cover border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        ) : (
          <ImageUpload 
            onImageSelect={handleImageSelect}
            currentImage={
              formData.project_image_upload 
                ? `/uploads/${formData.project_image_upload}`
                : null
            }
            showPreview={true}
          />
        )}
      </div>
    </div>
  );
}
```

## 6. Form Hook Implementation

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

## Key Implementation Notes

1. **Path Handling**:
   - Always use relative paths in database: `projects/project-123456.jpg`
   - Construct full paths in frontend: `/uploads/projects/project-123456.jpg`
   - Never store absolute paths

2. **Preview Handling**:
   - Let each mode handle its own preview
   - URL mode shows preview below input
   - Upload mode uses ImageUpload component's preview

3. **Layout Organization**:
   - Use flex container for consistent centering
   - Group related elements with proper spacing
   - Maintain responsive design

4. **Error Handling**:
   - Validate file types and sizes
   - Handle upload failures gracefully
   - Provide user feedback

5. **State Management**:
   - Clear unused fields when switching modes
   - Maintain consistent state
   - Handle loading states properly

## Testing Checklist

1. ✅ Directory Setup
   - Verify `/uploads/projects` exists
   - Check directory permissions

2. ✅ Image Upload
   - Test file size limits
   - Verify file type restrictions
   - Check path construction

3. ✅ URL Input
   - Test URL validation
   - Verify preview display
   - Check error handling

4. ✅ Display Modes
   - Test mode switching
   - Verify state clearing
   - Check preview consistency

5. ✅ Integration
   - Test in project list view
   - Verify in project details
   - Check edit form functionality

This implementation provides a robust solution for handling both URL and uploaded images in projects, incorporating all the improvements and fixes from the profile implementation. 