"use client" 

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FilterGroup from '@/components/filters/FilterGroup';
import ResultsGrid from '@/components/results/ResultsGrid';
import { fetchUserLikes } from '@/api/userContent';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from '@/components/icons/HeartIcon';

// Define content types for "Show" filter
const contentTypes = [
  { id: 'posts', label: 'Posts' },
  { id: 'articles', label: 'Articles' },
  { id: 'projects', label: 'Projects' }
];

export default function LikesPage() {
  const navigate = useNavigate();
  
  // State for selected filters - all selected by default
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['posts', 'articles', 'projects']);
  
  // State for results
  const [results, setResults] = useState({
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
  
  // Fetch results based on filters
  const fetchResults = async () => {
    setLoading(true);
    try {
      // Call API
      const data = await fetchUserLikes({
        contentTypes: selectedContentTypes,
        page,
        limit: 12
      });
      
      setResults(data.results);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching liked content:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch results when filters or page changes
  useEffect(() => {
    fetchResults();
  }, [selectedContentTypes, page]);
  
  // Check if there are any results
  const hasResults = results.posts.length > 0 || 
                     results.articles.length > 0 || 
                     results.projects.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Likes</h1>
      
      {/* Filters */}
      <div className="mb-8">
        <FilterGroup 
          title="Show" 
          options={contentTypes} 
          selected={selectedContentTypes} 
          onChange={handleContentTypeChange} 
        />
      </div>
      
      {/* No selection message */}
      {selectedContentTypes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Select content to display</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the "Show" filter to select what type of content you want to see.
          </p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && selectedContentTypes.length > 0 && !hasResults && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No liked content found</h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't liked any {selectedContentTypes.length === 1 
              ? selectedContentTypes[0].replace('s', '') 
              : 'content'} yet.
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
      {selectedContentTypes.length > 0 && (
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