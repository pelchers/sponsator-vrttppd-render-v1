import axios from 'axios';
import { getToken } from '@/api/auth';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

console.log('Articles API using URL:', API_URL);

// Types
export interface Article {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  article_image_url?: string | null;
  article_image_upload?: string | null;
  article_image_display?: 'url' | 'upload';
  sections: any[];
  citations: string[];
  contributors: string[];
  related_media: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Fetch all articles with pagination
export const fetchArticles = async (page = 1, limit = 10) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/articles`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// Fetch a single article
export const fetchArticle = async (id: string) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    throw error;
  }
};

// Create a new article
export const createArticle = async (data: any) => {
  try {
    const token = getToken();
    console.log('Creating article with API URL:', API_URL);
    // Use absolute URL with API_URL
    const response = await axios.post(`${API_URL}/articles`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

// Update an existing article
export const updateArticle = async (id: string, data: any) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/articles/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
    throw error;
  }
};

// Delete an article
export const deleteArticle = async (id: string) => {
  try {
    const token = getToken();
    const response = await axios.delete(`${API_URL}/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting article ${id}:`, error);
    throw error;
  }
};

// Upload media for an article section
export const uploadArticleMedia = async (articleId: string, sectionIndex: number, file: File) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sectionIndex', sectionIndex.toString());
    
    const response = await axios.post(`${API_URL}/articles/${articleId}/media`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading media for article ${articleId}:`, error);
    throw error;
  }
};

// Add new function for uploading article cover image
export const uploadArticleCoverImage = async (articleId: string, file: File) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    console.log('Uploading article cover image:', {
      articleId,
      fileName: file.name,
      fileSize: file.size
    });
    
    const response = await axios.post(
      `${API_URL}/articles/${articleId}/cover-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Expect response to include both URL and upload path
    console.log('Upload response:', response.data);
    
    return {
      article_image_url: response.data.url,
      article_image_upload: response.data.uploadPath,
      article_image_display: 'upload' // Default to upload for new images
    };
  } catch (error) {
    console.error('Error uploading article cover image:', error);
    throw error;
  }
}; 