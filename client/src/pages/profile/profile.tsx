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
      <div className="w-full">
        <div className="profile-container">
          <div className="profile-sections-container">
            {/* Basic Information */}
            <div className="profile-section">
              <div className="flex justify-between items-center">
                <h1 className="profile-header">{user.username}'s Profile</h1>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => navigate(`/portfolio/${id}`)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    View Portfolio
                  </Button>
                  <Button 
                    onClick={handleMessageUser}
                    disabled={isCreatingChat}
                    variant="outline"
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
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
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
              <div className="profile-grid">
                <div className="info-group">
                  <label className="info-label">Username</label>
                  <div className="info-value">{user.username}</div>
                </div>
                <div className="info-group">
                  <label className="info-label">Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-group">
                  <label className="info-label">Bio</label>
                  <div className="info-value" style={{ minHeight: '100px' }}>{user.bio}</div>
                </div>
                <div className="info-group">
                  <label className="info-label">User Type</label>
                  <div className="info-value">{user.user_type}</div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="profile-section">
              <h2 className="section-title">Professional Information</h2>
              <div className="profile-grid">
                {/* Career Details */}
                <div>
                  <h3 className="section-title">Career Details</h3>
                  <div className="info-group">
                    <label className="info-label">Career Title</label>
                    <div className="info-value">{user.career_title}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Experience</label>
                    <div className="info-value">{user.career_experience} years</div>
                  </div>
                </div>

                {/* Social Media Details */}
                <div>
                  <h3 className="section-title">Social Media</h3>
                  <div className="info-group">
                    <label className="info-label">Handle</label>
                    <div className="info-value">{user.social_media_handle}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Followers</label>
                    <div className="info-value">{user.social_media_followers}</div>
                  </div>
                </div>
              </div>

              {/* Add Professional Affiliation and Contract Specifications */}
              <div className="profile-grid mt-6">
                {/* Professional Affiliation */}
                <div>
                  <h3 className="section-title">Professional Affiliation</h3>
                  <div className="info-group">
                    <label className="info-label">Company</label>
                    <div className="info-value">{user.company || 'Not specified'}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Company Location</label>
                    <div className="info-value">{user.company_location || 'Not specified'}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Company Website</label>
                    <div className="info-value">
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
                  <h3 className="section-title">Contract Specifications</h3>
                  <div className="info-group">
                    <label className="info-label">Contract Type</label>
                    <div className="info-value">{user.contract_type || 'Not specified'}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Contract Duration</label>
                    <div className="info-value">{user.contract_duration || 'Not specified'}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Contract Rate</label>
                    <div className="info-value">{user.contract_rate || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability & Work Preferences */}
            <div className="profile-section">
              <h2 className="section-title">Availability & Work Preferences</h2>
              <div className="profile-grid">
                {/* Availability */}
                <div>
                  <h3 className="section-title">Availability</h3>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <div className="info-value">{user.availability_status}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Preferred Work Type</label>
                    <div className="info-value">{user.preferred_work_type}</div>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <h3 className="section-title">Compensation</h3>
                  <div className="info-group">
                    <label className="info-label">Standard Rate</label>
                    <div className="info-value">{user.standard_service_rate}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Rate Range</label>
                    <div className="info-value">{user.rate_range}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Focus */}
            <div className="profile-section">
              <h2 className="section-title">Focus</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.target_audience.map((tag: string, index: number) => (
                      <PillTag key={index} text={tag} />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="section-title">Solutions Offered</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.solutions_offered.map((tag: string, index: number) => (
                      <PillTag key={index} text={tag} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags & Categories */}
            <div className="profile-section">
              <h2 className="section-title">Skills & Expertise</h2>
              <div className="profile-grid">
                <div className="info-group">
                  <label className="info-label">Skills</label>
                  <div className="tag-container">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="info-group">
                  <label className="info-label">Expertise</label>
                  <div className="tag-container">
                    {user.expertise.map((item, index) => (
                      <span key={index} className="tag">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="profile-section">
              <h2 className="section-title">Status</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Work Status</h3>
                  <div className="info-group">
                    <label className="info-label">Current Status</label>
                    <div className="info-value">{user.work_status}</div>
                  </div>
                </div>
                <div>
                  <h3 className="section-title">Seeking</h3>
                  <div className="info-group">
                    <label className="info-label">Looking For</label>
                    <div className="info-value">{user.seeking}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Availability */}
            <div className="profile-section">
              <h2 className="section-title">Contact & Availability</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Social Links</h3>
                  {Object.entries(user.social_links).map(([platform, url]) => (
                    <div key={platform} className="info-group">
                      <label className="info-label capitalize">{platform}</label>
                      <div className="info-value">
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
                  <h3 className="section-title">Website Links</h3>
                  <div className="info-group">
                    <div className="tag-container">
                      {user.website_links.map((link, index) => (
                        <a 
                          key={index} 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="tag hover:bg-gray-300"
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
            <div className="profile-section">
              <h2 className="section-title">Qualifications</h2>
              <div className="space-y-6">
                {/* Work Experience */}
                <div className="info-group">
                  <h3 className="section-title">Work Experience</h3>
                  {user.work_experience.map((exp, index) => (
                    <div key={index} className="info-value mb-4">
                      <div className="font-medium">{exp.title}</div>
                      <div>{exp.company}</div>
                      <div className="text-sm text-gray-500">{exp.years}</div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="info-group">
                  <h3 className="section-title">Education</h3>
                  {user.education.map((edu, index) => (
                    <div key={index} className="info-value mb-4">
                      <div className="font-medium">{edu.degree}</div>
                      <div>{edu.school}</div>
                      <div className="text-sm text-gray-500">{edu.year}</div>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div className="info-group">
                  <h3 className="section-title">Certifications</h3>
                  {user.certifications.map((cert, index) => (
                    <div key={index} className="info-value mb-4">
                      <div className="font-medium">{cert.name}</div>
                      <div>{cert.issuer}</div>
                      <div className="text-sm text-gray-500">{cert.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collaboration & Goals */}
            <div className="profile-section">
              <h2 className="section-title">Collaboration & Goals</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Short Term Goals</h3>
                  <div className="info-group">
                    <div className="info-value" style={{ minHeight: '100px' }}>
                      {user.short_term_goals}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="section-title">Long Term Goals</h3>
                  <div className="info-group">
                    <div className="info-value" style={{ minHeight: '100px' }}>
                      {user.long_term_goals}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio & Showcase */}
            <div className="profile-section">
              <h2 className="section-title">Portfolio & Showcase</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Featured Projects</h3>
                  {user.featured_projects.map((project, index) => (
                    <div key={index} className="info-value mb-4">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm">{project.description}</div>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="section-title">Case Studies</h3>
                  {user.case_studies.map((study, index) => (
                    <div key={index} className="info-value mb-4">
                      <div className="font-medium">{study.title}</div>
                      <div className="text-sm">{study.description}</div>
                      {study.url && (
                        <a href={study.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Case Study
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy & Notifications */}
            <div className="profile-section">
              <h2 className="section-title">Privacy & Notifications</h2>
              <div className="profile-grid">
                <div>
                  <h3 className="section-title">Privacy Settings</h3>
                  <div className="info-group">
                    <label className="info-label">Profile Visibility</label>
                    <div className="info-value">{user.profile_visibility}</div>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Search Visibility</label>
                    <div className="info-value">{user.search_visibility ? 'Visible' : 'Hidden'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="section-title">Notification Preferences</h3>
                  {Object.entries(user.notification_preferences).map(([key, value]) => (
                    <div key={key} className="info-group">
                      <label className="info-label capitalize">{key.replace('_', ' ')}</label>
                      <div className="info-value">{value ? 'Enabled' : 'Disabled'}</div>
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

