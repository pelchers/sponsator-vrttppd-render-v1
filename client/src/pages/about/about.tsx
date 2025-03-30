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

            {/* New: Detailed Process Breakdown */}
            <div className="mt-16 max-w-6xl mx-auto">
              <h3 className="text-xl font-bold mb-8">Detailed Process Breakdown</h3>
              
              {/* Process Phases */}
              <div className="grid gap-8">
                {[
                  {
                    phase: "Discovery",
                    icon: "🔍",
                    title: "Platform Discovery & Goal Setting",
                    description: "Begin your journey by exploring platform capabilities and defining your objectives",
                    details: [
                      {
                        title: "Profile Analysis",
                        points: [
                          "AI-powered audience analysis",
                          "Content performance metrics",
                          "Market position evaluation",
                          "Growth opportunity identification"
                        ]
                      },
                      {
                        title: "Goal Definition",
                        points: [
                          "Target audience alignment",
                          "Revenue objectives",
                          "Brand partnership criteria",
                          "Growth milestones"
                        ]
                      }
                    ]
                  },
                  {
                    phase: "Setup",
                    icon: "⚙️",
                    title: "Profile & Portfolio Setup",
                    description: "Create your optimized presence on the platform",
                    details: [
                      {
                        title: "Profile Optimization",
                        points: [
                          "AI-assisted profile completion",
                          "Portfolio curation",
                          "Metric verification",
                          "Integration setup"
                        ]
                      },
                      {
                        title: "Verification Process",
                        points: [
                          "Identity verification",
                          "Metric validation",
                          "Portfolio authentication",
                          "Security setup"
                        ]
                      }
                    ]
                  },
                  // ... continue with other phases
                ].map((phase, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                      <span className="text-4xl">{phase.icon}</span>
                      <div>
                        <h4 className="text-xl font-semibold text-blue-600">{phase.title}</h4>
                        <p className="text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {phase.details.map((detail, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-6">
                          <h5 className="font-semibold mb-3">{detail.title}</h5>
                          <ul className="space-y-2">
                            {detail.points.map((point, pidx) => (
                              <li key={pidx} className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New: Integration Timeline */}
            <div className="mt-16 max-w-6xl mx-auto">
              <h3 className="text-xl font-bold mb-8">Integration Timeline</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-0 left-1/2 w-px h-full bg-blue-600 transform -translate-x-1/2"></div>
                
                {/* Timeline items */}
                <div className="space-y-12">
                  {[
                    {
                      day: "Day 1",
                      title: "Initial Setup",
                      tasks: [
                        "Account creation",
                        "Basic profile setup",
                        "Integration planning"
                      ]
                    },
                    {
                      day: "Days 2-3",
                      title: "Profile Optimization",
                      tasks: [
                        "Portfolio upload",
                        "Metric verification",
                        "Goal setting"
                      ]
                    },
                    {
                      day: "Days 4-5",
                      title: "Connection Phase",
                      tasks: [
                        "AI matching activation",
                        "Initial partner suggestions",
                        "Outreach preparation"
                      ]
                    },
                    {
                      day: "Week 2",
                      title: "Active Engagement",
                      tasks: [
                        "Partnership initiation",
                        "Collaboration tools setup",
                        "First project planning"
                      ]
                    }
                  ].map((period, index) => (
                    <div key={index} className="relative flex items-center">
                      <div className="w-1/2 pr-8 text-right">
                        <h4 className="font-semibold text-blue-600">{period.day}</h4>
                        <p className="text-gray-600">{period.title}</p>
                      </div>
                      <div className="absolute left-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2"></div>
                      <div className="w-1/2 pl-8">
                        <ul className="space-y-2">
                          {period.tasks.map((task, idx) => (
                            <li key={idx} className="text-sm text-gray-600">{task}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
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

          {/* New: Technical Specifications */}
          <div className="max-w-6xl mx-auto mt-16">
            <h3 className="text-xl font-bold mb-8">Technical Specifications</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* API & Integration */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-4">API & Integration</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-medium mb-2">REST API Endpoints</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">GET /api/v1/metrics</code>
                        <span>Real-time analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">POST /api/v1/content</code>
                        <span>Content management</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">PUT /api/v1/profiles</code>
                        <span>Profile updates</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Supported Integrations</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h6 className="font-medium mb-2">Analytics</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Google Analytics</li>
                          <li>• Mixpanel</li>
                          <li>• Custom tracking</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h6 className="font-medium mb-2">Social Media</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Instagram</li>
                          <li>• Twitter</li>
                          <li>• LinkedIn</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Performance */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-4">Security & Performance</h4>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-medium mb-2">Security Features</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>End-to-end encryption</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>Two-factor authentication</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>SOC 2 Type II compliant</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Performance Metrics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">99.9%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">&lt;100ms</div>
                        <div className="text-sm text-gray-600">Response Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New: Feature Comparison */}
          <div className="max-w-6xl mx-auto mt-16">
            <h3 className="text-xl font-bold mb-8">Feature Comparison</h3>
            <div className="bg-white rounded-2xl p-8 shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4">Feature</th>
                    <th className="p-4">Basic</th>
                    <th className="p-4">Professional</th>
                    <th className="p-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "AI Matching",
                      basic: "Basic",
                      pro: "Advanced",
                      enterprise: "Custom"
                    },
                    {
                      feature: "Analytics",
                      basic: "Limited",
                      pro: "Full Suite",
                      enterprise: "Custom Reports"
                    },
                    {
                      feature: "API Access",
                      basic: "No",
                      pro: "Yes",
                      enterprise: "Priority"
                    },
                    {
                      feature: "Support",
                      basic: "Email",
                      pro: "Priority",
                      enterprise: "24/7 Dedicated"
                    }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center">{row.basic}</td>
                      <td className="p-4 text-center">{row.pro}</td>
                      <td className="p-4 text-center">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New: Use Cases */}
          <div className="max-w-6xl mx-auto mt-16">
            <h3 className="text-xl font-bold mb-8">Use Cases</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Creator Collaboration",
                  icon: "🤝",
                  description: "How creators use our platform to find and manage brand partnerships",
                  steps: [
                    "Profile optimization",
                    "Brand matching",
                    "Contract negotiation",
                    "Content delivery",
                    "Performance tracking"
                  ]
                },
                {
                  title: "Brand Campaign",
                  icon: "🎯",
                  description: "How brands launch and manage influencer marketing campaigns",
                  steps: [
                    "Campaign setup",
                    "Creator discovery",
                    "Budget allocation",
                    "Content approval",
                    "ROI analysis"
                  ]
                },
                {
                  title: "Agency Management",
                  icon: "🏢",
                  description: "How agencies manage multiple clients and campaigns",
                  steps: [
                    "Client onboarding",
                    "Campaign planning",
                    "Creator selection",
                    "Performance monitoring",
                    "Reporting"
                  ]
                }
              ].map((useCase, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">{useCase.title}</h4>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <ol className="space-y-2">
                    {useCase.steps.map((step, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-bold text-blue-600">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
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

        {/* Why Choose Us Section - Expanded */}
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

          {/* New: Detailed Benefits Analysis */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-8">Detailed Benefits Analysis</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* ROI Benefits */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-4">ROI Benefits</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📈</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">127%</div>
                      <div className="text-sm text-gray-600">Average ROI Increase</div>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <div>
                        <h5 className="font-medium">Revenue Growth</h5>
                        <p className="text-sm text-gray-600">Average 2.5x increase in first year</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <div>
                        <h5 className="font-medium">Cost Reduction</h5>
                        <p className="text-sm text-gray-600">40% reduction in operational costs</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <div>
                        <h5 className="font-medium">Time Savings</h5>
                        <p className="text-sm text-gray-600">60% faster campaign deployment</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Competitive Advantages */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-lg font-semibold text-blue-600 mb-4">Competitive Advantages</h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">AI-First</div>
                      <p className="text-sm text-gray-600">Advanced matching algorithms</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">Secure</div>
                      <p className="text-sm text-gray-600">Enterprise-grade protection</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <div>
                        <h5 className="font-medium">Market Leadership</h5>
                        <p className="text-sm text-gray-600">Leading platform in creator-brand partnerships</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                      <div>
                        <h5 className="font-medium">Innovation Focus</h5>
                        <p className="text-sm text-gray-600">Continuous platform improvements</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* New: Industry Comparisons */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-8">Industry Comparisons</h3>
            <div className="bg-white rounded-2xl p-8 shadow-lg overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4">Feature</th>
                    <th className="p-4">Our Platform</th>
                    <th className="p-4">Traditional Agencies</th>
                    <th className="p-4">Other Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: "Match Success Rate",
                      us: "95%",
                      traditional: "65%",
                      others: "75%"
                    },
                    {
                      feature: "Time to Launch",
                      us: "24-48 hours",
                      traditional: "2-4 weeks",
                      others: "1 week"
                    },
                    {
                      feature: "Cost Efficiency",
                      us: "High",
                      traditional: "Low",
                      others: "Medium"
                    },
                    {
                      feature: "AI Integration",
                      us: "Full Suite",
                      traditional: "None",
                      others: "Basic"
                    }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-green-600 font-medium">{row.us}</td>
                      <td className="p-4 text-center text-gray-600">{row.traditional}</td>
                      <td className="p-4 text-center text-gray-600">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New: Success Metrics */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-8">Success Metrics</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  metric: "Partnership Success",
                  value: "95%",
                  description: "Of partnerships meet or exceed goals",
                  details: [
                    "Clear expectations",
                    "Aligned objectives",
                    "Continuous monitoring",
                    "Quick issue resolution"
                  ]
                },
                {
                  metric: "Time Efficiency",
                  value: "60%",
                  description: "Reduction in campaign setup time",
                  details: [
                    "Automated matching",
                    "Quick onboarding",
                    "Streamlined workflow",
                    "Integrated tools"
                  ]
                },
                {
                  metric: "User Satisfaction",
                  value: "4.8/5",
                  description: "Average platform rating",
                  details: [
                    "Intuitive interface",
                    "Responsive support",
                    "Regular updates",
                    "Community feedback"
                  ]
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{item.value}</div>
                  <h4 className="text-lg font-semibold mb-2">{item.metric}</h4>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• AI-matched brand recommendations</li>
                            <li>• Direct messaging with brand decision makers</li>
                            <li>• Automated proposal templates</li>
                            <li>• Partnership history tracking</li>
                            <li>• Performance analytics dashboard</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🤝</span>
                        <div>
                          <h5 className="font-semibold">Creator Collaborations</h5>
                          <p className="text-sm text-blue-100">Partner with other creators for joint projects and cross-promotion</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Creator discovery by niche and audience</li>
                            <li>• Collaboration project management tools</li>
                            <li>• Revenue sharing agreements</li>
                            <li>• Cross-promotion scheduling</li>
                            <li>• Joint analytics tracking</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔨</span>
                        <div>
                          <h5 className="font-semibold">Service Access</h5>
                          <p className="text-sm text-blue-100">Find contractors and freelancers for production needs</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Verified service provider directory</li>
                            <li>• Project-based hiring tools</li>
                            <li>• Secure payment processing</li>
                            <li>• Service quality ratings</li>
                            <li>• Project milestone tracking</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Audience demographic matching</li>
                            <li>• Content style analysis</li>
                            <li>• Brand safety alignment</li>
                            <li>• Performance prediction</li>
                            <li>• Budget range optimization</li>
                            <li>• Campaign type recommendations</li>
                            <li>• Engagement rate analysis</li>
                            <li>• Historical success patterns</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Deal Management</h5>
                          <p className="text-sm text-blue-100">Comprehensive tools for managing brand partnerships</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Contract templates and negotiation</li>
                            <li>• Payment milestone tracking</li>
                            <li>• Deliverable scheduling</li>
                            <li>• Performance reporting</li>
                            <li>• Brand communication tools</li>
                          </ul>
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
                      <li className="flex items-start gap-2">
                        <span>📈</span>
                        <div>
                          <h5 className="font-semibold">Performance Tracking</h5>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Real-time engagement metrics</li>
                            <li>• Audience growth analytics</li>
                            <li>• Content performance analysis</li>
                            <li>• Revenue tracking</li>
                            <li>• Campaign ROI measurement</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>👥</span>
                        <div>
                          <h5 className="font-semibold">Audience Insights</h5>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Demographic breakdowns</li>
                            <li>• Engagement patterns</li>
                            <li>• Interest analysis</li>
                            <li>• Geographic distribution</li>
                            <li>• Platform crossover data</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Custom Reporting</h5>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Brand campaign reports</li>
                            <li>• Growth trend analysis</li>
                            <li>• Competitive benchmarking</li>
                            <li>• Revenue forecasting</li>
                            <li>• Performance predictions</li>
                          </ul>
                        </div>
                      </li>
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
                {/* For Brands Card - Connection Benefits Dropdown */}
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• AI-powered creator matching</li>
                            <li>• Verified audience metrics</li>
                            <li>• Performance history access</li>
                            <li>• Direct creator communication</li>
                            <li>• Campaign coordination tools</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔨</span>
                        <div>
                          <h5 className="font-semibold">Service Access</h5>
                          <p className="text-sm text-blue-100">Find contractors and freelancers for your projects</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Vetted service provider network</li>
                            <li>• Project management suite</li>
                            <li>• Milestone-based payments</li>
                            <li>• Quality assurance tools</li>
                            <li>• Performance tracking</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Brand value alignment</li>
                            <li>• Audience overlap analysis</li>
                            <li>• Content quality scoring</li>
                            <li>• Performance predictions</li>
                            <li>• ROI forecasting</li>
                            <li>• Risk assessment</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📊</span>
                        <div>
                          <h5 className="font-semibold">Metrics Verification</h5>
                          <p className="text-sm text-blue-100">Access verified audience and engagement data</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Real audience verification</li>
                            <li>• Engagement authenticity</li>
                            <li>• Historical performance</li>
                            <li>• Brand safety scoring</li>
                            <li>• Demographic validation</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Campaign strategy templates</li>
                            <li>• Creator brief generation</li>
                            <li>• Timeline management</li>
                            <li>• Content approval workflows</li>
                            <li>• Multi-channel coordination</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💰</span>
                        <div>
                          <h5 className="font-semibold">Budget Management</h5>
                          <p className="text-sm text-blue-100">Track spending and ROI in real-time</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Budget allocation tools</li>
                            <li>• Payment scheduling</li>
                            <li>• ROI tracking</li>
                            <li>• Cost optimization</li>
                            <li>• Performance analytics</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Engagement analysis</li>
                            <li>• Conversion tracking</li>
                            <li>• Brand lift measurement</li>
                            <li>• Audience growth metrics</li>
                            <li>• Campaign impact assessment</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🛡️</span>
                        <div>
                          <h5 className="font-semibold">Brand Safety</h5>
                          <p className="text-sm text-blue-100">Automated content and audience verification</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Content monitoring</li>
                            <li>• Sentiment analysis</li>
                            <li>• Risk assessment</li>
                            <li>• Compliance tracking</li>
                            <li>• Safety score updates</li>
                          </ul>
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
                {/* For Contractors Card - Connection Benefits Dropdown */}
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Direct brand access</li>
                            <li>• Project bidding system</li>
                            <li>• Service package creation</li>
                            <li>• Portfolio showcase</li>
                            <li>• Client relationship tools</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🎥</span>
                        <div>
                          <h5 className="font-semibold">Creator Support</h5>
                          <p className="text-sm text-blue-100">Offer production and technical services to creators</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Creator network access</li>
                            <li>• Project matching</li>
                            <li>• Service promotion tools</li>
                            <li>• Collaboration features</li>
                            <li>• Resource scheduling</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Skill-based matching</li>
                            <li>• Budget alignment</li>
                            <li>• Timeline compatibility</li>
                            <li>• Project type filtering</li>
                            <li>• Priority notifications</li>
                            <li>• Custom search parameters</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🌟</span>
                        <div>
                          <h5 className="font-semibold">Portfolio Showcase</h5>
                          <p className="text-sm text-blue-100">Highlight your best work and services</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Project gallery</li>
                            <li>• Service descriptions</li>
                            <li>• Client testimonials</li>
                            <li>• Performance metrics</li>
                            <li>• Skills verification</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Timeline management</li>
                            <li>• Task organization</li>
                            <li>• Resource allocation</li>
                            <li>• Progress tracking</li>
                            <li>• Client reporting</li>
                            <li>• Team collaboration</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💰</span>
                        <div>
                          <h5 className="font-semibold">Payment Processing</h5>
                          <p className="text-sm text-blue-100">Secure, milestone-based payments</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Invoice generation</li>
                            <li>• Payment scheduling</li>
                            <li>• Milestone tracking</li>
                            <li>• Currency conversion</li>
                            <li>• Tax management</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Project completion rates</li>
                            <li>• Client satisfaction scores</li>
                            <li>• Revenue analytics</li>
                            <li>• Growth tracking</li>
                            <li>• Performance trends</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🏆</span>
                        <div>
                          <h5 className="font-semibold">Skill Endorsements</h5>
                          <p className="text-sm text-blue-100">Build credibility through verified reviews</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Client testimonials</li>
                            <li>• Skill verification</li>
                            <li>• Performance badges</li>
                            <li>• Industry certifications</li>
                            <li>• Expert status tracking</li>
                          </ul>
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
                {/* For Freelancers Card - Connection Benefits Dropdown */}
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Verified client network</li>
                            <li>• Direct messaging system</li>
                            <li>• Project discovery feed</li>
                            <li>• Client relationship tools</li>
                            <li>• Opportunity alerts</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🌟</span>
                        <div>
                          <h5 className="font-semibold">Project Opportunities</h5>
                          <p className="text-sm text-blue-100">Access a steady stream of relevant work</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Personalized job matching</li>
                            <li>• Quick application process</li>
                            <li>• Project recommendations</li>
                            <li>• Long-term opportunities</li>
                            <li>• Recurring client matching</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Package builder tool</li>
                            <li>• Pricing optimization</li>
                            <li>• Service tier management</li>
                            <li>• Add-on features</li>
                            <li>• Custom proposals</li>
                            <li>• Delivery timeline setup</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🎯</span>
                        <div>
                          <h5 className="font-semibold">Project Bidding</h5>
                          <p className="text-sm text-blue-100">Competitive proposal system</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Smart bid suggestions</li>
                            <li>• Proposal templates</li>
                            <li>• Competition insights</li>
                            <li>• Success rate analytics</li>
                            <li>• Client budget matching</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Time tracking tools</li>
                            <li>• Project scheduling</li>
                            <li>• Calendar integration</li>
                            <li>• Deadline management</li>
                            <li>• Availability settings</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>📝</span>
                        <div>
                          <h5 className="font-semibold">Invoice Generation</h5>
                          <p className="text-sm text-blue-100">Automated billing and payments</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Professional templates</li>
                            <li>• Automatic calculations</li>
                            <li>• Payment tracking</li>
                            <li>• Tax management</li>
                            <li>• Multi-currency support</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Earnings analytics</li>
                            <li>• Project success rates</li>
                            <li>• Client retention metrics</li>
                            <li>• Growth forecasting</li>
                            <li>• Performance benchmarks</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🏆</span>
                        <div>
                          <h5 className="font-semibold">Skill Verification</h5>
                          <p className="text-sm text-blue-100">Build trust with verified credentials</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Skill assessments</li>
                            <li>• Certification tracking</li>
                            <li>• Portfolio verification</li>
                            <li>• Client testimonials</li>
                            <li>• Experience validation</li>
                          </ul>
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
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Client communication tools</li>
                            <li>• Follow-up automation</li>
                            <li>• Relationship tracking</li>
                            <li>• Referral management</li>
                            <li>• Network analytics</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💫</span>
                        <div>
                          <h5 className="font-semibold">Community Access</h5>
                          <p className="text-sm text-blue-100">Connect with other professionals</p>
                          <ul className="mt-2 space-y-1 text-xs text-blue-100/80">
                            <li>• Professional forums</li>
                            <li>• Industry groups</li>
                            <li>• Collaboration opportunities</li>
                            <li>• Knowledge sharing</li>
                            <li>• Mentorship programs</li>
                          </ul>
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
            {/* Left Column - Story & Stats */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Our Story</h3>
              <p className="mb-8 text-gray-600">
                Founded by creators for creators, our platform bridges the gap between authentic content creation and brand partnerships. We're building the future of creator economics.
              </p>

              {/* Platform Evolution Timeline */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">Platform Evolution</h4>
                <div className="space-y-4">
                  {[
                    {
                      year: "2024",
                      title: "Platform Launch",
                      description: "Initial release with core features for creators and brands"
                    },
                    {
                      year: "2024 Q2",
                      title: "AI Integration",
                      description: "Advanced matching algorithms and analytics implementation"
                    },
                    {
                      year: "2024 Q3",
                      title: "Enterprise Solutions",
                      description: "Expanded features for agencies and large brands"
                    },
                    {
                      year: "2024 Q4",
                      title: "Global Expansion",
                      description: "International market penetration and localization"
                    }
                  ].map((milestone, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-24 font-bold text-blue-600">{milestone.year}</div>
                      <div>
                        <h5 className="font-medium">{milestone.title}</h5>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">2024</span>
                  <p className="text-sm text-gray-500">Founded</p>
                  <p className="text-xs text-gray-400">Silicon Valley, CA</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">$125M+</span>
                  <p className="text-sm text-gray-500">Creator Earnings</p>
                  <p className="text-xs text-gray-400">First 6 Months</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">10+</span>
                  <p className="text-sm text-gray-500">Expert Team Members</p>
                  <p className="text-xs text-gray-400">Industry Veterans</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-600">24/7</span>
                  <p className="text-sm text-gray-500">AI + Human Support</p>
                  <p className="text-xs text-gray-400">Global Coverage</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Content */}
            <div className="space-y-6">
              <img 
                src="https://picsum.photos/600/400" 
                alt="Team at work" 
                className="rounded-2xl shadow-lg mb-6"
              />
              
              {/* Mission & Vision Cards */}
              <div className="grid gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">Our Mission</h4>
                  <p className="text-gray-600">
                    To empower creators and brands to build authentic, profitable partnerships 
                    while maintaining creative integrity and maximizing mutual value.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h4 className="text-lg font-semibold text-blue-600 mb-2">Our Vision</h4>
                  <p className="text-gray-600">
                    To become the global standard for creator-brand collaborations, driving 
                    the future of digital content partnerships and creator economics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* New: Company Values Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-8 text-center">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🤝",
                  title: "Trust & Transparency",
                  description: "Building honest relationships through clear communication and verified metrics",
                  points: [
                    "Data-driven decisions",
                    "Verified analytics",
                    "Clear pricing",
                    "Open communication"
                  ]
                },
                {
                  icon: "💡",
                  title: "Innovation & Growth",
                  description: "Continuously evolving our platform to meet creator and brand needs",
                  points: [
                    "AI-powered solutions",
                    "Regular updates",
                    "User feedback integration",
                    "Market adaptation"
                  ]
                },
                {
                  icon: "🎯",
                  title: "Creator Success",
                  description: "Prioritizing creator growth and sustainable partnerships",
                  points: [
                    "Fair compensation",
                    "Creative freedom",
                    "Growth resources",
                    "Community support"
                  ]
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-3xl mb-4">{value.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                  <p className="text-gray-600 mb-4">{value.description}</p>
                  <ul className="space-y-2">
                    {value.points.map((point, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* New: Future Roadmap */}
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-8 text-center">Future Roadmap</h3>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    quarter: "Q2 2024",
                    title: "Enhanced Analytics",
                    features: [
                      "Advanced ROI tracking",
                      "Predictive metrics",
                      "Custom dashboards",
                      "Integration APIs"
                    ]
                  },
                  {
                    quarter: "Q3 2024",
                    title: "Global Expansion",
                    features: [
                      "Multi-language support",
                      "Regional pricing",
                      "Local partnerships",
                      "Cultural adaptation"
                    ]
                  },
                  {
                    quarter: "Q4 2024",
                    title: "Creator Tools",
                    features: [
                      "Content planning",
                      "Automated scheduling",
                      "Performance insights",
                      "Collaboration tools"
                    ]
                  },
                  {
                    quarter: "Q1 2025",
                    title: "Enterprise Features",
                    features: [
                      "Team management",
                      "Advanced security",
                      "Custom workflows",
                      "Priority support"
                    ]
                  }
                ].map((phase, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-semibold text-blue-600 mb-2">{phase.quarter}</div>
                    <h4 className="font-medium mb-4">{phase.title}</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {phase.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Our Commitment Section */}
      <section className="px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Our Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          {/* Creator Code of Ethics */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🤝</span>
              <h3 className="text-2xl font-bold">Creator Code of Ethics</h3>
            </div>
            <div className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Authentic Engagement Only</h4>
                    <p className="text-sm text-gray-600">We maintain strict policies against fake engagement and ensure all interactions are genuine and meaningful.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Transparent Disclosure</h4>
                    <p className="text-sm text-gray-600">Clear disclosure of partnerships and sponsored content to maintain trust with audiences.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Quality Content Promise</h4>
                    <p className="text-sm text-gray-600">Commitment to maintaining high content standards and creative integrity in all partnerships.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Audience Trust Priority</h4>
                    <p className="text-sm text-gray-600">Putting audience interests first in all partnership decisions and content creation.</p>
                  </div>
                </li>
              </ul>

              {/* New: Verification Process */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">Verification Process</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Regular account audits</li>
                  <li>• Engagement pattern analysis</li>
                  <li>• Content quality reviews</li>
                  <li>• Audience authenticity checks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Brand Standards */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🎯</span>
              <h3 className="text-2xl font-bold">Brand Standards</h3>
            </div>
            <div className="space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Fair Compensation</h4>
                    <p className="text-sm text-gray-600">Market-aligned rates and transparent payment structures for all creators.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Clear Expectations</h4>
                    <p className="text-sm text-gray-600">Detailed project briefs and well-defined deliverables for every partnership.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Timely Communication</h4>
                    <p className="text-sm text-gray-600">Responsive support and clear communication channels throughout projects.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  <div>
                    <h4 className="font-semibold mb-1">Creator Respect</h4>
                    <p className="text-sm text-gray-600">Valuing creative freedom and protecting creator intellectual property.</p>
                  </div>
                </li>
              </ul>

              {/* New: Quality Assurance */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">Quality Assurance</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Brand safety monitoring</li>
                  <li>• Content review process</li>
                  <li>• Performance tracking</li>
                  <li>• Satisfaction surveys</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* New: Additional Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mt-8">
          {/* Platform Security */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🔒</div>
            <h4 className="text-lg font-semibold mb-2">Platform Security</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Enterprise-grade encryption</li>
              <li>• Regular security audits</li>
              <li>• Data protection compliance</li>
              <li>• Secure payment processing</li>
            </ul>
          </div>

          {/* Community Support */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">👥</div>
            <h4 className="text-lg font-semibold mb-2">Community Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 24/7 customer service</li>
              <li>• Creator education resources</li>
              <li>• Community guidelines</li>
              <li>• Mentorship programs</li>
            </ul>
          </div>

          {/* Sustainable Growth */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-4">🌱</div>
            <h4 className="text-lg font-semibold mb-2">Sustainable Growth</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Long-term partnership focus</li>
              <li>• Eco-friendly initiatives</li>
              <li>• Social responsibility</li>
              <li>• Industry leadership</li>
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
      <footer className="bg-#FFFEFF text-black py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Sponsator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


