import axios from 'axios';
import { API_ROUTES } from './config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchFeaturedContent = async () => {
  try {
    const response = await axios.get(`${API_URL}${API_ROUTES.FEATURED.GET}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      projects: [],
      articles: [],
      posts: []
    };
  }
}; 