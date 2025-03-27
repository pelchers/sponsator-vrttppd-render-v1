import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { checkFollowStatus, getFollowCount } from '@/api/follows';
import { checkWatchStatus, getWatchCount } from '@/api/watches';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { UserImage } from '@/components/UserImage';
import { ArticleImage } from '@/components/ArticleImage';

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
    user_profile_image_url?: string;
    user_profile_image_upload?: string;
    user_profile_image_display?: string;
    article_image_url?: string | null;
    article_image_upload?: string | null;
    article_image_display?: 'url' | 'upload';
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
  // Interaction states
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(article.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(article.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(article.watches_count || 0);
  
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
    const fetchInteractionData = async () => {
      try {
        const [likes, follows, watches] = await Promise.all([
          getLikeCount('article', article.id),
          getFollowCount('article', article.id),
          getWatchCount('article', article.id)
        ]);
        
        setLikeCount(likes);
        setFollowCount(follows);
        setWatchCount(watches);
      } catch (error) {
        console.error('Error fetching interaction data:', error);
      }
    };
    
    fetchInteractionData();
  }, [article.id]);

  useEffect(() => {
    setLiked(userHasLiked);
  }, [userHasLiked]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Store previous values in case we need to revert
    const wasLiked = liked;
    const previousCount = likeCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      if (wasLiked) {
        await unlikeEntity('article', article.id);
      } else {
        await likeEntity('article', article.id);
      }
    } catch (error: unknown) {
      // Revert optimistic update on error
      setLiked(wasLiked);
      setLikeCount(previousCount);
      
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
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-250 hover:scale-105 hover:shadow-lg">
      <Link to={`/article/${article.id}`} className="flex-grow group">
        {(article.article_image_url || article.article_image_upload) && (
          <div className="aspect-video w-full overflow-hidden">
            <ArticleImage
              article={{
                article_image_url: article.article_image_url,
                article_image_upload: article.article_image_upload,
                article_image_display: article.article_image_display
              }}
              className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
              fallback={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No article image</span>
                </div>
              }
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <UserImage
              user={{
                profile_image_url: article.user_profile_image_url,
                profile_image_upload: article.user_profile_image_upload,
                profile_image_display: article.user_profile_image_display
              }}
              className="w-10 h-10 rounded-full object-cover mr-3"
              fallback={<DefaultAvatar className="w-10 h-10 mr-3" />}
            />
            <div>
              <Link 
                to={`/profile/${article.user_id}`}
                className="font-medium text-gray-900 hover:text-green-500"
              >
                {article.username}
              </Link>
              <p className="text-sm text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-250">
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
      <CardFooter className="w-full px-4 pt-0 border-t border-black">
        <div className="w-full flex items-center justify-between">
          <span className="text-sm text-gray-600 capitalize">
            Article
          </span>
          <div className="flex items-center gap-4">
            <WatchButton 
              entityType="article"
              entityId={article.id}
              initialWatching={watching}
              initialCount={watchCount}
              showCount={true}
              size="sm"
              variant="ghost"
            />
            <FollowButton 
              entityType="article"
              entityId={article.id}
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