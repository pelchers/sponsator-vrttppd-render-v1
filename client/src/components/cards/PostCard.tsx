import { Link } from 'react-router-dom';

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      {post.mediaUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={post.mediaUrl} 
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x150?text=Post';
            }}
          />
        </div>
      )}
      
      <div className="p-4 flex-grow">
        <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          By {post.username || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
        </p>
        
        <p className="text-gray-700 line-clamp-3 mb-4">
          {post.description || 'No description available'}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <span className="mr-3">{post.likes || 0} likes</span>
          <span>{post.comments || 0} comments</span>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link 
          to={`/post/${post.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Post
        </Link>
      </div>
    </div>
  );
} 