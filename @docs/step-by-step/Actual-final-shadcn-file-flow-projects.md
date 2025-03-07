# Adapting shadcn Components: Full Setup for Projects Management

## Document Organization
1. Overview & Prerequisites - Setup requirements and status assessment
2. Implementation Strategy - Approach based on existing user functionality 
3. Frontend API Service - Creating the projects API service
4. Custom Form Hooks - State management for project forms
5. Project Controller - Backend request handlers
6. Projects List Page - UI for displaying all user projects
7. Routes & Configuration - Connecting frontend and backend
8. Implementation Checklist - Verification of completed items
9. Integration Tips - Best practices for testing and optimization
10. Common Issues & Troubleshooting - Resolving migration challenges
11. TypeScript and Linting Issues
12. Form Structure and Styling

## User Action Flow: Saving a Project
When a user edits and saves a project, here's the complete file flow:

1. User interacts with **`ProjectEditFormV3.tsx`** (UI component with form elements)
2. Form uses **`useProjectForm.ts`** (Custom hook managing form state and validation)
3. On submit, hook calls **`api/projects.ts`** (API service with project CRUD functions)
4. API service sends HTTP request to backend endpoint
5. Request hits **`server/src/routes/projectRoutes.ts`** (API route definitions)
6. Router calls **`server/src/controllers/projectController.ts`** (Request/response handler)
7. Controller validates request and calls **`server/src/services/projectService.ts`** (Business logic)
8. Service processes data and uses **Prisma client** to interact with the database
9. Response flows back through the same layers:
   - **Database → Service**: Prisma returns updated project data to `projectService.ts`
   - **Service → Controller**: `projectService.ts` processes/formats data and returns to `projectController.ts`
   - **Controller → Route**: `projectController.ts` constructs HTTP response with status and data
   - **Backend → Frontend**: Response data arrives at the `api/projects.ts` function
   - **API → Hook**: `api/projects.ts` resolves the Promise with the response data to `useProjectForm.ts`
10. UI updates based on the response (success/error states)

This architecture ensures separation of concerns, maintainability, and scalability of your application.

## 1. Overview & Prerequisites

- **Monorepo**: You have a `client/` folder for your Vite + React frontend and a `server/` folder for your Express + Prisma backend.
- **Dependencies**: Already installed from previous user profile implementation.
- **Existing Components**: You already have the necessary project components (ProjectEditFormV3.tsx, editproject.tsx, project.tsx) that need to be connected to your backend.

**Current Status Assessment**:
  - ✅ Project Edit Form (`ProjectEditFormV3.tsx`) - Already implemented
  - ✅ Project Display Page (`project.tsx`) - Structure exists, needs data connection
  - ⬜ Projects List Page (`projects/index.tsx`) - Needs to be created
  - ⬜ API Service Functions (`api/projects.ts`) - Create based on pattern in `api/users.ts`
  - ⬜ API Config (`api/config.ts`) - Create based on pattern in `api/config.ts`
  - ⬜ Custom Hooks (`hooks/useProjectForm.ts`) - Create based on pattern in `hooks/useProfileForm.ts`
  - ⬜ Router Configuration (`router/index.tsx`) - Needs project routes added
  - ✅ shadcn components - Already set up from profile implementation

  **Backend Components**:
  - ✅ Prisma Schema (`schema.prisma`) - Projects table schema defined in prisma-projects-guide.md
  - ✅ Prisma Client (`lib/prisma.ts`) - Already set up
  - ⬜ Project Controller (`controllers/projectController.ts`) - Create following pattern in `userController.ts`
  - ⬜ Project Service (`services/projectService.ts`) - Create following pattern in `userService.ts`
  - ⬜ Project Routes (`routes/projectRoutes.ts`) - Create following pattern in `userRoutes.ts`
  - ✅ Authentication Middleware (`middlewares/auth.ts`) - Already implemented
  - ⬜ Express App Configuration for Projects (`index.ts`) - Needs updating

