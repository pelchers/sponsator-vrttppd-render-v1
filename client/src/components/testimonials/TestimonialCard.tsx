import React from 'react';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Testimonial } from '@/api/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {testimonial.user && (
          <UserImage
            user={{
              profile_image_url: testimonial.user.profile_image_url,
              profile_image_upload: testimonial.user.profile_image_upload,
              profile_image_display: testimonial.user.profile_image_display
            }}
            className="w-12 h-12 rounded-full object-cover mr-4"
            fallback={<DefaultAvatar className="w-12 h-12 mr-4" />}
          />
        )}
        
        <div>
          <h3 className="font-semibold">{testimonial.user?.username}</h3>
          {(testimonial.company || testimonial.position) && (
            <p className="text-sm text-gray-600">
              {testimonial.position}
              {testimonial.position && testimonial.company && ', '}
              {testimonial.company}
            </p>
          )}
        </div>
      </div>
      
      {testimonial.title && (
        <h4 className="font-bold text-lg mb-2">{testimonial.title}</h4>
      )}
      
      <div className="flex mb-2">
        {renderStars(testimonial.rating)}
      </div>
      
      <p className="text-gray-700">
        {testimonial.content}
      </p>
      
      <div className="mt-4 text-xs text-gray-500">
        {new Date(testimonial.created_at).toLocaleDateString()}
      </div>
    </div>
  );
} 