import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity } from '@/api/likes';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    description?: string;
    mediaUrl?: string;
    tags: string[];
    likes_count: number;
    user_id: string;
    username: string;
    created_at: string;
  };
  userHasLiked?: boolean;
}

export default function PostCard({ post, userHasLiked = false }: PostCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);

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
      } else {
        await likeEntity('post', post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/post/${post.id}`} className="flex-grow">
        {post.mediaUrl && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={post.mediaUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
              }}
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
          {post.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{post.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By {post.username}
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