## 2. Implementation Strategy

Since you already have many components in place and the user functionality as a working reference, we'll focus on:

1. Creating the API services and hooks modeled after your existing user implementations
2. Implementing the backend controllers, services, and routes following your established pattern
3. Integrating everything together

## 3. Creating the Frontend API Service

Create a file at `client/src/api/projects.ts` following the same pattern you used for `api/users.ts`:

```typescript
// client/src/api/projects.ts
import axios from 'axios';
import { API_BASE_URL } from './config';

// Fetch all projects for a user
export async function fetchUserProjects(userId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/projects/user/${userId}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

// Fetch single project by ID
export async function fetchProject(projectId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

// Create new project
export async function createProject(projectData: any, token: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, projectData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update existing project
export async function updateProject(projectId: string, projectData: any, token: string) {
  try {
    const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, projectData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Delete project
export async function deleteProject(projectId: string, token: string) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Upload project image
export async function uploadProjectImage(projectId: string, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
}
```

also complete the config file:

```typescript
// client/src/api/config.ts

```

## 4. Creating Custom Hooks for Form Handling

Create a file at `client/src/hooks/useProjectForm.ts` following the pattern from your existing `useProfileForm.ts`:

```typescript
// client/src/hooks/useProjectForm.ts
import { useState, useEffect } from 'react';
import { fetchProject, createProject, updateProject, uploadProjectImage } from '@/api/projects';

export function useProjectForm(projectId?: string) {
  // Use similar structure to your existing ProjectEditFormV3 state
  const [formData, setFormData] = useState({
    // Basic Information (using the structure from ProjectEditFormV3)
    project_image: null as File | null,
    project_name: "",
    project_description: "",
    project_type: "",
    project_category: "",
    
    // Project Details
    project_title: "",
    project_duration: "",
    project_handle: "",
    // ...all other fields from ProjectEditFormV3
    
    // Privacy and preferences
    project_visibility: "public",
    search_visibility: true,
    notification_preferences: {
      email: true,
      push: true,
      digest: true,
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Load project data if editing
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);
  
  async function loadProject(id: string) {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const projectData = await fetchProject(id, token || undefined);
      
      // Map project data to form fields
      setFormData({
        ...projectData,
        project_image: null, // Reset file object, image URL will still display
      });
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    
    // Handle nested fields like notification_preferences or seeking
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
      return;
    }
    
    // Handle normal fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageSelect = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      project_image: file,
    }));
  };
  
  const handleAddTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as string[]), tag],
    }));
  };
  
  const handleRemoveTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] as string[]).filter((t) => t !== tag),
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      let result;
      if (projectId) {
        // Update existing project
        result = await updateProject(projectId, formData, token);
        
        // Upload image if selected
        if (formData.project_image) {
          await uploadProjectImage(projectId, formData.project_image, token);
        }
      } else {
        // Create new project
        result = await createProject(formData, token);
        
        // Upload image if selected and project was created
        if (formData.project_image && result?.id) {
          await uploadProjectImage(result.id, formData.project_image, token);
        }
      }
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to save project');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  return {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleImageSelect,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
  };
}
```

## 5. Creating the Project Controller for Backend

Create a file at `server/src/controllers/projectController.ts` following the pattern from your existing `userController.ts`:

```typescript
// server/src/controllers/projectController.ts
import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

// Get all projects
export async function getProjects(req: Request, res: Response) {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

// Get projects by user ID
export async function getProjectsByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const projects = await projectService.getProjectsByUser(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error in getProjectsByUser:', error);
    res.status(500).json({ message: 'Failed to fetch user projects' });
  }
}

// Get project by ID
export async function getProjectById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error in getProjectById:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
}

// Create new project
export async function createProject(req: Request, res: Response) {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;
    
    // Add user_id to project data
    const projectData = {
      ...req.body,
      user_id: userId
    };
    
    const newProject = await projectService.createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ 
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

// Update project
export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if project exists and belongs to user
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (existingProject.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await projectService.updateProject(id, req.body);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ 
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if project exists and belongs to user
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (existingProject.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }
    
    await projectService.deleteProject(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ 
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Upload project image
export async function uploadProjectImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Check if project exists and belongs to user
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (existingProject.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const imageUrl = await projectService.uploadProjectImage(id, file);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading project image:', error);
    res.status(500).json({ message: 'Error uploading project image' });
  }
}
```

