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
  'portfolio',
  'showcase',
  'case_study'
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