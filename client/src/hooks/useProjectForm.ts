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

export function useProjectForm(projectId?: string) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProjectFormDataWithFile>({
    // Basic Information
    project_image: null,
    project_name: "",
    project_description: "",
    project_type: "",
    project_category: "",
    project_title: "",
    project_duration: "",
    project_handle: "",
    project_followers: 0,

    // Client & Contract Info
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

    // Tags & Categories
    skills_required: [],
    expertise_needed: [],
    target_audience: [],
    solutions_offered: [],
    project_tags: [],
    industry_tags: [],
    technology_tags: [],
    project_status_tag: "",

    // Seeking flags
    seeking: {
      creator: false,
      brand: false,
      freelancer: false,
      contractor: false,
    },

    // Social & Website Links
    social_links: {
      youtube: "",
      instagram: "",
      github: "",
      twitter: "",
      linkedin: "",
    },
    website_links: [],

    // Complex JSON fields
    deliverables: [],
    milestones: [],
    team_members: [],
    collaborators: [],
    advisors: [],
    partners: [],
    testimonials: [],

    // Goals
    short_term_goals: "",
    long_term_goals: "",

    // Privacy & Notifications
    project_visibility: "public",
    search_visibility: true,
    notification_preferences: {
      email: true,
      push: true,
      digest: true,
    },
  });
  
  // Load project data if editing
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);
  
  const loadProject = async (id: string) => {
    try {
      setLoading(true);
      setLoadingError(null);
      const token = localStorage.getItem('token');
      const projectData = await fetchProject(id, token || undefined);
      
      // Transform API data to form format
      const transformedData = transformApiDataToForm(projectData);
      setFormData(transformedData);
    } catch (err) {
      setLoadingError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.includes('.') ? name.split('.') : [name, null];
      
      if (child) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof ProjectFormDataWithFile] as Record<string, unknown>),
            [child]: (e.target as HTMLInputElement).checked,
          },
        }));
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
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
  
  const handleAddTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as string[]), tag],
    }));
  };
  
  const handleRemoveTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] as string[]).filter((t) => t !== tag),
    }));
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
      
      // Transform form data before sending to API
      const transformedData = transformFormDataForApi(formData);
      
      let result;
      if (projectId) {
        result = await updateProject(projectId, transformedData, token);
      } else {
        result = await createProject(transformedData, token);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/projects/${result.id}`);
      }, 1500);
      
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
const transformFormDataForApi = (data: ProjectFormDataWithFile) => {
  return {
    ...data,
    // Transform social links
    social_links_youtube: data.social_links.youtube,
    social_links_instagram: data.social_links.instagram,
    social_links_github: data.social_links.github,
    social_links_twitter: data.social_links.twitter,
    social_links_linkedin: data.social_links.linkedin,
    
    // Transform seeking fields
    seeking_creator: data.seeking.creator,
    seeking_brand: data.seeking.brand,
    seeking_freelancer: data.seeking.freelancer,
    seeking_contractor: data.seeking.contractor,

    // Remove the original fields that were transformed
    social_links: undefined,
    seeking: undefined,
  };
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