## 6. Creating the Project Service

Create a file at `server/src/services/projectService.ts` following the pattern from your existing `userService.ts`:

```typescript
// server/src/services/projectService.ts
import prisma from '../lib/prisma';

// Format projects for frontend
function formatProject(project: any) {
  // Extract booleans from seeking fields
  const seeking = {
    creator: project.seeking_creator || false,
    brand: project.seeking_brand || false,
    freelancer: project.seeking_freelancer || false,
    contractor: project.seeking_contractor || false,
  };
  
  // Format notification preferences
  const notification_preferences = {
    email: project.notification_preferences_email || false,
    push: project.notification_preferences_push || false,
    digest: project.notification_preferences_digest || false,
  };
  
  // Format social links
  const social_links = {
    youtube: project.social_links_youtube || '',
    instagram: project.social_links_instagram || '',
    github: project.social_links_github || '',
    twitter: project.social_links_twitter || '',
    linkedin: project.social_links_linkedin || '',
  };
  
  // Return formatted project
  return {
    ...project,
    seeking,
    notification_preferences,
    social_links,
    // Remove flattened fields to avoid duplication
    social_links_youtube: undefined,
    social_links_instagram: undefined,
    social_links_github: undefined,
    social_links_twitter: undefined,
    social_links_linkedin: undefined,
    notification_preferences_email: undefined,
    notification_preferences_push: undefined,
    notification_preferences_digest: undefined,
  };
}

// Format input data for database
function formatProjectForDB(data: any) {
  const { seeking, notification_preferences, social_links, ...rest } = data;
  
  // Flatten seeking object to individual fields
  const seekingFields = seeking ? {
    seeking_creator: seeking.creator || false,
    seeking_brand: seeking.brand || false,
    seeking_freelancer: seeking.freelancer || false,
    seeking_contractor: seeking.contractor || false,
  } : {};
  
  // Flatten notification preferences
  const notificationFields = notification_preferences ? {
    notification_preferences_email: notification_preferences.email || false,
    notification_preferences_push: notification_preferences.push || false,
    notification_preferences_digest: notification_preferences.digest || false,
  } : {};
  
  // Flatten social links
  const socialFields = social_links ? {
    social_links_youtube: social_links.youtube || '',
    social_links_instagram: social_links.instagram || '',
    social_links_github: social_links.github || '',
    social_links_twitter: social_links.twitter || '',
    social_links_linkedin: social_links.linkedin || '',
  } : {};
  
  // Handle JSON fields (stringify if they're objects)
  const jsonFields: Record<string, any> = {};
  ['team_members', 'collaborators', 'advisors', 'partners', 'testimonials', 'milestones', 'deliverables'].forEach(field => {
    if (rest[field] && typeof rest[field] === 'object') {
      jsonFields[field] = JSON.stringify(rest[field]);
    }
  });
  
  return {
    ...rest,
    ...seekingFields,
    ...notificationFields,
    ...socialFields,
    ...jsonFields,
  };
}

export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany();
    return projects.map(formatProject);
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    throw error;
  }
}

export async function getProjectsByUser(userId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { user_id: userId },
    });
    return projects.map(formatProject);
  } catch (error) {
    console.error('Error in getProjectsByUser:', error);
    throw error;
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    
    if (!project) return null;
    
    return formatProject(project);
  } catch (error) {
    console.error('Error in getProjectById:', error);
    throw error;
  }
}

export async function createProject(data: any) {
  try {
    const formattedData = formatProjectForDB(data);
    
    const newProject = await prisma.project.create({
      data: {
        ...formattedData,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    return formatProject(newProject);
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
}

export async function updateProject(id: string, data: any) {
  try {
    const formattedData = formatProjectForDB(data);
    
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...formattedData,
        updated_at: new Date(),
      },
    });
    
    return formatProject(updatedProject);
  } catch (error) {
    console.error('Error in updateProject:', error);
    throw error;
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
}

export async function uploadProjectImage(id: string, file: Express.Multer.File) {
  try {
    // This would typically involve uploading to cloud storage
    // For now, we'll just store the path locally
    const imagePath = `/uploads/${file.filename}`;
    
    await prisma.project.update({
      where: { id },
      data: {
        project_image: imagePath,
      },
    });
    
    return imagePath;
  } catch (error) {
    console.error('Error in uploadProjectImage:', error);
    throw error;
  }
}
```

