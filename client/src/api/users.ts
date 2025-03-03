import axios from 'axios';
import { API_BASE_URL } from './config';

// Fetch user profile
export async function fetchUserProfile(userId: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, userData: any, token: string) {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Upload profile image
export async function uploadProfileImage(userId: string, file: File, token: string) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
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
      'Authorization': `Bearer ${token}`
    }
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