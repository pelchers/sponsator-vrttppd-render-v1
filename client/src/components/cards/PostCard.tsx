import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { checkFollowStatus, getFollowCount } from '@/api/follows';
import { checkWatchStatus, getWatchCount } from '@/api/watches';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import LikeButton from "@/components/buttons/LikeButton";
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { UserImage } from '@/components/UserImage';
import { PostImage } from '@/components/PostImage';

interface PostCardProps {
  post: {
    id: string;
    title?: string;
    content?: string;
    created_at?: string;
    user?: {
      id?: string;
      username?: string;
      profile_image?: string | null;
    };
    description?: string;
    mediaUrl?: string;
    tags?: string[];
    likes_count?: number;
    follows_count?: number;
    watches_count?: number;
    user_id?: string;
    username?: string;
    user_profile_image_url?: string;
    user_profile_image_upload?: string;
    user_profile_image_display?: string;
    post_image_url?: string | null;
    post_image_upload?: string | null;
    post_image_display?: 'url' | 'upload';
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
}

export default function PostCard({
  post,
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false
}: PostCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(post.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(post.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Add safe fallbacks for all properties
  const title = post?.title || 'Untitled Post';
  const content = post?.content || '';
  const createdAt = post?.created_at ? new Date(post.created_at) : new Date();
  const userId = post?.user?.id || post?.user_id || '';
  const username = post?.user?.username || post?.username || 'Anonymous';
  const profileImage = post?.user?.profile_image || '/placeholder-avatar.png';
  const tags = post?.tags || [];
  
  // Safely truncate content
  const truncatedContent = content.length > 150 
    ? content.slice(0, 150) + '...' 
    : content;
  
  // Format the date without date-fns
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    // For older dates, show the actual date
    return date.toLocaleDateString();
  };
  
  const timeAgo = formatDate(createdAt);

  useEffect(() => {
    const fetchInteractionData = async () => {
      try {
        // Get current counts
        const [likes, follows, watches] = await Promise.all([
          getLikeCount('post', post.id),
          getFollowCount('post', post.id),
          getWatchCount('post', post.id)
        ]);
        
        setLikeCount(likes);
        setFollowCount(follows);
        setWatchCount(watches);
        
        // Check user's interaction status if not provided
        if (!userHasLiked || !userIsFollowing || !userIsWatching) {
          const [hasLiked, isFollowing, isWatching] = await Promise.all([
            !userHasLiked && checkLikeStatus('post', post.id),
            !userIsFollowing && checkFollowStatus('post', post.id),
            !userIsWatching && checkWatchStatus('post', post.id)
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
  }, [post.id, userHasLiked, userIsFollowing, userIsWatching]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the like button
    e.stopPropagation(); // Prevent event bubbling
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      if (liked) {
        await unlikeEntity('post', post.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('post', post.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // If we get a 409 error (already liked), just update the UI to show as liked
      if (error.response && error.response.status === 409) {
        setLiked(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-250 hover:scale-105 hover:shadow-lg">
      <Link to={`/post/${post.id}`} className="flex-grow group">
        {(post.post_image_url || post.post_image_upload) && (
          <div className="aspect-video w-full overflow-hidden">
            <PostImage
              post={{
                post_image_url: post.post_image_url,
                post_image_upload: post.post_image_upload,
                post_image_display: post.post_image_display
              }}
              className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
              fallback={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No post image</span>
                </div>
              }
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <UserImage
              user={{
                profile_image_url: post.user_profile_image_url,
                profile_image_upload: post.user_profile_image_upload,
                profile_image_display: post.user_profile_image_display
              }}
              className="w-10 h-10 rounded-full object-cover mr-3"
              fallback={<DefaultAvatar className="w-10 h-10 mr-3" />}
            />
            <div>
              <Link 
                to={`/profile/${post.user_id}`}
                className="font-medium text-gray-900 hover:text-green-500"
              >
                {post.username}
              </Link>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-250">
            {title}
          </h3>
          <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-250">
            {truncatedContent}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
              )}
            </div>
          )}
        </CardContent>
      </Link>
      <CardFooter className="w-full px-4 pt-0 border-t border-black">
        <div className="w-full flex items-center justify-between">
          <span className="text-sm text-gray-600 capitalize">
            Post
          </span>
          <div className="flex items-center gap-4">
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
      </CardFooter>
    </Card>
  );
} 