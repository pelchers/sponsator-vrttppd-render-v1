export interface TeamMember {
  id: string;
  name: string;
  role: string;
  years: string;
  bio: string;
  media?: File;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  company: string;
  contribution: string;
  media?: File;
}

export interface Advisor {
  id: string;
  name: string;
  expertise: string;
  year: string;
  bio: string;
  media?: File;
}

export interface Partner {
  id: string;
  name: string;
  contribution: string;
  year: string;
  organization: string;
  media?: File;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  text: string;
  role: string;
  organization: string;
  media?: File;
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
  media?: File;
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
  skills_required: string[];
  expertise_needed: string[];
  target_audience: string[];
  solutions_offered: string[];
  project_tags: string[];
  industry_tags: string[];
  technology_tags: string[];
  project_status_tag: string;
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
  website_links: string[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  team_members: TeamMember[];
  collaborators: Collaborator[];
  advisors: Advisor[];
  partners: Partner[];
  testimonials: Testimonial[];
  short_term_goals: string;
  long_term_goals: string;
  project_visibility: string;
  search_visibility: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
    digest: boolean;
  };
}

export interface ProjectFormMedia {
  file?: File;
  url?: string;
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

export interface ProjectFormDataWithFile extends Omit<ProjectFormData, 'project_image' | 'team_members' | 'collaborators' | 'advisors' | 'partners' | 'testimonials'> {
  project_image: File | string | null;
  team_members: ProjectFormTeamMember[];
  collaborators: ProjectFormCollaborator[];
  advisors: ProjectFormAdvisor[];
  partners: ProjectFormPartner[];
  testimonials: ProjectFormTestimonial[];
} 