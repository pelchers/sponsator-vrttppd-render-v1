"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import PageSection from "@/components/sections/PageSection"
import CategorySection from "@/components/sections/CategorySection"
import TagInput from "@/components/input/forms/TagInput"
import ImageUpload from "@/components/input/forms/ImageUpload"
import { Button } from "@/components/ui/button"
import { useProjectForm, ProjectFormDataWithFile } from "@/hooks/useProjectForm"
import "@/components/input/forms/ProjectEditFormV3.css"
import { 
  projectTypeFields,
  clientInfoLabelMap,
  contractInfoLabelMap,
  industryTagsLabelMap,
  technologyTagsLabelMap,
  deliverablesLabelMap,
  milestonesLabelMap,
  showClientContractSections,
  showBudgetSection,
  showSkillsExpertise,
  showIndustryTechnologyTags,
  showPortfolio,
  SEEKING_OPTIONS,
  contractTypeMap,
  defaultContractTypeOptions
} from '@/components/input/forms/config/projectFormConfig'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { v4 as uuidv4 } from 'uuid'
import ProjectImageUpload from './ProjectImageUpload'
import { API_URL } from '@/config'

interface ProjectEditFormProps {
  projectId?: string;
}

// Add type guard for formData
const isFormDataValid = (formData: ProjectFormDataWithFile | null): formData is ProjectFormDataWithFile => {
  return formData !== null;
};

// Add these type definitions at the top of the file
interface TeamMember {
  id: string;
  name: string;
  role: string;
  years?: string;
  bio?: string;
  media?: any;
}

interface Collaborator {
  id: string;
  name: string;
  company: string;
  role: string;
  contribution: string;
  media?: any;
}

interface Advisor {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  year: string;
  media?: any;
}

interface Partner {
  id: string;
  name: string;
  organization: string;
  contribution: string;
  year: string;
  media?: any;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  position: string;
  company: string;
  text: string;
  media?: any;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  media?: any;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  media?: any;
}

export default function ProjectEditFormV3({ projectId }: ProjectEditFormProps) {
  return (
    <ErrorBoundary>
      <ProjectEditFormContent projectId={projectId} />
    </ErrorBoundary>
  );
}

