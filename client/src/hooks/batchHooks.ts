import { useState, useEffect } from 'react'
import { checkLikeStatus } from '@/api/likes'
import { getToken } from '@/api/auth'

/**
 * Hook to check like status for multiple entities at once
 */
export function useBatchLikeStatus(items: any[], entityType: string) {
  const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Reset statuses when items change
    setLikeStatuses({})
    
    // Skip API calls if no items or not authenticated
    const token = getToken()
    if (!token || !items.length) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    // Create an array of promises, one for each item
    const promises = items.map(item => 
      checkLikeStatus(entityType, item.id)
        .then(liked => ({ id: item.id, liked }))
    )
    
    // Wait for all promises to resolve
    Promise.all(promises)
      .then(results => {
        // Convert array of results to a lookup object by ID
        const newStatuses: Record<string, boolean> = {}
        results.forEach(result => {
          newStatuses[result.id] = result.liked
        })
        setLikeStatuses(newStatuses)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error checking batch like status:', error)
        setLoading(false)
      })
  }, [items, entityType])
  
  return { likeStatuses, loading }
}

// Additional batch hooks can be added here in the future
// e.g., useBatchFollowStatus, useBatchWatchStatus, etc. 