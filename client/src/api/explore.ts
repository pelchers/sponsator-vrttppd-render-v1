import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Search across all content types
export async function searchAll(
  query: string = '',
  options: {
    contentTypes?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const params = new URLSearchParams({
    q: query,
    ...(options.contentTypes && { contentTypes: options.contentTypes.join(',') }),
    ...(options.page && { page: options.page.toString() }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.sortBy && { sortBy: options.sortBy }),
    ...(options.sortOrder && { sortOrder: options.sortOrder })
  });

  const response = await fetch(`${API_URL}/explore/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }

  return response.json();
}

// Search only users
export const searchUsers = async (query: string, filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/explore/users`, {
      params: {
        q: query,
        userTypes: filters.userTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    return { users: [], totalPages: 1 };
  }
};

// Search only projects
export const searchProjects = async (query: string, filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/explore/projects`, {
      params: {
        q: query,
        userTypes: filters.userTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching projects:', error);
    return { projects: [], totalPages: 1 };
  }
};

// Search only articles
export const searchArticles = async (query: string, filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/explore/articles`, {
      params: {
        q: query,
        userTypes: filters.userTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching articles:', error);
    return { articles: [], totalPages: 1 };
  }
};

// Search only posts
export const searchPosts = async (query: string, filters: any) => {
  try {
    const response = await axios.get(`${API_URL}/explore/posts`, {
      params: {
        q: query,
        userTypes: filters.userTypes?.join(','),
        page: filters.page || 1,
        limit: filters.limit || 12
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    return { posts: [], totalPages: 1 };
  }
}; 