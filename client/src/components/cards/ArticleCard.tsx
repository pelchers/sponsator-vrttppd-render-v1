import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    content?: string;
    tags: string[];
    likes: number;
    user_id: string;
    username: string;
    created_at: string;
  };
  userHasLiked?: boolean;
}

export default function ArticleCard({ article, userHasLiked = false }: ArticleCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [isLoading, setIsLoading] = useState(false);

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

  // Extract first image from sections if available
  const getFirstImage = () => {
    if (!article.sections) return null;
    
    try {
      const sections = Array.isArray(article.sections) 
        ? article.sections 
        : JSON.parse(article.sections);
      
      const mediaSection = sections.find(
        (section: any) => 
          section.type === 'full-width-media' || 
          section.type === 'left-media-right-text' ||
          section.type === 'left-text-right-media'
      );
      
      return mediaSection?.media_url || null;
    } catch (e) {
      return null;
    }
  };
  
  const firstImage = getFirstImage();
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/article/${article.id}`} className="flex-grow">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
          {article.content && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.content}</p>
          )}
          <div className="flex flex-wrap gap-1 mb-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By {article.username}
        </div>
        <button 
          onClick={handleLikeToggle}
          disabled={isLoading}
          className={`flex items-center gap-1 text-sm ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
          } transition-colors`}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <HeartIcon filled={liked} className="w-4 h-4" />
          <span>{likeCount}</span>
        </button>
      </CardFooter>
    </Card>
  );
} 