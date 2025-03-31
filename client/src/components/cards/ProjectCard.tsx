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
    user_id: string;
    project_name?: string;
    project_description?: string;
    project_type?: string;
    project_category?: string;
    project_image?: string;
    project_image_url?: string;
    project_image_upload?: string;
    project_image_display?: string;
    project_title?: string;
    project_duration?: string;
    project_handle?: string;
    project_followers?: number;
    client?: string;
    client_location?: string;
    client_website?: string;
    contract_type?: string;
    contract_duration?: string;
    contract_value?: string;
    project_timeline?: string;
    budget?: string;
    project_status?: string;
    preferred_collaboration_type?: string;
    budget_range?: string;
    currency?: string;
    standard_rate?: string;
    rate_type?: string;
    compensation_type?: string;
    skills_required?: string[];
    expertise_needed?: string[];
    target_audience?: string[];
    solutions_offered?: string[];
    project_tags?: string[];
    industry_tags?: string[];
    technology_tags?: string[];
    project_status_tag?: string;
    seeking_creator?: boolean;
    seeking_brand?: boolean;
    seeking_freelancer?: boolean;
    seeking_contractor?: boolean;
    social_links_youtube?: string;
    social_links_instagram?: string;
    social_links_github?: string;
    social_links_twitter?: string;
    social_links_linkedin?: string;
    website_links?: string[];
    short_term_goals?: string;
    long_term_goals?: string;
    project_visibility?: string;
    search_visibility?: boolean;
    notification_preferences_email?: boolean;
    notification_preferences_push?: boolean;
    notification_preferences_digest?: boolean;
    deliverables?: any;
    milestones?: any;
    team_members?: any;
    collaborators?: any;
    advisors?: any;
    partners?: any;
    testimonials?: any;
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

export default function ProjectCard({ 
  project, 
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false,
  viewMode = 'grid'
}: ProjectCardProps) {
  const isList = viewMode === 'list';
  
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(project.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(project.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(project.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  // Add safe fallbacks for all properties
  const title = project?.project_title || 'Untitled Project';
  const description = project?.project_description || '';
  const createdAt = project?.created_at ? new Date(project.created_at) : new Date();
  const userId = project?.user_id || '';
  const username = project?.username || 'Anonymous';
  const profileImage = project?.user_profile_image_url || '/placeholder-avatar.png';
  const tags = project?.project_tags || [];
  const skills = project?.skills_required || [];
  
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
    mediaUrl: project.project_image // check if we have legacy data
  });

  // LIST VIEW COMPONENT
  if (isList) {
    return (
      <div className="flex flex-row bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
        {/* Left side - Project Image */}
        <div className="mr-4 flex-shrink-0">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <ProjectImage 
              project={project}
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
              <h3 className="font-semibold text-lg">
                <Link to={`/projects/${project.id}`} className="hover:text-green-500">
                  {title}
                </Link>
              </h3>
              
              {/* Creator info */}
              <div className="flex items-center mt-1">
                <div className="w-5 h-5 mr-2">
                  <UserImage 
                    user={{
                      profile_image_url: project.user_profile_image_url,
                      profile_image_upload: project.user_profile_image_upload,
                      profile_image_display: project.user_profile_image_display
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
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 mt-2 line-clamp-2">
            {description || 'No description available'}
          </p>
          
          {/* Project type and category */}
          <div className="flex gap-4 mt-2 text-xs">
            {project.project_type && (
              <div>
                <span className="text-gray-600">Type:</span>{' '}
                <span className="font-medium">{project.project_type}</span>
              </div>
            )}
            {project.project_category && (
              <div>
                <span className="text-gray-600">Category:</span>{' '}
                <span className="font-medium">{project.project_category}</span>
              </div>
            )}
            {project.budget && (
              <div>
                <span className="text-gray-600">Budget:</span>{' '}
                <span className="font-medium">{project.budget}</span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1">
            {/* Project Tags */}
            {project.project_tags?.slice(0, 2).map((tag, index) => (
              <span 
                key={`tag-${index}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black"
              >
                {tag}
              </span>
            ))}
            
            {/* Skills Required */}
            {project.skills_required?.slice(0, 2).map((skill, index) => (
              <span 
                key={`skill-${index}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-yellow-100 text-black border border-black"
              >
                {skill}
              </span>
            ))}
            
            {/* Industry Tags */}
            {project.industry_tags?.slice(0, 1).map((tag, index) => (
              <span 
                key={`ind-${index}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}
            
            {/* Technology Tags */}
            {project.technology_tags?.slice(0, 1).map((tag, index) => (
              <span 
                key={`tech-${index}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}
            
            {/* Show count of remaining tags if there are more */}
            {(
              (project.project_tags?.length || 0) + 
              (project.industry_tags?.length || 0) + 
              (project.technology_tags?.length || 0) + 
              (project.skills_required?.length || 0) + 
              (project.expertise_needed?.length || 0)
            ) > 6 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                +more
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
          
          {/* Project type and category */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {project.project_type && (
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{project.project_type}</p>
              </div>
            )}
            {project.project_category && (
              <div>
                <span className="text-gray-600">Category:</span>
                <p className="font-medium">{project.project_category}</p>
              </div>
            )}
          </div>
          
          {project.budget && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Budget:</span> {project.budget}
            </div>
          )}
          
          {project.project_timeline && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Timeline:</span> {project.project_timeline}
            </div>
          )}
          
          {skills.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Skills needed:</h4>
              <div className="flex flex-wrap gap-0.5 justify-start">
                {skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-start mb-3">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
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