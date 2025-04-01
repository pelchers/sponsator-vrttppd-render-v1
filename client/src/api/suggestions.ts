import axios from 'axios';
import { API_URL } from '@/config';

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  status?: string;
  admin_comments?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    profile_image_upload?: string;
    profile_image_display?: string;
  };
}

export interface SuggestionFormData {
  title: string;
  description: string;
  category?: string;
  is_public?: boolean;
}

export const createSuggestion = async (data: SuggestionFormData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_URL}/suggestions`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating suggestion:', error);
    throw error;
  }
};

export const fetchSuggestions = async (params?: { 
  status?: string, 
  category?: string,
  limit?: number,
  showAll?: boolean
}) => {
  try {
    const response = await axios.get(`${API_URL}/suggestions`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

export const fetchSuggestion = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/suggestions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching suggestion ${id}:`, error);
    throw error;
  }
}; 