import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectFormData } from '@/types/project';
import { fetchProject, createProject, updateProject, uploadProjectImage, uploadTeamMemberMedia, uploadCollaboratorMedia } from '@/api/projects';
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
} from '@/config/projectFormConfig';

interface ProjectFormMedia {
  file: File;
}

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  years: string;
  bio?: string;
  media?: ProjectFormMedia;
}

// Update the project_image type to handle both File and string
interface ProjectFormDataWithFile extends Omit<ProjectFormData, 'project_image'> {
  project_image: File | string | null;
  team_members: TeamMember[];
}

export function useProjectForm(projectId?: string) {
  const navigate = useNavigate();
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
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Add loading states for media uploads
  const [mediaUploading, setMediaUploading] = useState<Record<string, boolean>>({});
  
  // Load project data if editing
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);
  
  async function loadProject(id: string) {
    try {
      setLoading(true);
      setLoadingError(null);
      const token = localStorage.getItem('token');
      const projectData = await fetchProject(id, token || undefined);
      
      setFormData({
        ...projectData,
        project_image: projectData.project_image || null,
        team_members: projectData.team_members.map((member: any) => ({
          ...member,
          media: member.media ? { file: new File([], '') } : undefined
        })),
      });
    } catch (err) {
      setLoadingError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const handleNestedUpdate = (parent: string, child: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof ProjectFormDataWithFile] as Record<string, unknown>),
        [child]: value,
      },
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [parent, child] = name.includes('.') ? name.split('.') : [name, null];
      
      if (child) {
        handleNestedUpdate(parent, child, (e.target as HTMLInputElement).checked);
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
      handleNestedUpdate(parent, child, value);
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
      
      // Transform data before sending to API
      const apiData = transformFormDataForApi(formData);
      
      let result;
      if (projectId) {
        // Update existing project
        result = await updateProject(projectId, apiData, token);
        
        // Handle file uploads
        if (formData.project_image instanceof File) {
          await uploadProjectImage(projectId, formData.project_image, token);
        }

        // Upload media files for complex fields
        await Promise.all([
          ...formData.team_members.map(async (member, index) => {
            if (member.media?.file instanceof File) {
              await uploadTeamMemberMedia(projectId, index, member.media.file, token);
            }
          }),
          ...formData.collaborators.map(async (collab, index) => {
            if (collab.media?.file instanceof File) {
              await uploadCollaboratorMedia(projectId, index, collab.media.file, token);
            }
          }),
          // Similar for other media fields
        ]);

      } else {
        // Create new project
        result = await createProject(apiData, token);
        
        // Handle file uploads for new project
        if (result?.id) {
          if (formData.project_image instanceof File) {
            await uploadProjectImage(result.id, formData.project_image, token);
          }

          // Upload media files for complex fields
          await Promise.all([
            ...formData.team_members.map(async (member, index) => {
              if (member.media?.file instanceof File) {
                await uploadTeamMemberMedia(result.id, index, member.media.file, token);
              }
            }),
            // Similar for other media fields
          ]);
        }
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
  
  // Update media handling function
  const handleMediaSelect = (
    section: 'team_members' | 'collaborators' | 'advisors' | 'partners' | 'testimonials',
    index: number
  ) => async (file: File) => {
    try {
      setMediaUploading({ ...mediaUploading, [`${section}-${index}`]: true });
      
      // Update form state immediately with file
      setFormData(prev => {
        const items = [...prev[section]];
        items[index] = {
          ...items[index],
          media: { file }
        };
        return {
          ...prev,
          [section]: items
        };
      });
      
    } catch (error) {
      console.error(`Error handling ${section} media:`, error);
    } finally {
      setMediaUploading({ ...mediaUploading, [`${section}-${index}`]: false });
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
    handleMediaSelect,
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