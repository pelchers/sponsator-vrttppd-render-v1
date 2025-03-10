import { Link } from 'react-router-dom';

interface UserCardProps {
  user: any;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-4">
          <img 
            src={user.profile_image || 'https://via.placeholder.com/40'} 
            alt={user.username} 
            className="w-10 h-10 rounded-full mr-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/40?text=User';
            }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500 capitalize">{user.user_type || 'User'}</p>
          </div>
        </div>
        
        <p className="text-gray-700 line-clamp-3 mb-4">
          {user.bio || 'No bio available'}
        </p>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link 
          to={`/profile/${user.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
} 