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
import { FeatureDropdown } from '@/components/ui/feature-dropdown';

const SHOW_WAITLIST = false;  // Toggle this when ready to show waitlist

export default function About() {
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

  function getPhaseDescription(phase: string): string {
    const descriptions = {
      Discovery: 'Explore opportunities and define goals',
      Setup: 'Create and optimize your profile',
      Matching: 'Connect with ideal partners',
      Collaboration: 'Work together seamlessly',
      Growth: 'Scale your success and reach'
    };
    return descriptions[phase as keyof typeof descriptions];
  }

return (
    <div className="min-h-screen flex flex-col">
      {/* Group 1: How It Works & Features */}
      <div className="bg-turquoise-light">
        {/* Group Title */}
        <h1 className="text-4xl font-bold tracking-tight text-center pt-16 mb-16">
          Platform Overview & Features
        </h1>

        {/* How It Works Section */}
        <section className="px-4 py-16">
          {/* Section Header */}
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          {/* Process Steps */}
          <div className="hidden md:block w-full max-w-6xl mx-auto space-y-12">
            {/* Subsection Header */}
            <h3 className="text-xl font-bold text-center mb-8">Process Steps</h3>
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

            {/* New: Process Timeline */}
            <div className="mt-16 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-600 -translate-y-1/2"></div>
              <div className="relative grid grid-cols-5 gap-4">
                {['Discovery', 'Setup', 'Matching', 'Collaboration', 'Growth'].map((phase, index) => (
                  <div key={phase} className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-4 relative z-10">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-center">{phase}</h4>
                    <p className="text-sm text-gray-600 text-center mt-2">
                      {getPhaseDescription(phase)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="py-16 px-4">
          {/* Section Header */}
          <h2 className="text-2xl font-bold text-center mb-12">Platform Features</h2>
          
          {/* Core Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
            {/* Subsection Header */}
            <h3 className="text-xl font-bold col-span-full mb-8">Core Features</h3>
            {/* AI Matching */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 h-full flex flex-col">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Matching</h3>
              <p className="text-gray-600 mb-4">Smart matching system for all platform users</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Behavioral analysis</li>
                <li>• Value alignment</li>
                <li>• Success prediction</li>
                <li>• Smart recommendations</li>
              </ul>
            </div>

            {/* Analytics & Metrics */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 h-full flex flex-col">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Analytics & Metrics</h3>
              <p className="text-gray-600 mb-4">Comprehensive real-time analytics system</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Performance tracking</li>
                <li>• Audience insights</li>
                <li>• ROI measurement</li>
                <li>• Growth analytics</li>
              </ul>
            </div>

            {/* Secure Transactions */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 h-full flex flex-col">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
              <p className="text-gray-600 mb-4">Protected payments and smart contracts</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Escrow services</li>
                <li>• Contract automation</li>
                <li>• Milestone payments</li>
                <li>• Dispute resolution</li>
              </ul>
            </div>

            {/* Collaboration Hub */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105 h-full flex flex-col">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Collaboration Hub</h3>
              <p className="text-gray-600 mb-4">Complete project collaboration suite</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Project management</li>
                <li>• Team messaging</li>
                <li>• File sharing</li>
                <li>• Task tracking</li>
              </ul>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="max-w-6xl mx-auto">
            {/* Subsection Header */}
            <h3 className="text-xl font-bold text-center mb-8">Advanced Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Content System */}
              <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                <div className="text-3xl mb-4">📝</div>
                <h4 className="text-xl font-semibold mb-4">Content Management</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Portfolio showcasing</li>
                  <li>• Content scheduling</li>
                  <li>• Asset management</li>
                  <li>• Version control</li>
                  <li>• Publishing workflow</li>
                </ul>
              </div>

              {/* Communication Hub */}
              <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                <div className="text-3xl mb-4">💬</div>
                <h4 className="text-xl font-semibold mb-4">Communication Suite</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Direct messaging</li>
                  <li>• Team channels</li>
                  <li>• File sharing</li>
                  <li>• Video calls</li>
                  <li>• Chat history</li>
                </ul>
              </div>

              {/* Verification System */}
              <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                <div className="text-3xl mb-4">✅</div>
                <h4 className="text-xl font-semibold mb-4">Trust & Verification</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Identity verification</li>
                  <li>• Metrics validation</li>
                  <li>• Performance history</li>
                  <li>• Reputation system</li>
                  <li>• Safety checks</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Group 2: Value Proposition */}
      <div className="bg-[#FFFEFF]">
        {/* Group Title */}
        <h1 className="text-4xl font-bold tracking-tight text-center pt-16 mb-16">
          Value Proposition & Solutions
        </h1>

        {/* Why Choose Us Section */}
        <section className="px-4 py-16">
          {/* Section Header */}
          <h2 className="text-2xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Efficiency Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
              hover:scale-105 hover:shadow-xl h-full flex flex-col">
              <div className="text-4xl mb-4 animate-bounce">⚡</div>
              <h3 className="text-xl font-bold mb-4">Efficiency</h3>
              <p className="text-gray-600 mb-4">Streamlined workflows and automated processes</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• AI-powered matching</li>
                <li>• Automated workflows</li>
                <li>• Integrated tools</li>
                <li>• Resource optimization</li>
              </ul>
            </div>

            {/* Trust & Safety Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
              hover:scale-105 hover:shadow-xl h-full flex flex-col">
              <div className="text-4xl mb-4 animate-bounce delay-100">🛡️</div>
              <h3 className="text-xl font-bold mb-4">Trust & Safety</h3>
              <p className="text-gray-600 mb-4">Secure and protected environment for all users</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Verified profiles</li>
                <li>• Secure payments</li>
                <li>• Contract protection</li>
                <li>• Data security</li>
              </ul>
            </div>

            {/* Growth & Scale Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
              hover:scale-105 hover:shadow-xl h-full flex flex-col">
              <div className="text-4xl mb-4 animate-bounce delay-200">📈</div>
              <h3 className="text-xl font-bold mb-4">Growth & Scale</h3>
              <p className="text-gray-600 mb-4">Tools and resources to expand your reach</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Market access</li>
                <li>• Network effects</li>
                <li>• Resource sharing</li>
                <li>• Business opportunities</li>
              </ul>
            </div>

            {/* Value Creation Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
              hover:scale-105 hover:shadow-xl h-full flex flex-col">
              <div className="text-4xl mb-4 animate-bounce delay-300">💎</div>
              <h3 className="text-xl font-bold mb-4">Value Creation</h3>
              <p className="text-gray-600 mb-4">Maximize returns on your investments</p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Fair pricing</li>
                <li>• Quality assurance</li>
                <li>• Performance tracking</li>
                <li>• ROI optimization</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tailored Solutions Section */}
        <section className="px-4 py-16">
          {/* Section Header */}
          <h2 className="text-2xl font-bold text-center mb-12">Tailored Solutions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {/* Creators Card */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="mb-6">
                <img 
                  src="https://picsum.photos/200/200?random=1" 
                  alt="Creator Example"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-4xl font-honk mb-4 animate-float">For Creators</h3>
              </div>
              <div className="space-y-4 flex-grow">
                {/* Creators Card Dropdowns */}
                <FeatureDropdown title="Connection Benefits" emoji="🤝">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Build valuable partnerships with brands, collaborate with fellow creators, and access professional services all in one place.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">Brand Partnerships</h5>
                          <p className="text-sm text-blue-100">Access brand deals, sponsorships, and ambassador programs</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🤝</span>
                        <div>
                          <h5 className="font-semibold">Creator Collaborations</h5>
                          <p className="text-sm text-blue-100">Partner with other creators for joint projects and cross-promotion</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔨</span>
                        <div>
                          <h5 className="font-semibold">Service Access</h5>
                          <p className="text-sm text-blue-100">Find contractors and freelancers for production needs</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Brand Opportunities Dropdown */}
                <FeatureDropdown title="Brand Opportunities" emoji="💼">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Get matched with brands that align with your values and audience, while maintaining full creative control.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">AI-matched brand deals</h5>
                          <p className="text-sm text-blue-100">Get matched with brands that align with your values</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Analytics Dropdown */}
                <FeatureDropdown title="Metrics & Analytics" emoji="📊">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Track your growth and performance with comprehensive analytics tools designed for creators.
                    </p>
                    <ul className="space-y-3">
                      <li>• Engagement tracking</li>
                      <li>• Conversion analytics</li>
                      <li>• Performance insights</li>
                      <li>• Custom reporting</li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Collaboration Tools Dropdown */}
                <FeatureDropdown title="Collaboration Tools" emoji="🤝">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Streamline your collaborations with integrated project management and communication tools.
                    </p>
                    <ul className="space-y-3">
                      <li>• Project timelines</li>
                      <li>• Task assignment</li>
                      <li>• Team messaging</li>
                      <li>• Resource sharing</li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Business Growth Dropdown */}
                <FeatureDropdown title="Business Growth" emoji="📈">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Scale your creator business with access to merchandise solutions, production resources, and marketing tools.
                    </p>
                    <ul className="space-y-3">
                      <li>• Revenue growth</li>
                      <li>• Brand safety</li>
                      <li>• Marketing strategies</li>
                    </ul>
                  </div>
                </FeatureDropdown>
              </div>

              {/* Stats in Creators Card */}
              <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="font-bold text-2xl">85%</div>
                  <div className="text-sm text-blue-100">Match Success</div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <div className="font-bold text-2xl">2.5x</div>
                  <div className="text-sm text-blue-100">Revenue Growth</div>
                </div>
              </div>

              {/* Stats and Button remain the same */}
              <div className="mt-auto">
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                          transition-all duration-250 hover:scale-105 mt-4"
                >
                  Start Creating
                </Button>
              </div>
            </div>

            {/* Brands Card */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="mb-6">
                <img 
                  src="https://picsum.photos/200/200?random=2" 
                  alt="Brand Example"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-4xl font-honk mb-4 animate-float">For Brands</h3>
              </div>
              <div className="space-y-4 flex-grow">
                {/* Connection Benefits Dropdown */}
                <FeatureDropdown title="Connection Benefits" emoji="🤝">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Connect with verified creators, access professional services, and build your brand through authentic partnerships.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">Creator Partnerships</h5>
                          <p className="text-sm text-blue-100">Access verified creators for brand deals and campaigns</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔨</span>
                        <div>
                          <h5 className="font-semibold">Service Access</h5>
                          <p className="text-sm text-blue-100">Find contractors and freelancers for your projects</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Creator Discovery Dropdown */}
                <FeatureDropdown title="Creator Discovery" emoji="🔍">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Find and verify creators that perfectly align with your brand values and target audience.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">AI Matching</h5>
                          <p className="text-sm text-blue-100">Smart creator recommendations based on your criteria</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Metrics Verification</h5>
                          <p className="text-sm text-blue-100">Access verified audience and engagement data</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Campaign Management Dropdown */}
                <FeatureDropdown title="Campaign Management" emoji="📈">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      End-to-end campaign orchestration with comprehensive tracking and management tools.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📋</span>
                        <div>
                          <h5 className="font-semibold">Planning Tools</h5>
                          <p className="text-sm text-blue-100">Comprehensive campaign planning and tracking</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💰</span>
                        <div>
                          <h5 className="font-semibold">Budget Management</h5>
                          <p className="text-sm text-blue-100">Track spending and ROI in real-time</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Value Assessment Dropdown */}
                <FeatureDropdown title="Value Assessment" emoji="⚖️">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Make informed decisions with comprehensive creator value metrics and analysis.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Performance Analysis</h5>
                          <p className="text-sm text-blue-100">Detailed metrics and ROI predictions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🛡️</span>
                        <div>
                          <h5 className="font-semibold">Brand Safety</h5>
                          <p className="text-sm text-blue-100">Automated content and audience verification</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Resource Management Dropdown */}
                <FeatureDropdown title="Resource Management" emoji="🔧">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Access and manage all your creative resources in one place.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>👥</span>
                        <div>
                          <h5 className="font-semibold">Team Collaboration</h5>
                          <p className="text-sm text-blue-100">Streamlined workflow and resource allocation</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📁</span>
                        <div>
                          <h5 className="font-semibold">Asset Management</h5>
                          <p className="text-sm text-blue-100">Centralized content and resource library</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>
              </div>

              {/* Stats and Button */}
              <div className="mt-auto">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">3.2x</div>
                    <div className="text-sm text-blue-100">ROI Increase</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">-40%</div>
                    <div className="text-sm text-blue-100">Time to Launch</div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                            transition-all duration-250 hover:scale-105 mt-0"
                >
                  Partner With Us
                </Button>
              </div>
            </div>

            {/* Contractors Card */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="mb-6">
                <img 
                  src="https://picsum.photos/200/200?random=3" 
                  alt="Contractor Example"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-4xl font-honk mb-4 animate-float">For Contractors</h3>
              </div>
              <div className="space-y-4 flex-grow">
                {/* Connection Benefits Dropdown */}
                <FeatureDropdown title="Connection Benefits" emoji="🤝">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Connect with brands and creators to provide professional services and grow your contractor business.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🏢</span>
                        <div>
                          <h5 className="font-semibold">Brand Services</h5>
                          <p className="text-sm text-blue-100">Provide professional services to established brands</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🎥</span>
                        <div>
                          <h5 className="font-semibold">Creator Support</h5>
                          <p className="text-sm text-blue-100">Offer production and technical services to creators</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Opportunity Access Dropdown */}
                <FeatureDropdown title="Opportunity Access" emoji="🎯">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Find and secure relevant projects that match your expertise and business goals.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🔍</span>
                        <div>
                          <h5 className="font-semibold">Project Matching</h5>
                          <p className="text-sm text-blue-100">AI-powered project recommendations</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🌟</span>
                        <div>
                          <h5 className="font-semibold">Portfolio Showcase</h5>
                          <p className="text-sm text-blue-100">Highlight your best work and services</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Business Management Dropdown */}
                <FeatureDropdown title="Business Management" emoji="💼">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Streamline your operations with comprehensive project and client management tools.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📋</span>
                        <div>
                          <h5 className="font-semibold">Project Tracking</h5>
                          <p className="text-sm text-blue-100">Manage timelines, tasks, and deliverables</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💰</span>
                        <div>
                          <h5 className="font-semibold">Payment Processing</h5>
                          <p className="text-sm text-blue-100">Secure, milestone-based payments</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Growth Tools Dropdown */}
                <FeatureDropdown title="Growth Tools" emoji="📈">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Track performance and grow your contractor business with advanced analytics.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Performance Metrics</h5>
                          <p className="text-sm text-blue-100">Track success rates and client satisfaction</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🏆</span>
                        <div>
                          <h5 className="font-semibold">Skill Endorsements</h5>
                          <p className="text-sm text-blue-100">Build credibility through verified reviews</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Service Management Dropdown */}
                <FeatureDropdown title="Service Management" emoji="⚙️">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Efficiently manage and deliver your professional services.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📦</span>
                        <div>
                          <h5 className="font-semibold">Service Packaging</h5>
                          <p className="text-sm text-blue-100">Create and manage service offerings</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📝</span>
                        <div>
                          <h5 className="font-semibold">Contract Handling</h5>
                          <p className="text-sm text-blue-100">Automated agreements and terms</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>
              </div>

              <div className="mt-auto">
                <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">95%</div>
                    <div className="text-sm text-blue-100">Project Success</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">4.8★</div>
                    <div className="text-sm text-blue-100">Avg Rating</div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                            transition-all duration-250 hover:scale-105 mt-0"
                >
                  Start Contracting
                </Button>
              </div>
            </div>

            {/* For Freelancers Card */}
            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-xl h-full flex flex-col">
              <div className="mb-6">
                <img 
                  src="https://picsum.photos/200/200?random=4" 
                  alt="Freelancer Example"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="text-4xl font-honk mb-4 animate-float">For Freelancers</h3>
              </div>
              <div className="space-y-4 flex-grow">
                {/* Connection Benefits Dropdown */}
                <FeatureDropdown title="Connection Benefits" emoji="🤝">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Connect directly with brands and creators to offer your freelance services and expertise.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">Direct Client Access</h5>
                          <p className="text-sm text-blue-100">Work directly with brands and creators</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🌟</span>
                        <div>
                          <h5 className="font-semibold">Project Opportunities</h5>
                          <p className="text-sm text-blue-100">Access a steady stream of relevant work</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Service Offering Dropdown */}
                <FeatureDropdown title="Service Offering" emoji="💼">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Showcase your skills and services with customizable packages and professional presentation.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📦</span>
                        <div>
                          <h5 className="font-semibold">Service Packages</h5>
                          <p className="text-sm text-blue-100">Create custom service offerings</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">Project Bidding</h5>
                          <p className="text-sm text-blue-100">Competitive proposal system</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Business Tools Dropdown */}
                <FeatureDropdown title="Business Tools" emoji="⚙️">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Manage your freelance business efficiently with comprehensive tools and automation.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>⏱️</span>
                        <div>
                          <h5 className="font-semibold">Time Management</h5>
                          <p className="text-sm text-blue-100">Track time and manage projects</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📝</span>
                        <div>
                          <h5 className="font-semibold">Invoice Generation</h5>
                          <p className="text-sm text-blue-100">Automated billing and payments</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Growth Features Dropdown */}
                <FeatureDropdown title="Growth Features" emoji="📈">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Scale your freelance career with powerful growth and networking tools.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Performance Analytics</h5>
                          <p className="text-sm text-blue-100">Track your success and growth</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🏆</span>
                        <div>
                          <h5 className="font-semibold">Skill Verification</h5>
                          <p className="text-sm text-blue-100">Build trust with verified credentials</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>

                {/* Network Access Dropdown */}
                <FeatureDropdown title="Network Access" emoji="🌐">
                  <div className="space-y-4">
                    <p className="text-sm text-blue-200 italic border-b border-white/10 pb-2">
                      Build your professional network and establish long-term client relationships.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span>🤝</span>
                        <div>
                          <h5 className="font-semibold">Client Networking</h5>
                          <p className="text-sm text-blue-100">Build lasting client relationships</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💫</span>
                        <div>
                          <h5 className="font-semibold">Community Access</h5>
                          <p className="text-sm text-blue-100">Connect with other professionals</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </FeatureDropdown>
              </div>

              <div className="mt-auto">
                <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">2.3x</div>
                    <div className="text-sm text-blue-100">Income Growth</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="font-bold text-2xl">+60%</div>
                    <div className="text-sm text-blue-100">Client Base</div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full bg-white text-blue-600 hover:bg-green-500 hover:text-white
                            transition-all duration-250 hover:scale-105 mt-0"
                >
                  Start Freelancing
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Group 3: Platform Performance */}
      <div className="bg-[#2563EB]">
        {/* Group Title */}
        <h1 className="text-4xl font-bold tracking-tight text-center pt-16 mb-16 text-white">
          Platform Performance & Impact
        </h1>

        {/* Platform Metrics Section */}
        <section className="px-4 py-16">
          <h2 className="text-4xl font-semibold text-center mb-16 text-white">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">💰</div>
              <div className="font-honk text-5xl text-white animate-float">10</div>
              <div className="text-lg mt-2 text-white">Million in Revenue</div>
              <div className="text-sm text-blue-200">+127% This Year</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-100">🌍</div>
              <div className="font-honk text-5xl text-white animate-float-delay-1">50</div>
              <div className="text-lg mt-2 text-white">Countries</div>
              <div className="text-sm text-blue-200">Global Reach</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-200">🤝</div>
              <div className="font-honk text-5xl text-white animate-float-delay-2">95</div>
              <div className="text-lg mt-2 text-white">Success Rate</div>
              <div className="text-sm text-blue-200">+5% vs Industry</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-300">⚡</div>
              <div className="font-honk text-5xl text-white animate-float">24</div>
              <div className="text-lg mt-2 text-white">Hour Support</div>
              <div className="text-sm text-blue-200">Always Online</div>
            </div>
          </div>
        </section>

        {/* Platform Statistics Section */}
        <section className="px-4 py-16">
          <h2 className="text-4xl font-semibold text-center mb-16 text-white">Growth Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">👥</div>
              <div className="font-honk text-5xl text-white animate-float">{siteStats?.totalUsers || '...'}</div>
              <div className="text-lg mt-2 text-white">Community Members</div>
              <div className="text-sm text-blue-200">Growing Daily</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-100">🚀</div>
              <div className="font-honk text-5xl text-white animate-float-delay-1">{siteStats?.totalProjects || '...'}</div>
              <div className="text-lg mt-2 text-white">Total Projects</div>
              <div className="text-sm text-blue-200">Active Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-200">📝</div>
              <div className="font-honk text-5xl text-white animate-float-delay-2">{siteStats?.totalArticles || '...'}</div>
              <div className="text-lg mt-2 text-white">Total Articles</div>
              <div className="text-sm text-blue-200">Published Content</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce delay-300">📱</div>
              <div className="font-honk text-5xl text-white animate-float">{siteStats?.totalPosts || '...'}</div>
              <div className="text-lg mt-2 text-white">Total Posts</div>
              <div className="text-sm text-blue-200">Shared Updates</div>
            </div>
          </div>
        </section>
      </div>

      {/* Group 4: Company & Values */}
      <div className="bg-[#FFFEFF]">
        {/* Group Title */}
        <h1 className="text-4xl font-bold tracking-tight text-center pt-16 mb-16">
          Our Company & Values
        </h1>

        {/* About Platform Section */}
        <section className="px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">About Our Platform</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Our Story</h3>
              <p className="mb-8">
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
        </section>

        {/* Our Commitment Section */}
        <section className="px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-12">Our Commitment</h2>
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
      </div>

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


