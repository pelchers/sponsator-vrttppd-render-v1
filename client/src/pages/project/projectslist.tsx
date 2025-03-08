import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '@/api/projects';
import { Project } from '@/types/project';
import Layout from '@/components/layout/layout';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || undefined;
        const data = await fetchProjects(token);
        setProjects(data);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link 
          to="/projects/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link 
            key={project.id}
            to={`/projects/${project.id}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {project.project_image && (
              <div className="relative w-full h-48 mb-4">
                <img
                  src={project.project_image}
                  alt={project.project_name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{project.project_name}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {project.project_description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {project.project_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                project.project_status_tag === 'completed' ? 'bg-green-100 text-green-800' :
                project.project_status_tag === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.project_status_tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 