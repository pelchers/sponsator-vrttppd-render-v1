import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, uploadProfileImage } from '@/api/users';

export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState({
    // Basic Information
    profile_image: null as File | null,
    username: "",
    email: "",
    bio: "",
    user_type: "",

    // Professional Information
    career_title: "",
    career_experience: 0,
    social_media_handle: "",
    social_media_followers: 0,
    company: "",
    company_location: "",
    company_website: "",
    contract_type: "",
    contract_duration: "",
    contract_rate: "",

    // Availability & Preferences
    availability_status: "",
    preferred_work_type: "",
    rate_range: "",
    currency: "USD",
    standard_service_rate: "",
    standard_rate_type: "",
    compensation_type: "",

    // Skills & Expertise
    skills: [] as string[],
    expertise: [] as string[],

    // Focus
    target_audience: [] as string[],
    solutions_offered: [] as string[],

    // Tags & Categories
    interest_tags: [] as string[],
    experience_tags: [] as string[],
    education_tags: [] as string[],
    work_status: "",
    seeking: "",

    // Contact & Availability
    social_links: {
      youtube: "",
      instagram: "",
      github: "",
      twitter: "",
      linkedin: "",
    },
    website_links: [] as string[],

    // Experience & Education
    work_experience: [] as { title: string; company: string; years: string; media?: File }[],
    education: [] as { degree: string; school: string; year: string; media?: File }[],
    certifications: [] as { name: string; issuer: string; year: string; media?: File }[],
    accolades: [] as { title: string; issuer: string; year: string; media?: File }[],
    endorsements: [] as { name: string; position: string; company: string; text: string; media?: File }[],

    // Collaboration & Goals
    short_term_goals: "",
    long_term_goals: "",

    // Portfolio
    featured_projects: [] as { title: string; description: string; url: string; media?: File }[],
    case_studies: [] as { title: string; description: string; url: string; media?: File }[],

    // Privacy
    profile_visibility: "public",
    search_visibility: true,
    notification_preferences: {
      email: true,
      push: true,
      digest: true,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user data
  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const userData = await fetchUserProfile(userId, token);
        
        // Initialize form data with defaults for missing values
        setFormData({
          // Basic Information
          profile_image: userData.profile_image || null,
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          user_type: userData.user_type || '',

          // Professional Information
          career_title: userData.career_title || '',
          career_experience: userData.career_experience || 0,
          social_media_handle: userData.social_media_handle || '',
          social_media_followers: userData.social_media_followers || 0,
          company: userData.company || '',
          company_location: userData.company_location || '',
          company_website: userData.company_website || '',
          contract_type: userData.contract_type || '',
          contract_duration: userData.contract_duration || '',
          contract_rate: userData.contract_rate || '',

          // Availability & Preferences
          availability_status: userData.availability_status || '',
          preferred_work_type: userData.preferred_work_type || '',
          rate_range: userData.rate_range || '',
          currency: userData.currency || 'USD',
          standard_service_rate: userData.standard_service_rate || '',
          standard_rate_type: userData.standard_rate_type || '',
          compensation_type: userData.compensation_type || '',

          // Skills & Expertise
          skills: userData.skills || [],
          expertise: userData.expertise || [],

          // Focus
          target_audience: userData.target_audience || [],
          solutions_offered: userData.solutions_offered || [],

          // Tags & Categories
          interest_tags: userData.interest_tags || [],
          experience_tags: userData.experience_tags || [],
          education_tags: userData.education_tags || [],
          work_status: userData.work_status || '',
          seeking: userData.seeking || '',

          // Contact & Availability
          social_links: userData.social_links || {
            youtube: '',
            instagram: '',
            github: '',
            twitter: '',
            linkedin: '',
          },
          website_links: userData.website_links || [],

          // Experience & Education
          work_experience: userData.work_experience || [],
          education: userData.education || [],
          certifications: userData.certifications || [],
          accolades: userData.accolades || [],
          endorsements: userData.endorsements || [],

          // Collaboration & Goals
          short_term_goals: userData.short_term_goals || '',
          long_term_goals: userData.long_term_goals || '',

          // Portfolio
          featured_projects: userData.featured_projects || [],
          case_studies: userData.case_studies || [],

          // Privacy
          profile_visibility: userData.profile_visibility || 'public',
          search_visibility: userData.search_visibility !== false,
          notification_preferences: userData.notification_preferences || {
            email: true,
            push: true,
            digest: true,
          },
        });
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle image upload
  const handleImageSelect = (file: File) => {
    setFormData(prev => ({
      ...prev,
      profile_image: file
    }));
  };

  // Handle adding tags
  const handleAddTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as string[]), tag],
    }));
  };

  // Handle removing tags
  const handleRemoveTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] as string[]).filter((t) => t !== tag),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Upload profile image if it's a File object
      if (formData.profile_image instanceof File) {
        await uploadProfileImage(userId, formData.profile_image, token);
      }
      
      // Prepare data for API
      const dataToSend = {
        ...formData,
        // Convert File objects to null to avoid circular JSON error
        profile_image: typeof formData.profile_image === 'string' ? formData.profile_image : null,
        // Process arrays of objects with File properties
        work_experience: formData.work_experience.map((exp: any) => ({
          ...exp,
          media: typeof exp.media === 'string' ? exp.media : null
        })),
        education: formData.education.map((edu: any) => ({
          ...edu,
          media: typeof edu.media === 'string' ? edu.media : null
        })),
        certifications: formData.certifications.map((cert: any) => ({
          ...cert,
          media: typeof cert.media === 'string' ? cert.media : null
        })),
        accolades: formData.accolades.map((accolade: any) => ({
          ...accolade,
          media: typeof accolade.media === 'string' ? accolade.media : null
        })),
        endorsements: formData.endorsements.map((endorsement: any) => ({
          ...endorsement,
          media: typeof endorsement.media === 'string' ? endorsement.media : null
        })),
        featured_projects: formData.featured_projects.map((project: any) => ({
          ...project,
          media: typeof project.media === 'string' ? project.media : null
        })),
        case_studies: formData.case_studies.map((study: any) => ({
          ...study,
          media: typeof study.media === 'string' ? study.media : null
        })),
      };
      
      // Update user profile
      await updateUserProfile(userId, dataToSend, token);
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    saving,
    error,
    success,
    handleInputChange,
    handleImageSelect,
    handleAddTag,
    handleRemoveTag,
    handleSubmit
  };
} 