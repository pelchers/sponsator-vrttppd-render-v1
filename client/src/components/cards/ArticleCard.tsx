import { Link } from 'react-router-dom';

interface ArticleCardProps {
  article: any;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Extract first image from sections if available
  const getFirstImage = () => {
    if (!article.sections) return null;
    
    try {
      const sections = Array.isArray(article.sections) 
        ? article.sections 
        : JSON.parse(article.sections);
      
      const mediaSection = sections.find(
        (section: any) => 
          section.type === 'full-width-media' || 
          section.type === 'left-media-right-text' ||
          section.type === 'left-text-right-media'
      );
      
      return mediaSection?.media_url || null;
    } catch (e) {
      return null;
    }
  };
  
  const firstImage = getFirstImage();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      {firstImage && (
        <div className="h-40 overflow-hidden">
          <img 
            src={firstImage} 
            alt={article.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x150?text=Article';
            }}
          />
        </div>
      )}
      
      <div className="p-4 flex-grow">
        <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          By {article.username || 'Unknown'} • {new Date(article.created_at).toLocaleDateString()}
        </p>
        
        <p className="text-gray-700 line-clamp-3 mb-4">
          {article.excerpt || 'No excerpt available'}
        </p>
        
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link 
          to={`/article/${article.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Read Article
        </Link>
      </div>
    </div>
  );
} 