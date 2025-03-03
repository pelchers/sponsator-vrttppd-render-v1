import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile, uploadProfileImage, deleteWorkExperience, deleteEducation, deleteCertification, 
         deleteAccolade, deleteEndorsement, deleteFeaturedProject, deleteCaseStudy } from '@/api/users';

// Add interfaces for related data types
interface WorkExperience {
  id?: string;
  title: string;
  company: string;
  years: string;
  media?: File;
}

interface Education {
  id?: string;
  degree: string;
  school: string;
  year: string;
  media?: File;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  year: string;
  media?: File;
}

interface Accolade {
  id?: string;
  title: string;
  issuer: string;
  year: string;
  media?: File;
}

interface Endorsement {
  id?: string;
  name: string;
  position: string;
  company: string;
  text: string;
  media?: File;
}

interface FeaturedProject {
  id?: string;
  title: string;
  description: string;
  url: string;
  media?: File;
}

interface CaseStudy {
  id?: string;
  title: string;
  description: string;
  url: string;
  media?: File;
}

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
    work_experience: [] as WorkExperience[],
    education: [] as Education[],
    certifications: [] as Certification[],
    accolades: [] as Accolade[],
    endorsements: [] as Endorsement[],

    // Collaboration & Goals
    short_term_goals: "",
    long_term_goals: "",

    // Portfolio
    featured_projects: [] as FeaturedProject[],
    case_studies: [] as CaseStudy[],

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
        
        // Map all the data including related tables
        setFormData(prev => ({
          ...prev,
          // ... other basic fields ...

          // Map related tables with proper typing
          work_experience: userData.user_work_experience?.map((exp: any) => ({
            id: exp.id,
            user_id: exp.user_id,
            title: exp.title || '',
            company: exp.company || '',
            years: exp.years || '',
            media: exp.media || null
          })) || [],
          
          education: userData.user_education?.map((edu: any) => ({
            id: edu.id,
            user_id: edu.user_id,
            degree: edu.degree || '',
            school: edu.school || '',
            year: edu.year || '',
            media: edu.media || null
          })) || [],
          
          certifications: userData.user_certifications?.map((cert: any) => ({
            id: cert.id,
            user_id: cert.user_id,
            name: cert.name || '',
            issuer: cert.issuer || '',
            year: cert.year || '',
            media: cert.media || null
          })) || [],
          
          accolades: userData.user_accolades?.map((acc: any) => ({
            id: acc.id,
            user_id: acc.user_id,
            title: acc.title || '',
            issuer: acc.issuer || '',
            year: acc.year || '',
            media: acc.media || null
          })) || [],
          
          endorsements: userData.user_endorsements?.map((end: any) => ({
            id: end.id,
            user_id: end.user_id,
            name: end.name || '',
            position: end.position || '',
            company: end.company || '',
            text: end.text || '',
            media: end.media || null
          })) || [],
          
          featured_projects: userData.user_featured_projects?.map((proj: any) => ({
            id: proj.id,
            user_id: proj.user_id,
            title: proj.title || '',
            description: proj.description || '',
            url: proj.url || '',
            media: proj.media || null
          })) || [],
          
          case_studies: userData.user_case_studies?.map((study: any) => ({
            id: study.id,
            user_id: study.user_id,
            title: study.title || '',
            description: study.description || '',
            url: study.url || '',
            media: study.media || null
          })) || [],
        }));
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
        // Convert numeric fields to numbers
        career_experience: typeof formData.career_experience === 'string' ? 
          parseInt(formData.career_experience, 10) || 0 : formData.career_experience,
        social_media_followers: typeof formData.social_media_followers === 'string' ? 
          parseInt(formData.social_media_followers, 10) || 0 : formData.social_media_followers,
        // Convert File objects to null to avoid circular JSON error
        profile_image: typeof formData.profile_image === 'string' ? formData.profile_image : null,
        // Ensure we're sending the full objects for related tables
        work_experience: formData.work_experience.map(exp => ({
          ...exp,
          user_id: userId,
          media: typeof exp.media === 'string' ? exp.media : null
        })),
        education: formData.education.map(edu => ({
          ...edu,
          user_id: userId,
          media: typeof edu.media === 'string' ? edu.media : null
        })),
        certifications: formData.certifications.map(cert => ({
          ...cert,
          user_id: userId,
          media: typeof cert.media === 'string' ? cert.media : null
        })),
        accolades: formData.accolades.map(acc => ({
          ...acc,
          user_id: userId,
          media: typeof acc.media === 'string' ? acc.media : null
        })),
        endorsements: formData.endorsements.map(end => ({
          ...end,
          user_id: userId,
          media: typeof end.media === 'string' ? end.media : null
        })),
        featured_projects: formData.featured_projects.map(proj => ({
          ...proj,
          user_id: userId,
          media: typeof proj.media === 'string' ? proj.media : null
        })),
        case_studies: formData.case_studies.map(study => ({
          ...study,
          user_id: userId,
          media: typeof study.media === 'string' ? study.media : null
        })),
      };
      
      console.log('Sending update data:', dataToSend);
      
      // Update user profile
      await updateUserProfile(userId, dataToSend, token);
      
      // Reload all data to get fresh IDs and ensure consistency
      await loadUserData();
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Add handlers for deleting records
  const handleDeleteWorkExperience = async (id: string) => {
    try {
      setLoading(true);
      await deleteWorkExperience(userId!, id);
      setFormData(prev => ({
        ...prev,
        work_experience: prev.work_experience.filter(exp => exp.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete work experience');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      setLoading(true);
      await deleteEducation(userId!, id);
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete education');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    try {
      setLoading(true);
      await deleteCertification(userId!, id);
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.filter(cert => cert.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete certification');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccolade = async (id: string) => {
    try {
      setLoading(true);
      await deleteAccolade(userId!, id);
      setFormData(prev => ({
        ...prev,
        accolades: prev.accolades.filter(acc => acc.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete accolade');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEndorsement = async (id: string) => {
    try {
      setLoading(true);
      await deleteEndorsement(userId!, id);
      setFormData(prev => ({
        ...prev,
        endorsements: prev.endorsements.filter(end => end.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete endorsement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeaturedProject = async (id: string) => {
    try {
      setLoading(true);
      await deleteFeaturedProject(userId!, id);
      setFormData(prev => ({
        ...prev,
        featured_projects: prev.featured_projects.filter(proj => proj.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete featured project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    try {
      setLoading(true);
      await deleteCaseStudy(userId!, id);
      setFormData(prev => ({
        ...prev,
        case_studies: prev.case_studies.filter(study => study.id !== id)
      }));
    } catch (err) {
      setError('Failed to delete case study');
      console.error(err);
    } finally {
      setLoading(false);
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
    handleSubmit,
    handleDeleteWorkExperience,
    handleDeleteEducation,
    handleDeleteCertification,
    handleDeleteAccolade,
    handleDeleteEndorsement,
    handleDeleteFeaturedProject,
    handleDeleteCaseStudy
  };
} 