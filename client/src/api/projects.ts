import axios from 'axios';
import { API_URL, API_ROUTES, replaceUrlParams, ApiResponse } from './config';
import { ProjectFormDataWithFile } from '@/hooks/useProjectForm';
import { Project } from '@/types/project';
import {
  showClientContractSections,
  showBudgetSection,
  showSkillsExpertise,
  showPortfolio,
  clientInfoLabelMap,
  budgetLabelMap,
  skillsLabelMap,
  deliverablesLabelMap,
  milestonesLabelMap
} from '@/components/input/forms/config/projectFormConfig';

/**
 * Transforms API response data to frontend format
 * @param projectData Raw project data from API
 * @returns Transformed project data matching frontend structure
 */
const transformApiResponse = (data: any) => {
  if (!data) return null;
  
  try {
    // Create a copy of the data
    const result = { ...data };
    
    // Safely parse JSON fields
    const parseJsonField = (field: string) => {
      if (!result[field]) return [];
      
      if (typeof result[field] === 'string') {
        try {
          return JSON.parse(result[field]);
        } catch (error) {
          console.warn(`Error parsing ${field}:`, error);
          return [];
        }
      }
      
      return result[field]; // Already an object/array
    };
    
    // Parse all JSON fields
    result.team_members = parseJsonField('team_members');
    result.collaborators = parseJsonField('collaborators');
    result.advisors = parseJsonField('advisors');
    result.partners = parseJsonField('partners');
    result.testimonials = parseJsonField('testimonials');
    result.deliverables = parseJsonField('deliverables');
    result.milestones = parseJsonField('milestones');
    
    // Add nested objects for UI compatibility
    result.seeking = {
      creator: Boolean(result.seeking_creator),
      brand: Boolean(result.seeking_brand),
      freelancer: Boolean(result.seeking_freelancer),
      contractor: Boolean(result.seeking_contractor)
    };
    
    result.social_links = {
      youtube: result.social_links_youtube || '',
      instagram: result.social_links_instagram || '',
      github: result.social_links_github || '',
      twitter: result.social_links_twitter || '',
      linkedin: result.social_links_linkedin || ''
    };
    
    result.notification_preferences = {
      email: Boolean(result.notification_preferences_email),
      push: Boolean(result.notification_preferences_push),
      digest: Boolean(result.notification_preferences_digest)
    };
    
    return result;
  } catch (error) {
    console.error('Error transforming API response:', error);
    return data; // Return original data if transformation fails
  }
};

// Transform frontend data to API format
const transformFormToApi = (formData: ProjectFormDataWithFile) => {
  return {
    ...formData,
    // Flatten nested objects
    seeking_creator: formData.seeking?.creator || false,
    seeking_brand: formData.seeking?.brand || false,
    seeking_freelancer: formData.seeking?.freelancer || false,
    seeking_contractor: formData.seeking?.contractor || false,
    
    social_links_youtube: formData.social_links?.youtube || '',
    social_links_instagram: formData.social_links?.instagram || '',
    social_links_github: formData.social_links?.github || '',
    social_links_twitter: formData.social_links?.twitter || '',
    social_links_linkedin: formData.social_links?.linkedin || '',

    // Stringify complex objects
    team_members: JSON.stringify(formData.team_members || []),
    collaborators: JSON.stringify(formData.collaborators || []),
    advisors: JSON.stringify(formData.advisors || []),
    partners: JSON.stringify(formData.partners || []),
    testimonials: JSON.stringify(formData.testimonials || []),
    deliverables: JSON.stringify(formData.deliverables || []),
    milestones: JSON.stringify(formData.milestones || []),

    // Remove nested objects after flattening
    seeking: undefined,
    social_links: undefined,
  };
};

// Fetch all projects for a user
export async function fetchUserProjects(userId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = replaceUrlParams(API_ROUTES.PROJECTS.GET_USER_PROJECTS, { userId });
    const response = await axios.get(`${API_URL}${url}`, { 
      headers,
      params: {
        include: [
          'team_members',
          'collaborators',
          'advisors',
          'partners',
          'testimonials',
          'deliverables',
          'milestones'
        ].join(',')
      }
    });

    // Transform each project in the response
    return response.data.map(transformApiResponse);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
}

