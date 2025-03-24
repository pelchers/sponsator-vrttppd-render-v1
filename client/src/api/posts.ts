import axios from 'axios';
import { getToken } from '@/api/auth';
import { API_URL } from '@/config';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_image_url?: string;
  post_image_upload?: string;
  post_image_display?: 'url' | 'upload';
  // ... other fields
}

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

// Add new function for uploading post cover image
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

    console.log('Upload response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error uploading post cover image:', error);
    throw error;
  }
};

// Update createPost to handle image fields
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

// Update updatePost to handle image fields
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