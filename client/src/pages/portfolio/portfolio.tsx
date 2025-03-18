"use client" 

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import FilterGroup from '@/components/filters/FilterGroup';
import ResultsGrid from '@/components/results/ResultsGrid';
import { fetchUserPortfolio } from '@/api/userContent';
import { useNavigate, useParams } from 'react-router-dom';
import { SortSelect } from '@/components/sort/SortSelect';
import { SortOrder } from '@/components/sort/SortOrder';

// Define content types for "Show" filter
const contentTypes = [
  { id: 'posts', label: 'Posts' },
  { id: 'articles', label: 'Articles' },
  { id: 'projects', label: 'Projects' }
];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { userId: portfolioUserId } = useParams();
  
  // Get current user ID from localStorage (simplified approach)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Load current user ID on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd decode the token or fetch user info
      // For now, we'll just use a placeholder
      setCurrentUserId('current-user-id');
    }
  }, []);
  
  // Determine if viewing own portfolio or someone else's
  const isOwnPortfolio = currentUserId && (!portfolioUserId || portfolioUserId === currentUserId);
  
  // State for user info when viewing someone else's portfolio
  const [portfolioUser, setPortfolioUser] = useState<any>(null);
  
  // State for selected content filters - all selected by default
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
  
  // Add state for sorting
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Fetch user info if viewing someone else's portfolio
  useEffect(() => {
    if (portfolioUserId) {
      // Fetch user info - this would be implemented in your API
      // For now, we'll just set a placeholder
      setPortfolioUser({ username: 'User', id: portfolioUserId });
    }
  }, [portfolioUserId]);
  
  // Handle content type filter change
  const handleContentTypeChange = (selected: string[]) => {
    setSelectedContentTypes(selected);
    setPage(1); // Reset to first page when filters change
  };
  
  // Add handlers for sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Reset to page 1 when sort changes
    setPage(1);
  };
  
  const handleSortOrderChange = (value: 'asc' | 'desc') => {
    setSortOrder(value);
    // Reset to page 1 when sort order changes
    setPage(1);
  };
  
  // Fetch results based on filters
  const fetchResults = async () => {
    setLoading(true);
    try {
      // Don't use the placeholder value directly
      const targetUserId = portfolioUserId || (currentUserId !== 'current-user-id' ? currentUserId : '');
      
      console.log('Fetching portfolio for user:', targetUserId);
      
      // Call API with the correct endpoint
      const data = await fetchUserPortfolio({
        contentTypes: selectedContentTypes,
        userId: targetUserId,
        page,
        limit: 12,
        sortBy,
        sortOrder
      });
      
      console.log('Portfolio data received:', data);
      
      // Ensure all arrays exist even if API doesn't return them
      setResults({
        posts: data.results?.posts || [],
        articles: data.results?.articles || [],
        projects: data.results?.projects || []
      });
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching user portfolio:', error);
      // Reset to empty arrays on error
      setResults({
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
    if (portfolioUserId || currentUserId) {
      fetchResults();
    } else {
      // For development - show some mock data when no user ID is available
      setResults({
        posts: [{ 
          id: '1', 
          title: 'Sample Post', 
          content: 'This is a sample post',
          created_at: new Date().toISOString(),
          user: { id: '1', username: 'TestUser', profile_image: null }
        }],
        articles: [],
        projects: []
      });
      setLoading(false);
    }
  }, [selectedContentTypes, page, portfolioUserId, currentUserId, sortBy, sortOrder]);
  
  // Check if there are any results
  const hasResults = results.posts.length > 0 || 
                     results.articles.length > 0 || 
                     results.projects.length > 0;
  
  // Determine page title based on context
  const pageTitle = isOwnPortfolio 
    ? "My Portfolio" 
    : `${portfolioUser?.username}'s Portfolio`;
  
  // Get appropriate empty state message based on filters
  const getEmptyStateMessage = () => {
    if (selectedContentTypes.length === 0) {
      return "Select content types to display";
    }
    
    let contentText = "";
    if (selectedContentTypes.length === 1) {
      contentText = selectedContentTypes[0].slice(0, -1); // Remove 's' to get singular form
    } else {
      contentText = "content";
    }
    
    return isOwnPortfolio
      ? `You haven't created any ${contentText} yet.`
      : `${portfolioUser?.username} hasn't created any ${contentText} yet.`;
  };
  
  // Add this inside your component to inspect the data structure
  useEffect(() => {
    console.log('Current results structure:', results);
  }, [results]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>
      
      {/* Filters */}
      <div className="mb-8 space-y-6">
        <FilterGroup 
          title="Show Content" 
          options={contentTypes} 
          selected={selectedContentTypes} 
          onChange={handleContentTypeChange} 
        />
      </div>
      
      {/* No selection message */}
      {selectedContentTypes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Select content types to display</h3>
          <p className="mt-2 text-sm text-gray-500">
            Use the filters above to select what type of content you want to see.
          </p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && selectedContentTypes.length > 0 && !hasResults && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 mx-auto text-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No content found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {getEmptyStateMessage()}
          </p>
          {isOwnPortfolio && (
            <div className="mt-4 space-x-4">
              {selectedContentTypes.includes('posts') && (
                <Button onClick={() => navigate('/post/new')}>
                  Create Post
                </Button>
              )}
              {selectedContentTypes.includes('articles') && (
                <Button onClick={() => navigate('/article/new')}>
                  Write Article
                </Button>
              )}
              {selectedContentTypes.includes('projects') && (
                <Button onClick={() => navigate('/project/new')}>
                  Start Project
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Add sort controls */}
      {selectedContentTypes.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Sort by:</span>
          <SortSelect 
            value={sortBy} 
            onValueChange={handleSortChange} 
            className="w-40"
          />
          <SortOrder 
            order={sortOrder} 
            onChange={handleSortOrderChange}
          />
        </div>
      )}
      
      {/* Results */}
      {selectedContentTypes.length > 0 && (
        <ResultsGrid 
          results={results} 
          loading={loading} 
          contentTypes={selectedContentTypes}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onSortOrderChange={handleSortOrderChange}
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