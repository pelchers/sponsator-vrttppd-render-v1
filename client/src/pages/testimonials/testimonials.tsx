import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect } from 'react';
import { fetchUserStats } from '@/api/userstats';
import { isAuthenticated } from '@/api/auth';
import { fetchSiteStats } from '@/api/stats';
import { SiteStats, UserStats } from '@/types/stats';
import { fetchFeaturedContent } from '@/api/featured';
import type { FeaturedContent } from '@/types/featured';
import { FeaturedContentSkeleton } from '@/components/skeletons/FeaturedContentSkeleton';
import UserCard from '@/components/cards/UserCard';
import ProjectCard from '@/components/cards/ProjectCard';
import ArticleCard from '@/components/cards/ArticleCard';
import PostCard from '@/components/cards/PostCard';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
// Import our testimonial components
import TestimonialsList from '@/components/testimonials/TestimonialsList';
import TestimonialForm from '@/components/testimonials/TestimonialForm';

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentStory, setCurrentStory] = useState(0);

  // Add auto-advance timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Tech Influencer • 1.2M Followers",
      image: "https://picsum.photos/100/100?random=1",
      quote: "The AI matching is incredible. I've found brand partnerships that perfectly align with my content and values.",
      stats: {
        deals: "45+ Deals Closed",
        rate: "98% Success Rate"
      }
    },
    {
      name: "Sarah Chen",
      role: "Beauty Creator • 800K Followers",
      image: "https://picsum.photos/100/100?random=2",
      quote: "The platform's analytics help me understand my true value and negotiate better partnerships.",
      stats: {
        deals: "30+ Campaigns",
        rate: "95% Client Retention"
      }
    },
    {
      name: "Marcus Johnson",
      role: "Fitness Expert • 2M Followers",
      image: "https://picsum.photos/100/100?random=3",
      quote: "Secure payments and clear contracts make it easy to focus on creating great content.",
      stats: {
        deals: "60+ Partnerships",
        rate: "40% Revenue Growth"
      }
    }
  ];

  const successStories = [
    {
      title: "Beauty Brand Collab",
      stats: "500K+ Reach • 25% Engagement",
      image: "https://picsum.photos/800/600?random=1"
    },
    {
      title: "Tech Launch Campaign",
      stats: "1M+ Impressions • 40K Conversions",
      image: "https://picsum.photos/800/600?random=2"
    },
    {
      title: "Fashion Collection",
      stats: "300K+ Sales • 15% Attribution",
      image: "https://picsum.photos/800/600?random=3"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      {/* 8. Success Stories Gallery */}
      <section className="relative py-16 px-4 bg-blue-600">
        <h2 className="text-4xl font-semibold text-center mb-8 text-white">Success Stories</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative pt-8">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4 pb-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
                      <div className="flex items-center gap-4 mb-6">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover" 
                        />
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <span className="text-sm text-blue-200">{testimonial.role}</span>
                        </div>
                      </div>
                      <p className="text-lg mb-6">"{testimonial.quote}"</p>
                      <div className="flex justify-between text-sm text-blue-200">
                        <span>{testimonial.stats.deals}</span>
                        <span>{testimonial.stats.rate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots - Exactly like How It Works */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-250 
                    ${currentTestimonial === index 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16">
          <div className="relative pt-8">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentStory * 100}%)` }}
              >
                {successStories.map((story, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4 pb-4 mt-4">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg 
                      transition-all duration-250 hover:scale-105">
                      <img 
                        src={story.image} 
                        alt={story.title} 
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h3 className="text-2xl font-semibold mb-2">{story.title}</h3>
                        <p>{story.stats}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots - Same as other carousels */}
            <div className="flex justify-center gap-2 mt-4">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStory(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-250 
                    ${currentStory === index 
                      ? 'bg-white w-6' 
                      : 'bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Testimonials Section */}
      <section className="py-16 px-4 bg-[#FFFEFF]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          
          {/* Display testimonials from our database */}
          <TestimonialsList 
            featured={false} 
            limit={6}
            showAll={true}
            className="mb-12"
          />
          
          <div className="text-center">
            <Button 
              className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
              onClick={() => document.getElementById('submit-testimonial')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Share Your Story
            </Button>
          </div>
        </div>
      </section>

      {/* Submit Testimonial Form */}
      <section id="submit-testimonial" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Share Your Experience</h2>
          <p className="text-center text-gray-600 mb-12">
            We'd love to hear about your success using our platform. Your story could inspire others!
          </p>
          
          <TestimonialForm />
        </div>
      </section>
    </div>
  );
}