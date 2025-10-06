import { useState } from 'react';
import { Github, Twitter, Facebook, Instagram, Mail, CheckCircle, ChevronDown, ChevronUp, Phone, MapPin, Clock, Shield, HelpCircle, FileText, Users, Heart, Globe, Star, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const socialLinks = [
    { 
      icon: Github, 
      href: 'https://github.com/harshavardhan8059', 
      label: 'GitHub',
      color: 'hover:text-gray-400'
    },
    { 
      icon: Twitter, 
      href: 'https://twitter.com/streamflix', 
      label: 'Twitter',
      color: 'hover:text-blue-400'
    },
    { 
      icon: Facebook, 
      href: 'https://facebook.com/streamflix', 
      label: 'Facebook',
      color: 'hover:text-blue-600'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/harshavardhan8059?igsh=MWc5MHYwMjhtOXA0Ng==', 
      label: 'Instagram',
      color: 'hover:text-pink-400'
    },
  ];

  const quickLinks = [
    { name: 'Movies', path: '/movies', icon: Star },
    { name: 'TV Shows', path: '/tv', icon: Award },
    { name: 'Search', path: '/search', icon: Globe },
    { name: 'Trending', path: '/browse', icon: Zap },
  ];

  const supportLinks = [
    { name: 'Help Center', icon: HelpCircle },
    { name: 'Contact Us', icon: Mail },
    { name: 'Terms of Service', icon: FileText },
    { name: 'Privacy Policy', icon: Shield },
    { name: 'Community', icon: Users },
  ];

  const companyInfo = [
    { 
      icon: MapPin, 
      text: 'Hyderabad, Telangana, India',
      link: 'https://maps.google.com/?q=Hyderabad,Telangana,India'
    },
    { 
      icon: Phone, 
      text: '+91 9704257475',
      link: 'tel:+919704257475'
    },
    { 
      icon: Mail, 
      text: 'h0458572@gmail.com',
      link: 'mailto:h0458572@gmail.com'
    },
    { 
      icon: Clock, 
      text: '24/7 Support Available',
      link: null
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      setSubscribeStatus('loading');
      setErrorMessage('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubscribeStatus('success');
      setEmail('');
      
      // Reset success status after 4 seconds
      setTimeout(() => setSubscribeStatus('idle'), 4000);
    } catch (error) {
      setSubscribeStatus('error');
      setErrorMessage('Failed to subscribe. Please try again later.');
    }
  };

  const renderSectionContent = (section: string) => {
    switch (section) {
      case 'faq':
        return (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 dark:bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <HelpCircle size={16} className="sm:w-5 sm:h-5 text-blue-400" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">How do I create an account?</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Click "Sign Up" in the top right corner and follow the instructions. You'll need a valid email and password to get started.
                </p>
              </div>
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">What payment methods do you accept?</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay for your convenience.
                </p>
              </div>
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">Can I cancel anytime?</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Yes, you can cancel through your account settings. Your subscription remains active until the current billing period ends.
                </p>
              </div>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 dark:bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FileText size={16} className="sm:w-5 sm:h-5 text-green-400" />
              Terms of Service
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">Acceptance of Terms</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  By using our service, you agree to these terms. If you don't agree, you may not use our service.
                </p>
              </div>
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">User Responsibilities</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  You must provide accurate information, maintain account security, and use the service lawfully and respectfully.
                </p>
              </div>
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">Subscription Policy</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Fees are billed in advance and are non-refundable. You authorize us to charge your selected payment method.
                </p>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-800/50 dark:bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Shield size={16} className="sm:w-5 sm:h-5 text-purple-400" />
              Privacy Policy
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">Information We Collect</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  We collect information you provide when creating an account, subscribing, or contacting us for support.
                </p>
              </div>
              <div className="border-b border-gray-700/50 pb-2 sm:pb-3">
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">How We Use Information</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  We use data to provide services, respond to requests, send updates, and communicate relevant offers.
                </p>
              </div>
              <div>
                <h4 className="text-sm sm:text-md font-medium text-gray-300 mb-2">Data Security</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  We implement industry-standard security measures, but no Internet transmission is 100% secure.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="bg-[#141414] dark:bg-gray-900 py-8 sm:py-12 mt-auto border-t border-gray-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/20 via-transparent to-[#E50914]/10"></div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#E50914] to-[#f6121d] rounded-xl flex items-center justify-center shadow-lg">
                <Star size={16} className="sm:w-6 sm:h-6 text-white" fill="white" />
              </div>
              <h3 className="text-[#E50914] font-bold text-lg sm:text-2xl bg-gradient-to-r from-[#E50914] to-[#f6121d] bg-clip-text text-transparent">
                STREAMFLIX
              </h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
              Your ultimate destination for premium entertainment. Stream the latest movies and TV shows with exceptional quality and personalized recommendations.
            </p>
            
            {/* Company contact info */}
            <div className="space-y-2 sm:space-y-3">
              {companyInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3 group">
                  <info.icon size={14} className="sm:w-4 sm:h-4 text-gray-500 group-hover:text-[#E50914] transition-colors duration-200" />
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-xs sm:text-sm touch-target"
                      target={info.link.startsWith('http') ? '_blank' : '_self'}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {info.text}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">{info.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <Globe size={16} className="sm:w-5 sm:h-5 text-[#E50914]" />
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-800/50 touch-target"
                  >
                    <link.icon size={14} className="sm:w-4 sm:h-4 text-gray-500 group-hover:text-[#E50914] transition-colors duration-200" />
                    <span className="text-xs sm:text-sm">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <HelpCircle size={16} className="sm:w-5 sm:h-5 text-[#E50914]" />
              Help & Support
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => toggleSection(link.name.toLowerCase().replace(/\s+/g, ''))}
                    className="flex items-center justify-between w-full text-gray-400 hover:text-white transition-colors duration-200 group py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg hover:bg-gray-800/50 touch-target"
                  >
                    <div className="flex items-center gap-2">
                      <link.icon size={14} className="sm:w-4 sm:h-4 text-gray-500 group-hover:text-[#E50914] transition-colors duration-200" />
                      <span className="text-xs sm:text-sm">{link.name}</span>
                    </div>
                    {['faq', 'terms', 'privacy'].includes(link.name.toLowerCase().replace(/\s+/g, '')) && (
                      <div className="ml-2">
                        {expandedSection === link.name.toLowerCase().replace(/\s+/g, '') ? 
                          <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                        }
                      </div>
                    )}
                  </button>
                  {expandedSection === link.name.toLowerCase().replace(/\s+/g, '') && 
                   renderSectionContent(link.name.toLowerCase().replace(/\s+/g, ''))}
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <Mail size={16} className="sm:w-5 sm:h-5 text-[#E50914]" />
              Stay Updated
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest updates, exclusive offers, and new content releases.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-2 sm:space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent placeholder-gray-500 transition-all duration-200 mobile-form-input"
                />
                <Mail size={14} className="sm:w-4 sm:h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              
              <button
                type="submit"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className="w-full bg-gradient-to-r from-[#E50914] to-[#f6121d] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:from-[#f6121d] hover:to-[#E50914] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm mobile-btn"
              >
                {subscribeStatus === 'loading' ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Subscribing...
                  </>
                ) : subscribeStatus === 'success' ? (
                  <>
                    <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Heart size={14} className="sm:w-4 sm:h-4" />
                    Subscribe
                  </>
                )}
              </button>
              
              {errorMessage && (
                <p className="text-red-400 text-xs sm:text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {errorMessage}
                </p>
              )}
              
              {subscribeStatus === 'success' && (
                <p className="text-green-400 text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                  Successfully subscribed to newsletter!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-gray-800">
          {socialLinks.map(({ icon: Icon, href, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-gray-400 ${color} transition-all duration-200 p-2 sm:p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transform hover:scale-110 hover:shadow-lg touch-target`}
              aria-label={label}
              title={label}
            >
              <Icon size={16} className="sm:w-5 sm:h-5" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-xs sm:text-sm border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="flex items-center gap-2">
              <span>&copy; {currentYear} Streamflix. All rights reserved.</span>
            </p>
            <p className="flex items-center gap-2">
              <span>Developed with</span>
              <Heart size={12} className="sm:w-3.5 sm:h-3.5 text-red-500 animate-pulse" fill="currentColor" />
              <span>by</span>
              <a
                href="https://github.com/harshavardhan8059"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E50914] hover:text-[#f6121d] transition-colors duration-200 font-medium hover:underline touch-target"
              >
                HARSHA VARDHAN
              </a>
            </p>
          </div>
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/50">
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline touch-target"
              >
                The Movie Database (TMDB)
              </a>
              {' '}• Built with React, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;