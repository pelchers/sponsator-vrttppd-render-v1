"use client"

import type React from "react"
import { useState } from "react"
import PageSection from "./PageSection"
import CategorySection from "./CategorySection"
import TagInput from "./TagInput"
import ImageUpload from "./ImageUpload"

export default function ProjectEditForm() {
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
  const [formData, setFormData] = useState({
    // Basic Information
    project_image: null as File | null,
    project_name: "",
    project_description: "",
    project_type: "",
    project_category: "",

    // Project Details
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

    // Availability & Preferences
    project_status: "",
    preferred_collaboration_type: "",
    budget_range: "",
    currency: "USD",
    standard_rate: "",
    rate_type: "",
    compensation_type: "",

    // Skills & Expertise
    skills_required: [] as string[],
    expertise_needed: [] as string[],

    // Focus
    target_audience: [] as string[],
    solutions_offered: [] as string[],

    // Tags & Categories
    project_tags: [] as string[],
    industry_tags: [] as string[],
    technology_tags: [] as string[],
    project_status_tag: "",
    seeking: {
      creator: false,
      brand: false,
      freelancer: false,
      contractor: false,
    },

    // Contact & Availability
    social_links: {
      youtube: "",
      instagram: "",
      github: "",
      twitter: "",
      linkedin: "",
    },
    website_links: [] as string[],

    // Team & Collaborators
    team_members: [] as { name: string; role: string; years: string; media?: File }[],
    collaborators: [] as { name: string; company: string; role: string; media?: File }[],
    advisors: [] as { name: string; expertise: string; year: string; media?: File }[],
    partners: [] as { name: string; contribution: string; year: string; media?: File }[],
    testimonials: [] as { name: string; position: string; company: string; text: string; media?: File }[],

    // Project Goals
    short_term_goals: "",
    long_term_goals: "",

    // Portfolio
    milestones: [] as { title: string; description: string; date: string; media?: File }[],
    deliverables: [] as { title: string; description: string; due_date: string; status: string }[],

    // Privacy
    project_visibility: "public",
    search_visibility: true,
    notification_preferences: {
      email: true,
      push: true,
      digest: true,
    },
  })

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
    // etc.
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
    // etc.
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
    // fallback will be "Industry Tags"
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
    // fallback => "Deliverables"
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
    // fallback => "Milestones"
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
    "contractor_products_supply",
    "contractor_management_services",
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

  // -----------------------------------------------------------------------
  // 4) HANDLERS
  // -----------------------------------------------------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (name === "seeking") {
      setFormData((prev) => ({
        ...prev,
        seeking: {
          ...prev.seeking,
          [value]: (e.target as HTMLInputElement).checked,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }))
    }
  }

  const handleImageSelect = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      project_image: file,
    }))
  }

  const handleAddTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as string[]), tag],
    }))
  }

  const handleRemoveTag = (section: keyof typeof formData) => (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: (prev[section] as string[]).filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  // Existing conditional fields for *Project Category* within "Project Information" 
  const renderConditionalFields = () => {
    switch (formData.project_type) {
      case "creative_work":
      case "creative_partnership":
        return (
          <>
            <div>
              <label
                htmlFor="project_category"
                className="block text-sm font-medium text-gray-700"
              >
                Content Category
              </label>
              <input
                type="text"
                id="project_category"
                name="project_category"
                value={formData.project_category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="e.g., Video, Music, Art, Writing"
              />
            </div>
          </>
        )
      case "brand_work":
      case "brand_deal":
      case "brand_partnership":
        return (
          <>
            <div>
              <label
                htmlFor="project_category"
                className="block text-sm font-medium text-gray-700"
              >
                Campaign Type
              </label>
              <input
                type="text"
                id="project_category"
                name="project_category"
                value={formData.project_category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="e.g., Product Launch, Brand Awareness, Influencer Collaboration"
              />
            </div>
          </>
        )
      case "freelance_services":
      case "contractor_services":
      case "contractor_products_supply":
      case "contractor_management_services":
        return (
          <>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="e.g., Web Development, Graphic Design, Marketing"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  // -----------------------------------------------------------------------
  // 5) RENDER
  // -----------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <PageSection title="Basic Information">
        <CategorySection>
          <div className="space-y-6 w-full">
            <ImageUpload onImageSelect={handleImageSelect} />

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
              <label
                htmlFor="project_description"
                className="block text-sm font-medium text-gray-700"
              >
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
                <option value="contractor_management_services">
                  Contractor Management Services
                </option>
                <option value="collaborative_work">Collaborative Work</option>
                <option value="simple_connection">Simple Connection</option>
              </select>
            </div>
          </div>
        </CategorySection>
      </PageSection>

      {/* Project Details */}
      <PageSection title="Project Details">
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
                <label
                  htmlFor="project_timeline"
                  className="block text-sm font-medium text-gray-700"
                >
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
                tags={formData.target_audience}
                onAddTag={handleAddTag("target_audience")}
                onRemoveTag={handleRemoveTag("target_audience")}
                placeholder="Add target audience..."
              />
            </div>
          </CategorySection>
        </div>

        <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
          {/* --- CLIENT INFO (CONDITIONAL) --- */}
          {showClientContractSections.includes(formData.project_type) && (
            <CategorySection
              title={
                clientInfoLabelMap[formData.project_type] ||
                "Client Info"
              }
            >
              <div className="space-y-4 w-full">
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                    {formData.project_type === "brand_work" ||
                    formData.project_type === "brand_deal" ||
                    formData.project_type === "brand_partnership"
                      ? "Brand / Sponsor Name"
                      : "Client Name"}
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="client_location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="client_location"
                    name="client_location"
                    value={formData.client_location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="client_website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="client_website"
                    name="client_website"
                    value={formData.client_website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </CategorySection>
          )}

          {/* --- CONTRACT INFO (CONDITIONAL) --- */}
          {showClientContractSections.includes(formData.project_type) && (
            <CategorySection
              title={
                contractInfoLabelMap[formData.project_type] ||
                "Contract Info"
              }
            >
              <div className="space-y-4 w-full">
                <div>
                  <label
                    htmlFor="contract_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contract Type
                  </label>
                  {/** 
                   * Show dynamic dropdown options. If none is found, we use
                   * defaultContractTypeOptions as fallback.
                   */}
                  <select
                    id="contract_type"
                    name="contract_type"
                    value={formData.contract_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="">Select contract type...</option>
                    {(contractTypeMap[formData.project_type] ||
                      defaultContractTypeOptions
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="contract_duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contract Duration
                  </label>
                  <input
                    type="text"
                    id="contract_duration"
                    name="contract_duration"
                    value={formData.contract_duration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contract_value"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contract Value
                  </label>
                  <input
                    type="text"
                    id="contract_value"
                    name="contract_value"
                    value={formData.contract_value}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </CategorySection>
          )}
        </div>
      </PageSection>

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
                  <label
                    htmlFor="preferred_collaboration_type"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="compensation_type"
                    className="block text-sm font-medium text-gray-700"
                  >
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
              <TagInput
                label="Expertise"
                tags={formData.expertise_needed}
                onAddTag={handleAddTag("expertise_needed")}
                onRemoveTag={handleRemoveTag("expertise_needed")}
                placeholder="Add an area of expertise..."
              />
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
              tags={formData.target_audience}
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
            <CategorySection
              title={
                industryTagsLabelMap[formData.project_type] || "Industry Tags"
              }
            >
              <TagInput
                label={
                  industryTagsLabelMap[formData.project_type] || "Industry Tags"
                }
                tags={formData.industry_tags}
                onAddTag={handleAddTag("industry_tags")}
                onRemoveTag={handleRemoveTag("industry_tags")}
                placeholder="Add an industry tag..."
              />
            </CategorySection>
            <CategorySection
              title={
                technologyTagsLabelMap[formData.project_type] ||
                "Technology Tags"
              }
            >
              <TagInput
                label={
                  technologyTagsLabelMap[formData.project_type] ||
                  "Technology Tags"
                }
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Seeking</label>
              <div className="mt-2 space-y-2">
                {["creator", "brand", "freelancer", "contractor"].map((option) => (
                  <div key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`seeking_${option}`}
                      name="seeking"
                      value={option}
                      checked={formData.seeking[option]}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <label
                      htmlFor={`seeking_${option}`}
                      className="ml-2 block text-sm text-gray-900 capitalize"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CategorySection>
        </div>
      </PageSection>

      {/* Contact & Availability (Unchanged) */}
      <PageSection title="Contact & Availability">
        <div className="md:grid md:grid-cols-2 md:gap-6">
          <CategorySection title="Social Links">
            <div className="space-y-4 w-full">
              {Object.entries(formData.social_links).map(([platform, url]) => (
                <div key={platform}>
                  <label
                    htmlFor={platform}
                    className="block text-sm font-medium text-gray-700 capitalize"
                  >
                    {platform}
                  </label>
                  <input
                    type="url"
                    id={platform}
                    name={`social_links.${platform}`}
                    value={url}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        social_links: {
                          ...prev.social_links,
                          [platform]: e.target.value,
                        },
                      }))
                    }}
                    placeholder={`Enter your ${platform} URL`}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              ))}
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
              {formData.website_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...formData.website_links]
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
                        website_links: prev.website_links.filter((_, i) => i !== index),
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
                    team_members: [
                      ...prev.team_members,
                      { name: "", role: "", years: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Team Member
              </button>
              {formData.team_members.map((member, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const newMembers = [...formData.team_members]
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
                      const newMembers = [...formData.team_members]
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
                      const newMembers = [...formData.team_members]
                      newMembers[index] = { ...newMembers[index], years: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        team_members: newMembers,
                      }))
                    }}
                    placeholder="Years"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newMembers = [...formData.team_members]
                        newMembers[index] = { ...newMembers[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          team_members: newMembers,
                        }))
                      }
                    }}
                    accept="image/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        team_members: prev.team_members.filter((_, i) => i !== index),
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
                    collaborators: [
                      ...prev.collaborators,
                      { name: "", company: "", role: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Collaborator
              </button>
              {formData.collaborators.map((collaborator, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={collaborator.name}
                    onChange={(e) => {
                      const newCollaborators = [...formData.collaborators]
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
                      const newCollaborators = [...formData.collaborators]
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
                      const newCollaborators = [...formData.collaborators]
                      newCollaborators[index] = { ...newCollaborators[index], role: e.target.value }
                      setFormData((prev) => ({
                        ...prev,
                        collaborators: newCollaborators,
                      }))
                    }}
                    placeholder="Role"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newCollaborators = [...formData.collaborators]
                        newCollaborators[index] = { ...newCollaborators[index], media: file }
                        setFormData((prev) => ({
                          ...prev,
                          collaborators: newCollaborators,
                        }))
                      }
                    }}
                    accept="image/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        collaborators: prev.collaborators.filter((_, i) => i !== index),
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
                  advisors: [
                    ...prev.advisors,
                    { name: "", expertise: "", year: "", media: undefined },
                  ],
                }))
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add Advisor
            </button>
            {formData.advisors.map((advisor, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-md">
                <input
                  type="text"
                  value={advisor.name}
                  onChange={(e) => {
                    const newAdvisors = [...formData.advisors]
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
                    const newAdvisors = [...formData.advisors]
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
                  value={advisor.year}
                  onChange={(e) => {
                    const newAdvisors = [...formData.advisors]
                    newAdvisors[index] = { ...newAdvisors[index], year: e.target.value }
                    setFormData((prev) => ({
                      ...prev,
                      advisors: newAdvisors,
                    }))
                  }}
                  placeholder="Year"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newAdvisors = [...formData.advisors]
                      newAdvisors[index] = { ...newAdvisors[index], media: file }
                      setFormData((prev) => ({
                        ...prev,
                        advisors: newAdvisors,
                      }))
                    }
                  }}
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      advisors: prev.advisors.filter((_, i) => i !== index),
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
                  partners: [
                    ...prev.partners,
                    { name: "", contribution: "", year: "", media: undefined },
                  ],
                }))
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add Partner
            </button>
            {formData.partners.map((partner, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-md">
                <input
                  type="text"
                  value={partner.name}
                  onChange={(e) => {
                    const newPartners = [...formData.partners]
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
                    const newPartners = [...formData.partners]
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
                    const newPartners = [...formData.partners]
                    newPartners[index] = { ...newPartners[index], year: e.target.value }
                    setFormData((prev) => ({
                      ...prev,
                      partners: newPartners,
                    }))
                  }}
                  placeholder="Year"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const newPartners = [...formData.partners]
                      newPartners[index] = { ...newPartners[index], media: file }
                      setFormData((prev) => ({
                        ...prev,
                        partners: newPartners,
                      }))
                    }
                  }}
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      partners: prev.partners.filter((_, i) => i !== index),
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
                  ...prev.testimonials,
                  { name: "", position: "", company: "", text: "", media: undefined },
                ],
              }))
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Add Testimonial
          </button>
          {formData.testimonials.map((testimonial, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              <input
                type="text"
                value={testimonial.name}
                onChange={(e) => {
                  const newTestimonials = [...formData.testimonials]
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
                  const newTestimonials = [...formData.testimonials]
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
                  const newTestimonials = [...formData.testimonials]
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
                  const newTestimonials = [...formData.testimonials]
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
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const newTestimonials = [...formData.testimonials]
                    newTestimonials[index] = { ...newTestimonials[index], media: file }
                    setFormData((prev) => ({
                      ...prev,
                      testimonials: newTestimonials,
                    }))
                  }
                }}
                accept="image/*"
                className="mt-2 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    testimonials: prev.testimonials.filter((_, i) => i !== index),
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
          <CategorySection
            title={
              deliverablesLabelMap[formData.project_type] ||
              "Deliverables"
            }
          >
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    deliverables: [
                      ...prev.deliverables,
                      { title: "", description: "", due_date: "", status: "" },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Deliverable
              </button>
              {formData.deliverables.map((deliverable, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={deliverable.title}
                    onChange={(e) => {
                      const newDeliverables = [...formData.deliverables]
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
                      const newDeliverables = [...formData.deliverables]
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
                    value={deliverable.due_date}
                    onChange={(e) => {
                      const newDeliverables = [...formData.deliverables]
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
                    value={deliverable.status}
                    onChange={(e) => {
                      const newDeliverables = [...formData.deliverables]
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
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        deliverables: prev.deliverables.filter((_, i) => i !== index),
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
          <CategorySection
            title={
              milestonesLabelMap[formData.project_type] ||
              "Milestones"
            }
          >
            <div className="space-y-4 w-full">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    milestones: [
                      ...prev.milestones,
                      { title: "", description: "", date: "", media: undefined },
                    ],
                  }))
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Add Milestone
              </button>
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones]
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
                      const newMilestones = [...formData.milestones]
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
                    value={milestone.date}
                    onChange={(e) => {
                      const newMilestones = [...formData.milestones]
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
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const newMilestones = [...formData.milestones]
                        newMilestones[index] = {
                          ...newMilestones[index],
                          media: file,
                        }
                        setFormData((prev) => ({
                          ...prev,
                          milestones: newMilestones,
                        }))
                      }
                    }}
                    accept="image/*"
                    className="mt-2 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        milestones: prev.milestones.filter((_, i) => i !== index),
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
                <label
                  htmlFor="project_visibility"
                  className="block text-sm font-medium text-gray-700"
                >
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
              {Object.entries(formData.notification_preferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    id={`notification_${key}`}
                    checked={value}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          [key]: e.target.checked,
                        },
                      }))
                    }}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <label
                    htmlFor={`notification_${key}`}
                    className="ml-2 block text-sm text-gray-900 capitalize"
                  >
                    {key.replace("_", " ")} Notifications
                  </label>
                </div>
              ))}
            </div>
          </CategorySection>
        </div>
      </PageSection>

      <div className="flex justify-center">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

