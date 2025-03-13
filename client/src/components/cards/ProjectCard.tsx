import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    project_followers: number;
    follows_count?: number;
    watches_count?: number;
    user_id: string;
    username: string;
    created_at: string;
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
}

export default function ProjectCard({ 
  project, 
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false
}: ProjectCardProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(project.project_followers || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        const count = await getLikeCount('project', project.id);
        setLikeCount(count);
        
        if (!userHasLiked) {
          const hasLiked = await checkLikeStatus('project', project.id);
          setLiked(hasLiked);
        }
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [project.id, userHasLiked]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (liked) {
        await unlikeEntity('project', project.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('project', project.id);
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
    <Card className="h-full flex flex-col overflow-hidden">
      <Link to={`/projects/${project.id}`} className="flex-grow">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{project.title}</h3>
          {project.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{project.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{project.tags.length - 3} more</span>
            )}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          By {project.username}
        </div>
        <div className="flex items-center gap-2">
          <WatchButton 
            entityType="project"
            entityId={project.id}
            initialWatching={userIsWatching}
            initialCount={project.watches_count || 0}
            showCount={false}
            size="sm"
            variant="ghost"
          />
          <FollowButton 
            entityType="project"
            entityId={project.id}
            initialFollowing={userIsFollowing}
            initialCount={project.follows_count || 0}
            showCount={false}
            size="sm"
            variant="ghost"
          />
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
        </div>
      </CardFooter>
    </Card>
  );
} 