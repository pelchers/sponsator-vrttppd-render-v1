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
const transformApiResponse = (projectData: any): Project => {
  if (!projectData) {
    throw new Error('No project data received from API');
  }

  return {
    ...projectData,
    // Transform flattened social links into object
    social_links: {
      youtube: projectData.social_links_youtube || '',
      instagram: projectData.social_links_instagram || '',
      github: projectData.social_links_github || '',
      twitter: projectData.social_links_twitter || '',
      linkedin: projectData.social_links_linkedin || '',
    },
    // Transform flattened seeking fields into object
    seeking: {
      creator: Boolean(projectData.seeking_creator),
      brand: Boolean(projectData.seeking_brand),
      freelancer: Boolean(projectData.seeking_freelancer),
      contractor: Boolean(projectData.seeking_contractor),
    },
    // Parse JSON fields
    team_members: JSON.parse(projectData.team_members || '[]'),
    collaborators: JSON.parse(projectData.collaborators || '[]'),
    advisors: JSON.parse(projectData.advisors || '[]'),
    partners: JSON.parse(projectData.partners || '[]'),
    testimonials: JSON.parse(projectData.testimonials || '[]'),
    deliverables: JSON.parse(projectData.deliverables || '[]'),
    milestones: JSON.parse(projectData.milestones || '[]'),
    // Transform conditional sections based on project type
    client_info: showClientContractSections.includes(projectData.project_type) ? {
      client: projectData.client,
      client_location: projectData.client_location,
      client_website: projectData.client_website,
      contract_type: projectData.contract_type,
      contract_duration: projectData.contract_duration,
      contract_value: projectData.contract_value,
    } : undefined,
    budget_info: showBudgetSection.includes(projectData.project_type) ? {
      budget: projectData.budget,
      budget_range: projectData.budget_range,
      currency: projectData.currency,
      rate_type: projectData.rate_type,
    } : undefined,
  };
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
    
    const url = replaceUrlParams(API_ROUTES.PROJECTS.GET, { id: projectId });
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
export async function updateProject(projectId: string, projectData: ProjectFormDataWithFile, token: string) {
  try {
    const apiData = transformFormToApi(projectData);
    const url = replaceUrlParams(API_ROUTES.PROJECTS.UPDATE, { id: projectId });
    const response = await axios.put(`${API_URL}${url}`, apiData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return transformApiResponse(response.data);
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

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