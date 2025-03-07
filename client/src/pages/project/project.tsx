import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, deleteProject } from '@/api/projects';
import PageSection from "@/components/sections/PageSection";
import CategorySection from "@/components/sections/CategorySection";
import PillTag from "@/components/input/forms/PillTag";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
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

const DisplaySeekingOptions = ({ seeking }: { seeking: Project['seeking'] }) => (
  <div className="flex flex-wrap gap-2">
    {Object.entries(SEEKING_OPTIONS).map(([key, label]) => (
      seeking[key as keyof typeof seeking] && (
        <span key={key} className="status-badge status-badge-green">
          {label}
        </span>
      )
    ))}
  </div>
);

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
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
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div>Project not found</div>
        </div>
      </Layout>
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
  
  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Project Details</h1>

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
                    {project.project_status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <h3 className="block text-sm font-medium text-gray-700">Preferred Collaboration Type</h3>
                  <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">
                    {project.preferred_collaboration_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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
        {showSkillsExpertise.includes(project.project_type) && (
          <PageSection title="Skills & Expertise">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <CategorySection title="Required Skills">
                <div className="space-y-4 w-full">
                  <DisplayTags 
                    label="Skills Required"
                    tags={project.skills_required || []}
                  />
                </div>
              </CategorySection>

              <CategorySection title="Expertise">
                <div className="space-y-4 w-full">
                  <DisplayTags
                    label="Expertise Needed"
                    tags={project.expertise_needed || []}
                  />
                </div>
              </CategorySection>
            </div>
          </PageSection>
          )}
          
          {/* Team Members */}
        <PageSection title="Team">
          <div className="md:grid md:grid-cols-2 md:gap-6">
            <CategorySection title="Team Members">
              <div className="space-y-4 w-full">
                {(project.team_members || []).map((member, index) => (
                  <div key={index} className="card">
                    {member.media?.url && (
                      <img 
                        src={member.media.url}
                        alt={member.name}
                        className="w-12 h-12 rounded-full mb-2"
                      />
                    )}
                    <div className="card-title">{member.name}</div>
                    <div className="card-subtitle">{member.role}</div>
                    {member.bio && (
                      <div className="mt-2 text-gray-600">{member.bio}</div>
                    )}
                    </div>
                ))}
                    </div>
            </CategorySection>

            <CategorySection title="Collaborators">
              <div className="space-y-4 w-full">
                {(project.collaborators || []).map((collaborator, index) => (
                  <div key={index} className="card">
                    {collaborator.media?.url && (
                      <img 
                        src={collaborator.media.url}
                        alt={collaborator.name}
                        className="w-12 h-12 rounded-full mb-2"
                      />
                    )}
                    <div className="card-title">{collaborator.name}</div>
                    <div className="card-subtitle">{collaborator.role} at {collaborator.company}</div>
                    <div className="card-meta">{collaborator.contribution}</div>
                  </div>
                ))}
              </div>
            </CategorySection>
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
                  {Object.entries(project.seeking).map(
                    ([role, isActive]) =>
                      isActive && (
                        <div key={role} className="flex items-center">
                          <span className="inline-block w-4 h-4 mr-2 bg-green-500 rounded-full"></span>
                          <span className="capitalize">{role.replace(/_/g, " ")}</span>
                        </div>
                      ),
                  )}
                  {Object.values(project.seeking).every((v) => !v) && (
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
                {project.social_links && Object.entries(project.social_links).map(([platform, url]) => (
                  <div key={platform}>
                    <h3 className="block text-sm font-medium text-gray-700 capitalize">{platform}</h3>
                    <p className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2">{url}</p>
                  </div>
                ))}
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
            <CategorySection title="Team Members">
              <div className="space-y-4 w-full">
                {(project.team_members || []).map((member, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{member.name}</h3>
                    <p>{member.role}</p>
                    <p>{member.years}</p>
                    {member.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={member.media?.url || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CategorySection>
            <CategorySection title="Collaborators">
              <div className="space-y-4 w-full">
                {(project.collaborators || []).map((collaborator, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{collaborator.name}</h3>
                    <p>{collaborator.company}</p>
                    <p>{collaborator.role}</p>
                    {collaborator.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={collaborator.media?.url || "/placeholder.svg"}
                          alt={collaborator.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CategorySection>
          </div>
          <div className="md:grid md:grid-cols-2 md:gap-6 mt-6">
            <CategorySection title="Advisors">
              <div className="space-y-4 w-full">
                {(project.advisors || []).map((advisor, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{advisor.name}</h3>
                    <p>{advisor.expertise}</p>
                    <p>{advisor.year}</p>
                    {advisor.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={advisor.media?.url || "/placeholder.svg"}
                          alt={advisor.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CategorySection>
            <CategorySection title="Partners">
              <div className="space-y-4 w-full">
                {(project.partners || []).map((partner, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{partner.name}</h3>
                    <p>{partner.contribution}</p>
                    <p>{partner.year}</p>
                    {partner.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={partner.media?.url || "/placeholder.svg"}
                          alt={partner.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
        </div>
                ))}
              </div>
            </CategorySection>
          </div>
          <CategorySection title="Testimonials">
            <div className="space-y-4 w-full">
              {(project.testimonials || []).map((testimonial, index) => (
                <div key={index} className="space-y-2 p-4 border rounded-md">
                  <h3 className="font-medium">{testimonial.name}</h3>
                  <p>
                    {testimonial.position} at {testimonial.company}
                  </p>
                  <p className="italic">"{testimonial.text}"</p>
                  {testimonial.media && (
                    <div className="relative w-full h-40">
                      <img
                        src={testimonial.media?.url || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CategorySection>
        </PageSection>

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

        {/* Portfolio */}
        {showPortfolio.includes(project.project_type) && (
          <PageSection title="Portfolio">
            <CategorySection title="Deliverables">
              <div className="space-y-4 w-full">
                {(project.deliverables || []).map((deliverable, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{deliverable.title || 'Untitled'}</h3>
                    <p>{deliverable.description || 'No description provided'}</p>
                    <div className="flex justify-between">
                      <span>Due: {new Date(deliverable.due_date || '').toLocaleDateString()}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          deliverable.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : deliverable.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {deliverable.status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                  </span>
                    </div>
                  </div>
                ))}
              </div>
            </CategorySection>
            <CategorySection title="Milestones">
              <div className="space-y-4 w-full">
                {(project.milestones || []).map((milestone, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <h3 className="font-medium">{milestone.title || 'Untitled'}</h3>
                    <p>{milestone.description || 'No description provided'}</p>
                    <p>Date: {new Date(milestone.date || '').toLocaleDateString()}</p>
                    {milestone.media && (
                      <div className="relative w-full h-40">
                        <img
                          src={milestone.media?.url || "/placeholder.svg"}
                          alt={milestone.title || 'Untitled'}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CategorySection>
          </PageSection>
        )}

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
    </Layout>
  )
}

