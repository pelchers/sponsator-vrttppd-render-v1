import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { checkFollowStatus, getFollowCount } from '@/api/follows';
import { checkWatchStatus, getWatchCount } from '@/api/watches';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { API_URL } from '@/config';
import { UserImage } from '@/components/UserImage';

interface UserCardProps {
  user: {
    id: string;
    username?: string;
    profile_image_url?: string | null;
    profile_image_upload?: string | null;
    profile_image_display?: 'url' | 'upload';
    bio?: string;
    user_type?: string;
    career_title?: string;
    likes_count?: number;
    follows_count?: number;
    watches_count?: number;
    skills?: string[];
    expertise?: string[];
    interest_tags?: string[];
    experience_tags?: string[];
    education_tags?: string[];
    target_audience?: string[];
    solutions_offered?: string[];
    career_experience?: number;
    social_media_handle?: string;
    social_media_followers?: number;
    company?: string;
    company_location?: string;
    company_website?: string;
    contract_type?: string;
    contract_duration?: string;
    contract_rate?: string;
    availability_status?: string;
    preferred_work_type?: string;
    rate_range?: string;
    currency?: string;
    standard_service_rate?: string;
    standard_rate_type?: string;
    compensation_type?: string;
    website_links?: string[];
    short_term_goals?: string;
    long_term_goals?: string;
    profile_visibility?: string;
    search_visibility?: boolean;
    notification_preferences_email?: boolean;
    notification_preferences_push?: boolean;
    notification_preferences_digest?: boolean;
    account_status?: string;
    last_active?: Date;
    created_at?: Date;
    updated_at?: Date;
    social_links_youtube?: string;
    social_links_instagram?: string;
    social_links_github?: string;
    social_links_twitter?: string;
    social_links_linkedin?: string;
    work_status?: string;
    seeking?: string;
  };
  userHasLiked?: boolean;
  userIsFollowing?: boolean;
  userIsWatching?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function UserCard({
  user,
  userHasLiked = false,
  userIsFollowing = false,
  userIsWatching = false,
  viewMode = 'grid'
}: UserCardProps) {
  const isList = viewMode === 'list';

  useEffect(() => {
    console.log('UserCard received user data:', {
      id: user.id,
      work_status: user.work_status,
      seeking: user.seeking,
      skills: user.skills,
      expertise: user.expertise,
      interest_tags: user.interest_tags,
      experience_tags: user.experience_tags,
      education_tags: user.education_tags,
      target_audience: user.target_audience,
      solutions_offered: user.solutions_offered
    });
  }, [user]);

  // Add this console log at the top of the component
  console.log('UserCard user data:', {
    skills: user.skills,
    expertise: user.expertise,
    interest_tags: user.interest_tags,
    experience_tags: user.experience_tags,
    education_tags: user.education_tags,
    target_audience: user.target_audience,
    solutions_offered: user.solutions_offered
  });

  // Interaction states
  const [liked, setLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(user.likes_count || 0);
  
  const [following, setFollowing] = useState(userIsFollowing);
  const [followCount, setFollowCount] = useState(user.follows_count || 0);
  
  const [watching, setWatching] = useState(userIsWatching);
  const [watchCount, setWatchCount] = useState(user.watches_count || 0);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInteractionData = async () => {
      try {
        // Get current counts
        const [likes, follows, watches] = await Promise.all([
          getLikeCount('user', user.id),
          getFollowCount('user', user.id),
          getWatchCount('user', user.id)
        ]);
        
        setLikeCount(likes);
        setFollowCount(follows);
        setWatchCount(watches);
        
        // Check user's interaction status if not provided
        if (!userHasLiked || !userIsFollowing || !userIsWatching) {
          const [hasLiked, isFollowing, isWatching] = await Promise.all([
            !userHasLiked && checkLikeStatus('user', user.id),
            !userIsFollowing && checkFollowStatus('user', user.id),
            !userIsWatching && checkWatchStatus('user', user.id)
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
  }, [user.id, userHasLiked, userIsFollowing, userIsWatching]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (liked) {
        await unlikeEntity('user', user.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('user', user.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isList) {
    return (
      <div className="flex flex-row items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="mr-4 flex-shrink-0">
          <div className="w-16 h-16">
            <UserImage 
              user={user}
              className="w-16 h-16 rounded-full object-cover"
              fallback={<DefaultAvatar className="w-16 h-16" />}
            />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                <Link to={`/profile/${user.id}`} className="hover:text-green-500">
                  {user.username}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm">{user.user_type || 'User'}</p>
            </div>
            
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
                entityType="user"
                entityId={user.id}
                initialWatching={watching}
                initialCount={watchCount}
                showCount={true}
                size="sm"
                variant="ghost"
              />
              <FollowButton 
                entityType="user"
                entityId={user.id}
                initialFollowing={following}
                initialCount={followCount}
                showCount={true}
                size="sm"
                variant="ghost"
              />
            </div>
          </div>
          
          <p className="text-gray-600 mt-2 line-clamp-2">
            {user.bio || 'No bio available'}
          </p>
          
          <div className="flex gap-4 mt-2 text-xs">
            <div>
              <span className="text-gray-600">Work Status:</span>{' '}
              <span className="font-medium">{user.work_status || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600">Seeking:</span>{' '}
              <span className="font-medium">{user.seeking || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {/* Target Audience Tags */}
            {user.target_audience?.slice(0, 2).map((tag) => (
              <span 
                key={`target-${tag}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-800 border border-black"
              >
                {tag}
              </span>
            ))}

            {/* Solutions Offered Tags */}
            {user.solutions_offered?.slice(0, 2).map((tag) => (
              <span 
                key={`solution-${tag}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-800 border border-black"
              >
                {tag}
              </span>
            ))}

            {/* Skills Tags */}
            {user.skills?.slice(0, 2).map((skill) => (
              <span 
                key={`skill-${skill}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black"
              >
                {skill}
              </span>
            ))}

            {/* Expertise Tags */}
            {user.expertise?.slice(0, 1).map((item) => (
              <span 
                key={`expertise-${item}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black"
              >
                {item}
              </span>
            ))}

            {/* Interest Tags */}
            {user.interest_tags?.slice(0, 1).map((tag) => (
              <span 
                key={`interest-${tag}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-yellow-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}
            
            {/* Experience Tags */}
            {user.experience_tags?.slice(0, 1).map((tag) => (
              <span 
                key={`exp-${tag}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}

            {/* Education Tags */}
            {user.education_tags?.slice(0, 1).map((tag) => (
              <span 
                key={`edu-${tag}`}
                className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-black border border-black"
              >
                {tag}
              </span>
            ))}

            {(
              (user.target_audience?.length || 0) + 
              (user.solutions_offered?.length || 0) + 
              (user.skills?.length || 0) + 
              (user.expertise?.length || 0) + 
              (user.interest_tags?.length || 0) + 
              (user.experience_tags?.length || 0) + 
              (user.education_tags?.length || 0)
            ) > 9 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                +more
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col items-center text-center">
      {/* Profile Image - Centered on its own line */}
      <div className="w-full flex justify-center py-4">
        <UserImage
          user={user}
          className="w-24 h-24 rounded-full object-cover border-2 border-black"
          fallback={<DefaultAvatar className="w-24 h-24" />}
        />
      </div>

      {/* Content Section */}
      <div className="w-full text-center px-4">
        {/* Username */}
        <Link to={`/profile/${user.id}`}>
          <h3 className="text-2xl font-bold hover:text-green-500 transition-colors duration-250">
            {user.username}
          </h3>
        </Link>

        {/* User Type */}
        <span className="block text-sm text-gray-600 mt-1 mb-2 capitalize">
          {user.user_type || 'User'}
        </span>

        {/* Bio */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {user.bio || 'No bio available'}
        </p>

        {/* All tags in a single flex container */}
        <div className="flex flex-wrap gap-0.5 justify-center mb-3">
          {/* Target Audience Tags */}
          {user.target_audience?.map((tag) => (
            <span 
              key={`target-${tag}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-800 border border-black transition-all duration-250 hover:scale-105"
            >
              {tag}
            </span>
          ))}

          {/* Solutions Offered Tags */}
          {user.solutions_offered?.map((tag) => (
            <span 
              key={`solution-${tag}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-800 border border-black transition-all duration-250 hover:scale-105"
            >
              {tag}
            </span>
          ))}

          {/* Skills Tags */}
          {user.skills?.map((skill) => (
            <span 
              key={`skill-${skill}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"
            >
              {skill}
            </span>
          ))}

          {/* Expertise Tags */}
          {user.expertise?.map((item) => (
            <span 
              key={`expertise-${item}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105"
            >
              {item}
            </span>
          ))}

          {/* Interest Tags */}
          {user.interest_tags?.map((tag) => (
            <span 
              key={`interest-${tag}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-yellow-100 text-black border border-black transition-all duration-250 hover:scale-105"
            >
              {tag}
            </span>
          ))}

          {/* Experience Tags */}
          {user.experience_tags?.map((tag) => (
            <span 
              key={`exp-${tag}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105"
            >
              {tag}
            </span>
          ))}

          {/* Education Tags */}
          {user.education_tags?.map((tag) => (
            <span 
              key={`edu-${tag}`}
              className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Work Status and Seeking Section */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2 mb-3 px-2">
          <div className="text-center">
            <span className="text-[10px] text-gray-600">Work Status</span>
            <p className="text-xs font-medium">
              {user.work_status || 'Not specified'}
            </p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-gray-600">Seeking</span>
            <p className="text-xs font-medium">
              {user.seeking || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      <CardFooter className="w-full px-4 pt-0 border-t border-black">
        <div className="flex items-center justify-center gap-4 w-full">
          <WatchButton 
            entityType="user"
            entityId={user.id}
            initialWatching={watching}
            initialCount={watchCount}
            showCount={true}
            size="sm"
            variant="ghost"
          />
          <FollowButton 
            entityType="user"
            entityId={user.id}
            initialFollowing={following}
            initialCount={followCount}
            showCount={true}
            size="sm"
            variant="ghost"
          />
          <button
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`flex items-center gap-1 ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
            } transition-colors`}
          >
            <HeartIcon 
              filled={liked} 
              className="w-4 h-4" 
            />
            <span className="text-sm">{likeCount}</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}