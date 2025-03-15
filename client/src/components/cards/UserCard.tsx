import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';

interface UserCardProps {
  user: any;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
  userHasLiked?: boolean;
}

export default function UserCard({ 
  user, 
  userIsFollowing = false,
  userIsWatching = false,
  userHasLiked = false 
}: UserCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(user.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        // Get current like count
        const count = await getLikeCount('user', user.id);
        setLikeCount(count);
        
        // Check if user has liked this user
        if (!userHasLiked) {
          const hasLiked = await checkLikeStatus('user', user.id);
          setLiked(hasLiked);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [user.id, userHasLiked]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the like button
    e.stopPropagation(); // Prevent event bubbling
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Store the current state before optimistic update
    const wasLiked = liked;
    const previousCount = likeCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      let newCount;
      if (liked) {
        // Unlike
        await unlikeEntity('user', user.id);
        newCount = await getLikeCount('user', user.id);
        setLiked(false);
      } else {
        // Like
        await likeEntity('user', user.id);
        newCount = await getLikeCount('user', user.id);
        setLiked(true);
      }
      
      // Update with the actual count from the server
      setLikeCount(newCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert to previous state if there was an error
      setLiked(wasLiked);
      setLikeCount(previousCount);
      
      // If we get a 409 error (already liked), update UI accordingly
      if (error.response && error.response.status === 409) {
        setLiked(true);
        // Fetch the actual count again
        try {
          const actualCount = await getLikeCount('user', user.id);
          setLikeCount(actualCount);
        } catch (countError) {
          console.error('Error fetching like count:', countError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col relative transition-all duration-250 hover:scale-105 hover:shadow-lg">
      <Link 
        to={`/profile/${user.id}`}
        className="flex-grow p-4 flex flex-col group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={`${user.username}'s avatar`}
                className="w-10 h-10 rounded-full object-cover mr-3"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const avatar = document.createElement('div');
                    avatar.className = 'mr-3';
                    avatar.innerHTML = '<svg class="w-10 h-10 text-gray-300 bg-gray-100 rounded-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>';
                    parent.insertBefore(avatar, target);
                  }
                }}
              />
            ) : (
              <DefaultAvatar className="w-10 h-10 mr-3" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-green-500 transition-colors duration-250">
                {user.username}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{user.user_type || 'User'}</p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-3 mb-4 group-hover:text-gray-900 transition-colors duration-250">
          {user.bio || 'No bio available'}
        </p>
      </Link>
      
      {/* Footer with interaction buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {user.user_type || 'User'}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <WatchButton 
            entityType="user"
            entityId={user.id}
            initialWatching={userIsWatching}
            initialCount={user.watches_count || 0}
            showCount={false}
            size="sm"
            variant="ghost"
          />
          <FollowButton 
            entityType="user"
            entityId={user.id}
            initialFollowing={userIsFollowing}
            initialCount={user.followers_count || 0}
            showCount={false}
            size="sm"
            variant="ghost"
          />
          <button 
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`flex items-center gap-1 text-sm transition-all duration-250 hover:scale-105 ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
            }`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <HeartIcon filled={liked} className="w-4 h-4" />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
} 