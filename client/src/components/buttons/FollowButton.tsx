import { useState, useEffect } from 'react';
import { FollowIcon } from '@/components/icons/FollowIcon';
import { Button } from '@/components/ui/button';
import { followEntity, unfollowEntity, checkFollowStatus, getFollowCount } from '@/api/follows';

interface FollowButtonProps {
  entityType: 'project' | 'article' | 'post' | 'user';
  entityId: string;
  initialFollowing?: boolean;
  initialCount?: number;
  showCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onFollowChange?: (following: boolean) => void;
}

export default function FollowButton({
  entityType,
  entityId,
  initialFollowing = false,
  initialCount = 0,
  showCount = true,
  variant = 'outline',
  size = 'sm',
  className = '',
  onFollowChange
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followCount, setFollowCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        // Get current follow count
        const count = await getFollowCount(entityType, entityId);
        setFollowCount(count);
        
        // Check if user is following this entity
        if (!initialFollowing) {
          const isFollowing = await checkFollowStatus(entityType, entityId);
          setFollowing(isFollowing);
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      }
    };
    
    fetchFollowData();
  }, [entityType, entityId, initialFollowing]);

  const handleFollowToggle = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (following) {
        await unfollowEntity(entityType, entityId);
        setFollowing(false);
        setFollowCount(prev => Math.max(0, prev - 1));
      } else {
        await followEntity(entityType, entityId);
        setFollowing(true);
        setFollowCount(prev => prev + 1);
      }
      
      // Notify parent component if callback provided
      if (onFollowChange) {
        onFollowChange(!following);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      
      // If we get a 409 error (already following), just update the UI to show as following
      if (error.response && error.response.status === 409) {
        setFollowing(true);
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
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 ${
        following ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
      } transition-colors ${className}`}
      aria-label={following ? "Unfollow" : "Follow"}
      title={following ? "Unfollow" : "Follow"}
    >
      <FollowIcon 
        filled={following} 
        className={`w-4 h-4 ${following ? 'text-blue-600' : 'text-current'}`} 
      />
      {showCount && <span className="ml-1 text-sm">{followCount}</span>}
    </button>
  );
} 