/**
 * Fetches a project by ID
 * @param projectId The project's unique identifier
 * @param token Optional authentication token
 * @returns Promise resolving to the project data
 * @throws Error if fetch fails
 */
export async function fetchProject(projectId: string, token?: string): Promise<Project> {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_URL}/projects/${projectId}`, { headers });
    return transformApiResponse(response.data);
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

// First, let's update the error handler to be more robust
const handleApiError = (error: any, defaultMessage: string) => {
  console.error(defaultMessage, error);
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || defaultMessage;
    throw new Error(message);
  }
  throw error;
};

// Create new project
export async function createProject(projectData: ProjectFormDataWithFile, token: string): Promise<Project> {
  try {
    const apiData = transformFormToApi(projectData);
    const response = await axios.post(`${API_URL}${API_ROUTES.PROJECTS.CREATE}`, apiData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return transformApiResponse(response.data);
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update existing project
export const updateProject = async (projectId: string, data: any, token: string) => {
  try {
    // Log what's being sent to the backend
    console.log('Sending to backend:', data);
    
    const response = await axios.put(`${API_URL}/projects/${projectId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// Delete project
export async function deleteProject(projectId: string, token: string) {
  try {
    const url = replaceUrlParams(API_ROUTES.PROJECTS.DELETE, { id: projectId });
    const response = await axios.delete(`${API_URL}${url}`, {
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

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_IMAGE, { id: projectId });
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
}

// Upload team member media
export async function uploadTeamMemberMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_TEAM_MEMBER_MEDIA, { 
      id: projectId, 
      index: index.toString() 
    });
    
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading team member media:', error);
    throw error;
  }
}

// Upload collaborator media
export async function uploadCollaboratorMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_COLLABORATOR_MEDIA, { 
      id: projectId, 
      index: index.toString() 
    });
    
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading collaborator media:', error);
    throw error;
  }
}

export async function uploadAdvisorMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_ADVISOR_MEDIA, { 
      id: projectId, 
      index: index.toString() 
    });
    
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading advisor media:', error);
    throw error;
  }
}

export async function uploadPartnerMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_PARTNER_MEDIA, { 
      id: projectId, 
      index: index.toString() 
    });
    
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading partner media:', error);
    throw error;
  }
}

export async function uploadTestimonialMedia(projectId: string, index: number, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('media', file);

    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPLOAD_TESTIMONIAL_MEDIA, { 
      id: projectId, 
      index: index.toString() 
    });
    
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Error uploading testimonial media');
  }
}

const transformApiDataToForm = (data: any): ProjectFormDataWithFile => {
  if (!data) {
    return defaultFormState;
  }

  return {
    ...defaultFormState, // Start with default values
    ...data, // Spread API data
    // Ensure nested objects are properly initialized
    seeking: {
      creator: Boolean(data.seeking_creator),
      brand: Boolean(data.seeking_brand),
      freelancer: Boolean(data.seeking_freelancer),
      contractor: Boolean(data.seeking_contractor),
    },
    social_links: {
      youtube: data.social_links_youtube || '',
      instagram: data.social_links_instagram || '',
      github: data.social_links_github || '',
      twitter: data.social_links_twitter || '',
      linkedin: data.social_links_linkedin || '',
    },
    notification_preferences: {
      email: Boolean(data.notification_preferences?.email),
      push: Boolean(data.notification_preferences?.push),
      digest: Boolean(data.notification_preferences?.digest),
    },
  };
};

export async function fetchProjects(token?: string): Promise<Project[]> {
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
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch projects');
    }
    throw error;
  }
}

// The transformFormDataForApi function should not transform these fields
const transformFormDataForApi = (formData: ProjectFormDataWithFile) => {
  // Create a copy to avoid mutating the original
  const apiData = { ...formData };
  
  // Handle file upload separately
  if (formData.project_image_file) {
    delete apiData.project_image_file;
  }
  
  // Make sure we're not transforming the seeking fields into an object
  // They should remain as individual boolean fields
  
  return apiData;
}; 