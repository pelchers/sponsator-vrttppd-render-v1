import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useScrollAnimation(); // Initialize scroll animations

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 py-16 bg-gradient-to-b from-white to-blue-50">
        {/* Floating Emoji */}
        <span className="absolute top-[15%] right-[10%] text-4xl animate-float-delay-1">✨</span>
        
        {/* Hero Content */}
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
              className="bg-blue-600 hover:bg-green-500 text-white text-lg px-8 py-6
                transition-all duration-250 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Join as Creator
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/register')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-green-500 
                hover:border-green-500 hover:text-white text-lg px-8 py-6
                transition-all duration-250 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Join as Brand
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-in-delay-3">
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
      </section>

      {/* 2. How It Works */}
      <section className="relative py-16 bg-white scroll-fade invisible 
        transition-all duration-700 transform translate-y-10 opacity-0">
        <span className="absolute bottom-[10%] right-[10%] text-4xl animate-float-delay-2">⚡</span>
        <h2 className="text-4xl font-semibold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="relative p-8 rounded-2xl bg-white shadow-lg transition-all duration-250 hover:scale-105">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">1</div>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-4">Create Profile</h3>
            <p className="text-gray-600 mb-4">Set up your verified profile as a creator or brand</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>Portfolio showcase</li>
              <li>Metrics verification</li>
              <li>Audience analytics</li>
            </ul>
          </div>

          <div className="relative p-8 rounded-2xl bg-white shadow-lg transition-all duration-250 hover:scale-105">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">2</div>
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-4">Smart Match</h3>
            <p className="text-gray-600 mb-4">Our AI matches you with perfect partners</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>Interest alignment</li>
              <li>Audience fit</li>
              <li>Value matching</li>
            </ul>
          </div>

          <div className="relative p-8 rounded-2xl bg-white shadow-lg transition-all duration-250 hover:scale-105">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">3</div>
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-4">Collaborate</h3>
            <p className="text-gray-600 mb-4">Connect, negotiate, and create together</p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>Secure messaging</li>
              <li>Contract tools</li>
              <li>Project management</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Success Stories Testimonials */}
      <section className="relative py-16 bg-blue-600 text-white scroll-fade invisible 
        transition-all duration-700 transform translate-y-10 opacity-0">
        <h2 className="text-4xl font-semibold text-center mb-16">Success Stories</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            {/* Arrow Buttons */}
            <button 
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12
                text-white/80 hover:text-white transition-colors duration-250
                hidden md:flex items-center justify-center w-10 h-10
                rounded-full bg-white/10 hover:bg-white/20"
            >
              ←
            </button>
            <button 
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12
                text-white/80 hover:text-white transition-colors duration-250
                hidden md:flex items-center justify-center w-10 h-10
                rounded-full bg-white/10 hover:bg-white/20"
            >
              →
            </button>

            {/* Testimonial Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={testimonials[currentTestimonial].image} 
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover" 
                />
                <div>
                  <h3 className="font-semibold">{testimonials[currentTestimonial].name}</h3>
                  <span className="text-sm text-blue-200">{testimonials[currentTestimonial].role}</span>
                </div>
              </div>
              <p className="text-lg mb-6">"{testimonials[currentTestimonial].quote}"</p>
              <div className="flex justify-between text-sm text-blue-200">
                <span>{testimonials[currentTestimonial].stats.deals}</span>
                <span>{testimonials[currentTestimonial].stats.rate}</span>
              </div>
            </div>
            
            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-6">
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
      <section className="relative py-16 bg-gray-50 scroll-fade invisible">
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
      <section className="relative py-16 bg-gray-50 scroll-fade invisible">
        <h2 className="text-4xl font-semibold text-center mb-16">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Secure Messaging</h3>
            <p className="text-gray-600">End-to-end encrypted communication with built-in file sharing</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Real Analytics</h3>
            <p className="text-gray-600">Track performance metrics and campaign ROI in real-time</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
            <p className="text-gray-600">Automated agreements and payment processing system</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 hover:scale-105">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">AI Matching</h3>
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
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-gray-600">AI-powered creator-brand matching based on authentic alignment</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
            hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-4 animate-bounce delay-100">📈</div>
            <h3 className="text-xl font-semibold mb-2">Real Analytics</h3>
            <p className="text-gray-600">Deep insights into campaign performance and audience engagement</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-250 
            hover:scale-105 hover:shadow-xl">
            <div className="text-4xl mb-4 animate-bounce delay-200">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">Protected payments and clear contract management</p>
          </div>
        </div>
      </section>

      {/* 8. Success Stories Gallery */}
      <section className="relative py-16 px-4 bg-white scroll-fade invisible">
        <h2 className="text-4xl font-semibold text-center mb-16">Success Stories</h2>
        <div className="max-w-6xl mx-auto overflow-hidden">
          <div className="flex gap-8 overflow-hidden">
            <div className="flex animate-carousel">
              <div className="min-w-[800px] relative rounded-2xl overflow-hidden shadow-lg 
                transition-all duration-250 hover:scale-105 flex-shrink-0">
                <img src="https://picsum.photos/800/600?random=1" alt="Success Story 1" 
                  className="w-full h-[400px] object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-semibold mb-2">Beauty Brand Collab</h3>
                  <p>500K+ Reach • 25% Engagement</p>
                </div>
              </div>
              
              <div className="min-w-[800px] relative rounded-2xl overflow-hidden shadow-lg 
                transition-all duration-250 hover:scale-105 flex-shrink-0">
                <img src="https://picsum.photos/800/600?random=2" alt="Success Story 2" 
                  className="w-full h-[400px] object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-semibold mb-2">Tech Launch Campaign</h3>
                  <p>1M+ Impressions • 40K Conversions</p>
                </div>
              </div>
              
              <div className="min-w-[800px] relative rounded-2xl overflow-hidden shadow-lg 
                transition-all duration-250 hover:scale-105 flex-shrink-0">
                <img src="https://picsum.photos/800/600?random=3" alt="Success Story 3" 
                  className="w-full h-[400px] object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-2xl font-semibold mb-2">Fashion Collection</h3>
                  <p>300K+ Sales • 15% Attribution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. About Platform */}
      <section className="relative py-16 bg-gray-50 scroll-fade invisible">
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

      {/* 10. Our Commitment */}
      <section className="relative py-16 bg-white scroll-fade invisible">
        <span className="absolute top-[10%] left-[10%] text-4xl animate-float">🛡️</span>
        <h2 className="text-4xl font-semibold text-center mb-16">Our Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Creator Code of Ethics</h3>
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
            <h3 className="text-2xl font-semibold mb-6">Brand Standards</h3>
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

      {/* 11. Join Waitlist */}
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

      {/* 12. Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Our Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
