import axios from 'axios';
import { getToken } from '@/api/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Types
export interface Post {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  post_image_url?: string | null;
  post_image_upload?: string | null;
  post_image_display?: 'url' | 'upload';
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Fetch all posts with pagination
export const fetchPosts = async (page = 1, limit = 10) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/posts`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Fetch a single post
export const fetchPost = async (id: string) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = getToken();
    const response = await axios.post(`${API_URL}/posts`, data, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = getToken();
    const response = await axios.put(`${API_URL}/posts/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
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
    const token = getToken();
    const response = await axios.delete(`${API_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
};

// Upload post cover image
export const uploadPostCoverImage = async (postId: string, file: File) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    console.log('Uploading post cover image:', {
      postId,
      fileName: file.name,
      fileSize: file.size
    });
    
    const response = await axios.post(
      `${API_URL}/posts/${postId}/cover-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Return both URL and upload path
    return {
      post_image_url: response.data.url,
      post_image_upload: response.data.uploadPath,
      post_image_display: 'upload' // Default to upload for new images
    };
  } catch (error) {
    console.error('Error uploading post cover image:', error);
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