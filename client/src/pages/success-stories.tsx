import React from 'react';
import TestimonialsList from '@/components/testimonials/TestimonialsList';
import TestimonialForm from '@/components/testimonials/TestimonialForm';

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Success Stories</h1>
      
      {/* Featured testimonials section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
        <TestimonialsList featured={true} limit={3} />
      </section>
      
      {/* Additional details section with white background */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-16">
        <h2 className="text-2xl font-bold mb-6">Why Our Platform Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-spring mb-2">93%</div>
            <p className="text-gray-700">of users report increased productivity</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-spring mb-2">78%</div>
            <p className="text-gray-700">found new collaboration opportunities</p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-spring mb-2">85%</div>
            <p className="text-gray-700">expanded their professional network</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">How Our Users Succeed</h3>
          <p className="text-gray-700 mb-4">
            Our platform provides the tools and connections needed to thrive in today's competitive landscape. 
            From freelancers finding consistent work to companies discovering top talent, our ecosystem 
            facilitates success across industries.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">For Creators & Freelancers</h4>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Find consistent, high-quality projects</li>
                <li>Build a professional portfolio</li>
                <li>Connect with industry leaders</li>
                <li>Access resources and training</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">For Businesses & Brands</h4>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Discover top creative talent</li>
                <li>Streamline collaboration processes</li>
                <li>Reduce hiring and onboarding time</li>
                <li>Scale your creative capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* All testimonials section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">All Success Stories</h2>
        <TestimonialsList limit={12} />
      </section>
      
      {/* Submit testimonial form */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Share Your Story</h2>
        <TestimonialForm />
      </section>
    </div>
  );
} 