function ProjectEditFormContent({ projectId }: ProjectEditFormProps) {
  const {
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
  } = useProjectForm(projectId);

  // Show loading state while initializing
  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // 1) FORM DATA (unchanged structure, but note on new dynamic usage below)
  // -----------------------------------------------------------------------
  /**
   * NOTE: Although we keep the same fields (e.g., `industry_tags` or `deliverables`),
   * we may label them differently in the UI based on `project_type`.
   * For example, "industry_tags" might be labeled "Music Genre" for a creative_work,
   * or "Brand Category" for brand_work, but the underlying formData key is still
   * `industry_tags`.
   */

  // -----------------------------------------------------------------------
  // 2) MAPS FOR CONDITIONAL LABELS / OPTIONS
  // -----------------------------------------------------------------------

  // For "Client Info" label or heading
  const clientInfoLabelMap: Record<string, string> = {
    brand_work: "Brand / Sponsor Info",
    brand_deal: "Brand / Sponsor Info",
    brand_partnership: "Brand / Sponsor Info",
    freelance_services: "Client / Hiring Manager",
    contractor_services: "Client / Hiring Manager",
    contractor_products_supply: "Client / Purchasing Company",
    contractor_management_services: "Management Contract Info",
  }

  // For "Contract Info" label or heading
  const contractInfoLabelMap: Record<string, string> = {
    brand_work: "Campaign / Contract Info",
    brand_deal: "Brand Deal Contract",
    brand_partnership: "Brand Partnership Contract",
    freelance_services: "Freelance Contract Info",
    contractor_services: "Contractor Services Contract",
    contractor_products_supply: "Supply Contract Details",
    contractor_management_services: "Management Contract Details",
  }

  // For "industry_tags" label:
  const industryTagsLabelMap: Record<string, string> = {
    creative_work: "Creative / Genre Tags",
    creative_partnership: "Creative / Genre Tags",
    brand_work: "Brand / Product Tags",
    brand_deal: "Brand / Product Tags",
    brand_partnership: "Brand / Product Tags",
    freelance_services: "Industry / Service Tags",
    contractor_services: "Industry / Service Tags",
    contractor_products_supply: "Supply / Industry Tags",
    contractor_management_services: "Management / Industry Tags",
  }

  // For "technology_tags" label:
  const technologyTagsLabelMap: Record<string, string> = {
    creative_work: "Tools / Software Tags",
    brand_work: "Platform / Tech Stack",
    brand_deal: "Platform / Tech Stack",
    // etc. fallback => "Technology Tags"
  }

  // For "Deliverables" section heading
  const deliverablesLabelMap: Record<string, string> = {
    brand_work: "Campaign Deliverables",
    brand_partnership: "Campaign Deliverables",
    brand_deal: "Deliverables / Sponsorship Items",
    freelance_services: "Deliverables / Work Items",
    contractor_services: "Service Deliverables",
    contractor_products_supply: "Product Supply Deliverables",
    contractor_management_services: "Management Deliverables",
  }

  // For "Milestones" section heading
  const milestonesLabelMap: Record<string, string> = {
    brand_work: "Campaign Milestones",
    brand_partnership: "Campaign Milestones",
    brand_deal: "Sponsorship Milestones",
    freelance_services: "Project Milestones",
    contractor_services: "Service Milestones",
    contractor_products_supply: "Fulfillment Milestones",
    contractor_management_services: "Management Milestones",
  }

  // For "Contract Type" or "Preferred Collaboration Type", etc., we can do a 
  // specialized set of arrays for each project_type. Then we can display them 
  // accordingly.
  const contractTypeMap: Record<string, string[]> = {
    brand_work: ["Fixed-Fee Campaign", "Ongoing Retainer", "One-Time Activation"],
    brand_deal: ["Sponsorship Deal", "Flat Fee", "Performance-based"],
    brand_partnership: ["Royalty-based", "Equity-based", "Revenue Share"],
    freelance_services: ["Hourly", "Fixed Project", "Retainer", "Milestone-based"],
    contractor_services: ["Hourly", "Fixed Project", "Retainer"],
    contractor_products_supply: ["Purchase Order", "Supply Contract", "Distribution Contract"],
    contractor_management_services: ["Management Retainer", "Performance-based", "Consulting Agreement"],
  }

  // Fallback arrays
  const defaultContractTypeOptions = [
    "Hourly",
    "Fixed Project",
    "Retainer",
    "Milestone-based",
    "Undefined Contract"
  ]

  // -----------------------------------------------------------------------
  // 3) ARRAYS FOR SHOW/HIDE ENTIRE SECTIONS
  // -----------------------------------------------------------------------
  const showClientContractSections = [
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
    "contractor_products_supply",
    "contractor_management_services",
  ]
  const showAvailabilityBudgetSections = [
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
    "contractor_products_supply",
    "contractor_management_services",
  ]
  const showSkillsExpertise = [
    "creative_work",
    "creative_partnership",
    "collaborative_work",
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
  ]
  const showIndustryTechnologyTags = [
    "creative_work",
    "creative_partnership",
    "collaborative_work",
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
    "contractor_products_supply",
    "contractor_management_services",
  ]
  const showPortfolio = [
    "creative_work",
    "creative_partnership",
    "collaborative_work",
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
    "contractor_products_supply",
    "contractor_management_services",
  ]

  // For "Skills Required" label
  const skillsLabelMap: Record<string, string> = {
    creative_work: "Creative Skills",
    creative_partnership: "Creative Skills",
    brand_work: "Marketing Skills",
    brand_deal: "Brand Management Skills",
    brand_partnership: "Partnership Skills",
    freelance_services: "Service Skills",
    contractor_services: "Technical Skills",
  };

  // For "Budget" section
  const budgetLabelMap: Record<string, string> = {
    brand_work: "Campaign Budget",
    brand_deal: "Sponsorship Budget",
    brand_partnership: "Partnership Budget",
    freelance_services: "Project Budget",
    contractor_services: "Service Budget",
  };

  const showBudgetSection = [
    "brand_work",
    "brand_deal",
    "brand_partnership",
    "freelance_services",
    "contractor_services",
  ];

  // -----------------------------------------------------------------------
  // 4) HANDLERS
  // -----------------------------------------------------------------------

  // Existing conditional fields for *Project Category* within "Project Information" 
  const renderConditionalFields = () => {
    switch (formData.project_type) {
      case "creative_work":
      case "creative_partnership":
        return (
          <>
            <div>
              <label htmlFor="project_category" className="block text-sm font-medium text-gray-700">
                {projectTypeFields[formData.project_type].category_label}
              </label>
              <input
                type="text"
                id="project_category"
                name="project_category"
                value={formData.project_category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder={projectTypeFields[formData.project_type].category_placeholder}
              />
            </div>
            {/* We can add more specific fields here once you share the image references */}
          </>
        );

      case "brand_work":
      case "brand_deal":
      case "brand_partnership":
        return (
            <div>
            <label htmlFor="project_category" className="block text-sm font-medium text-gray-700">
                Campaign Type
              </label>
              <input
                type="text"
                id="project_category"
                name="project_category"
                value={formData.project_category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="e.g., Product Launch, Brand Awareness, Influencer Collaboration"
              />
            </div>
        );

      case "freelance_services":
      case "contractor_services":
      case "contractor_products_supply":
      case "contractor_management_services":
        return (
            <div>
              <label
                htmlFor="project_category"
                className="block text-sm font-medium text-gray-700"
              >
                Service Category
              </label>
              <input
                type="text"
                id="project_category"
                name="project_category"
                value={formData.project_category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="e.g., Web Development, Graphic Design, Marketing"
              />
            </div>
        );

      default:
        return null;
    }
  }

  // Add these handler functions inside the component
  const handleAddWebsiteLink = () => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      website_links: [...prevData.website_links, '']
    }));
  };

  const handleUpdateWebsiteLink = (index: number, value: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      website_links: prevData.website_links.map((link, i) => 
        i === index ? value : link
      )
    }));
  };

  const handleRemoveWebsiteLink = (index: number) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      website_links: prevData.website_links.filter((_, i) => i !== index)
    }));
  };

  const handleAddTeamMember = () => {
    const newTeamMember = {
      id: uuidv4(),
      name: '',
      role: '',
      years: '',
      bio: ''
    };
    
    // Ensure team_members is an array before adding to it
    const currentTeamMembers = Array.isArray(formData.team_members) 
      ? formData.team_members 
      : (typeof formData.team_members === 'string' 
          ? JSON.parse(formData.team_members || '[]') 
          : []);
    
    setFormData((prev) => ({
      ...prev,
      team_members: [...currentTeamMembers, newTeamMember]
    }));
  };

  const handleUpdateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    // Ensure team_members is an array before updating
    const currentTeamMembers = Array.isArray(formData.team_members) 
      ? formData.team_members 
      : (typeof formData.team_members === 'string' 
          ? JSON.parse(formData.team_members || '[]') 
          : []);
    
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      team_members: currentTeamMembers.map((member: any) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleRemoveTeamMember = (id: string) => {
    // Ensure team_members is an array before filtering
    const currentTeamMembers = Array.isArray(formData.team_members) 
      ? formData.team_members 
      : (typeof formData.team_members === 'string' 
          ? JSON.parse(formData.team_members || '[]') 
          : []);
    
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      team_members: currentTeamMembers.filter((member: any) => member.id !== id)
    }));
  };

  const handleAddCollaborator = () => {
    const newCollaborator: Collaborator = {
      id: crypto.randomUUID(),
      name: '',
      company: '',
      role: '',
      contribution: ''
    };
    setFormData((prev) => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollaborator]
    }));
  };

  const handleUpdateCollaborator = (id: string, field: keyof Collaborator, value: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      collaborators: prevData.collaborators.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleRemoveCollaborator = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      collaborators: prevData.collaborators.filter(member => member.id !== id)
    }));
  };

  const handleAddAdvisor = () => {
    const newAdvisor: Advisor = {
      id: crypto.randomUUID(),
      name: '',
      expertise: '',
      bio: '',
      year: ''
    };
    setFormData((prev) => ({
      ...prev,
      advisors: [...prev.advisors, newAdvisor]
    }));
  };

  const handleUpdateAdvisor = (id: string, field: keyof Advisor, value: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      advisors: prevData.advisors.map((advisor: Advisor) =>
        advisor.id === id ? { ...advisor, [field]: value } : advisor
      )
    }));
  };

  const handleRemoveAdvisor = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      advisors: prevData.advisors.filter((advisor: Advisor) => advisor.id !== id)
    }));
  };

  const handleAddPartner = () => {
    const newPartner: Partner = {
      id: crypto.randomUUID(),
      name: '',
      organization: '',
      contribution: '',
      year: ''
    };
    setFormData((prev) => ({
      ...prev,
      partners: [...prev.partners, newPartner]
    }));
  };

  const handleUpdatePartner = (id: string, field: keyof Partner, value: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      partners: prevData.partners.map((partner: Partner) =>
        partner.id === id ? { ...partner, [field]: value } : partner
      )
    }));
  };

  const handleRemovePartner = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      partners: prevData.partners.filter((partner: Partner) => partner.id !== id)
    }));
  };

  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: crypto.randomUUID(),
      name: '',
      role: '',
      organization: '',
      position: '',
      company: '',
      text: ''
    };
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }));
  };

  const handleUpdateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      testimonials: prevData.testimonials.map((testimonial: Testimonial) =>
        testimonial.id === id ? { ...testimonial, [field]: value } : testimonial
      )
    }));
  };

  const handleRemoveTestimonial = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      testimonials: prevData.testimonials.filter((testimonial: Testimonial) => testimonial.id !== id)
    }));
  };

  // Add handlers for deliverables and milestones
  const handleAddDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      due_date: '',
      status: 'pending'
    };
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      deliverables: [...prevData.deliverables, newDeliverable]
    }));
  };

  const handleUpdateDeliverable = (id: string, field: keyof Deliverable, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((deliverable) =>
        deliverable.id === id ? { ...deliverable, [field]: value } : deliverable
      )
    }));
  };

  const handleRemoveDeliverable = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      deliverables: prevData.deliverables.filter((deliverable: Deliverable) => deliverable.id !== id)
    }));
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      date: ''
    };
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      milestones: [...prevData.milestones, newMilestone]
    }));
  };

  const handleUpdateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      )
    }));
  };

  const handleRemoveMilestone = (id: string) => {
    setFormData((prevData: ProjectFormDataWithFile) => ({
      ...prevData,
      milestones: prevData.milestones.filter((milestone: Milestone) => milestone.id !== id)
    }));
  };

  // -----------------------------------------------------------------------
  // 5) RENDER
  // -----------------------------------------------------------------------

  // Add loading indicator to media upload buttons
  const MediaUploadButton = ({ 
    section, 
    index, 
    onSelect, 
    isUploading 
  }: { 
    section: string; 
    index: number; 
    onSelect: (file: File) => void;
    isUploading: boolean;
  }) => (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
        className="hidden"
        id={`${section}-${index}-media`}
        disabled={isUploading}
      />
      <label
        htmlFor={`${section}-${index}-media`}
        className={`cursor-pointer inline-flex items-center px-4 py-2 ${
          isUploading ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'
        } text-gray-700 rounded-md`}
      >
        {isUploading ? 'Uploading...' : 'Upload Media'}
      </label>
              </div>
  );

  // Add SOCIAL_PLATFORMS constant at the top
  const SOCIAL_PLATFORMS = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    github: 'GitHub',
    twitter: 'Twitter',
    linkedin: 'LinkedIn'
  } as const;

  // Update handleNestedChange to handle social links
  const handleNestedChange = (parent: string, child: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  // Add this helper function at the top of the component
  const safelyParseArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn('Error parsing JSON string:', error);
        return [];
      }
    }
    return [];
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Error/Success Messages */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {error && (
              <div className="error-message">{error}</div>
            )}
            {success && (
              <div className="success-message">Project updated successfully!</div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            <div className="space-y-6 w-full">
              {/* Image section container */}
              <div className="flex flex-col items-center space-y-4">
                {/* Image Toggle Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className={`
                      relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                      transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                      ${
                        formData.project_image_display === "url" 
                          ? 'bg-spring text-black' 
                          : 'bg-white text-black'
                      }`}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      project_image_display: "url",
                      project_image_upload: "" 
                    }))}
                  >
                    Use URL Image
                  </button>
                  <button
                    type="button"
                    className={`
                      relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                      transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                      ${
                        formData.project_image_display === "upload" 
                          ? 'bg-spring text-black' 
                          : 'bg-white text-black'
                      }`}
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      project_image_display: "upload",
                      project_image_url: "" 
                    }))}
                  >
                    Use Uploaded Image
                  </button>
                </div>

                {/* URL Input or Upload Component */}
                {formData.project_image_display === "url" ? (
                  <div className="w-full max-w-md">
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="project_image_url"
                      value={formData.project_image_url || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        project_image_url: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                ) : (
                  <ProjectImageUpload 
                    onImageSelect={handleImageSelect}
                    currentImage={
                      formData.project_image_upload 
                        ? `${API_URL.replace("/api", "")}/uploads/${formData.project_image_upload}`
                        : undefined
                    }
                    showPreview={true}
                  />
                )}

                {/* Image Preview for URL mode */}
                {formData.project_image_display === "url" && formData.project_image_url && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={formData.project_image_url}
                      alt="Project preview"
                      className="w-64 h-48 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  id="project_name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                  <label htmlFor="project_description" className="block text-sm font-medium text-gray-700">
                  Project Description
                </label>
                <textarea
                  id="project_description"
                  name="project_description"
                  value={formData.project_description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                ></textarea>
              </div>

              <div>
                <label htmlFor="project_type" className="block text-sm font-medium text-gray-700">
                  Project Type
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select project type...</option>
                  <option value="creative_work">Creative Work</option>
                  <option value="creative_partnership">Creative Partnership</option>
                  <option value="brand_work">Brand Work</option>
                  <option value="brand_deal">Brand Deal</option>
                  <option value="brand_partnership">Brand Partnership</option>
                  <option value="freelance_services">Freelance Services</option>
                  <option value="contractor_services">Contractor Services</option>
                  <option value="contractor_products_supply">Contractor Products/Supply</option>
                  <option value="contractor_management_services">Contractor Management Services</option>
                  <option value="collaborative_work">Collaborative Work</option>
                  <option value="simple_connection">Simple Connection</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Project Details</h2>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Project Information">
                <div className="space-y-4 w-full">
                  <div>
                    <label htmlFor="project_title" className="block text-sm font-medium text-gray-700">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="project_title"
                      name="project_title"
                      value={formData.project_title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="project_timeline" className="block text-sm font-medium text-gray-700">
                      Project Timeline
                    </label>
                    <input
                      type="text"
                      id="project_timeline"
                      name="project_timeline"
                      value={formData.project_timeline}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="e.g., 3 months, Ongoing, etc."
                    />
                  </div>
                  {renderConditionalFields()}
                </div>
              </CategorySection>
              <CategorySection title="Target Audience">
                <div className="space-y-4 w-full">
                  <TagInput
                    label="Target Audience"
                    tags={formData?.target_audience ?? []}
                    onAddTag={handleAddTag("target_audience")}
                    onRemoveTag={handleRemoveTag("target_audience")}
                    placeholder="Add target audience..."
                  />
                </div>
              </CategorySection>
            </div>
          </div>

          {/* Availability & Project Preferences + Budget (Both Conditional) */}
          {showAvailabilityBudgetSections.includes(formData.project_type) && (
            <PageSection title="Availability & Project Preferences">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Availability">
                  <div className="space-y-4 w-full">
                    <div>
                      <label htmlFor="project_status" className="block text-sm font-medium text-gray-700">
                        Project Status
                      </label>
                      <select
                        id="project_status"
                        name="project_status"
                        value={formData.project_status}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select status...</option>
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="seeking_collaborators">Seeking Collaborators</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="preferred_collaboration_type" className="block text-sm font-medium text-gray-700">
                        Preferred Collaboration Type
                      </label>
                      <select
                        id="preferred_collaboration_type"
                        name="preferred_collaboration_type"
                        value={formData.preferred_collaboration_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select collaboration type...</option>
                        <option value="remote">Remote</option>
                        <option value="on_site">On-site</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title="Budget">
                  <div className="space-y-4 w-full">
                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                        Budget
                      </label>
                      <input
                        type="text"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="e.g., $5,000-$10,000, Negotiable, etc."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700">
                        Budget Range
                      </label>
                      <input
                        type="text"
                        id="budget_range"
                        name="budget_range"
                        value={formData.budget_range}
                        onChange={handleInputChange}
                        placeholder="e.g. $5,000-$10,000"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="standard_rate" className="block text-sm font-medium text-gray-700">
                        Standard Rate
                      </label>
                      <input
                        type="text"
                        id="standard_rate"
                        name="standard_rate"
                        value={formData.standard_rate}
                        onChange={handleInputChange}
                        placeholder="e.g. $100/hour"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="rate_type" className="block text-sm font-medium text-gray-700">
                        Rate Type
                      </label>
                      <select
                        id="rate_type"
                        name="rate_type"
                        value={formData.rate_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select rate type...</option>
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="compensation_type" className="block text-sm font-medium text-gray-700">
                        Compensation Type
                      </label>
                      <select
                        id="compensation_type"
                        name="compensation_type"
                        value={formData.compensation_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select compensation type...</option>
                        <option value="monetary">Monetary</option>
                        <option value="equity">Equity</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                  </div>
                </CategorySection>
              </div>
            </PageSection>
          )}

          {/* Skills & Expertise (Conditional) */}
          {showSkillsExpertise.includes(formData.project_type) && (
            <PageSection title="Skills & Expertise">
              <div className="space-y-6">
                <CategorySection title="Skills Required">
                  <TagInput
                    label="Skills"
                    tags={formData.skills_required}
                    onAddTag={handleAddTag("skills_required")}
                    onRemoveTag={handleRemoveTag("skills_required")}
                    placeholder="Add a required skill..."
                  />
                </CategorySection>
                <CategorySection title="Expertise Needed">
                  <div className="space-y-4 w-full">
                    <TagInput
                      label="Expertise"
                      tags={formData.expertise_needed}
                      onAddTag={handleAddTag("expertise_needed")}
                      onRemoveTag={handleRemoveTag("expertise_needed")}
                      placeholder="Add an area of expertise..."
                    />
                  </div>
                </CategorySection>
              </div>
            </PageSection>
          )}

          {/* Focus (left as-is) */}
          <PageSection title="Focus">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Target Audience">
                <TagInput
                  label="Target Audience"
                  tags={formData?.target_audience ?? []}
                  onAddTag={handleAddTag("target_audience")}
                  onRemoveTag={handleRemoveTag("target_audience")}
                  placeholder="Add target audience..."
                />
              </CategorySection>
              <CategorySection title="Solutions Offered">
                <TagInput
                  label="Solutions Offered"
                  tags={formData.solutions_offered}
                  onAddTag={handleAddTag("solutions_offered")}
                  onRemoveTag={handleRemoveTag("solutions_offered")}
                  placeholder="Add a solution..."
                />
              </CategorySection>
            </div>
          </PageSection>

          {/* Tags & Categories (Conditional for Industry & Tech) */}
          {showIndustryTechnologyTags.includes(formData.project_type) && (
            <PageSection title="Tags & Categories">
              <div className="space-y-6">
                <CategorySection title="Project Tags">
                  <TagInput
                    label="Project Tags"
                    tags={formData.project_tags}
                    onAddTag={handleAddTag("project_tags")}
                    onRemoveTag={handleRemoveTag("project_tags")}
                    placeholder="Add a project tag..."
                  />
                </CategorySection>
                <CategorySection title={industryTagsLabelMap[formData.project_type] || "Industry Tags"}>
                  <TagInput
                    label={industryTagsLabelMap[formData.project_type] || "Industry Tags"}
                    tags={formData.industry_tags}
                    onAddTag={handleAddTag("industry_tags")}
                    onRemoveTag={handleRemoveTag("industry_tags")}
                    placeholder="Add an industry tag..."
                  />
                </CategorySection>
                <CategorySection title={technologyTagsLabelMap[formData.project_type] || "Technology Tags"}>
                  <TagInput
                    label={technologyTagsLabelMap[formData.project_type] || "Technology Tags"}
                    tags={formData.technology_tags}
                    onAddTag={handleAddTag("technology_tags")}
                    onRemoveTag={handleRemoveTag("technology_tags")}
                    placeholder="Add a technology tag..."
                  />
                </CategorySection>
              </div>
            </PageSection>
          )}

          {/* Status */}
          <PageSection title="Status">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Project Status">
                <div className="w-full">
                  <select
                    id="project_status_tag"
                    name="project_status_tag"
                    value={formData.project_status_tag}
                    aria-label="Project Status"
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">Select project status...</option>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </CategorySection>

              <CategorySection title="Seeking">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Seeking</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seeking_creator"
                        name="seeking_creator"
                        checked={formData.seeking?.creator || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            seeking: {
                              ...prev.seeking,
                              creator: e.target.checked
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="seeking_creator" className="ml-2">Creator</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seeking_brand"
                        name="seeking_brand"
                        checked={formData.seeking?.brand || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            seeking: {
                              ...prev.seeking,
                              brand: e.target.checked
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="seeking_brand" className="ml-2">Brand</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seeking_freelancer"
                        name="seeking_freelancer"
                        checked={formData.seeking?.freelancer || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            seeking: {
                              ...prev.seeking,
                              freelancer: e.target.checked
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="seeking_freelancer" className="ml-2">Freelancer</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="seeking_contractor"
                        name="seeking_contractor"
                        checked={formData.seeking?.contractor || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            seeking: {
                              ...prev.seeking,
                              contractor: e.target.checked
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <label htmlFor="seeking_contractor" className="ml-2">Contractor</label>
                    </div>
                  </div>
                </div>
              </CategorySection>
            </div>
          </PageSection>

          {/* Contact & Availability (Unchanged) */}
          <PageSection title="Contact & Availability">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Social Links">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Social Links</h3>
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="social_links_youtube">YouTube</label>
                      <input
                        type="text"
                        id="social_links_youtube"
                        value={formData.social_links?.youtube || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            social_links: {
                              ...prev.social_links,
                              youtube: e.target.value
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_links_instagram">Instagram</label>
                      <input
                        type="text"
                        id="social_links_instagram"
                        value={formData.social_links?.instagram || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            social_links: {
                              ...prev.social_links,
                              instagram: e.target.value
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_links_github">GitHub</label>
                      <input
                        type="text"
                        id="social_links_github"
                        value={formData.social_links?.github || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            social_links: {
                              ...prev.social_links,
                              github: e.target.value
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_links_twitter">Twitter</label>
                      <input
                        type="text"
                        id="social_links_twitter"
                        value={formData.social_links?.twitter || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            social_links: {
                              ...prev.social_links,
                              twitter: e.target.value
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="social_links_linkedin">LinkedIn</label>
                      <input
                        type="text"
                        id="social_links_linkedin"
                        value={formData.social_links?.linkedin || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            social_links: {
                              ...prev.social_links,
                              linkedin: e.target.value
                            }
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </CategorySection>
              <CategorySection title="Website Links">
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        website_links: [...prev.website_links, ""],
                      }))
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Website Link
                  </button>
                  {safelyParseArray(formData.website_links).map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => {
                          const newLinks = [...safelyParseArray(formData.website_links)]
                          newLinks[index] = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            website_links: newLinks,
                          }))
                        }}
                        placeholder="Enter website URL"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            website_links: safelyParseArray(prev.website_links).filter((_, i) => i !== index),
                          }))
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
          </PageSection>

          {/* Team & Collaborators (unchanged) */}
          <PageSection title="Team & Collaborators">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Team Members">
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        team_members: [...safelyParseArray(prev.team_members), { name: "", role: "", years: "", media: undefined }],
                      }))
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Team Member
                  </button>
                  {safelyParseArray(formData.team_members).map((member, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const newMembers = [...safelyParseArray(formData.team_members)]
                          newMembers[index] = { ...newMembers[index], name: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            team_members: newMembers,
                          }))
                        }}
                        placeholder="Name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => {
                          const newMembers = [...safelyParseArray(formData.team_members)]
                          newMembers[index] = { ...newMembers[index], role: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            team_members: newMembers,
                          }))
                        }}
                        placeholder="Role"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="text"
                        value={member.years}
                        onChange={(e) => {
                          const newMembers = [...safelyParseArray(formData.team_members)]
                          newMembers[index] = { ...newMembers[index], years: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            team_members: newMembers,
                          }))
                        }}
                        placeholder="Years"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <MediaUploadButton
                        section="team_members"
                        index={index}
                        onSelect={(file) => {
                          const newMembers = [...safelyParseArray(formData.team_members)]
                          newMembers[index] = { ...newMembers[index], media: file }
                          setFormData((prev) => ({
                            ...prev,
                            team_members: newMembers,
                          }))
                        }}
                        isUploading={imageUploading}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            team_members: safelyParseArray(prev.team_members).filter((_, i) => i !== index),
                          }))
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
              <CategorySection title="Collaborators">
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        collaborators: [...safelyParseArray(prev.collaborators), { name: "", company: "", role: "", media: undefined }],
                      }))
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Collaborator
                  </button>
                  {safelyParseArray(formData.collaborators).map((collaborator, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                      <input
                        type="text"
                        value={collaborator.name}
                        onChange={(e) => {
                          const newCollaborators = [...safelyParseArray(formData.collaborators)]
                          newCollaborators[index] = { ...newCollaborators[index], name: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            collaborators: newCollaborators,
                          }))
                        }}
                        placeholder="Name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="text"
                        value={collaborator.company}
                        onChange={(e) => {
                          const newCollaborators = [...safelyParseArray(formData.collaborators)]
                          newCollaborators[index] = { ...newCollaborators[index], company: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            collaborators: newCollaborators,
                          }))
                        }}
                        placeholder="Company"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="text"
                        value={collaborator.role}
                        onChange={(e) => {
                          const newCollaborators = [...safelyParseArray(formData.collaborators)]
                          newCollaborators[index] = { ...newCollaborators[index], role: e.target.value }
                          setFormData((prev) => ({
                            ...prev,
                            collaborators: newCollaborators,
                          }))
                        }}
                        placeholder="Role"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <MediaUploadButton
                        section="collaborators"
                        index={index}
                        onSelect={(file) => {
                          const newCollaborators = [...safelyParseArray(formData.collaborators)]
                          newCollaborators[index] = { ...newCollaborators[index], media: file }
                          setFormData((prev) => ({
                            ...prev,
                            collaborators: newCollaborators,
                          }))
                        }}
                        isUploading={imageUploading}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            collaborators: safelyParseArray(prev.collaborators).filter((_, i) => i !== index),
                          }))
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
            <CategorySection title="Advisors">
              <div className="space-y-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      advisors: [...safelyParseArray(prev.advisors), { name: "", expertise: "", bio: "", year: "", media: undefined }],
                    }))
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add Advisor
                </button>
                {safelyParseArray(formData.advisors).map((advisor, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <input
                      type="text"
                      value={advisor.name}
                      onChange={(e) => {
                        const newAdvisors = [...safelyParseArray(formData.advisors)]
                        newAdvisors[index] = { ...newAdvisors[index], name: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          advisors: newAdvisors,
                        }))
                      }}
                      placeholder="Name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={advisor.expertise}
                      onChange={(e) => {
                        const newAdvisors = [...safelyParseArray(formData.advisors)]
                        newAdvisors[index] = { ...newAdvisors[index], expertise: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          advisors: newAdvisors,
                        }))
                      }}
                      placeholder="Expertise"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={advisor.bio}
                      onChange={(e) => {
                        const newAdvisors = [...safelyParseArray(formData.advisors)]
                        newAdvisors[index] = { ...newAdvisors[index], bio: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          advisors: newAdvisors,
                        }))
                      }}
                      placeholder="Bio"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={advisor.year}
                      onChange={(e) => {
                        const newAdvisors = [...safelyParseArray(formData.advisors)]
                        newAdvisors[index] = { ...newAdvisors[index], year: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          advisors: newAdvisors,
                        }))
                      }}
                      placeholder="Year"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <MediaUploadButton
                      section="advisors"
                      index={index}
                      onSelect={(file) => {
                        const newAdvisors = [...safelyParseArray(formData.advisors)]
                        newAdvisors[index] = { ...newAdvisors[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          advisors: newAdvisors,
                        }))
                      }}
                      isUploading={imageUploading}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          advisors: safelyParseArray(prev.advisors).filter((_, i) => i !== index),
                        }))
                      }}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </CategorySection>
            <CategorySection title="Partners">
              <div className="space-y-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      partners: [...safelyParseArray(prev.partners), { name: "", contribution: "", year: "", media: undefined }],
                    }))
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add Partner
                </button>
                {safelyParseArray(formData.partners).map((partner, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => {
                        const newPartners = [...safelyParseArray(formData.partners)]
                        newPartners[index] = { ...newPartners[index], name: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          partners: newPartners,
                        }))
                      }}
                      placeholder="Name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={partner.contribution}
                      onChange={(e) => {
                        const newPartners = [...safelyParseArray(formData.partners)]
                        newPartners[index] = { ...newPartners[index], contribution: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          partners: newPartners,
                        }))
                      }}
                      placeholder="Contribution"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={partner.year}
                      onChange={(e) => {
                        const newPartners = [...safelyParseArray(formData.partners)]
                        newPartners[index] = { ...newPartners[index], year: e.target.value }
                        setFormData((prev) => ({
                          ...prev,
                          partners: newPartners,
                        }))
                      }}
                      placeholder="Year"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <MediaUploadButton
                      section="partners"
                      index={index}
                      onSelect={(file) => {
                        const newPartners = [...safelyParseArray(formData.partners)]
                        newPartners[index] = { ...newPartners[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          partners: newPartners,
                        }))
                      }}
                      isUploading={imageUploading}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          partners: safelyParseArray(prev.partners).filter((_, i) => i !== index),
                        }))
                      }}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </CategorySection>
          </PageSection>

          <CategorySection title="Testimonials">
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    testimonials: [
                      ...safelyParseArray(prev.testimonials),
                      { name: "", position: "", company: "", text: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Testimonial
              </button>
              {safelyParseArray(formData.testimonials).map((testimonial, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={testimonial.name}
                    onChange={(e) => {
                      const newTestimonials = [...safelyParseArray(formData.testimonials)]
                      newTestimonials[index] = { ...newTestimonials[index], name: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: newTestimonials,
                      }))
                    }}
                    placeholder="Name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={testimonial.position}
                    onChange={(e) => {
                      const newTestimonials = [...safelyParseArray(formData.testimonials)]
                      newTestimonials[index] = { ...newTestimonials[index], position: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: newTestimonials,
                      }))
                    }}
                    placeholder="Position"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="text"
                    value={testimonial.company}
                    onChange={(e) => {
                      const newTestimonials = [...safelyParseArray(formData.testimonials)]
                      newTestimonials[index] = { ...newTestimonials[index], company: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: newTestimonials,
                      }))
                    }}
                    placeholder="Company"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <textarea
                    value={testimonial.text}
                    onChange={(e) => {
                      const newTestimonials = [...safelyParseArray(formData.testimonials)]
                      newTestimonials[index] = { ...newTestimonials[index], text: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: newTestimonials,
                      }))
                    }}
                    placeholder="Testimonial Text"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <MediaUploadButton
                    section="testimonials"
                    index={index}
                    onSelect={(file) => {
                      const newTestimonials = [...safelyParseArray(formData.testimonials)]
                      newTestimonials[index] = { ...newTestimonials[index], media: file }
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: newTestimonials,
                      }))
                    }}
                    isUploading={imageUploading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        testimonials: safelyParseArray(prev.testimonials).filter((_, i) => i !== index),
                      }))
                    }}
                    className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CategorySection>

          {/* Project Goals */}
          <PageSection title="Project Goals">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Short Term Goals">
                <div className="space-y-4 w-full">
                  <div>
                    <label htmlFor="short_term_goals" className="block text-sm font-medium text-gray-700">
                      Short Term Goals
                    </label>
                    <textarea
                      id="short_term_goals"
                      name="short_term_goals"
                      value={formData.short_term_goals}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Enter your project's short term goals..."
                    ></textarea>
                  </div>
                </div>
              </CategorySection>
              <CategorySection title="Long Term Goals">
                <div className="space-y-4 w-full">
                  <div>
                    <label htmlFor="long_term_goals" className="block text-sm font-medium text-gray-700">
                      Long Term Goals
                    </label>
                    <textarea
                      id="long_term_goals"
                      name="long_term_goals"
                      value={formData.long_term_goals}
                      onChange={handleInputChange}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Enter your project's long term goals..."
                    ></textarea>
                  </div>
                </div>
              </CategorySection>
            </div>
          </PageSection>

          {/* Portfolio (Conditional) */}
          {showPortfolio.includes(formData.project_type) && (
            <PageSection title="Portfolio">
              <CategorySection title={deliverablesLabelMap[formData.project_type] || "Deliverables"}>
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        deliverables: [...safelyParseArray(prev.deliverables), { title: "", description: "", due_date: "", status: "" }],
                      }))
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Deliverable
                  </button>
                  {safelyParseArray(formData.deliverables).map((deliverable, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                      <input
                        type="text"
                        value={deliverable.title}
                        onChange={(e) => {
                          const newDeliverables = [...safelyParseArray(formData.deliverables)]
                          newDeliverables[index] = {
                            ...newDeliverables[index],
                            title: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: newDeliverables,
                          }))
                        }}
                        placeholder="Deliverable Title"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <textarea
                        value={deliverable.description}
                        onChange={(e) => {
                          const newDeliverables = [...safelyParseArray(formData.deliverables)]
                          newDeliverables[index] = {
                            ...newDeliverables[index],
                            description: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: newDeliverables,
                          }))
                        }}
                        placeholder="Deliverable Description"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="date"
                        aria-label="Due Date"
                        value={deliverable.due_date}
                        onChange={(e) => {
                          const newDeliverables = [...safelyParseArray(formData.deliverables)]
                          newDeliverables[index] = {
                            ...newDeliverables[index],
                            due_date: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: newDeliverables,
                          }))
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <select
                        aria-label="Status"
                        value={deliverable.status}
                        onChange={(e) => {
                          const newDeliverables = [...safelyParseArray(formData.deliverables)]
                          newDeliverables[index] = {
                            ...newDeliverables[index],
                            status: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: newDeliverables,
                          }))
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Select status...</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <MediaUploadButton
                        section="deliverables"
                        index={index}
                        onSelect={(file) => {
                          const newDeliverables = [...safelyParseArray(formData.deliverables)]
                          newDeliverables[index] = {
                            ...newDeliverables[index],
                            media: file,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: newDeliverables,
                          }))
                        }}
                        isUploading={imageUploading}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            deliverables: safelyParseArray(prev.deliverables).filter((_, i) => i !== index),
                          }))
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
              <CategorySection title={milestonesLabelMap[formData.project_type] || "Milestones"}>
                <div className="space-y-4 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        milestones: [...safelyParseArray(prev.milestones), { title: "", description: "", date: "", media: undefined }],
                      }))
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add Milestone
                  </button>
                  {safelyParseArray(formData.milestones).map((milestone, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-md">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...safelyParseArray(formData.milestones)]
                          newMilestones[index] = {
                            ...newMilestones[index],
                            title: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            milestones: newMilestones,
                          }))
                        }}
                        placeholder="Milestone Title"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <textarea
                        value={milestone.description}
                        onChange={(e) => {
                          const newMilestones = [...safelyParseArray(formData.milestones)]
                          newMilestones[index] = {
                            ...newMilestones[index],
                            description: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            milestones: newMilestones,
                          }))
                        }}
                        placeholder="Milestone Description"
                        rows={3}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <input
                        type="date"
                        aria-label="Milestone Date"
                        value={milestone.date}
                        onChange={(e) => {
                          const newMilestones = [...safelyParseArray(formData.milestones)]
                          newMilestones[index] = {
                            ...newMilestones[index],
                            date: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            milestones: newMilestones,
                          }))
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <MediaUploadButton
                        section="milestones"
                        index={index}
                        onSelect={(file) => {
                          const newMilestones = [...safelyParseArray(formData.milestones)]
                          newMilestones[index] = {
                            ...newMilestones[index],
                            media: file,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            milestones: newMilestones,
                          }))
                        }}
                        isUploading={imageUploading}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            milestones: safelyParseArray(prev.milestones).filter((_, i) => i !== index),
                          }))
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </PageSection>
          )}

          {/* Privacy & Notifications (Unchanged) */}
          <PageSection title="Privacy & Notifications">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Privacy Settings">
                <div className="space-y-4 w-full">
                  <div>
                    <label htmlFor="project_visibility" className="block text-sm font-medium text-gray-700">
                      Project Visibility
                    </label>
                    <select
                      id="project_visibility"
                      name="project_visibility"
                      value={formData.project_visibility}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="team">Team Only</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      id="search_visibility"
                      name="search_visibility"
                      checked={formData.search_visibility}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label htmlFor="search_visibility" className="ml-2 block text-sm text-gray-900">
                      Visible in search results
                    </label>
                  </div>
                </div>
              </CategorySection>
              <CategorySection title="Notification Preferences">
                <div className="space-y-4 w-full">
                  {safelyParseArray(formData.notification_preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        id={`notification_${key}`}
                        checked={value}
                        onChange={(e) => {
                          setFormData((prev) => {
                            if (!prev?.notification_preferences) return prev;
                            return {
                              ...prev,
                              notification_preferences: {
                                ...prev.notification_preferences,
                                [key]: e.target.checked,
                              },
                            };
                          });
                        }}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <label htmlFor={`notification_${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                        {key.replace("_", " ")} Notifications
                      </label>
                    </div>
                  ))}
                </div>
              </CategorySection>
            </div>
          </PageSection>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

                       