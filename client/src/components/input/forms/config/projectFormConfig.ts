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