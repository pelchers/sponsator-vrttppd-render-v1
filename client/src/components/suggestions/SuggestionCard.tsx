import React from 'react';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Suggestion } from '@/api/suggestions';
import { Link } from 'react-router-dom';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  // Function to get status badge color
  const getStatusColor = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Function to get category badge color
  const getCategoryColor = (category: string = 'other') => {
    switch (category.toLowerCase()) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bug': return 'bg-red-100 text-red-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {suggestion.user && (
          <UserImage
            user={{
              profile_image_url: suggestion.user.profile_image_url,
              profile_image_upload: suggestion.user.profile_image_upload,
              profile_image_display: suggestion.user.profile_image_display
            }}
            className="w-10 h-10 rounded-full object-cover mr-3"
            fallback={<DefaultAvatar className="w-10 h-10 mr-3" />}
          />
        )}
        
        <div>
          <h3 className="font-semibold">{suggestion.user?.username || 'Anonymous'}</h3>
          <p className="text-xs text-gray-500">
            {new Date(suggestion.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <Link to={`/suggestions/${suggestion.id}`} className="block hover:opacity-90">
        <h4 className="font-bold text-lg mb-2">{suggestion.title}</h4>
      </Link>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestion.category && (
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(suggestion.category)}`}>
            {suggestion.category}
          </span>
        )}
        
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(suggestion.status)}`}>
          {suggestion.status || 'Pending'}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">
        {suggestion.description}
      </p>
      
      {suggestion.admin_comments && (
        <div className="mt-4 border-t pt-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-1">Admin Response:</h5>
          <p className="text-sm text-gray-600 italic">
            {suggestion.admin_comments}
          </p>
        </div>
      )}
    </div>
  );
} 