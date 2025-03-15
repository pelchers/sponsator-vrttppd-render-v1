import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';

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
    user_id?: string;
    username?: string;
  };
  userHasLiked?: boolean;
}

export default function PostCard({ post, userHasLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
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
    const fetchLikeData = async () => {
      try {
        // Get current like count
        const count = await getLikeCount('post', post.id);
        setLikeCount(count);
        
        // Check if user has liked this post
        if (!userHasLiked) {
          const hasLiked = await checkLikeStatus('post', post.id);
          setLiked(hasLiked);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [post.id, userHasLiked]);

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
        {post.mediaUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={post.mediaUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
              }}
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={username}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => {
                  // Replace with DefaultAvatar component if image fails to load
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
              <Link 
                to={`/profile/${userId}`} 
                className="font-medium text-gray-900 hover:text-green-500 transition-colors duration-250"
              >
                {username}
              </Link>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-green-500 transition-colors duration-250">
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
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By {username}
        </div>
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
      </CardFooter>
    </Card>
  );
} 