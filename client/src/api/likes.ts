import axios from 'axios'
import { getAuthHeaders } from '@/utils/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api'

/**
 * Add a like to an entity
 */
export const likeEntity = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.post(`${API_URL}/likes`, {
      entity_type: entityType,
      entity_id: entityId
    }, {
      headers: getAuthHeaders()
    })
    return response.data
  } catch (error) {
    console.error(`Error liking ${entityType}:`, error)
    throw error
  }
}

/**
 * Remove a like from an entity
 */
export const unlikeEntity = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/likes`, {
      data: {
        entity_type: entityType,
        entity_id: entityId
      },
      headers: getAuthHeaders()
    })
    return response.data
  } catch (error) {
    console.error(`Error unliking ${entityType}:`, error)
    throw error
  }
}

/**
 * Check if the current user has liked an entity
 */
export const checkLikeStatus = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/likes/status?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: getAuthHeaders() }
    )
    return response.data.liked
  } catch (error) {
    console.error(`Error checking like status for ${entityType}:`, error)
    return false // Default to not liked if there's an error
  }
}

/**
 * Get the like count for an entity
 */
export const getLikeCount = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/likes/count?entity_type=${entityType}&entity_id=${entityId}`
    )
    return response.data.count
  } catch (error) {
    console.error(`Error getting like count for ${entityType}:`, error)
    return 0 // Default to 0 if there's an error
  }
} 