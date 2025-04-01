import React, { useState, useEffect } from 'react';
import { fetchSuggestions, Suggestion } from '@/api/suggestions';
import SuggestionCard from '@/components/suggestions/SuggestionCard';

interface SuggestionsListProps {
  status?: string;
  category?: string;
  limit?: number;
  className?: string;
  showAll?: boolean;
}

export default function SuggestionsList({ 
  status,
  category,
  limit = 10,
  className = '',
  showAll = false
}: SuggestionsListProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const data = await fetchSuggestions({ status, category, limit, showAll });
        setSuggestions(data);
      } catch (err) {
        console.error('Error loading suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    
    loadSuggestions();
  }, [status, category, limit, showAll]);
  
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No suggestions yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Be the first to submit a suggestion!
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </div>
  );
} 