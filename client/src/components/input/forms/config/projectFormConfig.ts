export interface ProjectTypeConfig {
  category_label: string;
  category_placeholder: string;
  skills_label: string;
  skills_placeholder: string;
  target_audience_label: string;
  target_audience_placeholder: string;
  solutions_label: string;
  solutions_placeholder: string;
  industry_tags_label: string;
  technology_tags_label: string;
}

export const clientInfoLabelMap: Record<string, string> = {
  client_project: 'Client',
  contract_work: 'Company',
  consulting: 'Organization'
};

export const contractInfoLabelMap: Record<string, string> = {
  brand_work: "Campaign / Contract Info",
  brand_deal: "Brand Deal Contract",
  brand_partnership: "Brand Partnership Contract",
  freelance_services: "Freelance Contract Info",
  contractor_services: "Contractor Services Contract",
  contractor_products_supply: "Supply Contract Details",
  contractor_management_services: "Management Contract Details",
};

export const industryTagsLabelMap: Record<string, string> = {
  creative_work: "Creative / Genre Tags",
  creative_partnership: "Creative / Genre Tags",
  brand_work: "Brand / Product Tags",
  brand_deal: "Brand / Product Tags",
  brand_partnership: "Brand / Product Tags",
  freelance_services: "Industry / Service Tags",
  contractor_services: "Industry / Service Tags",
  contractor_products_supply: "Supply / Industry Tags",
  contractor_management_services: "Management / Industry Tags",
};

export const skillsLabelMap: Record<string, string> = {
  client_project: 'Required Skills',
  contract_work: 'Skills Needed',
  freelance: 'Expertise',
  consulting: 'Areas of Expertise'
};

export const budgetLabelMap: Record<string, string> = {
  client_project: 'Project Budget',
  contract_work: 'Contract Value',
  freelance: 'Rate'
};

export const deliverablesLabelMap: Record<string, string> = {
  portfolio: 'Portfolio Items',
  showcase: 'Showcase Items',
  case_study: 'Deliverables'
};

export const milestonesLabelMap: Record<string, string> = {
  portfolio: 'Key Achievements',
  showcase: 'Highlights',
  case_study: 'Milestones'
};

export const showClientContractSections = [
  'client_project',
  'contract_work',
  'consulting'
];

export const showBudgetSection = [
  'client_project',
  'contract_work',
  'freelance'
];

export const showSkillsExpertise = [
  'client_project',
  'contract_work',
  'freelance',
  'consulting'
];

export const showPortfolio = [
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
  "campaign",
  "content_creation",
  "event",
  "product_launch",
  "service_offering",
  "social_media_management",
  "website_development"
];

export const SEEKING_OPTIONS = {
  creator: "Creator",
  brand: "Brand",
  freelancer: "Freelancer",
  contractor: "Contractor"
} as const;

export type SeekingOption = keyof typeof SEEKING_OPTIONS;

export const projectTypeFields: Record<string, ProjectTypeConfig> = {
  creative_work: {
    category_label: "Content Category",
    category_placeholder: "e.g., Video, Music, Art, Writing",
    skills_label: "Creative Skills",
    skills_placeholder: "Add creative skills...",
    target_audience_label: "Target Audience",
    target_audience_placeholder: "Add target audience...",
    solutions_label: "Solutions Offered",
    solutions_placeholder: "Add solutions...",
    industry_tags_label: "Creative / Genre Tags",
    technology_tags_label: "Tools / Software Tags"
  },
  creative_partnership: {
    category_label: "Content Category",
    category_placeholder: "e.g., Video, Music, Art, Writing",
    skills_label: "Creative Skills",
    skills_placeholder: "Add creative skills...",
    target_audience_label: "Target Audience",
    target_audience_placeholder: "Add target audience...",
    solutions_label: "Solutions Offered",
    solutions_placeholder: "Add solutions...",
    industry_tags_label: "Creative / Genre Tags",
    technology_tags_label: "Tools / Software Tags"
  }
};

export const contractTypeMap: Record<string, string[]> = {
  brand_work: ["Fixed-Fee Campaign", "Ongoing Retainer", "One-Time Activation"],
  brand_deal: ["Sponsorship Deal", "Flat Fee", "Performance-based"],
  brand_partnership: ["Royalty-based", "Equity-based", "Revenue Share"],
  freelance_services: ["Hourly", "Fixed Project", "Retainer", "Milestone-based"],
  contractor_services: ["Hourly", "Fixed Project", "Retainer"],
  contractor_products_supply: ["Purchase Order", "Supply Contract", "Distribution Contract"],
  contractor_management_services: ["Management Retainer", "Performance-based", "Consulting Agreement"],
};

export const defaultContractTypeOptions = [
  "Hourly",
  "Fixed Project",
  "Retainer",
  "Milestone-based",
  "Undefined Contract"
];

export const technologyTagsLabelMap: Record<string, string> = {
  creative_work: "Tools / Software Tags",
  brand_work: "Platform / Tech Stack",
  brand_deal: "Platform / Tech Stack",
  // Default falls back to "Technology Tags"
};

export const showIndustryTechnologyTags = [
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
];

export const defaultFormState = {
  project_name: "",
  project_description: "",
  project_type: "",
  project_category: "",
  project_timeline: "",
  project_status_tag: "",
  project_visibility: "public",
  search_visibility: true,
  project_image: null,
  team_members: [],
  collaborators: [],
  advisors: [],
  partners: [],
  testimonials: [],
  deliverables: [],
  milestones: [],
  
  seeking_creator: false,
  seeking_brand: false,
  seeking_freelancer: false,
  seeking_contractor: false,
  
  social_links_youtube: "",
  social_links_instagram: "",
  social_links_github: "",
  social_links_twitter: "",
  social_links_linkedin: "",
  
  notification_preferences_email: true,
  notification_preferences_push: true,
  notification_preferences_digest: true
};