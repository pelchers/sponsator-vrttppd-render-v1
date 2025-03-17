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
      posts: (data.results.posts || []).map((post: any) => ({ ...post, userHasLiked: true })),
      articles: (data.results.articles || []).map((article: any) => ({ ...article, userHasLiked: true })),
      projects: (data.results.projects || []).map((project: any) => ({ ...project, userHasLiked: true }))
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

interface FetchUserInteractionsOptions {
  contentTypes: string[];
  interactionTypes: string[];
  page: number;
  limit: number;
  userId: string;
}

// Fetch user interactions (likes, follows, watches)
export const fetchUserInteractions = async (options: FetchUserInteractionsOptions) => {
  try {
    const params = new URLSearchParams();
    
    if (options.contentTypes?.length > 0) {
      params.append('contentTypes', options.contentTypes.join(','));
    }
    
    if (options.interactionTypes?.length > 0) {
      params.append('interactionTypes', options.interactionTypes.join(','));
    }
    
    params.append('page', options.page.toString());
    params.append('limit', options.limit.toString());
    params.append('userId', options.userId);
    
    const response = await axios.get(`${API_URL}/users/interactions?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user interactions:', error);
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

export const fetchUserPortfolio = async (options: {
  contentTypes: string[];
  userId: string;
  page: number;
  limit: number;
}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.contentTypes && options.contentTypes.length > 0) {
      params.append('contentTypes', options.contentTypes.join(','));
    }
    
    if (options.page) {
      params.append('page', options.page.toString());
    }
    
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    
    // Make sure we're using the correct API URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100';
    
    // Determine the endpoint based on whether we're fetching for a specific user
    let endpoint;
    if (options.userId) {
      endpoint = `${API_URL}/api/users/portfolio/${options.userId}?${params.toString()}`;
    } else {
      endpoint = `${API_URL}/api/users/portfolio?${params.toString()}`;
    }
    
    console.log('Fetching from endpoint:', endpoint);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };
    
    console.log('Using headers:', headers);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    });

    // Log the full response for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Try to get the response text first to see what's coming back
    const responseText = await response.text();
    console.log('Response text:', responseText);

    // Then parse it as JSON if it's valid
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid JSON response from server');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    
    // Return empty results as fallback
    return {
      results: {
        posts: [],
        articles: [],
        projects: []
      },
      counts: {
        posts: 0,
        articles: 0,
        projects: 0
      },
      page: options.page,
      limit: options.limit,
      totalPages: 0
    };
  }
}; 