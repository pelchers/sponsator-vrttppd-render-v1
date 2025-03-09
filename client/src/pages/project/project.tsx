import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, deleteProject } from '@/api/projects';
import { getCurrentUser } from '@/api/auth';
import PageSection from "@/components/sections/PageSection";
import CategorySection from "@/components/sections/CategorySection";
import PillTag from "@/components/input/forms/PillTag";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import {
  Project,
  ProjectFormTeamMember,
  ProjectFormCollaborator,
  ProjectFormAdvisor,
  ProjectFormPartner,
  ProjectFormTestimonial,
  ProjectFormDeliverable,
  ProjectFormMilestone
} from '@/types/project';
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
} from '@/components/input/forms/config/projectFormConfig';
import "@/components/input/forms/ProjectEditFormV3.css";

const DisplayField = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
      {value || 'Not specified'}
    </div>
  </div>
);

const DisplayTextArea = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 min-h-[100px] whitespace-pre-line">
      {value || 'No description provided'}
    </div>
  </div>
);

const DisplayTags = ({ label, tags = [] }: { label: string; tags?: string[] }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex flex-wrap gap-2">
      {tags.length > 0 ? (
        tags.map((tag, index) => (
          <PillTag key={index} text={tag} onRemove={() => {}} />
        ))
      ) : (
        <span className="text-gray-500">No tags added</span>
      )}
    </div>
  </div>
);

