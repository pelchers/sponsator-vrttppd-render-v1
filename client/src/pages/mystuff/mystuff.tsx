"use client" 

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FilterGroup from '@/components/filters/FilterGroup';
import ResultsGrid from '@/components/results/ResultsGrid';
import { fetchUserInteractions } from '@/api/userContent';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@/components/icons/HeartIcon';

// Define content types for "Show" filter
const contentTypes = [
  { id: 'users', label: 'Users' },
  { id: 'posts', label: 'Posts' },
  { id: 'articles', label: 'Articles' },
  { id: 'projects', label: 'Projects' }
];

// Define interaction types filter
const interactionTypes = [
  { id: 'likes', label: 'Likes' },
  { id: 'follows', label: 'Follows' },
  { id: 'watches', label: 'Watches' }
];

export default function MyStuffPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Get the logged-in user's ID
  
  // State for selected content filters - all selected by default
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['users', 'posts', 'articles', 'projects']);
  
  // State for selected interaction filters - all selected by default
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState<string[]>(['likes', 'follows', 'watches']);
  
  // State for results
  const [results, setResults] = useState({
    users: [],
    posts: [],
    articles: [],
    projects: []
  });
  
  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Handle content type filter change
  const handleContentTypeChange = (selected: string[]) => {
    setSelectedContentTypes(selected);
    setPage(1); // Reset to first page when filters change
  };
  
  // Handle interaction type filter change
  const handleInteractionTypeChange = (selected: string[]) => {
    setSelectedInteractionTypes(selected);
    setPage(1); // Reset to first page when filters change
  };
  
  // Fetch results based on filters
  const fetchResults = async () => {
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    setLoading(true);
    try {
      // Call API with userId to ensure we only get the user's interactions
      const data = await fetchUserInteractions({
        contentTypes: selectedContentTypes,
        interactionTypes: selectedInteractionTypes,
        page,
        limit: 12,
        userId // Pass the userId to filter interactions by this user
      });
      
      // Ensure all arrays exist even if API doesn't return them
      setResults({
        users: data.results.users || [],
        posts: data.results.posts || [],
        articles: data.results.articles || [],
        projects: data.results.projects || []
      });
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching user interactions:', error);
      // Reset to empty arrays on error
      setResults({
        users: [],
        posts: [],
        articles: [],
        projects: []
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch results when filters or page changes
  useEffect(() => {
    fetchResults();
  }, [selectedContentTypes, selectedInteractionTypes, page]);
  
  // Check if there are any results
  const hasResults = results.users.length > 0 || 
                     results.posts.length > 0 || 
                     results.articles.length > 0 || 
                     results.projects.length > 0;
  
  // Get appropriate empty state message based on filters
  const getEmptyStateMessage = () => {
    if (selectedInteractionTypes.length === 0 || selectedContentTypes.length === 0) {
      return "Select content and interaction types to display";
    }
    
    let interactionText = "";
    if (selectedInteractionTypes.length === 1) {
      if (selectedInteractionTypes[0] === 'likes') interactionText = "liked";
      if (selectedInteractionTypes[0] === 'follows') interactionText = "followed";
      if (selectedInteractionTypes[0] === 'watches') interactionText = "watched";
    } else {
      interactionText = "interacted with";
    }
    
    let contentText = "";
    if (selectedContentTypes.length === 1) {
      contentText = selectedContentTypes[0].slice(0, -1); // Remove 's' to get singular form
    } else {
      contentText = "content";
    }
    
    return `You haven't ${interactionText} any ${contentText} yet.`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Stuff</h1>
      
      {/* Filters */}
      <div className="mb-8 space-y-6">
        <FilterGroup 
          title="Show Content" 
          options={contentTypes} 
          selected={selectedContentTypes} 
          onChange={handleContentTypeChange} 
        />
        
        <FilterGroup 
          title="Interaction Types" 
          options={interactionTypes} 
          selected={selectedInteractionTypes} 
          onChange={handleInteractionTypeChange} 
        />
      </div>
      
      {/* No selection message */}
      {(selectedContentTypes.length === 0 || selectedInteractionTypes.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Select filters to display content</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the filters above to select what type of content and interactions you want to see.
          </p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && selectedContentTypes.length > 0 && selectedInteractionTypes.length > 0 && !hasResults && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No content found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {getEmptyStateMessage()}
          </p>
          <Button 
            onClick={() => navigate('/explore')} 
            className="mt-4"
          >
            Explore Content
          </Button>
        </div>
      )}
      
      {/* Results */}
      {selectedContentTypes.length > 0 && selectedInteractionTypes.length > 0 && (
        <ResultsGrid 
          results={results} 
          loading={loading} 
          contentTypes={selectedContentTypes}
        />
      )}
      
      {/* Pagination */}
      {totalPages > 1 && hasResults && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            variant="outline"
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>
          <Button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 