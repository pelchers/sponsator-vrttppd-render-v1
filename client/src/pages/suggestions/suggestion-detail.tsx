import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSuggestion, Suggestion } from '@/api/suggestions';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Button } from '@/components/ui/button';

export default function SuggestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSuggestion = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchSuggestion(id);
        setSuggestion(data);
      } catch (err) {
        console.error('Error loading suggestion:', err);
        setError('Failed to load suggestion details');
      } finally {
        setLoading(false);
      }
    };
    
    loadSuggestion();
  }, [id]);
  
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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !suggestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Suggestion not found'}
        </div>
        <div className="text-center mt-6">
          <Link to="/suggestions">
            <Button variant="outline">Back to Suggestions</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/suggestions" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Suggestions
        </Link>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{suggestion.title}</h1>
          
          <div className="flex items-center mb-6">
            {suggestion.user && (
              <UserImage
                user={{
                  profile_image_url: suggestion.user.profile_image_url,
                  profile_image_upload: suggestion.user.profile_image_upload,
                  profile_image_display: suggestion.user.profile_image_display
                }}
                className="w-12 h-12 rounded-full object-cover mr-4"
                fallback={<DefaultAvatar className="w-12 h-12 mr-4" />}
              />
            )}
            
            <div>
              <h3 className="font-semibold">{suggestion.user?.username || 'Anonymous'}</h3>
              <p className="text-sm text-gray-500">
                {new Date(suggestion.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestion.category && (
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(suggestion.category)}`}>
                {suggestion.category}
              </span>
            )}
            
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(suggestion.status)}`}>
              {suggestion.status || 'Pending'}
            </span>
            
            {suggestion.priority && (
              <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                Priority: {suggestion.priority}
              </span>
            )}
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line">{suggestion.description}</p>
          </div>
          
          {suggestion.admin_comments && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Admin Response:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-line">{suggestion.admin_comments}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 