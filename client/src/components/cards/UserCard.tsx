import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { checkFollowStatus, getFollowCount } from '@/api/follows';
import { checkWatchStatus, getWatchCount } from '@/api/watches';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { API_URL } from '@/config';
import { UserImage } from '@/components/UserImage';

interface UserCardProps {
  user: {
    id: string;
    username?: string;
    profile_image_url?: string | null;
    profile_image_upload?: string | null;
    profile_image_display?: 'url' | 'upload';
    bio?: string;
    user_type?: string;
    career_title?: string;
    likes_count?: number;
    follows_count?: number;
    watches_count?: number;
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
}

export default function UserCard({
  user,
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false
}: UserCardProps) {
  // Interaction states
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(user.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(user.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(user.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInteractionData = async () => {
      try {
        // Get current counts
        const [likes, follows, watches] = await Promise.all([
          getLikeCount('user', user.id),
          getFollowCount('user', user.id),
          getWatchCount('user', user.id)
        ]);
        
        setLikeCount(likes);
        setFollowCount(follows);
        setWatchCount(watches);
        
        // Check user's interaction status if not provided
        if (!userHasLiked || !userIsFollowing || !userIsWatching) {
          const [hasLiked, isFollowing, isWatching] = await Promise.all([
            !userHasLiked && checkLikeStatus('user', user.id),
            !userIsFollowing && checkFollowStatus('user', user.id),
            !userIsWatching && checkWatchStatus('user', user.id)
          ]);
          
          setLiked(hasLiked);
          setFollowing(isFollowing);
          setWatching(isWatching);
        }
      } catch (error) {
        console.error('Error fetching interaction data:', error);
      }
    };
    
    fetchInteractionData();
  }, [user.id, userHasLiked, userIsFollowing, userIsWatching]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      if (liked) {
        await unlikeEntity('user', user.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('user', user.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      if (error && 
          typeof error === 'object' && 
          'response' in error && 
          error.response && 
          typeof error.response === 'object' && 
          'status' in error.response) {
        if (error.response.status === 409) {
          setLiked(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col items-center text-center">
      {/* Profile Image - Centered on its own line */}
      <div className="w-full flex justify-center py-4">
        <UserImage
          user={user}
          className="w-24 h-24 rounded-full object-cover border-2 border-black"
          fallback={<DefaultAvatar className="w-24 h-24" />}
        />
      </div>

      {/* Content Section */}
      <div className="w-full text-center px-4">
        {/* Username */}
        <Link to={`/profile/${user.id}`}>
          <h3 className="text-2xl font-bold hover:text-green-500 transition-colors duration-250">
            {user.username}
          </h3>
        </Link>

        {/* User Type */}
        <span className="block text-sm text-gray-600 mt-1 mb-2 capitalize">
          {user.user_type || 'User'}
        </span>

        {/* Bio */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {user.bio || 'No bio available'}
        </p>
      </div>

      <CardFooter className="w-full px-4 pt-0 border-t border-black">
        <div className="flex items-center justify-center gap-4 w-full">
          <WatchButton 
            entityType="user"
            entityId={user.id}
            initialWatching={watching}
            initialCount={watchCount}
            showCount={true}
            size="sm"
            variant="ghost"
          />
          <FollowButton 
            entityType="user"
            entityId={user.id}
            initialFollowing={following}
            initialCount={followCount}
            showCount={true}
            size="sm"
            variant="ghost"
          />
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`flex items-center gap-1 ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
            } transition-colors`}
          >
            <HeartIcon 
              filled={liked} 
              className="w-4 h-4" 
            />
            <span className="text-sm">{likeCount}</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 