import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  showClientContractSections,
  showBudgetSection,
  showSkillsExpertise,
  showPortfolio,
  clientInfoLabelMap,
  budgetLabelMap,
  skillsLabelMap,
  deliverablesLabelMap,
  milestonesLabelMap
} from '@/components/input/forms/config/projectFormConfig';
import { 
  fetchProject, 
  createProject, 
  updateProject, 
  uploadProjectImage,
  uploadTeamMemberMedia,
  uploadCollaboratorMedia,
  uploadAdvisorMedia,
  uploadPartnerMedia,
  uploadTestimonialMedia
} from '@/api/projects';

// Move all types here from project.ts
export interface ProjectFormMedia {
  file: File;
}

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  years: string;
  bio?: string;
  media?: ProjectFormMedia;
}

export interface Collaborator {
  id: string;
  name: string;
  company: string;
  role: string;
  contribution: string;
  media?: ProjectFormMedia;
}

export interface Advisor {
  id: string;
  name: string;
  expertise: string;
  year: string;
  bio: string;
  media?: ProjectFormMedia;
}

export interface Partner {
  id: string;
  name: string;
  organization: string;
  contribution: string;
  year: string;
  media?: ProjectFormMedia;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  position: string;
  company: string;
  text: string;
  media?: ProjectFormMedia;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface ProjectFormData {
  project_image: string | null;
  project_name: string;
  project_description: string;
  project_type: string;
  project_category: string;
  project_title: string;
  project_duration: string;
  project_handle: string;
  project_followers: number;

  // Client & Contract Info
  client: string;
  client_location: string;
  client_website: string;
  contract_type: string;
  contract_duration: string;
  contract_value: string;
  project_timeline: string;
  budget: string;
  project_status: string;
  preferred_collaboration_type: string;
  budget_range: string;
  currency: string;
  standard_rate: string;
  rate_type: string;
  compensation_type: string;

  // Arrays
  skills_required: string[];
  expertise_needed: string[];
  target_audience: string[];
  solutions_offered: string[];
  project_tags: string[];
  industry_tags: string[];
  technology_tags: string[];
  website_links: string[];

  // Complex objects
  team_members: TeamMember[];
  collaborators: Collaborator[];
  advisors: Advisor[];
  partners: Partner[];
  testimonials: Testimonial[];
  deliverables: Deliverable[];
  milestones: Milestone[];

  // Nested objects
  seeking: {
    creator: boolean;
    brand: boolean;
    freelancer: boolean;
    contractor: boolean;
  };

  social_links: {
    youtube: string;
    instagram: string;
    github: string;
    twitter: string;
    linkedin: string;
  };

  notification_preferences: {
    email: boolean;
    push: boolean;
    digest: boolean;
  };

  // Other fields
  project_status_tag: string;
  project_visibility: string;
  search_visibility: boolean;
  short_term_goals: string;
  long_term_goals: string;
}

export interface ProjectFormDataWithFile extends Omit<ProjectFormData, 'project_image' | 'team_members' | 'collaborators' | 'advisors' | 'partners' | 'testimonials'> {
  project_image: File | string | null;
  team_members: ProjectFormTeamMember[];
  collaborators: ProjectFormCollaborator[];
  advisors: ProjectFormAdvisor[];
  partners: ProjectFormPartner[];
  testimonials: ProjectFormTestimonial[];
}

export interface ProjectFormTeamMember extends Omit<TeamMember, 'media'> {
  media?: ProjectFormMedia;
}

export interface ProjectFormCollaborator extends Omit<Collaborator, 'media'> {
  media?: ProjectFormMedia;
}

export interface ProjectFormAdvisor extends Omit<Advisor, 'media'> {
  media?: ProjectFormMedia;
}

export interface ProjectFormPartner extends Omit<Partner, 'media'> {
  media?: ProjectFormMedia;
}

export interface ProjectFormTestimonial extends Omit<Testimonial, 'media'> {
  media?: ProjectFormMedia;
}

const defaultFormState: ProjectFormDataWithFile = {
  project_image: null,
  project_name: "",
  project_description: "",
  project_type: "",
  project_category: "",
  project_title: "",
  project_duration: "",
  project_handle: "",
  project_followers: 0,
  client: "",
  client_location: "",
  client_website: "",
  contract_type: "",
  contract_duration: "",
  contract_value: "",
  project_timeline: "",
  budget: "",
  project_status: "",
  preferred_collaboration_type: "",
  budget_range: "",
  currency: "USD",
  standard_rate: "",
  rate_type: "",
  compensation_type: "",
  skills_required: [],
  expertise_needed: [],
  target_audience: [],
  solutions_offered: [],
  project_tags: [],
  industry_tags: [],
  technology_tags: [],
  project_status_tag: "",
  seeking: {
    creator: false,
    brand: false,
    freelancer: false,
    contractor: false,
  },
  social_links: {
    youtube: "",
    instagram: "",
    github: "",
    twitter: "",
    linkedin: "",
  },
  website_links: [],
  deliverables: [],
  milestones: [],
  team_members: [],
  collaborators: [],
  advisors: [],
  partners: [],
  testimonials: [],
  short_term_goals: "",
  long_term_goals: "",
  project_visibility: "public",
  search_visibility: true,
  notification_preferences: {
    email: true,
    push: true,
    digest: true,
  },
  social_links_youtube: '',
  social_links_instagram: '',
  social_links_github: '',
  social_links_twitter: '',
  social_links_linkedin: '',
  seeking_creator: false,
  seeking_brand: false,
  seeking_freelancer: false,
  seeking_contractor: false,
};

export function useProjectForm(projectId?: string) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(projectId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormDataWithFile>({
    ...defaultFormState,
    team_members: Array.isArray(defaultFormState.team_members) 
      ? defaultFormState.team_members 
      : (typeof defaultFormState.team_members === 'string' 
          ? JSON.parse(defaultFormState.team_members || '[]') 
          : []),
    collaborators: Array.isArray(defaultFormState.collaborators) 
      ? defaultFormState.collaborators 
      : (typeof defaultFormState.collaborators === 'string' 
          ? JSON.parse(defaultFormState.collaborators || '[]') 
          : []),
    advisors: Array.isArray(defaultFormState.advisors) 
      ? defaultFormState.advisors 
      : (typeof defaultFormState.advisors === 'string' 
          ? JSON.parse(defaultFormState.advisors || '[]') 
          : []),
    partners: Array.isArray(defaultFormState.partners) 
      ? defaultFormState.partners 
      : (typeof defaultFormState.partners === 'string' 
          ? JSON.parse(defaultFormState.partners || '[]') 
          : []),
    testimonials: Array.isArray(defaultFormState.testimonials) 
      ? defaultFormState.testimonials 
      : (typeof defaultFormState.testimonials === 'string' 
          ? JSON.parse(defaultFormState.testimonials || '[]') 
          : []),
  });
  
  useEffect(() => {
    const initializeForm = async () => {
      if (projectId) {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const projectData = await fetchProject(projectId, token || undefined);
          if (projectData) {
            setFormData(transformApiDataToForm(projectData));
          } else {
            setFormData(defaultFormState);
          }
        } catch (err) {
          console.error('Failed to load project:', err);
          setError('Failed to load project');
          setFormData(defaultFormState);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeForm();
  }, [projectId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.includes('.') ? name.split('.') : [name, null];
      
      if (child && parent === 'seeking') {
        setFormData((prev) => {
          if (!prev?.seeking) return prev;
          return {
            ...prev,
            seeking: {
              ...prev.seeking,
              [child]: (e.target as HTMLInputElement).checked,
            },
          };
        });
        return;
      }
      
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        };
      });
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageSelect = async (file: File) => {
    try {
      setImageUploading(true);
      setUploadError(null);
      
      if (projectId) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');
        
        await uploadProjectImage(projectId, file, token);
      }
      
      setFormData((prev) => ({
        ...prev,
        project_image: file,
      }));
    } catch (err) {
      setUploadError('Failed to upload image');
      console.error(err);
    } finally {
      setImageUploading(false);
    }
  };
  
  const handleAddTag = (section: keyof ProjectFormDataWithFile) => (tag: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const currentTags = prev[section] as string[];
      return {
        ...prev,
        [section]: [...currentTags, tag],
      };
    });
  };
  
  const handleRemoveTag = (section: keyof ProjectFormDataWithFile) => (tag: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const currentTags = prev[section] as string[];
      return {
        ...prev,
        [section]: currentTags.filter((t) => t !== tag),
      };
    });
  };
  
  const validateForm = () => {
    const errors: string[] = [];

    // Basic validation
    if (!formData.project_name?.trim()) {
      errors.push('Project name is required');
    }

    if (!formData.project_type?.trim()) {
      errors.push('Project type is required');
    }

    // Conditional validation based on project type
    if (showClientContractSections.includes(formData.project_type)) {
      if (!formData.client?.trim()) {
        errors.push(`${clientInfoLabelMap[formData.project_type] || 'Client'} name is required`);
      }
      
      if (!formData.contract_type?.trim()) {
        errors.push('Contract type is required');
      }
    }

    if (showBudgetSection.includes(formData.project_type)) {
      if (!formData.budget?.trim()) {
        errors.push(`${budgetLabelMap[formData.project_type] || 'Budget'} is required`);
      }
    }

    if (showSkillsExpertise.includes(formData.project_type)) {
      if (formData.skills_required.length === 0) {
        errors.push(`${skillsLabelMap[formData.project_type] || 'Skills'} are required`);
      }
    }

    // Portfolio validation
    if (showPortfolio.includes(formData.project_type)) {
      if (formData.deliverables.length === 0) {
        errors.push(`${deliverablesLabelMap[formData.project_type] || 'Deliverables'} are required`);
      }
      
      if (formData.milestones.length === 0) {
        errors.push(`${milestonesLabelMap[formData.project_type] || 'Milestones'} are required`);
      }
    }

    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate form data
      const errors = validateForm();
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }
      
      if (!formData) {
        throw new Error('No form data available');
      }

      // Log the form data before transformation
      console.log('Form data before transformation:', formData);
      
      const apiData = transformFormDataForApi(formData);
      
      // Log the data after transformation
      console.log('API data after transformation:', apiData);
      
      let result;
      if (projectId) {
        result = await updateProject(projectId, apiData, token);
      } else {
        result = await createProject(apiData, token);
      }
      
      setSuccess(true);
      
      // Add delay before redirect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (result?.id) {
        navigate(`/projects/${result.id}`);
      }
      
    } catch (err) {
      setError('Failed to save project');
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
    imageUploading,
    loadingError,
    uploadError,
    handleInputChange,
    handleImageSelect,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
  };
}

