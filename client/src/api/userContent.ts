import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';
import { searchAll } from '@/api/explore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Fetch user's liked content
export const fetchUserLikes = async (options: any) => {
  try {
    // Use the explore API as a temporary solution
    const data = await searchAll('', {
      contentTypes: options.contentTypes,
      page: options.page,
      limit: options.limit
    });
    
    // Add userHasLiked flag to all items
    const results = {
      users: data.results.users || [],
      posts: (data.results.posts || []).map(post => ({ ...post, userHasLiked: true })),
      articles: (data.results.articles || []).map(article => ({ ...article, userHasLiked: true })),
      projects: (data.results.projects || []).map(project => ({ ...project, userHasLiked: true }))
    };
    
    return {
      results,
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return {
      results: {
        users: [],
        posts: [],
        articles: [],
        projects: []
      },
      totalPages: 1
    };
  }
}; 