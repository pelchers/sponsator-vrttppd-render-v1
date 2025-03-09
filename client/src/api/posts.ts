import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get all posts with pagination
export const fetchPosts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/posts`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Get a single post
export const fetchPost = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
};

// Create a new post
export const createPost = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, data, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update an existing post
export const updatePost = async (id: string, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/posts/${id}`, data, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
};

// Like a post
export const likePost = async (id: string) => {
  try {
    const response = await axios.post(`${API_URL}/posts/${id}/like`, {}, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${id}:`, error);
    throw error;
  }
};

// Comment on a post
export const commentOnPost = async (id: string, comment: string) => {
  try {
    const response = await axios.post(`${API_URL}/posts/${id}/comment`, { content: comment }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error commenting on post ${id}:`, error);
    throw error;
  }
}; 