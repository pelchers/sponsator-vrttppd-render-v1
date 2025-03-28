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
import { HeartIcon } from '@/components/icons/HeartIcon';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import CommentsSection from '@/components/comments/CommentsSection';
import { ProjectImage } from '@/components/ProjectImage';

const DisplayField = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="form-group">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="info-value border border-black p-2 rounded-lg bg-white">
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
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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

  useEffect(() => {
    const fetchLikeData = async () => {
      if (!project) return;
      
      try {
        const count = await getLikeCount('project', project.id);
        setLikeCount(count);
        
        const hasLiked = await checkLikeStatus('project', project.id);
        setLiked(hasLiked);
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [project]);
  
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
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !project) return;
    
    setIsLoading(true);
    
    const wasLiked = liked;
    const previousCount = likeCount;
    
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      let newCount;
      if (liked) {
        await unlikeEntity('project', project.id);
        newCount = await getLikeCount('project', project.id);
        setLiked(false);
      } else {
        await likeEntity('project', project.id);
        newCount = await getLikeCount('project', project.id);
        setLiked(true);
      }
      
      setLikeCount(newCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(wasLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-semibold">{project.project_name}</h1>
              {isProjectOwner && (
                <Button
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Edit Project
                </Button>
              )}
            </div>
            
            <div className="flex justify-center items-center space-x-6 mt-4">
              <div className="flex flex-col items-center">
                <button 
                  onClick={handleLikeToggle}
                  disabled={isLoading}
                  className={`flex items-center gap-1 text-sm ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                  } transition-colors`}
                  aria-label={liked ? "Unlike" : "Like"}
                >
                  <HeartIcon filled={liked} className="w-6 h-6" />
                  <span className="font-medium">{likeCount}</span>
                </button>
                <span className="text-xs text-gray-500 mt-1">Likes</span>
              </div>

              <div className="flex flex-col items-center">
                <WatchButton 
                  entityType="project"
                  entityId={project.id}
                  initialWatching={false}
                  initialCount={project.watches_count || 0}
                  showCount={true}
                  size="lg"
                  variant="ghost"
                />
                <span className="text-xs text-gray-500 mt-1">Watching</span>
              </div>

              <div className="flex flex-col items-center">
                <FollowButton 
                  entityType="project"
                  entityId={project.id}
                  initialFollowing={false}
                  initialCount={project.followers_count || 0}
                  showCount={true}
                  size="lg"
                  variant="ghost"
                />
                <span className="text-xs text-gray-500 mt-1">Followers</span>
              </div>
            </div>
          </div>
          
          <PageSection title="Project Details">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Project Details</h2>
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Project Information">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Title</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_title || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Timeline</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_timeline || 'Not specified'}
                      </div>
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
                      <h3 className="text-xl font-bold mb-4">Client</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.client || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Client Location</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.client_location || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Client Website</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.client_website || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CategorySection>
                <CategorySection title="Contract Info">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Contract Type</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.contract_type || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Contract Duration</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.contract_duration || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Contract Value</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.contract_value || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Availability & Project Preferences">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Availability">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Status</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Preferred Collaboration Type</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.preferred_collaboration_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CategorySection>
                <CategorySection title="Budget">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Budget</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.budget || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Budget Range</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.budget_range || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Standard Rate</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.standard_rate || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Rate Type</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.rate_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Compensation Type</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.compensation_type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Skills & Expertise">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Required Skills">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.skills_required || []).map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!project.skills_required || project.skills_required.length === 0) && (
                        <span className="text-gray-500">No skills specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title="Expertise Needed">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.expertise_needed || []).map((expertise, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {expertise}
                        </span>
                      ))}
                      {(!project.expertise_needed || project.expertise_needed.length === 0) && (
                        <span className="text-gray-500">No expertise specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title="Target Audience">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.target_audience || []).map((audience, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {audience}
                        </span>
                      ))}
                      {(!project.target_audience || project.target_audience.length === 0) && (
                        <span className="text-gray-500">No target audience specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title="Solutions Offered">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.solutions_offered || []).map((solution, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {solution}
                        </span>
                      ))}
                      {(!project.solutions_offered || project.solutions_offered.length === 0) && (
                        <span className="text-gray-500">No solutions specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>
          
          <PageSection title="Team">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <TeamMembersSection team_members={project.team_members} />
                <CollaboratorsSection collaborators={project.collaborators} />
              </div>
            </div>
          </PageSection>

          <PageSection title="Tags & Categories">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Project Tags">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.project_tags || []).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!project.project_tags || project.project_tags.length === 0) && (
                        <span className="text-gray-500">No project tags specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title={industryTagsLabelMap[project.project_type] || "Industry Tags"}>
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.industry_tags || []).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!project.industry_tags || project.industry_tags.length === 0) && (
                        <span className="text-gray-500">No industry tags specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>

                <CategorySection title={technologyTagsLabelMap[project.project_type] || "Technology Tags"}>
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap gap-0.5">
                      {(project.technology_tags || []).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-orange-light text-black border border-black transition-all duration-250 hover:scale-105"
                        >
                          {tag}
                        </span>
                      ))}
                      {(!project.technology_tags || project.technology_tags.length === 0) && (
                        <span className="text-gray-500">No technology tags specified</span>
                      )}
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Status">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Project Status">
                  <div className="w-full">
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {project.project_status_tag.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
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
            </div>
          </PageSection>

          <PageSection title="Contact & Availability">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Social Links">
                  <div className="space-y-4 w-full">
                    {project.social_links_youtube && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">YouTube</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          <a href={project.social_links_youtube} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {project.social_links_youtube}
                          </a>
                        </div>
                      </div>
                    )}
                    {project.social_links_instagram && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Instagram</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          <a href={project.social_links_instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {project.social_links_instagram}
                          </a>
                        </div>
                      </div>
                    )}
                    {project.social_links_github && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">GitHub</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          <a href={project.social_links_github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {project.social_links_github}
                          </a>
                        </div>
                      </div>
                    )}
                    {project.social_links_twitter && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">Twitter</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          <a href={project.social_links_twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {project.social_links_twitter}
                          </a>
                        </div>
                      </div>
                    )}
                    {project.social_links_linkedin && (
                      <div>
                        <h3 className="text-xl font-bold mb-4">LinkedIn</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          <a href={project.social_links_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {project.social_links_linkedin}
                          </a>
                        </div>
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
                        <h3 className="text-xl font-bold mb-4">Website {index + 1}</h3>
                        <div className="info-value border border-black p-2 rounded-lg bg-white">
                          {link}
                        </div>
                      </div>
                    ))}
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Team & Collaborators">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <TeamMembersSection team_members={project.team_members} />
                <CollaboratorsSection collaborators={project.collaborators} />
              </div>
            </div>
          </PageSection>

          <PageSection title="Advisors & Partners">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <AdvisorsSection advisors={project.advisors} />
                <PartnersSection partners={project.partners} />
              </div>
            </div>
          </PageSection>
          
          <TestimonialsSection testimonials={project.testimonials} />
          
          <PageSection title="Portfolio">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title={deliverablesLabelMap[project.project_type] || "Campaign Deliverables"}>
                  <DeliverablesSection deliverables={project.deliverables} />
                </CategorySection>
                <CategorySection title={milestonesLabelMap[project.project_type] || "Campaign Milestones"}>
                  <MilestonesSection milestones={project.milestones} />
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Project Goals">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Short Term Goals">
                  <div className="space-y-4 w-full">
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {project.short_term_goals || 'Not specified'}
                    </div>
                  </div>
                </CategorySection>
                <CategorySection title="Long Term Goals">
                  <div className="space-y-4 w-full">
                    <div className="info-value border border-black p-2 rounded-lg bg-white">
                      {project.long_term_goals || 'Not specified'}
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>

          <PageSection title="Privacy & Notifications">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Privacy Settings">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Visibility</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_visibility?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || 'Not specified'}
                      </div>
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
            </div>
          </PageSection>

          {showClientContractSections.includes(project.project_type) && (
            <PageSection title={clientInfoLabelMap[project.project_type] || "Client Info"}>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
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
              </div>
            </PageSection>
          )}

          {showBudgetSection.includes(project.project_type) && (
            <PageSection title="Budget Information">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
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
              </div>
            </PageSection>
          )}

          <PageSection title="Project Handle">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <CategorySection title="Project Details">
                  <div className="space-y-4 w-full">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Handle</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_handle || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Project Duration</h3>
                      <div className="info-value border border-black p-2 rounded-lg bg-white">
                        {project.project_duration || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </CategorySection>
              </div>
            </div>
          </PageSection>
        </div>
        
        {project && (
          <CommentsSection 
            entityType="project"
            entityId={project.id}
          />
        )}
      </div>
    </div>
  )
}

