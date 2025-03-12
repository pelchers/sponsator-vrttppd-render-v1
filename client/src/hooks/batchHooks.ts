import { useState, useEffect } from 'react'
import { checkLikeStatus } from '@/api/likes'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hook to check like status for multiple entities at once
 */
export function useBatchLikeStatus(items: any[], entityType: string) {
  const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  
  useEffect(() => {
    // Reset when items change
    setLikeStatuses({})
    
    if (!isAuthenticated || !items.length) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    // Check like status for each item
    const promises = items.map(item => 
      checkLikeStatus(entityType, item.id)
        .then(liked => ({ id: item.id, liked }))
    )
    
    Promise.all(promises)
      .then(results => {
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
  }, [items, entityType, isAuthenticated])
  
  return { likeStatuses, loading }
}

// Additional batch hooks can be added here in the future
// e.g., useBatchFollowStatus, useBatchWatchStatus, etc. 