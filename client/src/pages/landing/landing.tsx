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

const SHOW_WAITLIST = false;  // Toggle this when ready to show waitlist

export default function Landing() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const userId = localStorage.getItem('userId');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent>({
    users: [],
    projects: [],
    articles: [],
    posts: [],
    comments: []
  });
  const [allContent, setAllContent] = useState<FeaturedContent>({
    users: [],
    projects: [],
    articles: [],
    posts: [],
    comments: []
  });
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      number: 1,
      emoji: "🎯",
      title: "Create Profile",
      description: "Set up your verified profile as a creator or brand",
      points: ["Portfolio showcase", "Metrics verification", "Audience analytics"]
    },
    {
      number: 2,
      emoji: "🤖",
      title: "Smart Match",
      description: "Our AI matches you with perfect partners",
      points: ["Interest alignment", "Audience fit", "Value matching"]
    },
    {
      number: 3,
      emoji: "🤝",
      title: "Collaborate",
      description: "Connect, negotiate, and create together",
      points: ["Secure messaging", "Contract tools", "Project management"]
    }
  ];

  // Add state for success stories slider
  const [currentStory, setCurrentStory] = useState(0);
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

  useEffect(() => {
    if (userId && isAuthenticated()) {
      fetchUserStats(userId).then(stats => setUserStats(stats));
    }
    
    fetchSiteStats().then(stats => setSiteStats(stats));
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchFeaturedContent({ featuredOnly: true }),
      fetchFeaturedContent({ featuredOnly: false })
    ])
      .then(([featured, all]) => {
        setFeaturedContent(featured || { users: [], projects: [], articles: [], posts: [], comments: [] });
        setAllContent(all || { users: [], projects: [], articles: [], posts: [], comments: [] });
      })
      .catch(error => {
        console.error('Error fetching content:', error);
        // Set empty arrays on error
        const emptyContent = { users: [], projects: [], articles: [], posts: [], comments: [] };
        setFeaturedContent(emptyContent);
        setAllContent(emptyContent);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance success stories
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useScrollAnimation(); // Initialize scroll animations

  if (userId && isAuthenticated() && userStats) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <section className="w-full bg-[#2563EB] text-white shadow-sm py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
              <Button 
                onClick={() => navigate('/explore')}
                variant="spring"
              >
                Explore Content
              </Button>
            </div>
            
            {/* Platform Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce">👥</div>
                <div className="font-honk text-5xl animate-float">{siteStats?.totalUsers || '...'}</div>
                <div className="text-lg mt-2">Community Members</div>
                <div className="text-sm text-blue-200">Growing Daily</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce delay-100">🚀</div>
                <div className="font-honk text-5xl animate-float-delay-1">{siteStats?.totalProjects || '...'}</div>
                <div className="text-lg mt-2">Total Projects</div>
                <div className="text-sm text-blue-200">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce delay-200">📝</div>
                <div className="font-honk text-5xl animate-float-delay-2">{siteStats?.totalArticles || '...'}</div>
                <div className="text-lg mt-2">Total Articles</div>
                <div className="text-sm text-blue-200">Published Content</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce delay-300">📱</div>
                <div className="font-honk text-5xl animate-float">{siteStats?.totalPosts || '...'}</div>
                <div className="text-lg mt-2">Total Posts</div>
                <div className="text-sm text-blue-200">Shared Updates</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-semibold text-center mb-16">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
              <Link 
                to="/projects"
                className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 group"
              >
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Projects</h3>
                <p className="text-sm text-gray-600">Manage your projects</p>
              </Link>
              
              <Link 
                to="/article"
                className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 group"
              >
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Articles</h3>
                <p className="text-sm text-gray-600">Write and manage articles</p>
              </Link>
              
              <Link 
                to="/post"
                className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 group"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">Posts</h3>
                <p className="text-sm text-gray-600">Share updates</p>
              </Link>
              
              <Link 
                to="/mystuff"
                className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 group"
              >
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600">My Stuff</h3>
                <p className="text-sm text-gray-600">View liked, watched, and followed content</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 bg-[#FFFEFF]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl font-semibold text-center mb-16">Featured Content</h2>
            {loading ? (
              <FeaturedContentSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Featured Users */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Featured Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredContent.users?.map((user) => (
                      <UserCard 
                        key={user.id}
                        user={{
                          ...user,
                          profile_image: user.profile_image_url || user.profile_image_upload,
                          bio: user.bio || '',
                          career_title: user.career_title || '',
                          likes_count: user.likes_count || 0,
                          followers_count: user.followers_count || 0,
                          watches_count: user.watches_count || 0
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Featured Projects */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Featured Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredContent.projects?.map((project) => (
                      <ProjectCard 
                        key={project.id}
                        project={{
                          ...project,
                          description: project.description || '',
                          likes_count: project.likes_count || 0,
                          follows_count: project.follows_count || 0,
                          watches_count: project.watches_count || 0,
                          mediaUrl: project.mediaUrl || project.project_image_url || project.project_image_upload
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Featured Articles */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Featured Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredContent.articles?.map((article) => (
                      <ArticleCard 
                        key={article.id}
                        article={{
                          ...article,
                          description: article.description || '',
                          likes_count: article.likes_count || 0,
                          follows_count: article.follows_count || 0,
                          watches_count: article.watches_count || 0,
                          mediaUrl: article.mediaUrl || article.cover_image
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Featured Posts */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Featured Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredContent.posts?.map((post) => (
                      <PostCard 
                        key={post.id}
                        post={{
                          ...post,
                          description: post.description || '',
                          likes_count: post.likes_count || 0,
                          follows_count: post.follows_count || 0,
                          watches_count: post.watches_count || 0,
                          mediaUrl: post.mediaUrl || post.image_url
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Featured Comments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredContent.comments.map((comment) => (
                      <div 
                        key={comment.id}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center mb-3">
                          <img 
                            src={comment.users.profile_image || '/default-avatar.png'} 
                            alt={comment.users.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <Link 
                              to={`/profile/${comment.users.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {comment.users.username}
                            </Link>
                            <p className="text-xs text-gray-500">
                              on {comment.entity_type} • {new Date(comment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 line-clamp-3">{comment.text}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>❤️ {comment.likes_count}</span>
                          <span>👁️ {comment.watches_count}</span>
                          <Link 
                            to={`/${comment.entity_type}/${comment.entity_id}`}
                            className="ml-auto text-blue-600 hover:text-blue-800"
                          >
                            View {comment.entity_type}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Content Section */}
            <h2 className="text-4xl font-semibold text-center mb-16 mt-12">Recent Content</h2>
            {loading ? (
              <FeaturedContentSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Recent Users */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Recent Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allContent.users?.map((user) => (
                      <UserCard 
                        key={user.id}
                        user={{
                          ...user,
                          profile_image: user.profile_image_url || user.profile_image_upload,
                          bio: user.bio || '',
                          career_title: user.career_title || '',
                          likes_count: user.likes_count || 0,
                          followers_count: user.followers_count || 0,
                          watches_count: user.watches_count || 0
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Recent Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allContent.projects?.map((project) => (
                      <ProjectCard 
                        key={project.id}
                        project={{
                          ...project,
                          description: project.description || '',
                          likes_count: project.likes_count || 0,
                          follows_count: project.follows_count || 0,
                          watches_count: project.watches_count || 0,
                          mediaUrl: project.mediaUrl || project.project_image_url || project.project_image_upload
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Articles */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Recent Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allContent.articles?.map((article) => (
                      <ArticleCard 
                        key={article.id}
                        article={{
                          ...article,
                          description: article.description || '',
                          likes_count: article.likes_count || 0,
                          follows_count: article.follows_count || 0,
                          watches_count: article.watches_count || 0,
                          mediaUrl: article.mediaUrl || article.cover_image
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Recent Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allContent.posts?.map((post) => (
                      <PostCard 
                        key={post.id}
                        post={{
                          ...post,
                          description: post.description || '',
                          likes_count: post.likes_count || 0,
                          follows_count: post.follows_count || 0,
                          watches_count: post.watches_count || 0,
                          mediaUrl: post.mediaUrl || post.image_url
                        }}
                        variant="white"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section with How It Works */}
      <section className="relative flex flex-col px-4 py-16 
        bg-gradient-to-b from-white to-turquoise-light
        min-h-[calc(100vh-64px)]">
        {/* Floating Emoji */}
        <span className="absolute top-[15%] right-[10%] text-4xl animate-float-delay-1">✨</span>
        
        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <h1 className="font-honk text-5xl md:text-6xl text-blue-600 mb-6 animate-float tracking-wide
              text-shadow-lg transform transition-all duration-250">
              Where Brands & Creators Unite
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay-1">
              Connect authentically. Create meaningfully. Grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Button 
                onClick={() => navigate('/register')}
                variant="spring"
                className="text-lg px-8 py-6 transition-all duration-250 hover:scale-105"
              >
                Join as Creator
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                variant="turquoise"
                className="text-lg px-8 py-6 transition-all duration-250 hover:scale-105"
              >
                Join as Brand
              </Button>
            </div>
          </div>

          {/* Stats Section - Increase bottom margin */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-delay-3 mb-24">
            <div className="group p-4 rounded-xl transition-all duration-250 hover:bg-white/10 hover:-translate-y-1">
              <span className="font-honk text-5xl text-blue-600 block animate-float group-hover:scale-110
                transition-all duration-250">2.5K+</span>
              <span className="text-gray-600 text-lg">Creators</span>
            </div>
            <div className="group p-4 rounded-xl transition-all duration-250 hover:bg-white/10 hover:-translate-y-1">
              <span className="font-honk text-5xl text-blue-600 block animate-float-delay-1 group-hover:scale-110
                transition-all duration-250">500+</span>
              <span className="text-gray-600 text-lg">Brands</span>
            </div>
            <div className="group p-4 rounded-xl transition-all duration-250 hover:bg-white/10 hover:-translate-y-1">
              <span className="font-honk text-5xl text-blue-600 block animate-float-delay-2 group-hover:scale-110
                transition-all duration-250">10K+</span>
              <span className="text-gray-600 text-lg">Collaborations</span>
            </div>
          </div>
        </div>

        {/* How It Works - Desktop - Add top margin */}
        <div className="hidden md:block w-full max-w-6xl mx-auto mt-auto space-y-12">
          <h2 className="text-4xl font-semibold text-center">How It Works</h2>
          <div className="grid grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative p-8 rounded-2xl bg-white/80 backdrop-blur shadow-lg transition-all duration-250 hover:scale-105">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  {step.number}
                </div>
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <ul className="text-sm text-gray-500 space-y-2">
                  {step.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works - Mobile Carousel - Add top margin */}
        <div className="md:hidden w-full max-w-6xl mx-auto mt-auto space-y-12">
          <h2 className="text-4xl font-semibold text-center">How It Works</h2>
          <div className="relative pt-8">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}>
                {steps.map((step, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4 pb-4 mt-4">
                    <div className="relative p-8 rounded-2xl bg-white/80 backdrop-blur shadow-lg">
                      <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                        {step.number}
                      </div>
                      <div className="text-4xl mb-4">{step.emoji}</div>
                      <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <ul className="text-sm text-gray-500 space-y-2">
                        {step.points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-250 
                    ${currentStep === index 
                      ? 'bg-blue-600 w-6' 
                      : 'bg-blue-600/50 hover:bg-blue-600/80'}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Success Stories Testimonials */}
      <section className="relative py-16 bg-blue-600 text-white scroll-fade invisible">
        <h2 className="text-4xl font-semibold text-center mb-8">Success Stories</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative pt-8">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4 pb-4 mt-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
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
      </section>

      {/* 4. For Creators/Brands Split Sections */}
      <section className="relative py-16 bg-turquoise-light scroll-fade invisible">
        <span className="absolute top-[10%] left-[10%] text-4xl animate-float">🚀</span>
        <span className="absolute top-[10%] right-[10%] text-4xl animate-float-delay-1">🎥</span>
        
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-4xl font-honk mb-8 animate-float">For Creators</h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>✨</span>AI-Powered Brand Matching
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>💰</span>Automated Payment System
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>📊</span>Performance Analytics
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>📝</span>Content Planning Tools
              </li>
            </ul>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                transition-all duration-250 hover:scale-105"
            >
              Start Creating
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl">
            {/* Creator Profile Card */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src="https://picsum.photos/150/150" alt="Creator Profile" 
                  className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold">Sarah Johnson</h3>
                  <p className="text-gray-600">Lifestyle Creator</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold">500K+</span>
                  <span className="text-gray-600">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold">15%</span>
                  <span className="text-gray-600">Eng. Rate</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recent Campaigns</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Beauty Brand Launch</li>
                  <li>Tech Product Review</li>
                  <li>Fashion Collection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative py-16 bg-white scroll-fade invisible">
        <span className="absolute bottom-[10%] left-[10%] text-4xl animate-float">📊</span>
        
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl order-2 md:order-1">
            {/* Brand Profile Card */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src="https://picsum.photos/150/150?random=2" alt="Brand Profile" 
                  className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold">TechVibe</h3>
                  <p className="text-gray-600">Tech & Lifestyle Brand</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold">250+</span>
                  <span className="text-gray-600">Campaigns</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold">98%</span>
                  <span className="text-gray-600">Success Rate</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recent Collaborations</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>Product Launch Series</li>
                  <li>Influencer Showcase</li>
                  <li>Brand Ambassador Program</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl order-1 md:order-2">
            <h2 className="text-4xl font-honk mb-8 animate-float">For Brands</h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>🔍</span>Creator Discovery Engine
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>📈</span>Campaign Management
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>💹</span>ROI Analytics
              </li>
              <li className="flex items-center gap-2 transition-all duration-250 hover:translate-x-2">
                <span>🛡️</span>Brand Safety Tools
              </li>
            </ul>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                transition-all duration-250 hover:scale-105"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Platform Metrics */}
      <section className="relative py-16 bg-blue-600 text-white scroll-fade invisible">
        <span className="absolute top-[10%] right-[10%] text-4xl animate-float">📈</span>
        <h2 className="text-4xl font-semibold text-center mb-16">Platform Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">💰</div>
            <div className="font-honk text-5xl animate-float">10</div>
            <div className="text-lg mt-2">Million in Revenue</div>
            <div className="text-sm text-blue-200">+127% This Year</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce delay-100">🌍</div>
            <div className="font-honk text-5xl animate-float-delay-1">50</div>
            <div className="text-lg mt-2">Countries</div>
            <div className="text-sm text-blue-200">Global Reach</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce delay-200">🤝</div>
            <div className="font-honk text-5xl animate-float-delay-2">95</div>
            <div className="text-lg mt-2">Success Rate</div>
            <div className="text-sm text-blue-200">+5% vs Industry</div>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce delay-300">⚡</div>
            <div className="font-honk text-5xl animate-float">24</div>
            <div className="text-lg mt-2">Hour Support</div>
            <div className="text-sm text-blue-200">Always Online</div>
          </div>
        </div>
      </section>

      {/* 6. Platform Features */}
      <section className="relative py-16 bg-turquoise-light scroll-fade invisible">
        <h2 className="text-4xl font-semibold text-center mb-16">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Secure Messaging</h3>
            <p className="text-gray-600">End-to-end encrypted communication with built-in file sharing</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Real Analytics</h3>
            <p className="text-gray-600">Track performance metrics and campaign ROI in real-time</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Smart Contracts</h3>
            <p className="text-gray-600">Automated agreements and payment processing system</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">AI Matching</h3>
            <p className="text-gray-600">Advanced algorithms for perfect partnership matches</p>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Us */}
      <section id="features" className="relative py-16 px-4 bg-white scroll-fade invisible">
        <span className="absolute bottom-[10%] right-[10%] text-4xl animate-float-delay-2">💡</span>
        
        <h2 className="text-4xl font-semibold text-center mb-16">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
            hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-4 animate-bounce">🤝</div>
            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI-powered creator-brand matching based on authentic alignment</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
            hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-4 animate-bounce delay-100">📈</div>
            <h3 className="text-xl font-bold mb-2">Real Analytics</h3>
            <p className="text-gray-600">Deep insights into campaign performance and audience engagement</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
            hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-4 animate-bounce delay-200">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-gray-600">Protected payments and clear contract management</p>
          </div>
        </div>
      </section>

      {/* 8. Success Stories Gallery */}
      <section className="relative py-16 px-4 bg-white scroll-fade invisible">
        <h2 className="text-4xl font-semibold text-center mb-8">Success Stories</h2>
        <div className="max-w-6xl mx-auto">
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
                      ? 'bg-blue-600 w-6' 
                      : 'bg-blue-600/50 hover:bg-blue-600/80'}`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. About Platform */}
      <section className="relative py-16 bg-turquoise-light scroll-fade invisible">
        <span className="absolute top-[10%] right-[10%] text-4xl animate-float">🌟</span>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-center mb-16">About Our Platform</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Our Story</h3>
              <p className="text-gray-600 mb-8">
                Founded by creators for creators, our platform bridges the gap between authentic content creation and brand partnerships. We're building the future of creator economics.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">2024</span>
                  <p className="text-sm text-gray-500">Founded</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">$125M+</span>
                  <p className="text-sm text-gray-500">Creator Earnings</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">10+</span>
                  <p className="text-sm text-gray-500">Expert Team Members</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">24/7</span>
                  <p className="text-sm text-gray-500">AI + Human Support</p>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://picsum.photos/600/400" 
                alt="Team at work" 
                className="rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="relative py-16 bg-[#2563EB] text-white scroll-fade invisible">
        <span className="absolute top-[10%] right-[10%] text-4xl animate-float">📈</span>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-semibold text-center mb-16">Platform Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">👥</div>
              <div className="font-honk text-5xl animate-float">{siteStats?.totalUsers || '...'}</div>
              <div className="text-lg mt-2">Community Members</div>
              <div className="text-sm text-blue-200">Growing Daily</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-100">🚀</div>
              <div className="font-honk text-5xl animate-float-delay-1">{siteStats?.totalProjects || '...'}</div>
              <div className="text-lg mt-2">Total Projects</div>
              <div className="text-sm text-blue-200">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-200">📝</div>
              <div className="font-honk text-5xl animate-float-delay-2">{siteStats?.totalArticles || '...'}</div>
              <div className="text-lg mt-2">Total Articles</div>
              <div className="text-sm text-blue-200">Published Content</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-300">📱</div>
              <div className="font-honk text-5xl animate-float">{siteStats?.totalPosts || '...'}</div>
              <div className="text-lg mt-2">Total Posts</div>
              <div className="text-sm text-blue-200">Shared Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Our Commitment */}
      <section className="relative py-16 bg-white scroll-fade invisible">
        <span className="absolute top-[10%] left-[10%] text-4xl animate-float">🛡️</span>
        <h2 className="text-4xl font-semibold text-center mb-16">Our Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Creator Code of Ethics</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Authentic engagement only
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Transparent disclosure
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Quality content promise
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Audience trust priority
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Brand Standards</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Fair compensation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Clear expectations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Timely communication
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Creator respect
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 11. Join Waitlist - Toggle visibility based on pre-signup vs launch phase */}
      {SHOW_WAITLIST && (
        <section className="relative py-16 bg-blue-600 text-white scroll-fade invisible">
          <span className="absolute bottom-[10%] right-[10%] text-4xl animate-float">✉️</span>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-semibold mb-4">Join the Waitlist</h2>
            <p className="text-xl mb-8 text-blue-100">
              Be among the first to experience the future of creator partnerships
            </p>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60
                  focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60
                  focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <select
                aria-label="Select your role"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white
                  focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="">I am a...</option>
                <option value="creator">Creator</option>
                <option value="brand">Brand</option>
              </select>
              <textarea
                placeholder="Tell us about yourself (Optional)"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60
                  focus:outline-none focus:ring-2 focus:ring-white/50 h-32"
              ></textarea>
              <Button
                className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                  transition-all duration-250 hover:scale-105 text-lg py-6"
              >
                Join Waitlist
              </Button>
            </form>
          </div>
        </section>
      )}

      {/* 12. Sign Up Section */}
      <section className="relative py-16 bg-blue-600 text-white scroll-fade invisible">
        <span className="absolute bottom-[10%] right-[10%] text-4xl animate-float">🚀</span>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold mb-4">Join Now</h2>
          <p className="text-xl mb-8 text-blue-100">
            Connect with top brands, streamline collaborations, and grow your influence. 
            Our AI-powered platform matches you with perfect partners while our secure 
            tools handle contracts and payments.
          </p>
          <Button
            onClick={() => navigate('/register')}
            className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
              transition-all duration-250 hover:scale-105 text-lg py-6"
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* 13. Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Our Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