## 7. Creating Project Routes and UI Components

### 7.1 Projects List Page

Create a file at `client/src/pages/projects/index.tsx`:

```typescript
// client/src/pages/projects/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProjects } from '@/api/projects';
import { Button } from '@/components/ui/button';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function loadProjects() {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchUserProjects(userId, token);
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, [navigate]);
  
  if (loading) return <div className="container mx-auto px-4 py-8">Loading projects...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={() => navigate('/projects/new')}>Create New Project</Button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">You don't have any projects yet</p>
          <Button onClick={() => navigate('/projects/new')}>Create Your First Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="h-40 bg-gray-200 relative">
                {project.project_image ? (
                  <img 
                    src={project.project_image} 
                    alt={project.project_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
                  {project.project_type}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{project.project_name}</h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {project.project_description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {project.project_status || "Draft"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7.2 Connect ProjectEditFormV3 to useProjectForm

You should update your existing ProjectEditFormV3 component to use the custom hook:

```typescript
// client/src/components/input/forms/ProjectEditFormV3.tsx
// Import useProjectForm and useParams
import { useParams } from 'react-router-dom';
import { useProjectForm } from '@/hooks/useProjectForm';

export default function ProjectEditForm() {
  // Get the project ID from URL if editing
  const { id } = useParams();
  
  // Use the custom hook
  const {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleImageSelect,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
  } = useProjectForm(id);

  if (loading) return <div>Loading project data...</div>;

  // Rest of the component remains largely the same
  // but using the state and handlers from the hook
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">Project saved successfully!</div>}
      
      {/* Form content remains the same, but uses state and handlers from the hook */}
      {/* ... */}
      
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
```

### 7.3 Project Routes

Create a file at `server/src/routes/projectRoutes.ts`:

```typescript
// server/src/routes/projectRoutes.ts
import express from 'express';
import multer from 'multer';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Get all projects (public)
router.get('/', projectController.getProjects);

// Get projects by user ID (public)
router.get('/user/:userId', projectController.getProjectsByUser);

// Get project by ID (public)
router.get('/:id', projectController.getProjectById);

// Protected routes (require authentication)
// Create new project
router.post('/', authenticate, projectController.createProject);

// Update project
router.put('/:id', authenticate, projectController.updateProject);

// Delete project
router.delete('/:id', authenticate, projectController.deleteProject);

// Upload project image
router.post('/:id/image', authenticate, upload.single('image'), projectController.uploadProjectImage);

export default router;
```

### 7.4 Update Express App Configuration

Update `server/src/index.ts` to include the project routes:

```typescript
// server/src/index.ts
// Add this import
import projectRoutes from './routes/projectRoutes';

// Add this to your existing routes configuration
app.use('/api/projects', projectRoutes);
```

## 8. Update Router Configuration

Update `client/src/router/index.tsx` to include the project routes:

```typescript
// client/src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/home/Home'
import Login from '../pages/auth/Login'
import ProfilePage from '../pages/profile/profile'
import ProfileEditPage from '../pages/profile/editprofile'
import ProjectsListPage from '../pages/projects/index'
import ProjectPage from '../pages/project/project'
import ProjectEditPage from '../pages/project/editproject'
import Layout from '../components/layout/layout'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Home /></Layout>,
  },
  {
    path: "/login",
    element: <Layout><Login /></Layout>,
  },
  {
    path: "profile/:id",
    element: <ProfilePage />,
  },
  {
    path: "profile/:id/edit",
    element: <ProfileEditPage />,
  },
  // Add these new routes for projects
  {
    path: "projects",
    element: <ProjectsListPage />,
  },
  {
    path: "projects/new",
    element: <ProjectEditPage />,
  },
  {
    path: "projects/:id",
    element: <ProjectPage />,
  },
  {
    path: "projects/:id/edit",
    element: <ProjectEditPage />,
  },
])
```

## 9. Implementation Checklist

Before you consider the project functionality complete, make sure you have:

1. **Frontend Components**:
   - ✅ Project Edit Form (`ProjectEditFormV3.tsx`)
   - ✅ Project Display Page (`project.tsx`)
   - ✅ Projects List Page (`projects/index.tsx`)
   - ✅ API Service Functions (`api/projects.ts`)
   - ✅ Custom Hooks (`hooks/useProjectForm.ts`)
   - ✅ Router Configuration (`router/index.tsx` with project routes)

2. **Backend Components**:
   - ✅ Prisma Schema (`schema.prisma` with projects table)
   - ✅ Project Controller (`controllers/projectController.ts`)
   - ✅ Project Service (`services/projectService.ts`)
   - ✅ Project Routes (`routes/projectRoutes.ts`)
   - ✅ Express App Configuration (`index.ts` with project routes)

3. **Additional Requirements**:
   - ✅ JSON data handling (for complex arrays like `milestones`, `team_members`, etc.)
   - ✅ File uploads (for project images)
   - ✅ Authentication middleware integration
   - ✅ Proper error handling
   - ✅ User-specific data access (users can only edit/delete their own projects)

## 10. Common Issues & Troubleshooting

When migrating components from Next.js or implementing the projects functionality, you might encounter these common issues:

### Import Path Problems

Next.js projects often use a different import pattern than standard React applications. When adapting components, pay attention to:

1. **Component Path References**: 
   ```typescript
   // Incorrect local import (common in Next.js components)
   import PageSection from "./PageSection"
   
   // Correct absolute import with path alias
   import PageSection from "@/components/sections/PageSection"
   ```

2. **Image Handling**: Next.js has its own Image component that needs to be replaced with standard HTML img tags or a custom Image component.

3. **CSS Module Imports**: Check for any special CSS imports that might need to be adjusted.

### Router Configuration Issues

React Router requires precise configuration for proper routing:

1. **Leading Slashes**: Always include leading slashes in route paths for consistency:
   ```typescript
   // Correct
   { path: "/projects", element: <Layout><ProjectsListPage /></Layout> }
   
   // May cause issues
   { path: "projects", element: <ProjectsListPage /> }
   ```

2. **Route Export**: Export your router correctly in index.tsx:
   ```typescript
   export default router; // Make sure to export as default
   ```

3. **Consistent Layout Wrapper**: Wrap all route components with the same Layout component:
   ```typescript
   { path: "/profile/:id", element: <Layout><ProfilePage /></Layout> }
   ```

### Component Adaptations

When migrating from Next.js to React Router:

1. **Remove Next.js Specific Code**: 
   - No `getServerSideProps` or `getStaticProps`
   - Replace `useRouter()` with `useNavigate()` and `useParams()`
   - Remove any Next.js specific hooks or imports

2. **File Naming and Organization**: 
   - Be consistent with file casing (Layout.tsx vs layout.tsx)
   - Ensure imports match the actual file paths and names

3. **Server Components vs Client Components**: 
   - Remove any "use client" or "use server" directives if not needed
   - Adapt server-side rendering patterns to client-side data fetching

### Testing Your Routes

If you encounter 404 errors or routing issues:

1. Create a simple test route to verify the router is working:
   ```typescript
   {
     path: "/test",
     element: <Layout><div>Test Route</div></Layout>,
   }
   ```

2. Check the console for import errors that might prevent components from loading

3. Verify that your main.tsx is correctly importing and using the router:
   ```typescript
   import router from './router/index';
   
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <RouterProvider router={router} />
     </React.StrictMode>
   );
   ```

By following these troubleshooting tips, you can successfully adapt Next.js components and ensure your project functionality works seamlessly alongside the existing user profile features.

## 11. TypeScript and Linting Issues

When implementing the project functionality, you might encounter several TypeScript and linting issues. Here are common issues and their solutions:

### File Casing Consistency

The most common issue is with Layout component imports having inconsistent casing:

```typescript
// Incorrect - mixed casing
import Layout from '@/components/layout/layout';
import Layout from '@/components/layout/Layout';

