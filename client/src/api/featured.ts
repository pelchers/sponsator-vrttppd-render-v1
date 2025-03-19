import axios from 'axios';
import { API_ROUTES } from './config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

interface FetchFeaturedContentOptions {
  featuredOnly?: boolean;
}

export const fetchFeaturedContent = async (options: FetchFeaturedContentOptions = {}) => {
  try {
    const { featuredOnly = false } = options;
    const params = featuredOnly ? '?featured=true' : '';
    const response = await axios.get(`${API_URL}${API_ROUTES.FEATURED.GET}${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
  }
}; 