import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';

interface ArticleCardProps {
  article: {
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
    sections?: any[];
    follows_count?: number;
    watches_count?: number;
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
  interactionType?: string;
}

export default function ArticleCard({ 
  article, 
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false,
  interactionType
}: ArticleCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(article.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

  // Add safe fallbacks for all properties
  const title = article?.title || 'Untitled Article';
  const sections = article?.sections || [];
  const firstTextSection = sections.find(section => section?.type?.includes('text') && section?.text);
  const content = firstTextSection?.text || article?.content || article?.description || '';
  const createdAt = article?.created_at ? new Date(article.created_at) : new Date();
  const userId = article?.user?.id || article?.user_id || '';
  const username = article?.user?.username || article?.username || 'Anonymous';
  const profileImage = article?.user?.profile_image || '/placeholder-avatar.png';
  const tags = article?.tags || [];
  
  // Find the first media section for the cover image
  const firstMediaSection = sections.find(section => 
    section?.type?.includes('media') && section?.media_url
  );
  const mediaUrl = article?.mediaUrl || firstMediaSection?.media_url;
  
  // Safely truncate content
  const truncatedContent = content && content.length > 150 
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
        const count = await getLikeCount('article', article.id);
        setLikeCount(count);
        
        // Check if user has liked this article
        if (!userHasLiked) {
          const hasLiked = await checkLikeStatus('article', article.id);
          setLiked(hasLiked);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [article.id, userHasLiked]);

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
        await unlikeEntity('article', article.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('article', article.id);
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
      <Link to={`/article/${article.id}`} className="flex-grow group">
        {mediaUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={mediaUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200?text=Article+Image';
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
          {content && (
            <p className="text-gray-700 mb-3 group-hover:text-gray-900 transition-colors duration-250">
              {truncatedContent}
            </p>
          )}
          
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
        <div className="flex items-center gap-2">
          <WatchButton 
            entityType="article"
            entityId={article.id}
            initialWatching={userIsWatching}
            initialCount={article.watches_count || 0}
            showCount={false}
            size="sm"
            variant="ghost"
          />
          <FollowButton 
            entityType="article"
            entityId={article.id}
            initialFollowing={userIsFollowing}
            initialCount={article.follows_count || 0}
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
      </CardFooter>
    </Card>
  );
} 