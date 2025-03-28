import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { checkFollowStatus, getFollowCount } from '@/api/follows';
import { checkWatchStatus, getWatchCount } from '@/api/watches';
import { UserImage } from '@/components/UserImage';
import { ProjectImage } from '@/components/ProjectImage';

interface ProjectCardProps {
  project: {
    id: string;
    title?: string;
    description?: string;
    created_at?: string;
    user?: {
      id?: string;
      username?: string;
      profile_image?: string | null;
    };
    mediaUrl?: string;
    tags?: string[];
    likes_count?: number;
    user_id?: string;
    username?: string;
    skills?: string[];
    budget?: string;
    timeline?: string;
    project_followers: number;
    follows_count?: number;
    watches_count?: number;
    user_profile_image_url?: string | null;
    user_profile_image_upload?: string | null;
    user_profile_image_display?: 'url' | 'upload';
    project_image_url?: string | null;
    project_image_upload?: string | null;
    project_image_display?: 'url' | 'upload';
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
  const [likeCount, setLikeCount] = useState(project.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(project.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(project.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Add safe fallbacks for all properties
  const title = project?.title || 'Untitled Project';
  const description = project?.description || '';
  const createdAt = project?.created_at ? new Date(project.created_at) : new Date();
  const userId = project?.user?.id || project?.user_id || '';
  const username = project?.user?.username || project?.username || 'Anonymous';
  const profileImage = project?.user?.profile_image || '/placeholder-avatar.png';
  const tags = project?.tags || [];
  const skills = project?.skills || [];
  
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
          getLikeCount('project', project.id),
          getFollowCount('project', project.id),
          getWatchCount('project', project.id)
        ]);
        
        setLikeCount(likes);
        setFollowCount(follows);
        setWatchCount(watches);
        
        // Check user's interaction status if not provided
        if (!userHasLiked || !userIsFollowing || !userIsWatching) {
          const [hasLiked, isFollowing, isWatching] = await Promise.all([
            !userHasLiked && checkLikeStatus('project', project.id),
            !userIsFollowing && checkFollowStatus('project', project.id),
            !userIsWatching && checkWatchStatus('project', project.id)
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
  }, [project.id, userHasLiked, userIsFollowing, userIsWatching]);

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
        await unlikeEntity('project', project.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('project', project.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: unknown) {
      console.error('Error toggling like:', error);
      // Type guard for axios error
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

  console.log('ProjectCard image props:', {
    url: project.project_image_url,
    upload: project.project_image_upload,
    display: project.project_image_display,
    mediaUrl: project.mediaUrl // check if we have legacy data
  });

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-250 hover:scale-105 hover:shadow-lg">
      <Link to={`/projects/${project.id}`} className="flex-grow group">
        {(project.project_image_url || project.project_image_upload) && (
          <div className="aspect-video w-full overflow-hidden">
            <ProjectImage
              project={project}
              className="w-full h-full object-cover rounded-2xl"
              fallback={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No project image</span>
                </div>
              }
            />
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <UserImage
              user={{
                profile_image_url: project.user_profile_image_url,
                profile_image_upload: project.user_profile_image_upload,
                profile_image_display: project.user_profile_image_display
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
          <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-250">
            {title}
          </h3>
          {description && (
            <p className="text-gray-700 mb-3 group-hover:text-gray-900 transition-colors duration-250">
              {truncatedDescription}
            </p>
          )}
          
          {project.budget && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Budget:</span> {project.budget}
            </div>
          )}
          
          {project.timeline && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Timeline:</span> {project.timeline}
            </div>
          )}
          
          {skills.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Skills needed:</h4>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{skills.length - 3} more</span>
                )}
              </div>
            </div>
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
            Project
          </span>
          <div className="flex items-center gap-4">
            <WatchButton 
              entityType="project"
              entityId={project.id}
              initialWatching={watching}
              initialCount={watchCount}
              showCount={true}
              size="sm"
              variant="ghost"
            />
            <FollowButton 
              entityType="project"
              entityId={project.id}
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