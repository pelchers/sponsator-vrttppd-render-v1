# List Pages Styling and Props Implementation Guide

This guide explains how to implement consistent list pages with proper prop flow and component reuse, using the projects implementation as an example.

## File Structure
```bash
client/src/
  ├── api/
  │   └── projects.ts              # API and type definitions
  ├── components/
  │   ├── ProjectImage.tsx         # Reusable image component
  │   └── cards/
  │       └── ProjectCard.tsx      # Card component used in list
  └── pages/
      └── project/
          └── projectslist.tsx     # List page implementation
```

## Implementation Steps

### 1. API and Types (projects.ts)
```typescript
// Define clear interfaces for data flow
export interface Project {
  id: string;
  title: string;
  description?: string;
  // Image fields for dual system
  project_image_url?: string | null;
  project_image_upload?: string | null;
  project_image_display?: 'url' | 'upload';
  // ... other fields
}

// Fetch function returns properly typed data
export const fetchProjects = async (token?: string): Promise<Project[]> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/projects`, { headers });
    return response.data;
  } catch (error) {
    // ... error handling
  }
};
```

### 2. List Page (projectslist.tsx)
```typescript
import { ProjectImage } from '@/components/ProjectImage';
import { PencilIcon } from '@/components/icons/PencilIcon';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Load data
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchProjects(token);
        setProjects(data);
      } catch (err) {
        // ... error handling
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with create button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          to="/projects/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Project
        </Link>
      </div>

      {/* Grid of project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            {/* Main content link */}
            <Link to={`/projects/${project.id}`} className="block">
              {/* Image section using ProjectImage component */}
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <ProjectImage
                  project={{
                    project_image_url: project.project_image_url,
                    project_image_upload: project.project_image_upload,
                    project_image_display: project.project_image_display
                  }}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No project image</span>
                    </div>
                  }
                />
              </div>
              
              {/* Project details */}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                <p className="text-gray-600 line-clamp-3">{project.description}</p>
              </div>
            </Link>

            {/* Edit button */}
            <Link
              to={`/projects/${project.id}/edit`}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md"
            >
              <PencilIcon className="w-4 h-4 text-gray-600 hover:text-blue-500" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Key Concepts

### 1. Props Flow and Type Safety

The data flows through a clear chain of typed components and interfaces:

```typescript
// 1. API Layer (projects.ts)
export interface Project {
  id: string;
  project_image_url?: string | null;
  project_image_upload?: string | null;
  project_image_display?: 'url' | 'upload';
  // ... other fields
}

// 2. List Page Component (projectslist.tsx)
const [projects, setProjects] = useState<Project[]>([]);

// 3. ProjectImage Component Props
interface ProjectImageProps {
  project: {
    project_image_url?: string | null;
    project_image_upload?: string | null;
    project_image_display?: 'url' | 'upload';
  };
  className?: string;
  fallback?: React.ReactNode;
}
```

The complete flow works like this:
1. **API → List Page**:
   ```typescript
   // In projectslist.tsx
   const loadProjects = async () => {
     const data = await fetchProjects(token); // Returns Project[]
     setProjects(data); // State is typed as Project[]
   };
   ```

2. **List Page → ProjectImage**:
   ```typescript
   // In projectslist.tsx
   <ProjectImage
     project={{
       project_image_url: project.project_image_url,
       project_image_upload: project.project_image_upload,
       project_image_display: project.project_image_display
     }}
     // ... other props
   />
   ```

3. **ProjectImage → Display**:
   ```typescript
   // In ProjectImage.tsx
   const imageUrl = project.project_image_display === 'url'
     ? project.project_image_url
     : project.project_image_upload
       ? `${API_URL}/uploads/${project.project_image_upload}`
       : null;
   ```

### 2. Component Reuse Pattern

The ProjectImage component is designed for maximum reusability:

1. **Consistent Interface**:
   ```typescript
   // ProjectImage.tsx
   export function ProjectImage({ project, className, fallback }: ProjectImageProps) {
     // Same interface used everywhere
   }
   ```

2. **Usage Examples**:
   ```typescript
   // In list view (thumbnail)
   <ProjectImage
     project={project}
     className="w-full h-48 object-cover"
     fallback={<DefaultThumbnail />}
   />

   // In detail view (full size)
   <ProjectImage
     project={project}
     className="w-full max-h-[600px] object-contain"
     fallback={<FullSizePlaceholder />}
   />

   // In edit form (preview)
   <ProjectImage
     project={formData}
     className="w-64 h-64 object-cover rounded"
     fallback={<EditPreviewPlaceholder />}
   />
   ```

3. **Shared Logic**:
   - Path construction
   - Error handling
   - Fallback display
   - Loading states

4. **Usage Locations**:
   ```typescript
   // List page cards
   projectslist.tsx → ProjectCard → ProjectImage

   // Detail view
   project.tsx → ProjectImage

   // Edit form
   editproject.tsx → ProjectImage

   // Results grid
   ResultsGrid.tsx → ProjectCard → ProjectImage
   ```

### 3. Styling and Layout Strategy

The styling system uses a hierarchical approach:

1. **Container Level** (Page Layout):
   ```typescript
   // Base container
   <div className="container mx-auto px-4 py-8">
     {/* Content */}
   </div>

   // Header section
   <div className="flex justify-between items-center mb-6">
     <h1 className="text-2xl font-bold">Projects</h1>
     <Link className="bg-blue-500 hover:bg-blue-600 ...">
       Create Project
     </Link>
   </div>
   ```

2. **Grid Level** (Responsive Layout):
   ```typescript
   // Responsive grid with breakpoints
   <div className={`
     grid
     grid-cols-1          // Mobile: 1 column
     md:grid-cols-2       // Tablet: 2 columns
     lg:grid-cols-3       // Desktop: 3 columns
     gap-6               // Consistent spacing
   `}>
     {/* Cards */}
   </div>
   ```

3. **Card Level** (Component Layout):
   ```typescript
   // Card structure
   <div className="relative bg-white rounded-lg shadow hover:shadow-md">
     {/* Main content wrapper */}
     <Link className="block">
       {/* Image container */}
       <div className="aspect-video w-full overflow-hidden rounded-t-lg">
         <ProjectImage {...props} />
       </div>
       
       {/* Content section */}
       <div className="p-4">
         <h2 className="text-xl font-semibold mb-2">{title}</h2>
         <p className="text-gray-600 line-clamp-3">{description}</p>
       </div>
     </Link>

     {/* Floating edit button */}
     <Link className="absolute top-2 right-2 ...">
       <PencilIcon />
     </Link>
   </div>
   ```

4. **Consistent Patterns**:
   ```typescript
   // Spacing
   const spacing = {
     container: 'px-4 py-8',
     section: 'mb-6',
     card: 'p-4',
     elements: 'mb-2'
   };

   // Transitions
   const transitions = {
     hover: 'transition-shadow hover:shadow-md',
     button: 'transition-colors hover:bg-blue-600'
   };

   // Colors
   const colors = {
     primary: 'bg-blue-500 hover:bg-blue-600',
     text: 'text-gray-600',
     heading: 'text-gray-900'
   };
   ```

This structured approach ensures:
- Consistent visual hierarchy
- Predictable responsive behavior
- Easy maintenance and updates
- Reusable style patterns
- Clear component boundaries

This implementation provides a robust foundation for list pages that's easy to maintain and extend. 