import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProject, deleteProject } from '@/api/projects';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/layout';

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Project ID is required');
          return;
        }
        
        const token = localStorage.getItem('token');
        const projectData = await fetchProject(id, token || undefined);
        setProject(projectData);
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
      
      const token = localStorage.getItem('token');
      if (!token || !id) {
        throw new Error('Authentication or project ID required');
      }
      
      await deleteProject(id, token);
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) return <div className="container mx-auto px-4 py-8">Loading project...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  if (!project) return <div className="container mx-auto px-4 py-8">Project not found</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.project_name}</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
            Edit Project
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
      
      {/* Project Header with Image */}
      <div className="mb-8">
        {project.project_image ? (
          <div className="h-64 md:h-80 overflow-hidden rounded-lg">
            <img 
              src={project.project_image} 
              alt={project.project_name} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-lg">No image available</span>
          </div>
        )}
      </div>
      
      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{project.project_description}</p>
          </section>
          
          {/* Project Type Information */}
          {project.project_type && (
            <section>
              <h2 className="text-2xl font-semibold mb-3">Project Type</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{project.project_type}</p>
                {project.project_category && <p className="text-gray-600">{project.project_category}</p>}
              </div>
            </section>
          )}
          
          {/* Team Members */}
          {project.team_members && project.team_members.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-3">Team</h2>
              <div className="space-y-4">
                {project.team_members.map((member: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 flex-shrink-0">
                      {/* Member image would go here */}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-gray-600">{member.role}</p>
                      {member.years && <p className="text-gray-500 text-sm">{member.years} years</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-3">Milestones</h2>
              <div className="space-y-4">
                {project.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="border-l-4 border-indigo-500 pl-4">
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-gray-600">{milestone.description}</p>
                    {milestone.date && <p className="text-gray-500 text-sm">{milestone.date}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Additional project details can be added here */}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          {project.project_tags && project.project_tags.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.project_tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Status */}
          {project.project_status && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <div className="px-3 py-1 inline-block bg-blue-100 text-blue-800 text-sm rounded-full">
                {project.project_status}
              </div>
            </section>
          )}
          
          {/* Skills Required */}
          {project.skills_required && project.skills_required.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills_required.map((skill: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Target Audience */}
          {project.target_audience && project.target_audience.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Target Audience</h3>
              <div className="flex flex-wrap gap-2">
                {project.target_audience.map((audience: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {audience}
                  </span>
                ))}
              </div>
            </section>
          )}
          
          {/* Social Links */}
          {project.social_links && Object.values(project.social_links).some(link => link) && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Social Media</h3>
              <div className="space-y-2">
                {project.social_links.instagram && (
                  <a href={project.social_links.instagram} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                    Instagram
                  </a>
                )}
                {project.social_links.youtube && (
                  <a href={project.social_links.youtube} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                    YouTube
                  </a>
                )}
                {project.social_links.twitter && (
                  <a href={project.social_links.twitter} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                    Twitter
                  </a>
                )}
                {project.social_links.linkedin && (
                  <a href={project.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                )}
                {project.social_links.github && (
                  <a href={project.social_links.github} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                    GitHub
                  </a>
                )}
              </div>
            </section>
          )}
          
          {/* Other sidebar sections can be added here */}
        </div>
      </div>
    </div>
  );
}
