import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProjects } from '@/api/projects';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/layout';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }
        
        const token = localStorage.getItem('token');
        const projectsData = await fetchUserProjects(userId, token);
        setProjects(projectsData);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, [navigate]);
  
  if (loading) return <div className="container mx-auto px-4 py-8">Loading projects...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={() => navigate('/projects/new')}>Create New Project</Button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">You don't have any projects yet</p>
          <Button onClick={() => navigate('/projects/new')}>Create Your First Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <div key={project.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {project.project_image ? (
                <img 
                  src={project.project_image} 
                  alt={project.project_name} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{project.project_name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.project_description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.project_tags?.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {project.project_status || "Draft"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={() => navigate(`/projects/${project.id}`)}>
                    View
                  </Button>
                  <Button onClick={() => navigate(`/projects/${project.id}/edit`)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 