// Transform form data before sending to API
const transformFormDataForApi = (formData: ProjectFormDataWithFile) => {
  // Create a copy to avoid mutating the original
  const apiData = { ...formData };
  
  // Make sure project_status and preferred_collaboration_type are included
  apiData.project_status = formData.project_status || '';
  apiData.preferred_collaboration_type = formData.preferred_collaboration_type || '';
  
  // Handle file upload separately
  if (formData.project_image instanceof File) {
    apiData.project_image_file = formData.project_image;
    apiData.project_image = null;
  }
  
  // Explicitly flatten nested objects to individual fields
  if (formData.seeking) {
    apiData.seeking_creator = formData.seeking.creator;
    apiData.seeking_brand = formData.seeking.brand;
    apiData.seeking_freelancer = formData.seeking.freelancer;
    apiData.seeking_contractor = formData.seeking.contractor;
    delete apiData.seeking; // Remove the nested object
  }
  
  if (formData.social_links) {
    apiData.social_links_youtube = formData.social_links.youtube;
    apiData.social_links_instagram = formData.social_links.instagram;
    apiData.social_links_github = formData.social_links.github;
    apiData.social_links_twitter = formData.social_links.twitter;
    apiData.social_links_linkedin = formData.social_links.linkedin;
    delete apiData.social_links; // Remove the nested object
  }
  
  if (formData.notification_preferences) {
    apiData.notification_preferences_email = formData.notification_preferences.email;
    apiData.notification_preferences_push = formData.notification_preferences.push;
    apiData.notification_preferences_digest = formData.notification_preferences.digest;
    delete apiData.notification_preferences; // Remove the nested object
  }
  
  // Stringify array fields
  if (Array.isArray(apiData.team_members)) {
    apiData.team_members = JSON.stringify(apiData.team_members);
  }
  
  if (Array.isArray(apiData.collaborators)) {
    apiData.collaborators = JSON.stringify(apiData.collaborators);
  }
  
  if (Array.isArray(apiData.advisors)) {
    apiData.advisors = JSON.stringify(apiData.advisors);
  }
  
  if (Array.isArray(apiData.partners)) {
    apiData.partners = JSON.stringify(apiData.partners);
  }
  
  if (Array.isArray(apiData.testimonials)) {
    apiData.testimonials = JSON.stringify(apiData.testimonials);
  }
  
  if (Array.isArray(apiData.deliverables)) {
    apiData.deliverables = JSON.stringify(apiData.deliverables);
  }
  
  if (Array.isArray(apiData.milestones)) {
    apiData.milestones = JSON.stringify(apiData.milestones);
  }
  
  return apiData;
};

// Transform API data to form format
const transformApiDataToForm = (data: any): ProjectFormDataWithFile => {
  return {
    ...data,
    // Transform social links back to object
    social_links: {
      youtube: data.social_links_youtube || "",
      instagram: data.social_links_instagram || "",
      github: data.social_links_github || "",
      twitter: data.social_links_twitter || "",
      linkedin: data.social_links_linkedin || "",
    },
    
    // Transform seeking fields back to object
    seeking: {
      creator: data.seeking_creator || false,
      brand: data.seeking_brand || false,
      freelancer: data.seeking_freelancer || false,
      contractor: data.seeking_contractor || false,
    },
  };
}; 