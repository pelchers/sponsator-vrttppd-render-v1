import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchSiteStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site stats:', error);
    return null;
  }
}; 