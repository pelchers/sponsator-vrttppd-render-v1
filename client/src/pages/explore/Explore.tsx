"use client" 

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import SearchBar from '@/components/search/SearchBar';
import FilterGroup from '@/components/filters/FilterGroup';
import ResultsGrid from '@/components/results/ResultsGrid';
import { searchAll } from '@/api/explore';

// Define content types for "Show" filter
const contentTypes = [
  { id: 'users', label: 'Users' },
  { id: 'projects', label: 'Projects' },
  { id: 'articles', label: 'Articles' },
  { id: 'posts', label: 'Posts' }
];

// Define user types for "Type" filter
const userTypes = [
  { id: 'creator', label: 'Creator' },
  { id: 'brand', label: 'Brand' },
  { id: 'freelancer', label: 'Freelancer' },
  { id: 'contractor', label: 'Contractor' }
];

export default function ExplorePage() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for selected filters - empty arrays by default (nothing selected)
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  
  // State for results
  const [results, setResults] = useState({
    users: [],
    projects: [],
    articles: [],
    posts: []
  });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle content type filter change
  const handleContentTypeChange = (selected: string[]) => {
    setSelectedContentTypes(selected);
  };
  
  // Handle user type filter change
  const handleUserTypeChange = (selected: string[]) => {
    setSelectedUserTypes(selected);
  };
  
  // Fetch results based on search query and filters
  const fetchResults = async () => {
    // Only fetch if at least one content type is selected
    if (selectedContentTypes.length === 0) {
      setResults({
        users: [],
        projects: [],
        articles: [],
        posts: []
      });
      return;
    }
    
    setLoading(true);
    try {
      // Call API
      const data = await searchAll(searchQuery, {
        contentTypes: selectedContentTypes,
        userTypes: selectedUserTypes,
        page,
        limit: 12
      });
      
      setResults(data.results);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch results when search query, filters, or page changes
  useEffect(() => {
    fetchResults();
  }, [searchQuery, selectedContentTypes, selectedUserTypes, page]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Explore</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar 
          value={searchQuery} 
          onChange={handleSearchChange} 
          onSearch={fetchResults}
        />
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FilterGroup 
          title="Show" 
          options={contentTypes} 
          selected={selectedContentTypes} 
          onChange={handleContentTypeChange} 
        />
        <FilterGroup 
          title="Filter by" 
          options={userTypes} 
          selected={selectedUserTypes} 
          onChange={handleUserTypeChange} 
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
      
      {/* Results */}
      {selectedContentTypes.length > 0 && (
        <ResultsGrid 
          results={results} 
          loading={loading} 
          contentTypes={selectedContentTypes}
        />
      )}
      
      {/* Pagination */}
      {totalPages > 1 && selectedContentTypes.length > 0 && (
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