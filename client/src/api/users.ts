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