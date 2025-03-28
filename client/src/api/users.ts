import axios from 'axios';
import { API_BASE_URL } from './config';
import { api } from './api';
import { User } from '@/types/user';

// Fetch user profile
export async function fetchUserProfile(userId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make sure we're requesting all related data
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers,
      params: {
        include: [
          'user_work_experience',
          'user_education',
          'user_certifications',
          'user_accolades',
          'user_endorsements',
          'user_featured_projects',
          'user_case_studies',
          'skills',
          'expertise',
          'interest_tags',
          'experience_tags',
          'education_tags',
          'target_audience',
          'solutions_offered'
        ].join(',')
      }
    });

    // Transform the response data to match our frontend structure
    const userData = response.data;
    return {
      ...userData,
      // Ensure arrays are initialized even if empty
      skills: userData.skills || [],
      expertise: userData.expertise || [],
      interest_tags: userData.interest_tags || [],
      experience_tags: userData.experience_tags || [],
      education_tags: userData.education_tags || [],
      target_audience: userData.target_audience || [],
      solutions_offered: userData.solutions_offered || [],
      // Don't set default values for these fields - let them be null if not present
      profile_image_url: userData.profile_image_url || null,
      profile_image_upload: userData.profile_image_upload || null,
      // Transform flattened social links into object
      social_links: {
        youtube: userData.social_links_youtube || '',
        instagram: userData.social_links_instagram || '',
        github: userData.social_links_github || '',
        twitter: userData.social_links_twitter || '',
        linkedin: userData.social_links_linkedin || '',
      },
      // Map related data from the nested tables
      work_experience: userData.user_work_experience || [],
      education: userData.user_education || [],
      certifications: userData.user_certifications || [],
      accolades: userData.user_accolades || [],
      endorsements: userData.user_endorsements || [],
      featured_projects: userData.user_featured_projects || [],
      case_studies: userData.user_case_studies || []
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, data: any, token: string) => {
  try {
    console.log('API: Updating user profile:', { userId, data });
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const result = await response.json();
    console.log('API: Update successful:', result);
    return result;
  } catch (error) {
    console.error('API: Error updating user profile:', error);
    throw error;
  }
};

// Upload profile image
export async function uploadProfileImage(userId: string, file: File, token: string) {
  const formData = new FormData();
  formData.append('profile_image', file);
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload profile image');
  }
  
  return await response.json();
}

// Add these new endpoints
export async function deleteWorkExperience(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/work-experience/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete work experience');
  return response.json();
}

export async function deleteEducation(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/education/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete education');
  return response.json();
}

export async function deleteCertification(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/certifications/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete certification');
  return response.json();
}

export async function deleteAccolade(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/accolades/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`    }
  });
  if (!response.ok) throw new Error('Failed to delete accolade');
  return response.json();
}

export async function deleteEndorsement(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/endorsements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete endorsement');
  return response.json();
}

export async function deleteFeaturedProject(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/featured-projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete featured project');
  return response.json();
}

export async function deleteCaseStudy(userId: string, id: string) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users/${userId}/case-studies/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete case study');
  return response.json();
}

// Search for users by username
export const searchUsers = async (query: string): Promise<User[]> => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
}; 
