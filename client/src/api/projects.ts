import axios from 'axios';
import { API_BASE_URL } from './config';
import { ProjectFormDataWithFile } from '@/types/project';

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

// Add error handling helper
const handleApiError = (error: any, defaultMessage: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || defaultMessage;
    throw new Error(message);
  }
  throw error;
};

// Create new project
export async function createProject(projectData: ProjectFormDataWithFile, token: string) {
  try {
    // Transform data for API
    const apiData = {
      ...projectData,
      // Handle nested objects
      team_members: projectData.team_members.map(member => ({
        ...member,
        media: undefined // Remove file object
      })),
      collaborators: projectData.collaborators.map(collab => ({
        ...collab,
        media: undefined
      })),
      // Similar for other fields with media
    };

    const response = await axios.post(`${API_BASE_URL}/projects`, apiData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error creating project');
  }
}

// Update existing project
export async function updateProject(projectId: string, projectData: ProjectFormDataWithFile, token: string) {
  try {
    // Transform data for API
    const apiData = {
      ...projectData,
      // Handle nested objects
      team_members: projectData.team_members.map(member => ({
        ...member,
        media: undefined // Remove file object
      })),
      // Similar for other fields
    };

    const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, apiData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    handleApiError(error, 'Error updating project');
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
    handleApiError(error, 'Error deleting project');
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
    handleApiError(error, 'Error uploading project image');
  }
}

export async function uploadTeamMemberMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectId}/team-members/${index}/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error uploading team member media');
  }
}

// Add similar functions for other media uploads
export async function uploadCollaboratorMedia(projectId: string, index: number, file: File, token: string) {
  // Similar implementation
}

export async function uploadAdvisorMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);
    
    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectId}/advisors/${index}/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error uploading advisor media');
  }
}

export async function uploadPartnerMedia(projectId: string, index: number, file: File, token: string) {
  // Similar implementation
}

export async function uploadTestimonialMedia(projectId: string, index: number, file: File, token: string) {
  // Similar implementation
} 