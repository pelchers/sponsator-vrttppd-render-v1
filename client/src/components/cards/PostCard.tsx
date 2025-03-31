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
    user_id: string;
    title?: string;
    mediaUrl?: string;
    post_image_url?: string;
    post_image_upload?: string;
    post_image_display?: string;
    tags?: string[];
    description?: string;
    likes?: number;
    comments?: number;
    likes_count?: number;
    follows_count?: number;
    watches_count?: number;
    featured?: boolean;
    created_at?: Date;
    updated_at?: Date;
    // User fields
    username?: string;
    user_type?: string;
    user_profile_image_url?: string;
    user_profile_image_upload?: string;
    user_profile_image_display?: string;
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function PostCard({
  post,
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false,
  viewMode = 'grid'
}: PostCardProps) {
  const isList = viewMode === 'list';
  
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(post.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(post.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Add safe fallbacks for all properties
  const title = post?.title || '';
  const description = post?.description || '';
  const createdAt = post?.created_at ? new Date(post.created_at) : new Date();
  const userId = post?.user_id || '';
  const username = post?.username || 'Anonymous';
  const profileImage = post?.user_profile_image_url || '/placeholder-avatar.png';
  const tags = post?.tags || [];
  const comments = post?.comments || 0;
  
  // Safely truncate description
  const truncatedDescription = description && description.length > 150 
    ? description.slice(0, 150) + '...' 
    : description;
  
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

  // LIST VIEW COMPONENT
  if (isList) {
    return (
      <div className="flex flex-row bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
        {/* Left side - Post Image */}
        <div className="mr-4 flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <PostImage 
              post={post}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              }
            />
          </div>
        </div>
        
        {/* Right side - Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h3 className="font-semibold text-lg">
                  <Link to={`/posts/${post.id}`} className="hover:text-green-500">
                    {title}
                  </Link>
                </h3>
              )}
              
              {/* Author info */}
              <div className="flex items-center mt-1">
                <div className="w-5 h-5 mr-2">
                  <UserImage 
                    user={{
                      profile_image_url: post.user_profile_image_url,
                      profile_image_upload: post.user_profile_image_upload,
                      profile_image_display: post.user_profile_image_display
                    }}
                    className="w-5 h-5 rounded-full object-cover"
                    fallback={<DefaultAvatar className="w-5 h-5" />}
                  />
                </div>
                <span className="text-sm text-gray-600">{username}</span>
                <span className="text-xs text-gray-500 ml-2">{timeAgo}</span>
              </div>
            </div>
            
            {/* Interaction buttons */}
            <div className="flex space-x-3 text-sm">
              <button
                onClick={handleLikeToggle}
                disabled={isLoading}
                className={`flex items-center gap-1 ${
                  liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                } transition-colors`}
              >
                <HeartIcon filled={liked} className="w-4 h-4" />
                <span className="text-sm">{likeCount}</span>
              </button>
              <WatchButton 
                entityType="post"
                entityId={post.id}
                initialWatching={watching}
                initialCount={watchCount}
                showCount={true}
                size="sm"
                variant="ghost"
              />
              <FollowButton 
                entityType="post"
                entityId={post.id}
                initialFollowing={following}
                initialCount={followCount}
                showCount={true}
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 mt-2 line-clamp-2">
            {description || 'No description available'}
          </p>
          
          {/* Post metadata */}
          <div className="flex gap-4 mt-2 text-xs">
            {comments > 0 && (
              <div>
                <span className="text-gray-600">Comments:</span>
                <span className="font-medium">{comments}</span>
              </div>
            )}
            {post.featured && (
              <div className="text-blue-600 font-medium">
                Featured
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {/* Post Tags */}
            {post.tags?.slice(0, 4).map((tag, index) => (
              <span 
                key={`tag-${index}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}
            
            {/* Show count of remaining tags if there are more */}
            {post.tags && post.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                +{post.tags.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW COMPONENT (UNCHANGED)
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-250 hover:scale-105 hover:shadow-lg">
      <Link to={`/posts/${post.id}`} className="flex-grow group">
        {(post.post_image_url || post.post_image_upload) && (
          <div className="aspect-video w-full overflow-hidden">
            <PostImage
              post={post}
              className="w-full h-full object-cover rounded-2xl"
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
                to={`/profile/${userId}`} 
                className="font-medium text-gray-900 hover:text-green-500 transition-colors duration-250"
              >
                {username}
              </Link>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          
          {title && (
            <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-250">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-gray-700 mb-3 group-hover:text-gray-900 transition-colors duration-250">
              {truncatedDescription}
            </p>
          )}
          
          {/* Post metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {comments > 0 && (
              <div>
                <span className="text-gray-600">Comments:</span>
                <p className="font-medium">{comments}</p>
              </div>
            )}
            {post.featured && (
              <div className="text-blue-600 font-medium">
                Featured
              </div>
            )}
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-start mb-3">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"
                >
                  {tag}
                </span>
              ))}
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
            <WatchButton 
              entityType="post"
              entityId={post.id}
              initialWatching={watching}
              initialCount={watchCount}
              showCount={true}
              size="sm"
              variant="ghost"
            />
            <FollowButton 
              entityType="post"
              entityId={post.id}
              initialFollowing={following}
              initialCount={followCount}
              showCount={true}
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
      </CardFooter>
    </Card>
  );
} 