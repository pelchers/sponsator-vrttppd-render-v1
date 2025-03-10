import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: any;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      {project.project_image && (
        <div className="h-40 overflow-hidden">
          <img 
            src={project.project_image} 
            alt={project.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x150?text=Project';
            }}
          />
        </div>
      )}
      
      <div className="p-4 flex-grow">
        <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          By {project.username || 'Unknown'} • {project.project_type?.replace('_', ' ')}
        </p>
        
        <p className="text-gray-700 line-clamp-3 mb-4">
          {project.description || 'No description available'}
        </p>
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link 
          to={`/projects/${project.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Project
        </Link>
      </div>
    </div>
  );
} 