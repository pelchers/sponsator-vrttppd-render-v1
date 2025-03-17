import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAuthHeaders } from '@/utils/auth';

// Add this new function to the existing users.ts file
export async function fetchUserStats(userId: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/stats`, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    return {
      ...response.data,
      // Transform any nested data if needed
      recentProjects: response.data.recentProjects || [],
      recentArticles: response.data.recentArticles || [],
      recentPosts: response.data.recentPosts || [],
      projects: response.data.projectCount || 0,
      articles: response.data.articleCount || 0,
      posts: response.data.postCount || 0,
      likes: response.data.likeCount || 0
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return default values if the request fails
    return {
      recentProjects: [],
      recentArticles: [],
      recentPosts: [],
      projects: 0,
      articles: 0,
      posts: 0,
      likes: 0
    };
  }
}
