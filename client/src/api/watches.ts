import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

/**
 * Watch an entity
 */
export const watchEntity = async (entityType: string, entityId: string) => {
  try {
    // First check if already watching
    const alreadyWatching = await checkWatchStatus(entityType, entityId);
    
    if (alreadyWatching) {
      // If already watching, unwatch instead
      console.log(`${entityType} already watched, unwatching instead`);
      return unwatchEntity(entityType, entityId);
    }
    
    // Otherwise proceed with watch
    const response = await axios.post(`${API_URL}/watches`, {
      entity_type: entityType,
      entity_id: entityId
    }, {
      headers: getAuthHeaders()
    });
    
    return response.data;
  } catch (error) {
    // If it's already watched (409 Conflict), don't treat as an error
    if (error.response && error.response.status === 409) {
      console.log(`${entityType} already watched, ignoring`);
      return { alreadyWatching: true };
    }
    console.error(`Error watching ${entityType}:`, error);
    throw error;
  }
};

/**
 * Unwatch an entity
 */
export const unwatchEntity = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/watches`, {
      data: {
        entity_type: entityType,
        entity_id: entityId
      },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error(`Error unwatching ${entityType}:`, error);
    throw error;
  }
};

/**
 * Check if the current user is watching an entity
 */
export const checkWatchStatus = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/watches/status?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: getAuthHeaders() }
    );
    return response.data.watching;
  } catch (error) {
    console.error(`Error checking watch status for ${entityType}:`, error);
    return false; // Default to not watching if there's an error
  }
};

/**
 * Get the watch count for an entity
 */
export const getWatchCount = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/watches/count?entity_type=${entityType}&entity_id=${entityId}`
    );
    return response.data.count;
  } catch (error) {
    console.error(`Error getting watch count for ${entityType}:`, error);
    return 0; // Default to 0 if there's an error
  }
};

/**
 * Get the count of entities of a specific type that the current user is watching
 */
export const getUserWatchesCount = async (entityType: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/watches/user-count?entity_type=${entityType}`,
      { headers: getAuthHeaders() }
    );
    return response.data.count;
  } catch (error) {
    console.error(`Error getting user watches count for ${entityType}:`, error);
    return 0; // Default to 0 if there's an error
  }
}; 