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
    profile_image_url: '',
    profile_image_upload: '',
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

  // Add token state
  const [token] = useState(localStorage.getItem('token'));

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
        console.log('Loaded user data:', userData);
        
        console.log('Setting form data with:', {
          work_experience: userData.work_experience,
          education: userData.education,
          certifications: userData.certifications,
          accolades: userData.accolades,
          endorsements: userData.endorsements,
          featured_projects: userData.featured_projects,
          case_studies: userData.case_studies
        });
        
        setFormData(prev => {
          const newData = {
            ...prev,
            // Basic Information
            profile_image: userData.profile_image || null,
            profile_image_url: userData.profile_image_url || '',
            profile_image_upload: userData.profile_image_upload || '',
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
            work_experience: userData.work_experience?.map((exp: any) => ({
              id: exp.id,
              title: exp.title || '',
              company: exp.company || '',
              years: exp.years || '',
              media: exp.media || null
            })) || [],
            
            education: userData.education?.map((edu: any) => ({
              id: edu.id,
              degree: edu.degree || '',
              school: edu.school || '',
              year: edu.year || '',
              media: edu.media || null
            })) || [],
            
            certifications: userData.certifications?.map((cert: any) => ({
              id: cert.id,
              name: cert.name || '',
              issuer: cert.issuer || '',
              year: cert.year || '',
              media: cert.media || null
            })) || [],
            
            accolades: userData.accolades?.map((acc: any) => ({
              id: acc.id,
              title: acc.title || '',
              issuer: acc.issuer || '',
              year: acc.year || '',
              media: acc.media || null
            })) || [],
            
            endorsements: userData.endorsements?.map((end: any) => ({
              id: end.id,
              name: end.name || '',
              position: end.position || '',
              company: end.company || '',
              text: end.text || '',
              media: end.media || null
            })) || [],
            
            featured_projects: userData.featured_projects?.map((proj: any) => ({
              id: proj.id,
              title: proj.title || '',
              description: proj.description || '',
              url: proj.url || '',
              media: proj.media || null
            })) || [],
            
            case_studies: userData.case_studies?.map((study: any) => ({
              id: study.id,
              title: study.title || '',
              description: study.description || '',
              url: study.url || '',
              media: study.media || null
            })) || [],

            // Collaboration & Goals
            short_term_goals: userData.short_term_goals || '',
            long_term_goals: userData.long_term_goals || '',

            // Privacy
            profile_visibility: userData.profile_visibility || 'public',
            search_visibility: userData.search_visibility !== false,
            notification_preferences: userData.notification_preferences || {
              email: true,
              push: true,
              digest: true,
            },
          };
          console.log('New form data:', newData);
          return newData;
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
  const handleImageSelect = async (file: File | null) => {
    try {
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      if (file && userId) {
        // Upload the file
        const result = await uploadProfileImage(userId, file, token);
        
        // Update form data with new upload path and clear URL
        setFormData(prev => ({
          ...prev,
          profile_image: file,
          profile_image_upload: result.path,
          profile_image_url: null // Clear URL when using upload
        }));
      } else {
        // Clear both when removing image
        setFormData(prev => ({
          ...prev,
          profile_image: null,
          profile_image_upload: null,
          profile_image_url: null
        }));
      }
    } catch (error) {
      console.error('Error handling image select:', error);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image_url: url || null,
      profile_image_upload: null, // Clear upload path when using URL
      profile_image: null // Clear file when using URL
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
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      let uploadedImagePath = null;

      // Handle profile image upload or URL
      if (formData.profile_image instanceof File) {
        // Upload the file and get back the path
        const uploadResponse = await uploadProfileImage(userId, formData.profile_image, token);
        uploadedImagePath = uploadResponse.path; // Assuming the API returns { path: string }
      }
      
      // Prepare data for API
      const dataToSend = {
        ...formData,
        // Handle profile image fields
        profile_image_url: formData.profile_image_url || null,
        profile_image_upload: uploadedImagePath || formData.profile_image_upload || null,
        
        // Convert numeric fields to numbers
        career_experience: typeof formData.career_experience === 'string' ? 
          parseInt(formData.career_experience, 10) || 0 : formData.career_experience,
        social_media_followers: typeof formData.social_media_followers === 'string' ? 
          parseInt(formData.social_media_followers, 10) || 0 : formData.social_media_followers,

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
        accolades: formData.accolades.map((acc: any) => ({
          ...acc,
          media: typeof acc.media === 'string' ? acc.media : null
        })),
        endorsements: formData.endorsements.map((end: any) => ({
          ...end,
          media: typeof end.media === 'string' ? end.media : null
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
      
      console.log('Sending update data:', dataToSend);
      
      // Update user profile
      await updateUserProfile(userId, dataToSend, token);
      
      // Reload the data to get the updated records with IDs
      const updatedData = await fetchUserProfile(userId, token);
      
      // Update form data with the fresh data including IDs
      setFormData(prev => ({
        ...prev,
        work_experience: updatedData.work_experience?.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          company: exp.company || '',
          years: exp.years || '',
          media: exp.media || null
        })) || [],
        
        education: updatedData.education?.map((edu: any) => ({
          id: edu.id,
          degree: edu.degree || '',
          school: edu.school || '',
          year: edu.year || '',
          media: edu.media || null
        })) || [],
        
        certifications: updatedData.certifications?.map((cert: any) => ({
          id: cert.id,
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || '',
          media: cert.media || null
        })) || [],
        
        accolades: updatedData.accolades?.map((acc: any) => ({
          id: acc.id,
          title: acc.title || '',
          issuer: acc.issuer || '',
          year: acc.year || '',
          media: acc.media || null
        })) || [],
        
        endorsements: updatedData.endorsements?.map((end: any) => ({
          id: end.id,
          name: end.name || '',
          position: end.position || '',
          company: end.company || '',
          text: end.text || '',
          media: end.media || null
        })) || [],
        
        featured_projects: updatedData.featured_projects?.map((proj: any) => ({
          id: proj.id,
          title: proj.title || '',
          description: proj.description || '',
          url: proj.url || '',
          media: proj.media || null
        })) || [],
        
        case_studies: updatedData.case_studies?.map((study: any) => ({
          id: study.id,
          title: study.title || '',
          description: study.description || '',
          url: study.url || '',
          media: study.media || null
        })) || []
      }));
      
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
    handleImageUrlChange,
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