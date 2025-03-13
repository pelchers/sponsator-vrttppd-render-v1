import { Link } from 'react-router-dom';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';

interface UserCardProps {
  user: any;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-4">
          {user.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={`${user.username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover mr-3"
              onError={(e) => {
                // Replace with DefaultAvatar component if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const avatar = document.createElement('div');
                  avatar.className = 'mr-3';
                  avatar.innerHTML = '<svg class="w-10 h-10 text-gray-300 bg-gray-100 rounded-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>';
                  parent.insertBefore(avatar, target);
                }
              }}
            />
          ) : (
            <DefaultAvatar className="w-10 h-10 mr-3" />
          )}
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