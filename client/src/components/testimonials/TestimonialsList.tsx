import React, { useState, useEffect } from 'react';
import { fetchTestimonials, Testimonial } from '@/api/testimonials';
import TestimonialCard from '@/components/testimonials/TestimonialCard';

interface TestimonialsListProps {
  featured?: boolean;
  limit?: number;
  className?: string;
  showAll?: boolean;
}

export default function TestimonialsList({ 
  featured = false, 
  limit = 6,
  className = '',
  showAll = false
}: TestimonialsListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        console.log('Fetching testimonials with params:', { featured, limit, showAll });
        const data = await fetchTestimonials({ featured, limit, showAll });
        console.log('Testimonials received:', data);
        setTestimonials(data);
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };
    
    loadTestimonials();
  }, [featured, limit, showAll]);
  
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
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
  
  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No testimonials yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Be the first to share your success story!
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Debug info: featured={featured.toString()}, showAll={showAll.toString()}, limit={limit}
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
} 