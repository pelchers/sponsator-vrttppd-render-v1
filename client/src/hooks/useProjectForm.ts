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
import { API_URL } from '@/config';

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
  project_name: string;
  project_description: string;
  project_type: string;
  project_category: string;
  project_image_url: string;
  project_image_upload: string;
  project_image_display: 'url' | 'upload';
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
  project_image_url: '',
  project_image_upload: '',
  project_image_display: 'url',
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
    deliverables: [],
    milestones: [],
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
        
        console.log('Uploading project image for project:', projectId);
        const result = await uploadProjectImage(projectId, file, token);
        console.log('Upload result:', result);
        
        setFormData((prev) => ({
          ...prev,
          project_image: file,
          project_image_upload: result.path,
          project_image_url: '',
          project_image_display: 'upload'
        }));
      } else {
        // If no projectId (creating new project), just update the form state
        // The file will be uploaded when the project is created
        console.log('Storing image in form state for new project');
        setFormData((prev) => ({
          ...prev,
          project_image: file,
          project_image_display: 'upload'
        }));
      }
    } catch (err) {
      setUploadError('Failed to upload image');
      console.error('Error uploading image:', err);
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

    // Basic validation - always required
    if (!formData.project_name?.trim()) {
      errors.push('Project name is required');
    }

    // Only validate project type if creating a new project
    // For existing projects, we should allow updates without requiring all fields
    if (!projectId && !formData.project_type?.trim()) {
      errors.push('Project type is required');
    }

    // Skip advanced validation for basic updates or when creating a minimal project
    const isMinimalMode = true; // Set this to true to allow minimal project creation/updates

    if (!isMinimalMode) {
      // Conditional validation based on project type
      if (formData.project_type && showClientContractSections.includes(formData.project_type)) {
        if (!formData.client?.trim()) {
          errors.push(`${clientInfoLabelMap[formData.project_type] || 'Client'} name is required`);
        }
        
        if (!formData.contract_type?.trim()) {
          errors.push('Contract type is required');
        }
      }

      if (formData.project_type && showBudgetSection.includes(formData.project_type)) {
        if (!formData.budget?.trim()) {
          errors.push(`${budgetLabelMap[formData.project_type] || 'Budget'} is required`);
        }
      }

      if (formData.project_type && showSkillsExpertise.includes(formData.project_type)) {
        if (formData.skills_required.length === 0) {
          errors.push(`${skillsLabelMap[formData.project_type] || 'Skills'} are required`);
        }
      }

      // Portfolio validation
      if (formData.project_type && showPortfolio.includes(formData.project_type)) {
        if (formData.deliverables.length === 0) {
          errors.push(`${deliverablesLabelMap[formData.project_type] || 'Deliverables'} are required`);
        }
        
        if (formData.milestones.length === 0) {
          errors.push(`${milestonesLabelMap[formData.project_type] || 'Milestones'} are required`);
        }
      }
    }

    return errors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission triggered');
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate form data
      const errors = validateForm();
      if (errors.length > 0) {
        console.log('Validation errors:', errors);
        setError(errors.join(', '));
        setSaving(false);
        return;
      }
      
      console.log('Validation passed successfully');
      
      if (!formData) {
        throw new Error('No form data available');
      }

      // Log the form data before transformation
      console.log('Form data before transformation:', JSON.stringify(formData, null, 2));
      
      const apiData = transformFormDataForApi(formData);
      
      // Log the data after transformation
      console.log('API data after transformation:', JSON.stringify(apiData, null, 2));
      
      let result;
      console.log('Sending request to API...');
      console.log('Project ID:', projectId ? projectId : 'Creating new project');
      
      if (projectId) {
        console.log('Updating existing project');
        result = await updateProject(projectId, apiData, token);
      } else {
        console.log('Creating new project');
        result = await createProject(apiData, token);
      }
      
      console.log('API response:', result);
      
      setSuccess(true);
      console.log('Success state set to true');
      
      // Add delay before redirect
      console.log('Waiting before redirect...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (result?.id) {
        console.log('Redirecting to project page:', result.id);
        navigate(`/projects/${result.id}`);
      } else {
        console.log('No project ID in result, not redirecting');
      }
      
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
      console.log('Saving state set to false');
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
  const apiData: any = {};
  
  // Basic fields
  apiData.project_name = formData.project_name || '';
  apiData.project_description = formData.project_description || '';
  apiData.project_type = formData.project_type || '';
  apiData.project_category = formData.project_category || '';
  
  // Handle image fields properly
  apiData.project_image_display = formData.project_image_display || 'url';
  apiData.project_image_url = formData.project_image_display === 'url' 
    ? formData.project_image_url 
    : '';
  apiData.project_image_upload = formData.project_image_display === 'upload' 
    ? formData.project_image_upload 
    : '';

  // Include other basic fields
  apiData.project_title = formData.project_title || '';
  apiData.project_duration = formData.project_duration || '';
  apiData.client = formData.client || '';
  apiData.client_location = formData.client_location || '';
  apiData.client_website = formData.client_website || '';
  apiData.contract_type = formData.contract_type || '';
  apiData.contract_duration = formData.contract_duration || '';
  apiData.contract_value = formData.contract_value || '';
  apiData.project_timeline = formData.project_timeline || '';
  apiData.budget = formData.budget || '';
  apiData.project_status = formData.project_status || '';
  apiData.preferred_collaboration_type = formData.preferred_collaboration_type || '';
  apiData.budget_range = formData.budget_range || '';
  apiData.currency = formData.currency || 'USD';
  apiData.standard_rate = formData.standard_rate || '';
  apiData.rate_type = formData.rate_type || '';
  apiData.compensation_type = formData.compensation_type || '';
  
  // Handle array fields
  apiData.skills_required = formData.skills_required || [];
  apiData.expertise_needed = formData.expertise_needed || [];
  apiData.target_audience = formData.target_audience || [];
  apiData.solutions_offered = formData.solutions_offered || [];
  apiData.project_tags = formData.project_tags || [];
  apiData.industry_tags = formData.industry_tags || [];
  apiData.technology_tags = formData.technology_tags || [];
  apiData.website_links = formData.website_links || [];
  
  // Handle boolean fields
  apiData.search_visibility = formData.search_visibility === undefined ? true : formData.search_visibility;
  apiData.project_visibility = formData.project_visibility || 'public';
  
  // Handle text fields
  apiData.short_term_goals = formData.short_term_goals || '';
  apiData.long_term_goals = formData.long_term_goals || '';
  apiData.project_status_tag = formData.project_status_tag || '';
  
  // Explicitly flatten nested objects to individual fields
  if (formData.seeking) {
    apiData.seeking_creator = formData.seeking.creator || false;
    apiData.seeking_brand = formData.seeking.brand || false;
    apiData.seeking_freelancer = formData.seeking.freelancer || false;
    apiData.seeking_contractor = formData.seeking.contractor || false;
  }
  
  if (formData.social_links) {
    apiData.social_links_youtube = formData.social_links.youtube || '';
    apiData.social_links_instagram = formData.social_links.instagram || '';
    apiData.social_links_github = formData.social_links.github || '';
    apiData.social_links_twitter = formData.social_links.twitter || '';
    apiData.social_links_linkedin = formData.social_links.linkedin || '';
  }
  
  if (formData.notification_preferences) {
    apiData.notification_preferences_email = formData.notification_preferences.email || false;
    apiData.notification_preferences_push = formData.notification_preferences.push || false;
    apiData.notification_preferences_digest = formData.notification_preferences.digest || false;
  }
  
  // Stringify JSON fields
  apiData.team_members = JSON.stringify(formData.team_members || []);
  apiData.collaborators = JSON.stringify(formData.collaborators || []);
  apiData.advisors = JSON.stringify(formData.advisors || []);
  apiData.partners = JSON.stringify(formData.partners || []);
  apiData.testimonials = JSON.stringify(formData.testimonials || []);
  apiData.deliverables = JSON.stringify(formData.deliverables || []);
  apiData.milestones = JSON.stringify(formData.milestones || []);
  
  // Remove any fields that don't exist in the schema
  delete apiData.project_image;
  delete apiData.project_image_file;
  
  return apiData;
};

