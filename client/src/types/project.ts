export interface ProjectFormMedia {
  file: File;
  url?: string;
}

export interface ProjectFormTeamMember {
  id: string;
  name: string;
  role: string;
  years?: string;
  bio?: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormCollaborator {
  id: string;
  name: string;
  company: string;
  role: string;
  contribution: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormAdvisor {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  year: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormPartner {
  id: string;
  name: string;
  organization: string;
  contribution: string;
  year: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormTestimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  position: string;
  company: string;
  text: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormDeliverable {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  media?: ProjectFormMedia;
}

export interface ProjectFormMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  media?: ProjectFormMedia;
}

export interface Project {
  id: string;
  project_name: string;
  project_description: string;
  project_type: string;
  project_category?: string;
  project_timeline: string;
  project_status_tag: string;
  project_visibility: string;
  search_visibility: boolean;
  project_image: string | null;
  
  // Add missing fields that we're using
  social_links?: {
    youtube?: string;
    instagram?: string;
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  website_links?: string[];
  
  // Team related fields
  team_members: ProjectFormTeamMember[];
  collaborators: ProjectFormCollaborator[];
  advisors: ProjectFormAdvisor[];
  partners: ProjectFormPartner[];
  testimonials: ProjectFormTestimonial[];
  deliverables: ProjectFormDeliverable[];
  milestones: ProjectFormMilestone[];
  
  // Project specific fields
  seeking: {
    creator: boolean;
    brand: boolean;
    freelancer: boolean;
    contractor: boolean;
  };
  notification_preferences: Record<string, boolean>;
  
  // Optional fields based on project type
  client?: string;
  client_location?: string;
  client_website?: string;
  contract_type?: string;
  contract_duration?: string;
  contract_value?: string;
  budget?: string;
  budget_range?: string;
  currency?: string;
  skills_required?: string[];
  expertise_needed?: string[];
  industry_tags?: string[];
  technology_tags?: string[];
  short_term_goals?: string;
  long_term_goals?: string;
  
  // Add target_audience field
  target_audience?: string[];
} 