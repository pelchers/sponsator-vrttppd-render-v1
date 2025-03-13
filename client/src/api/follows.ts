import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

/**
 * Follow an entity
 */
export const followEntity = async (entityType: string, entityId: string) => {
  try {
    // First check if already following
    const alreadyFollowing = await checkFollowStatus(entityType, entityId);
    
    if (alreadyFollowing) {
      // If already following, unfollow instead
      console.log(`${entityType} already followed, unfollowing instead`);
      return unfollowEntity(entityType, entityId);
    }
    
    // Otherwise proceed with follow
    const response = await axios.post(`${API_URL}/follows`, {
      entity_type: entityType,
      entity_id: entityId
    }, {
      headers: getAuthHeaders()
    });
    
    return response.data;
  } catch (error) {
    // If it's already followed (409 Conflict), don't treat as an error
    if (error.response && error.response.status === 409) {
      console.log(`${entityType} already followed, ignoring`);
      return { alreadyFollowing: true };
    }
    console.error(`Error following ${entityType}:`, error);
    throw error;
  }
};

/**
 * Unfollow an entity
 */
export const unfollowEntity = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/follows`, {
      data: {
        entity_type: entityType,
        entity_id: entityId
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error unfollowing ${entityType}:`, error);
    throw error;
  }
};

/**
 * Check if the current user is following an entity
 */
export const checkFollowStatus = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/follows/status?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: getAuthHeaders() }
    );
    return response.data.following;
  } catch (error) {
    console.error(`Error checking follow status for ${entityType}:`, error);
    return false; // Default to not following if there's an error
  }
};

/**
 * Get the follow count for an entity
 */
export const getFollowCount = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/follows/count?entity_type=${entityType}&entity_id=${entityId}`
    );
    return response.data.count;
  } catch (error) {
    console.error(`Error getting follow count for ${entityType}:`, error);
    return 0; // Default to 0 if there's an error
  }
};

/**
 * Get the count of entities of a specific type that the current user is following
 */
export const getUserFollowsCount = async (entityType: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/follows/user-count?entity_type=${entityType}`,
      { headers: getAuthHeaders() }
    );
    return response.data.count;
  } catch (error) {
    console.error(`Error getting user follows count for ${entityType}:`, error);
    return 0; // Default to 0 if there's an error
  }
}; 