// Transform API data to form format
const transformApiDataToForm = (data: any): ProjectFormDataWithFile => {
  if (!data) {
    return defaultFormState;
  }

  console.log('Transforming API data to form:', data);

  return {
    ...defaultFormState, // Start with default values
    ...data, // Spread API data
    
    // Ensure image fields are properly set
    project_image_url: data.project_image_url || '',
    project_image_upload: data.project_image_upload || '',
    project_image_display: data.project_image_display || 'url',
    
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
    
    // Ensure notification preferences are properly set
    notification_preferences: {
      email: data.notification_preferences_email || false,
      push: data.notification_preferences_push || false,
      digest: data.notification_preferences_digest || false,
    },
    
    // Parse JSON fields if they're strings
    team_members: Array.isArray(data.team_members) 
      ? data.team_members 
      : (typeof data.team_members === 'string' 
          ? JSON.parse(data.team_members || '[]') 
          : []),
    collaborators: Array.isArray(data.collaborators) 
      ? data.collaborators 
      : (typeof data.collaborators === 'string' 
          ? JSON.parse(data.collaborators || '[]') 
          : []),
    advisors: Array.isArray(data.advisors) 
      ? data.advisors 
      : (typeof data.advisors === 'string' 
          ? JSON.parse(data.advisors || '[]') 
          : []),
    partners: Array.isArray(data.partners) 
      ? data.partners 
      : (typeof data.partners === 'string' 
          ? JSON.parse(data.partners || '[]') 
          : []),
    testimonials: Array.isArray(data.testimonials) 
      ? data.testimonials 
      : (typeof data.testimonials === 'string' 
          ? JSON.parse(data.testimonials || '[]') 
          : []),
    deliverables: Array.isArray(data.deliverables) 
      ? data.deliverables 
      : (typeof data.deliverables === 'string' 
          ? JSON.parse(data.deliverables || '[]') 
          : []),
    milestones: Array.isArray(data.milestones) 
      ? data.milestones 
      : (typeof data.milestones === 'string' 
          ? JSON.parse(data.milestones || '[]') 
          : []),
  };
}; 