const DisplayStatus = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
    status === "completed" ? "bg-green-100 text-green-800" :
    status === "in_progress" ? "bg-blue-100 text-blue-800" :
    "bg-gray-100 text-gray-800"
  }`}>
    {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
  </span>
);

const DisplaySeekingOptions = ({ seeking }: { seeking: any }) => (
  <div className="flex flex-wrap gap-2">
    {seeking?.creator && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Creator</span>}
    {seeking?.brand && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Brand</span>}
    {seeking?.freelancer && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Freelancer</span>}
    {seeking?.contractor && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Contractor</span>}
  </div>
);

// Helper function to safely parse JSON strings to arrays
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

// Component for Team Members section
const TeamMembersSection = ({ team_members }: { team_members: any }) => {
  const members = safelyParseArray(team_members);
  
  return (
    <CategorySection title="Team Members">
      <div className="space-y-4">
        {members.length > 0 ? (
          members.map((member, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              {member.media?.url && (
                <div className="relative w-full h-40">
                  <img
                    src={member.media.url || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div>
                  <span className="font-medium text-gray-600">Name: </span>
                  <span>{member.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Role: </span>
                  <span>{member.role}</span>
                </div>
                {member.years && (
                  <div>
                    <span className="font-medium text-gray-600">Experience: </span>
                    <span>{member.years} years</span>
                  </div>
                )}
                {member.bio && (
                  <div>
                    <span className="font-medium text-gray-600">Bio: </span>
                    <span>{member.bio}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No team members listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Component for Collaborators section
const CollaboratorsSection = ({ collaborators }: { collaborators: any }) => {
  const items = safelyParseArray(collaborators);
  
  return (
    <CategorySection title="Collaborators">
      <div className="space-y-4 w-full">
        {items.length > 0 ? (
          items.map((collaborator, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              {collaborator.media?.url && (
                <div className="relative w-full h-40">
                  <img
                    src={collaborator.media.url || "/placeholder.svg"}
                    alt={collaborator.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div>
                  <span className="font-medium text-gray-600">Name: </span>
                  <span>{collaborator.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Company: </span>
                  <span>{collaborator.company}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Role: </span>
                  <span>{collaborator.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Contribution: </span>
                  <span>{collaborator.contribution}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No collaborators listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Component for Advisors section
const AdvisorsSection = ({ advisors }: { advisors: any }) => {
  const items = safelyParseArray(advisors);
  
  return (
    <CategorySection title="Advisors">
      <div className="space-y-4 w-full">
        {items.length > 0 ? (
          items.map((advisor, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              {/* Display advisor details */}
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {advisor.name}</div>
                <div><span className="font-medium">Expertise:</span> {advisor.expertise}</div>
                <div><span className="font-medium">Year:</span> {advisor.year}</div>
                <div><span className="font-medium">Bio:</span> {advisor.bio}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No advisors listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Component for Partners section
const PartnersSection = ({ partners }: { partners: any }) => {
  const items = safelyParseArray(partners);
  
  return (
    <CategorySection title="Partners">
      <div className="space-y-4 w-full">
        {items.length > 0 ? (
          items.map((partner, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-md">
              {partner.media?.url && (
                <div className="relative w-full h-40">
                  <img
                    src={partner.media.url || "/placeholder.svg"}
                    alt={partner.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <div className="space-y-1">
                <div><span className="font-medium">Name:</span> {partner.name}</div>
                <div><span className="font-medium">Organization:</span> {partner.organization}</div>
                <div><span className="font-medium">Contribution:</span> {partner.contribution}</div>
                <div><span className="font-medium">Year:</span> {partner.year}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No partners listed</p>
        )}
      </div>
    </CategorySection>
  );
};

// Component for Testimonials section
const TestimonialsSection = ({ testimonials }: { testimonials: any }) => {
  const items = safelyParseArray(testimonials);
  
  return (
    <PageSection title="Testimonials">
      <CategorySection title="Associated Testimonials">
        <div className="space-y-4 w-full">
          {items.length > 0 ? (
            items.map((testimonial, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-md">
                {testimonial.media?.url && (
                  <div className="relative w-full h-40">
                    <img
                      src={testimonial.media.url || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <div><span className="font-medium">Name:</span> {testimonial.name}</div>
                  <div><span className="font-medium">Role:</span> {testimonial.role}</div>
                  <div><span className="font-medium">Organization:</span> {testimonial.organization}</div>
                  <div><span className="font-medium">Position:</span> {testimonial.position}</div>
                  <div><span className="font-medium">Company:</span> {testimonial.company}</div>
                  <div><span className="font-medium">Testimonial:</span> {testimonial.text}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No testimonials listed</p>
          )}
        </div>
      </CategorySection>
    </PageSection>
  );
};

// Component for Deliverables section
const DeliverablesSection = ({ deliverables }: { deliverables: any }) => {
  const items = safelyParseArray(deliverables);
  
  return (
    <div className="space-y-4 w-full">
      {items.length > 0 ? (
        items.map((deliverable, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-md">
            {deliverable.media?.url && (
              <div className="relative w-full h-40">
                <img
                  src={deliverable.media.url || "/placeholder.svg"}
                  alt={deliverable.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
            <div className="space-y-1">
              <div><span className="font-medium">Title:</span> {deliverable.title}</div>
              <div><span className="font-medium">Description:</span> {deliverable.description}</div>
              <div><span className="font-medium">Due Date:</span> {deliverable.due_date}</div>
              <div><span className="font-medium">Status:</span> {deliverable.status}</div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No deliverables listed</p>
      )}
    </div>
  );
};

// Component for Milestones section
const MilestonesSection = ({ milestones }: { milestones: any }) => {
  const items = safelyParseArray(milestones);
  
  return (
    <div className="space-y-4 w-full">
      {items.length > 0 ? (
        items.map((milestone, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-md">
            {milestone.media?.url && (
              <div className="relative w-full h-40">
                <img
                  src={milestone.media.url || "/placeholder.svg"}
                  alt={milestone.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
            <div className="space-y-1">
              <div><span className="font-medium">Title:</span> {milestone.title}</div>
              <div><span className="font-medium">Description:</span> {milestone.description}</div>
              <div><span className="font-medium">Date:</span> {milestone.date}</div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No milestones listed</p>
      )}
    </div>
  );
};

// Component for Portfolio section
const PortfolioSection = ({ deliverables, milestones }: { deliverables: any, milestones: any }) => {
  return (
    <PageSection title="Portfolio">
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <DeliverablesSection deliverables={deliverables} />
        <MilestonesSection milestones={milestones} />
      </div>
    </PageSection>
  );
};

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const currentUser = getCurrentUser();
  const isProjectOwner = currentUser?.id === project?.user_id;
  
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || undefined;
        if (!id) {
          throw new Error('Project ID is required');
        }
        const data = await fetchProject(id, token);
        setProject(data);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [id]);
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('token') || '';
      await deleteProject(id!, token);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Project not found</div>
      </div>
    );
  }

  const renderConditionalFields = () => {
    switch (project.project_type) {
      case "creative_work":
      case "creative_partnership":
        return (
          <div>
            <h3 className="block text-sm font-medium text-gray-700">
              {projectTypeFields[project.project_type].category_label}
            </h3>
            <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
              {project.project_category}
            </p>
          </div>
        );

      case "brand_work":
      case "brand_deal":
      case "brand_partnership":
        return (
          <div>
            <h3 className="block text-sm font-medium text-gray-700">Campaign Type</h3>
            <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
              {project.project_category}
            </p>
          </div>
        );

      case "freelance_services":
      case "contractor_services":
      case "contractor_products_supply":
      case "contractor_management_services":
        return (
          <div>
            <h3 className="block text-sm font-medium text-gray-700">Service Category</h3>
            <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
              {project.project_category}
            </p>
          </div>
        );

      default:
        return null;
    }
  }
  
  const teamMembers = safelyParseArray(project.team_members);
  const collaborators = safelyParseArray(project.collaborators);
  const advisors = safelyParseArray(project.advisors);
  const partners = safelyParseArray(project.partners);
  const testimonials = safelyParseArray(project.testimonials);
  const deliverables = safelyParseArray(project.deliverables);
  const milestones = safelyParseArray(project.milestones);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Details</h1>
        {isProjectOwner && (
          <Button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Project
          </Button>
        )}
      </div>
      
      {/* Wrap all sections in a single parent div */}
      <div className="space-y-8">
        {/* Basic Information */}
        <PageSection title="Basic Information">
          <CategorySection>
            <div className="space-y-6 w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
        {project.project_image ? (
            <img 
              src={project.project_image} 
                      alt="Project"
                      className="rounded-full object-cover w-full h-full"
            />
        ) : (
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
              </div>

              <DisplayField 
                label="Project Name"
                value={project.project_name}
              />

              <DisplayTextArea
                label="Project Description"
                value={project.project_description}
              />

              <DisplayField
                label="Project Type"
                value={project.project_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              />

              {renderConditionalFields()}
            </div>
          </CategorySection>
        </PageSection>
      
      {/* Project Details */}
        <PageSection title="Project Details">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Project Information">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Project Title</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.project_title}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Project Timeline</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.project_timeline}
                  </p>
                </div>
                {renderConditionalFields()}
              </div>
            </CategorySection>
            <CategorySection title="Target Audience">
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap gap-2">
                  {(project.target_audience || []).map((tag, index) => (
                    <PillTag 
                      key={index} 
                      text={tag} 
                    />
                  ))}
                  {(!project.target_audience || project.target_audience.length === 0) && (
                    <span className="text-gray-500">No target audience specified</span>
                  )}
                </div>
              </div>
            </CategorySection>
          </div>
          <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
            <CategorySection title="Client Info">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Client</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{project.client || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Client Location</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.client_location || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Client Website</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.client_website || 'Not specified'}
                  </p>
                </div>
              </div>
            </CategorySection>
            <CategorySection title="Contract Info">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Contract Type</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.contract_type || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Contract Duration</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.contract_duration || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Contract Value</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.contract_value || 'Not specified'}
                  </p>
                </div>
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Availability & Project Preferences */}
        <PageSection title="Availability & Project Preferences">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Availability">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Project Status</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.project_status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Preferred Collaboration Type</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.preferred_collaboration_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </p>
                </div>
              </div>
            </CategorySection>
            <CategorySection title="Budget">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Budget</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{project.budget || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Budget Range</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.budget_range || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Standard Rate</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.standard_rate || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Rate Type</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.rate_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Compensation Type</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.compensation_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </p>
                </div>
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Skills & Expertise */}
        <PageSection title="Skills & Expertise">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Required Skills">
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap gap-2">
                  {(project.skills_required || []).map((skill, index) => (
                    <PillTag 
                      key={index} 
                      text={skill} 
                      onRemove={() => {}}
                    />
                  ))}
                  {(!project.skills_required || project.skills_required.length === 0) && (
                    <span className="text-gray-500">No skills specified</span>
                  )}
                </div>
              </div>
            </CategorySection>

            <CategorySection title="Expertise Needed">
              <div className="space-y-4 w-full">
                <div className="flex flex-wrap gap-2">
                  {(project.expertise_needed || []).map((expertise, index) => (
                    <PillTag 
                      key={index} 
                      text={expertise} 
                      onRemove={() => {}}
                    />
                  ))}
                  {(!project.expertise_needed || project.expertise_needed.length === 0) && (
                    <span className="text-gray-500">No expertise specified</span>
                  )}
                </div>
              </div>
            </CategorySection>
          </div>
        </PageSection>
          
          {/* Team Members */}
        <PageSection title="Team">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <TeamMembersSection team_members={project.team_members} />
            <CollaboratorsSection collaborators={project.collaborators} />
          </div>
        </PageSection>

        {/* Industry & Technology Tags (Conditional) */}
        {showIndustryTechnologyTags.includes(project.project_type) && (
          <PageSection title="Tags & Categories">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title={industryTagsLabelMap[project.project_type] || "Industry Tags"}>
                <div className="space-y-4 w-full">
                  <DisplayTags
                    label={industryTagsLabelMap[project.project_type] || "Industry Tags"}
                    tags={project.industry_tags || []}
                  />
                </div>
              </CategorySection>

              <CategorySection title={technologyTagsLabelMap[project.project_type] || "Technology Tags"}>
                <div className="space-y-4 w-full">
                  <DisplayTags
                    label={technologyTagsLabelMap[project.project_type] || "Technology Tags"}
                    tags={project.technology_tags || []}
                  />
                </div>
              </CategorySection>
            </div>
          </PageSection>
        )}

        {/* Status */}
        <PageSection title="Status">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Project Status">
              <div className="w-full">
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {project.project_status_tag.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </p>
              </div>
            </CategorySection>

            <CategorySection title="Seeking">
              <div className="w-full">
                <div className="space-y-2">
                  {project.seeking_creator && (
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                      <span className="capitalize">Creator</span>
                    </div>
                  )}
                  {project.seeking_brand && (
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                      <span className="capitalize">Brand</span>
                    </div>
                  )}
                  {project.seeking_freelancer && (
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                      <span className="capitalize">Freelancer</span>
                    </div>
                  )}
                  {project.seeking_contractor && (
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                      <span className="capitalize">Contractor</span>
                    </div>
                  )}
                  {!project.seeking_creator && !project.seeking_brand && 
                   !project.seeking_freelancer && !project.seeking_contractor && (
                    <p className="text-gray-500">Not seeking any roles at the moment</p>
                  )}
                </div>
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Contact & Availability */}
        <PageSection title="Contact & Availability">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Social Links">
              <div className="space-y-4 w-full">
                {project.social_links_youtube && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700">YouTube</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                      <a href={project.social_links_youtube} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {project.social_links_youtube}
                      </a>
                    </p>
                  </div>
                )}
                {project.social_links_instagram && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700">Instagram</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                      <a href={project.social_links_instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {project.social_links_instagram}
                      </a>
                    </p>
                  </div>
                )}
                {project.social_links_github && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700">GitHub</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                      <a href={project.social_links_github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {project.social_links_github}
                      </a>
                    </p>
                  </div>
                )}
                {project.social_links_twitter && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700">Twitter</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                      <a href={project.social_links_twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {project.social_links_twitter}
                      </a>
                    </p>
                  </div>
                )}
                {project.social_links_linkedin && (
                  <div>
                    <h3 className="block text-sm font-medium text-gray-700">LinkedIn</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                      <a href={project.social_links_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {project.social_links_linkedin}
                      </a>
                    </p>
                  </div>
                )}
                {!project.social_links_youtube && !project.social_links_instagram && 
                 !project.social_links_github && !project.social_links_twitter && 
                 !project.social_links_linkedin && (
                  <p className="text-gray-500">No social links provided</p>
                )}
              </div>
            </CategorySection>
            <CategorySection title="Website Links">
              <div className="space-y-4 w-full">
                {(project.website_links || []).map((link, index) => (
                  <div key={index}>
                    <h3 className="block text-sm font-medium text-gray-700">Website {index + 1}</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{link}</p>
                  </div>
                ))}
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Team & Collaborators */}
        <PageSection title="Team & Collaborators">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <TeamMembersSection team_members={project.team_members} />
            <CollaboratorsSection collaborators={project.collaborators} />
          </div>
        </PageSection>

        {/* Advisors & Partners */}
        <PageSection title="Advisors & Partners">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <AdvisorsSection advisors={project.advisors} />
            <PartnersSection partners={project.partners} />
        </div>
        </PageSection>
        
        <TestimonialsSection testimonials={project.testimonials} />
        
        {/* Portfolio section */}
        {showPortfolio.includes(project.project_type) && (
          <PageSection title="Portfolio">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title={deliverablesLabelMap[project.project_type] || "Campaign Deliverables"}>
                <DeliverablesSection deliverables={project.deliverables} />
              </CategorySection>
              <CategorySection title={milestonesLabelMap[project.project_type] || "Campaign Milestones"}>
                <MilestonesSection milestones={project.milestones} />
              </CategorySection>
            </div>
          </PageSection>
        )}

        {/* Project Goals */}
        <PageSection title="Project Goals">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Short Term Goals">
              <div className="space-y-4 w-full">
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {project.short_term_goals || 'Not specified'}
                </p>
              </div>
            </CategorySection>
            <CategorySection title="Long Term Goals">
              <div className="space-y-4 w-full">
                <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                  {project.long_term_goals || 'Not specified'}
                </p>
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Privacy & Notifications */}
        <PageSection title="Privacy & Notifications">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Privacy Settings">
              <div className="space-y-4 w-full">
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Project Visibility</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.project_visibility?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-block w-4 h-4 mr-2 rounded-full ${
                      project.search_visibility ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span>
                    {project.search_visibility ? "Visible in search results" : "Not visible in search results"}
                  </span>
                </div>
              </div>
            </CategorySection>
            <CategorySection title="Notification Preferences">
              <div className="space-y-4 w-full">
                {project.notification_preferences ? (
                  Object.entries(project.notification_preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span
                        className={`inline-block w-4 h-4 mr-2 rounded-full ${value ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      <span className="capitalize">{key.replace(/_/g, " ")} Notifications</span>
              </div>
                  ))
                ) : (
                  <p>No notification preferences set</p>
                )}
              </div>
            </CategorySection>
          </div>
        </PageSection>

        {/* Client & Contract Info (Conditional) */}
        {showClientContractSections.includes(project.project_type) && (
          <PageSection title={clientInfoLabelMap[project.project_type] || "Client Info"}>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title={clientInfoLabelMap[project.project_type] || "Client Information"}>
                <div className="space-y-4 w-full">
                  <DisplayField 
                    label="Client"
                    value={project.client || 'Not specified'}
                  />
                  <DisplayField 
                    label="Client Location"
                    value={project.client_location || 'Not specified'}
                  />
                  <DisplayField 
                    label="Client Website"
                    value={project.client_website || 'Not specified'}
                  />
                </div>
              </CategorySection>

              <CategorySection title={contractInfoLabelMap[project.project_type] || "Contract Information"}>
                <div className="space-y-4 w-full">
                  <DisplayField 
                    label="Contract Type"
                    value={project.contract_type || 'Not specified'}
                  />
                  <DisplayField 
                    label="Contract Duration"
                    value={project.contract_duration || 'Not specified'}
                  />
                  <DisplayField 
                    label="Contract Value"
                    value={project.contract_value || 'Not specified'}
                  />
                </div>
              </CategorySection>
            </div>
          </PageSection>
        )}

        {/* Budget Section (Conditional) */}
        {showBudgetSection.includes(project.project_type) && (
          <PageSection title="Budget Information">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Budget Details">
                <div className="space-y-4 w-full">
                  <DisplayField 
                    label="Budget"
                    value={project.budget || 'Not specified'}
                  />
                  <DisplayField 
                    label="Budget Range"
                    value={project.budget_range || 'Not specified'}
                  />
                  <DisplayField 
                    label="Currency"
                    value={project.currency || 'Not specified'}
                  />
                </div>
              </CategorySection>
        </div>
          </PageSection>
        )}
      </div>
    </div>
  )
}