// Correct - pick one consistent pattern (preferably PascalCase for components)
import Layout from '@/components/layout/Layout';
```

### Image Handling Types

When dealing with image uploads, you need to handle the type conversion properly:

```typescript
// Incorrect
initialImage={formData.project_image as string}

// Correct - check for existence and type
initialImage={formData.project_image ? 
  (typeof formData.project_image === 'string' ? formData.project_image : undefined) 
  : undefined}
```

### Prisma Schema Alignment

Make sure your Prisma model names match your code:

```typescript
// Incorrect
const user = await prisma.users.findUnique({

// Correct
const user = await prisma.user.findUnique({
```

### Express Route Types

Express route handlers need proper type definitions:

```typescript
// Incorrect
router.get('/:id', projectController.getProjectById);

// Correct
router.get('/:id', async (req: Request, res: Response) => {
  await projectController.getProjectById(req, res);
});
```

### Error Handling Types

When handling errors, make sure to type them properly:

```typescript
// Incorrect
} catch (error) {
  console.error(error.message);

// Correct
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('An unknown error occurred');
  }
}
```

## 12. Form Structure and Styling

The project edit form should follow a consistent structure with the following sections:

### Basic Information
- Project Image Upload
- Project Name
- Project Description
- Project Type
- Project Category (conditional based on type)

### Project Details
- Project Title
- Duration
- Handle
- Client Information (conditional based on type)
- Contract Information (conditional based on type)

### Focus
- Target Audience
- Solutions Offered
- Industry Tags
- Technology Tags

### Status
- Project Status
- Seeking (checkboxes for creator, brand, freelancer, contractor)

### Contact & Availability
- Social Links
  - YouTube
  - Instagram
  - GitHub
  - Twitter
  - LinkedIn
- Website Links

### Team & Collaborators
- Team Members
- Collaborators
- Advisors
- Partners
- Testimonials

### Project Goals
- Short Term Goals
- Long Term Goals

### Privacy & Notifications
- Project Visibility
- Search Visibility
- Notification Preferences

Each section should use consistent styling:

```typescript
<PageSection title="Section Title">
  <div className="md:grid md:grid-cols-2 md:gap-6">
    <CategorySection title="Subsection Title">
      <div className="space-y-4 w-full">
        {/* Form fields */}
      </div>
    </CategorySection>
  </div>
</PageSection>
```

### Form Field Styling

All form fields should use consistent styling classes:

```typescript
// Input fields
className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"

// Labels
className="block text-sm font-medium text-gray-700"

// Tag containers
className="flex flex-wrap gap-2"

// Tags
className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
```

This structure ensures consistency with your profile pages while maintaining the specific requirements for project management.