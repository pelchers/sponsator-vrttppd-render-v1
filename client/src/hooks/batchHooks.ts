import { useState, useEffect } from 'react'
import { checkLikeStatus } from '@/api/likes'
import { getToken } from '@/api/auth'
import { checkFollowStatus } from '@/api/follows'
import { checkWatchStatus } from '@/api/watches'

/**
 * Hook to check like status for multiple entities at once
 */
export function useBatchLikeStatus(items: any[], entityType: string) {
  const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchLikeStatuses = async () => {
      try {
        const statuses = await Promise.all(
          items.map(item => 
            checkLikeStatus(entityType, item.id)
          )
        );
        
        const newStatuses = items.reduce((acc, item, index) => {
          acc[item.id] = statuses[index];
          return acc;
        }, {} as Record<string, boolean>);
        
        setLikeStatuses(newStatuses);
      } catch (error) {
        console.error('Error fetching like statuses:', error);
      }
    };

    if (items.length > 0) {
      fetchLikeStatuses();
    }
  }, [items, entityType])
  
  return { likeStatuses, loading }
}

/**
 * Hook to check follow status for multiple entities at once
 */
export function useBatchFollowStatus(entities: any[], entityType: string) {
  const [followStatuses, setFollowStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowStatuses = async () => {
      if (!entities || entities.length === 0) {
        setFollowStatuses({});
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Create a map to store follow statuses
        const statusMap: Record<string, boolean> = {};
        
        // Check follow status for each entity
        // In a real implementation, we would batch this into a single API call
        for (const entity of entities) {
          if (entity && entity.id) {
            const isFollowing = await checkFollowStatus(entityType, entity.id);
            statusMap[entity.id] = isFollowing;
          }
        }
        
        setFollowStatuses(statusMap);
      } catch (error) {
        console.error(`Error fetching follow statuses for ${entityType}s:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowStatuses();
  }, [entities, entityType]);

  return { followStatuses, loading };
}

/**
 * Hook to check watch status for multiple entities at once
 */
export function useBatchWatchStatus(entities: any[], entityType: string) {
  const [watchStatuses, setWatchStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchStatuses = async () => {
      if (!entities || entities.length === 0) {
        setWatchStatuses({});
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Create a map to store watch statuses
        const statusMap: Record<string, boolean> = {};
        
        // Check watch status for each entity
        // In a real implementation, we would batch this into a single API call
        for (const entity of entities) {
          if (entity && entity.id) {
            const isWatching = await checkWatchStatus(entityType, entity.id);
            statusMap[entity.id] = isWatching;
          }
        }
        
        setWatchStatuses(statusMap);
      } catch (error) {
        console.error(`Error fetching watch statuses for ${entityType}s:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchStatuses();
  }, [entities, entityType]);

  return { watchStatuses, loading };
}

// Additional batch hooks can be added here in the future
// e.g., useBatchWatchStatus, etc. 