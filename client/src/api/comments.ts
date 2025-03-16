import axios from 'axios';
import { API_URL } from './config';
import { Comment } from '@/types/comments';

export const createComment = async (
  entityType: string,
  entityId: string,
  text: string,
  token?: string
): Promise<Comment> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${API_URL}/comments`,
      {
        entity_type: entityType,
        entity_id: entityId,
        text
      },
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getComments = async (
  entityType: string,
  entityId: string,
  token?: string
): Promise<Comment[]> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get(
      `${API_URL}/comments/${entityType}/${entityId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const deleteComment = async (
  commentId: string,
  token?: string
): Promise<void> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await axios.delete(`${API_URL}/comments/${commentId}`, { headers });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}; 