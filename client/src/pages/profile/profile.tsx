import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '@/api/users';
import PageSection from "@/components/sections/PageSection"
import CategorySection from "@/components/sections/CategorySection"
import PillTag from "@/components/input/forms/PillTag"
import { Button } from "@/components/ui/button"
import Layout from "@/components/layout/Layout"
import './Profile.css'
import { createChat } from '@/api/chats';
import { Loader } from '@/components/ui/loader';
import { HeartIcon } from '@/components/icons/HeartIcon';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import { API_URL } from '@/config';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          navigate(`/profile/${userId}`);
          return;
        } else {
          navigate('/login');
          return;
        }
      }
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = await fetchUserProfile(id, token);
        
        // Initialize empty arrays and objects for collections if they don't exist
        const processedData = {
          ...userData,
          skills: userData.skills || [],
          expertise: userData.expertise || [],
          target_audience: userData.target_audience || [],
          solutions_offered: userData.solutions_offered || [],
          interest_tags: userData.interest_tags || [],
          experience_tags: userData.experience_tags || [],
          education_tags: userData.education_tags || [],
          website_links: userData.website_links || [],
          work_experience: userData.work_experience || [],
          education: userData.education || [],
          certifications: userData.certifications || [],
          accolades: userData.accolades || [],
          endorsements: userData.endorsements || [],
          featured_projects: userData.featured_projects || [],
          case_studies: userData.case_studies || [],
          social_links: userData.social_links || {
            youtube: '',
            instagram: '',
            github: '',
            twitter: '',
            linkedin: ''
          },
          notification_preferences: userData.notification_preferences || {
            email: false,
            push: false,
            digest: false
          }
        };
        
        setUser(processedData);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id, navigate]);

  useEffect(() => {
    const fetchLikeData = async () => {
      if (!user) return;
      
      try {
        // Get current like count
        const count = await getLikeCount('user', user.id);
        setLikeCount(count);
        
        // Check if user has liked this user
        const hasLiked = await checkLikeStatus('user', user.id);
        setLiked(hasLiked);
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [user]);

  const handleMessageUser = async () => {
    if (!user) return;
    
    try {
      setIsCreatingChat(true);
      const newChat = await createChat({
        type: 'direct',
        name: `Chat with ${user.username}`,
        participants: [user.id]
      });
      
      // Redirect to the new chat
      navigate(`/messages/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      // Fallback to messages list if chat creation fails
      navigate('/messages');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !user) return;
    
    setIsLoading(true);
    
    // Store the current state before optimistic update
    const wasLiked = liked;
    const previousCount = likeCount;
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      let newCount;
      if (liked) {
        await unlikeEntity('user', user.id);
        newCount = await getLikeCount('user', user.id);
        setLiked(false);
      } else {
        await likeEntity('user', user.id);
        newCount = await getLikeCount('user', user.id);
        setLiked(true);
      }
      
      setLikeCount(newCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(wasLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

  return (
      <div className="min-h-screen w-full bg-[#FFFEFF]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              {/* Title and Buttons Container - Vertical on mobile, horizontal on desktop */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                {/* Title Section */}
                <div className="flex justify-center md:justify-start">
                  <h1 className="text-4xl font-semibold text-center md:text-left">{user.username}'s Profile</h1>
                </div>

                {/* Buttons Row - Centered on mobile, right-aligned on desktop */}
                <div className="flex flex-row justify-center md:justify-end items-center gap-2">
                  <Button 
                    onClick={() => navigate(`/portfolio/${id}`)}
                    className="bg-blue-600 text-white hover:bg-blue-700 text-sm md:text-base px-3 py-1.5"
                  >
                    View Portfolio
                  </Button>
                  <Button 
                    onClick={handleMessageUser}
                    disabled={isCreatingChat}
                    className="bg-orange-500 text-white hover:bg-orange-600 text-sm md:text-base px-3 py-1.5"
                  >
                    {isCreatingChat ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Creating Chat...
                      </>
                    ) : (
                      'Message'
                    )}
                  </Button>
                  {/* Only show Edit button if it's the user's own profile */}
                  {localStorage.getItem('userId') === id && (
                    <Button 
                      onClick={() => navigate(`/profile/${id}/edit`)}
                      className="bg-green-500 text-white hover:bg-green-600 text-sm md:text-base px-3 py-1.5"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Image and Stats */}
              <div className="flex flex-col items-center">
                <div className="image-container">
                  <img 
                    src={
                      user.profile_image_display === 'url'
                        ? user.profile_image_url
                        : user.profile_image_upload
                          ? `${API_URL.replace('/api', '')}/uploads/${user.profile_image_upload}`
                          : '/placeholder.svg'
                    } 
                    alt="Profile" 
                    className="profile-image"
                  />
                  <div className="flex justify-center items-center space-x-6 mt-4">
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={handleLikeToggle}
                        disabled={isLoading}
                        className={`flex items-center gap-1 text-sm ${
                          liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                        } transition-colors`}
                        aria-label={liked ? "Unlike" : "Like"}
                      >
                        <HeartIcon filled={liked} className="w-6 h-6" />
                        <span className="font-medium">{likeCount}</span>
                      </button>
                      <span className="text-xs text-gray-500 mt-1">Likes</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <WatchButton 
                        entityType="user"
                        entityId={user.id}
                        initialWatching={false}
                        initialCount={user.watches_count || 0}
                        showCount={true}
                        size="lg"
                        variant="ghost"
                      />
                      <span className="text-xs text-gray-500 mt-1">Watching</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <FollowButton 
                        entityType="user"
                        entityId={user.id}
                        initialFollowing={false}
                        initialCount={user.followers_count || 0}
                        showCount={true}
                        size="lg"
                        variant="ghost"
                      />
                      <span className="text-xs text-gray-500 mt-1">Followers</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="info-group">
                  <label className="info-label">Username</label>
                  <div className="info-value border border-black p-2 rounded-lg bg-white">
                    {user.username}
                  </div>
                </div>
                <div className="info-group">
                  <label className="info-label">Email</label>
                  <div className="info-value border border-black p-2 rounded-lg bg-white">
                    {user.email}
                  </div>
                </div>
                <div className="info-group">
                  <label className="info-label">Bio</label>
                  <div className="info-value border border-black p-2 rounded-lg bg-white" style={{ minHeight: '100px' }}>
                    {user.bio}
                  </div>
                </div>
                <div className="info-group">
                  <label className="info-label">User Type</label>
                  <div className="info-value border border-black p-2 rounded-lg bg-white">
                    {user.user_type}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Professional Information</h2>
              <div className="profile-grid">
                {/* Career Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Career Details</h3>
                  <div className="info-group">
                    <label className="info-label">Career Title</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.career_title}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Experience</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.career_experience} years
                    </div>
                  </div>
                </div>

                {/* Social Media Details */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Social Media</h3>
                  <div className="info-group">
                    <label className="info-label">Handle</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.social_media_handle}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Followers</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.social_media_followers}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Professional Affiliation and Contract Specifications */}
              <div className="profile-grid mt-6">
                {/* Professional Affiliation */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Professional Affiliation</h3>
                  <div className="info-group">
                    <label className="info-label">Company</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.company || 'Not specified'}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Company Location</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">{user.company_location || 'Not specified'}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Company Website</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.company_website ? (
                        <a 
                          href={user.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {user.company_website}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                  </div>
                </div>

                {/* Contract Specifications */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Contract Specifications</h3>
                  <div className="info-group">
                    <label className="info-label">Contract Type</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.contract_type || 'Not specified'}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Contract Duration</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.contract_duration || 'Not specified'}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Contract Rate</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.contract_rate || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability & Work Preferences */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Availability & Work Preferences</h2>
              <div className="profile-grid">
                {/* Availability */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Availability</h3>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.availability_status}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Preferred Work Type</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.preferred_work_type}
                    </div>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Compensation</h3>
                  <div className="info-group">
                    <label className="info-label">Standard Rate</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.standard_service_rate}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Rate Range</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.rate_range}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Focus */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Focus</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="text-xl font-bold mb-4">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.target_audience.map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Solutions Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.solutions_offered.map((tag: string, index: number) => (
                      <PillTag key={index} text={tag} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags & Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Tags & Categories</h2>
              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((item, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-black border border-black transition-all duration-250 hover:scale-105">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interest Tags */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Interest Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.interest_tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-black border border-black transition-all duration-250 hover:scale-105">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Tags */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Experience Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.experience_tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education Tags */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Education Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.education_tags.map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-black border border-black transition-all duration-250 hover:scale-105">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Status</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="text-xl font-bold mb-4">Work Status</h3>
                  <div className="info-group">
                    <label className="info-label">Current Status</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.work_status}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Seeking</h3>
                  <div className="info-group">
                    <label className="info-label">Looking For</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.seeking}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Availability */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Contact & Availability</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="text-xl font-bold mb-4">Social Links</h3>
                  {Object.entries(user.social_links).map(([platform, url]) => (
                    <div key={platform} className="info-group">
                      <label className="info-label capitalize">{platform}</label>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {url ? (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {url}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Website Links</h3>
                  <div className="info-group">
                    <div className="flex flex-wrap gap-2">
                      {user.website_links.map((link, index) => (
                        <a 
                          key={index} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-2 py-0.5 text-xs rounded-full bg-white text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {new URL(link).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Qualifications</h2>
              <div className="space-y-8">
                {/* Work Experience */}
                <div className="info-group">
                  <h3 className="text-xl font-bold mb-4">Work Experience</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.work_experience.map((exp, index) => (
                      <div key={index} className="bg-white p-4 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Title</label>
                            <div className="font-medium">{exp.title}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Company</label>
                            <div>{exp.company}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Years</label>
                            <div>{exp.years}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="info-group">
                  <h3 className="text-xl font-bold mb-4">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.education.map((edu, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Degree</label>
                            <div className="font-medium">{edu.degree}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">School</label>
                            <div>{edu.school}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Year</label>
                            <div>{edu.year}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="info-group">
                  <h3 className="text-xl font-bold mb-4">Certifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.certifications.map((cert, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Name</label>
                            <div className="font-medium">{cert.name}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Issuer</label>
                            <div>{cert.issuer}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Year</label>
                            <div>{cert.year}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accolades */}
                <div className="info-group">
                  <h3 className="text-xl font-bold mb-4">Accolades</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.accolades.map((accolade, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Title</label>
                            <div className="font-medium">{accolade.title}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Issuer</label>
                            <div>{accolade.issuer}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Year</label>
                            <div>{accolade.year}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Endorsements */}
                <div className="info-group">
                  <h3 className="text-xl font-bold mb-4">Endorsements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.endorsements.map((endorsement, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Name</label>
                            <div className="font-medium">{endorsement.name}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Position</label>
                            <div>{endorsement.position}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Company</label>
                            <div>{endorsement.company}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Testimonial</label>
                            <div className="text-sm">{endorsement.text}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration & Goals */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Collaboration & Goals</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="text-xl font-bold mb-4">Short Term Goals</h3>
                  <div className="info-group">
                    <div className="info-value border border-black p-2 rounded-lg bg-white" style={{ minHeight: '100px' }}>
                      {user.short_term_goals}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Long Term Goals</h3>
                  <div className="info-group">
                    <div className="info-value border border-black p-2 rounded-lg bg-white" style={{ minHeight: '100px' }}>
                      {user.long_term_goals}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio & Showcase */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Portfolio & Showcase</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Featured Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.featured_projects.map((project, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Title</label>
                            <div className="font-medium">{project.title}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Description</label>
                            <div className="text-sm">{project.description}</div>
                          </div>
                          {project.url && (
                            <div>
                              <label className="text-sm text-gray-500">Project Link</label>
                              <div>
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Project
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Case Studies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.case_studies.map((study, index) => (
                      <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div>
                            <label className="text-sm text-gray-500">Title</label>
                            <div className="font-medium">{study.title}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Description</label>
                            <div className="text-sm">{study.description}</div>
                          </div>
                          {study.url && (
                            <div>
                              <label className="text-sm text-gray-500">Case Study Link</label>
                              <div>
                                <a href={study.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Case Study
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Notifications */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Privacy & Notifications</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="text-xl font-bold mb-4">Privacy Settings</h3>
                  <div className="info-group">
                    <label className="info-label">Profile Visibility</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.profile_visibility}
                    </div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Search Visibility</label>
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {user.search_visibility ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Notification Preferences</h3>
                  {Object.entries(user.notification_preferences).map(([key, value]) => (
                    <div key={key} className="info-group">
                      <label className="info-label capitalize">{key.replace('_', ' ')}</label>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {value ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

