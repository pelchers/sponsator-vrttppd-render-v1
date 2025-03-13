import { useState, useEffect } from 'react';
import { WatchIcon } from '@/components/icons/WatchIcon';
import { Button } from '@/components/ui/button';
import { watchEntity, unwatchEntity, checkWatchStatus, getWatchCount } from '@/api/watches';

interface WatchButtonProps {
  entityType: 'project' | 'article';
  entityId: string;
  initialWatching?: boolean;
  initialCount?: number;
  showCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onWatchChange?: (watching: boolean) => void;
}

export default function WatchButton({
  entityType,
  entityId,
  initialWatching = false,
  initialCount = 0,
  showCount = true,
  variant = 'outline',
  size = 'sm',
  className = '',
  onWatchChange
}: WatchButtonProps) {
  const [watching, setWatching] = useState(initialWatching);
  const [watchCount, setWatchCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWatchData = async () => {
      try {
        // Get current watch count
        const count = await getWatchCount(entityType, entityId);
        setWatchCount(count);
        
        // Check if user is watching this entity
        if (!initialWatching) {
          const isWatching = await checkWatchStatus(entityType, entityId);
          setWatching(isWatching);
        }
      } catch (error) {
        console.error('Error fetching watch data:', error);
      }
    };
    
    fetchWatchData();
  }, [entityType, entityId, initialWatching]);

  const handleWatchToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (watching) {
        await unwatchEntity(entityType, entityId);
        setWatching(false);
        setWatchCount(prev => Math.max(0, prev - 1));
      } else {
        await watchEntity(entityType, entityId);
        setWatching(true);
        setWatchCount(prev => prev + 1);
      }
      
      // Notify parent component if callback provided
      if (onWatchChange) {
        onWatchChange(!watching);
      }
    } catch (error) {
      console.error('Error toggling watch:', error);
      
      // If we get a 409 error (already watching), just update the UI to show as watching
      if (error.response && error.response.status === 409) {
        setWatching(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4'
  }[size];

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleWatchToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 ${watching ? 'text-blue-600' : ''} ${className}`}
      aria-label={watching ? "Unwatch" : "Watch"}
    >
      <WatchIcon filled={watching} className="w-4 h-4" />
      {showCount && <span>{watchCount}</span>}
      <span>{watching ? 'Watching' : 'Watch'}</span>
    </Button>
  );
} 