import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchUserLikes = async (filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/user/likes`, {
      params: {
        contentTypes: filters.contentTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user likes:', error);
    // Return empty results on error
    return {
      results: {
        posts: [],
        articles: [],
        projects: []
      },
      totalPages: 1,
      page: 1
    };
  }
}; 