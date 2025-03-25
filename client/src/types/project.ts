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
  user_id: string;
  project_name: string;
  project_description?: string;
  project_type: string;
  project_category?: string;
  project_timeline: string;
  project_status_tag: string;
  project_visibility: string;
  search_visibility: boolean;
  project_image_url?: string | null;
  project_image_upload?: string | null;
  project_image_display?: 'url' | 'upload';
  
  // Social links to match schema
  social_links_youtube?: string;
  social_links_instagram?: string;
  social_links_github?: string;
  social_links_twitter?: string;
  social_links_linkedin?: string;
  website_links?: string[];
  
  // Team related fields (as JSON in schema)
  team_members: ProjectFormTeamMember[];
  collaborators: ProjectFormCollaborator[];
  advisors: ProjectFormAdvisor[];
  partners: ProjectFormPartner[];
  testimonials: ProjectFormTestimonial[];
  deliverables: ProjectFormDeliverable[];
  milestones: ProjectFormMilestone[];
  
  // Seeking fields as individual booleans
  seeking_creator: boolean;
  seeking_brand: boolean;
  seeking_freelancer: boolean;
  seeking_contractor: boolean;
  
  // Notification preferences
  notification_preferences_email: boolean;
  notification_preferences_push: boolean;
  notification_preferences_digest: boolean;
  
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
  target_audience?: string[];
  solutions_offered?: string[];
  project_tags?: string[];
  short_term_goals?: string;
  long_term_goals?: string;
}

export interface ProjectFormDataWithFile {
  // ... other fields
  
  // Social links as individual fields
  social_links_youtube: string;
  social_links_instagram: string;
  social_links_github: string;
  social_links_twitter: string;
  social_links_linkedin: string;
  
  // Seeking as individual boolean fields
  seeking_creator: boolean;
  seeking_brand: boolean;
  seeking_freelancer: boolean;
  seeking_contractor: boolean;
  
  // ... other fields
} 