import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, ChevronLeft, Youtube, X, Heart, Share2, Copy, Check, Facebook, Twitter, MessageCircle, Award, Users, Film, Globe } from 'lucide-react';
import { fetchTVDetails, getImageUrl } from '../services/api';
import ContentRow from '../components/movies/ContentRow';
import LoadingScreen from '../components/common/LoadingScreen';
import SEOHead from '../components/common/SEOHead';

const TVDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchTVDetails(id);
        setShow(data);
        
        // Initialize like status from localStorage
        const likedShows = JSON.parse(localStorage.getItem('likedShows') || '{}');
        setIsLiked(!!likedShows[id]);
        
        // Set initial like count
        const localLikes = parseInt(localStorage.getItem(`show_${id}_likes`) || '0');
        setLikeCount(Math.floor((data.vote_count || 0) / 100) + localLikes);
        
        // Preload the backdrop image
        if (data.backdrop_path) {
          const img = new Image();
          img.onload = () => setImageLoaded(true);
          img.src = getImageUrl(data.backdrop_path, 'original');
        }
      } catch (err) {
        console.error('Error fetching TV show details:', err);
        setError('Failed to load TV show details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // Close modals when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTrailer(false);
        setShowShareMenu(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('netflix-modal')) {
        setShowTrailer(false);
      }
    };

    if (showTrailer) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showTrailer]);

  const handleLike = () => {
    if (!id) return;
    
    const likedShows = JSON.parse(localStorage.getItem('likedShows') || '{}');
    const newLikedState = !isLiked;
    
    if (newLikedState) {
      likedShows[id] = true;
      setLikeCount(prev => prev + 1);
      localStorage.setItem(`show_${id}_likes`, (parseInt(localStorage.getItem(`show_${id}_likes`) || '0') + 1).toString());
    } else {
      delete likedShows[id];
      setLikeCount(prev => Math.max(0, prev - 1));
      localStorage.setItem(`show_${id}_likes`, Math.max(0, parseInt(localStorage.getItem(`show_${id}_likes`) || '0') - 1).toString());
    }
    
    localStorage.setItem('likedShows', JSON.stringify(likedShows));
    setIsLiked(newLikedState);
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = `Check out ${show.name} on Streamflix!`;
    const text = `${show.name} - ${show.overview?.substring(0, 100)}...`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url });
          } catch (err) {
            console.log('Share cancelled');
          }
        } else {
          setShowShareMenu(!showShareMenu);
        }
    }
  };

  // Handle video errors
  const handleVideoError = () => {
    setVideoError(true);
  };

  // Close video modal
  const closeVideoModal = () => {
    setShowTrailer(false);
    setVideoError(false);
  };

  if (loading) return <LoadingScreen />;

  if (error || !show) {
    return (
      <>
        <SEOHead 
          title="TV Show Not Found - Streamflix"
          description="The requested TV show could not be found"
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#141414]">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4 text-[#E50914]">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'TV show not found'}</p>
            <Link 
              to="/"
              className="netflix-btn netflix-btn-primary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get language name from ISO code
  const getLanguageName = (languageCode: string) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'hi': 'Hindi',
      'ar': 'Arabic',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'pl': 'Polish',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'el': 'Greek',
      'tr': 'Turkish',
      'he': 'Hebrew',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Tagalog',
      'te': 'Telugu',
      'ta': 'Tamil',
      'bn': 'Bengali',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'pa': 'Punjabi',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'ur': 'Urdu'
    };
    return languageNames[languageCode] || languageCode.toUpperCase();
  };

  const trailer = show.videos?.results?.find(
    (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
  );

  const creators = show.created_by || [];
  const director = show.credits?.crew?.find((person: any) => person.job === 'Director');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": show.name,
    "description": show.overview,
    "image": `https://image.tmdb.org/t/p/w500${show.poster_path}`,
    "datePublished": show.first_air_date,
    "genre": show.genres?.map((g: any) => g.name),
    "inLanguage": show.original_language,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": show.vote_average,
      "ratingCount": show.vote_count,
      "bestRating": 10,
      "worstRating": 0
    },
    "creator": creators.map((creator: any) => ({
      "@type": "Person",
      "name": creator.name
    })),
    "actor": show.credits?.cast?.slice(0, 10).map((actor: any) => ({
      "@type": "Person",
      "name": actor.name
    })),
    "productionCompany": show.production_companies?.map((company: any) => ({
      "@type": "Organization",
      "name": company.name
    }))
  };

  return (
    <>
      <SEOHead 
        title={`${show.name} (${show.first_air_date?.split('-')[0]}) - Watch on Streamflix`}
        description={`Watch ${show.name} on Streamflix. ${show.overview?.substring(0, 150)}...`}
        keywords={`${show.name}, TV show, watch online, ${show.genres?.map((g: any) => g.name).join(', ')}, ${getLanguageName(show.original_language)}`}
        image={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
        url={`https://streamflix.app/tv/${id}`}
        type="video.tv_show"
        structuredData={structuredData}
      />

      <div className="min-h-screen relative bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
        {/* Enhanced Show-specific Background with Perfect Visibility */}
        <div className="fixed inset-0 z-0">
          {/* Primary Background Image - Limited to this show only */}
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(${getImageUrl(show.backdrop_path, 'original')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
            }}
          />

          {/* Fallback Background */}
          <div 
            className={`absolute inset-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{
              backgroundImage: `url(${getImageUrl(show.poster_path, 'w500')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(20px) brightness(0.3)',
              transform: 'scale(1.1)'
            }}
          />

          {/* Optimized Gradient Overlays for Perfect Background Visibility */}
          {/* Light Mode Overlays - Minimal opacity for maximum image visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/50 to-white/10 dark:from-[#141414]/85 dark:via-[#141414]/50 dark:to-[#141414]/10 transition-colors duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent dark:from-[#141414]/70 dark:via-[#141414]/30 dark:to-transparent transition-colors duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 dark:to-[#141414]/90 transition-colors duration-500"></div>
          
          {/* Minimal additional overlay for text readability only */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/20 transition-colors duration-500"></div>
        </div>

        {/* Enhanced Trailer Modal with Better Error Handling */}
        {showTrailer && (
          <div className="netflix-modal" onClick={closeVideoModal}>
            <div className="netflix-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                  onClick={closeVideoModal}
                  className="bg-black/80 hover:bg-black text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg backdrop-blur-sm border border-white/20"
                  aria-label="Close trailer"
                >
                  <X size={20} />
                </button>
              </div>
              
              {videoError ? (
                <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                  <div className="text-center text-white p-8">
                    <Youtube size={48} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold mb-2">Trailer Unavailable</h3>
                    <p className="text-gray-300 mb-4">
                      This trailer cannot be played due to restrictions or availability issues.
                    </p>
                    <button
                      onClick={closeVideoModal}
                      className="bg-[#E50914] hover:bg-[#f6121d] text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : trailer ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1&fs=1&enablejsapi=1&origin=${window.location.origin}`}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${show.name} Trailer`}
                  onError={handleVideoError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
                  <div className="text-center text-white p-8">
                    <Youtube size={48} className="mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-bold mb-2">No Trailer Available</h3>
                    <p className="text-gray-300 mb-4">
                      No trailer is currently available for this TV show.
                    </p>
                    <button
                      onClick={closeVideoModal}
                      className="bg-[#E50914] hover:bg-[#f6121d] text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back button */}
        <Link 
          to="/"
          className="fixed top-20 left-2 sm:left-4 z-40 netflix-btn-icon"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-white" />
        </Link>

        {/* Main Content */}
        <div className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-7xl">
            
            {/* Show Header Section */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              
              {/* Show Poster */}
              <div className="flex-none">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#E50914] to-[#f6121d] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-2xl shadow-2xl">
                    <img 
                      src={getImageUrl(show.poster_path, 'w500')}
                      alt={show.name}
                      className="w-64 sm:w-80 h-auto rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(show.name)}&size=500&background=1f2937&color=ffffff&format=png`;
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Show Information */}
              <div className="flex-1 space-y-6">
                
                {/* Title and Basic Info */}
                <div>
                  <h1 className="netflix-title mb-4 text-gray-900 dark:text-white drop-shadow-2xl transition-colors duration-300">
                    {show.name}
                  </h1>
                  
                  {show.tagline && (
                    <p className="netflix-subtitle mb-4 opacity-90 drop-shadow-lg text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      "{show.tagline}"
                    </p>
                  )}
                  
                  {/* Rating, Date, Seasons, Language */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {show.vote_average && (
                      <div className="flex items-center bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-400/50 shadow-lg">
                        <Star size={16} className="text-yellow-500 mr-2" fill="currentColor" />
                        <span className="text-gray-900 dark:text-white font-semibold">{(show.vote_average / 10 * 5).toFixed(1)}</span>
                        <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">/5</span>
                      </div>
                    )}

                    {show.first_air_date && (
                      <div className="flex items-center bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/50 shadow-lg">
                        <Calendar size={16} className="text-blue-500 mr-2" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {new Date(show.first_air_date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}

                    {show.number_of_seasons && (
                      <div className="flex items-center bg-gradient-to-r from-green-500/30 to-teal-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-green-400/50 shadow-lg">
                        <Clock size={16} className="text-green-500 mr-2" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                        </span>
                      </div>
                    )}

                    {/* Language Display */}
                    {show.original_language && (
                      <div className="flex items-center bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-400/50 shadow-lg">
                        <Globe size={16} className="text-indigo-500 mr-2" />
                        <span className="text-gray-900 dark:text-white font-medium">{getLanguageName(show.original_language)}</span>
                      </div>
                    )}

                    {/* Like Count Display */}
                    <div className="flex items-center bg-gradient-to-r from-pink-500/30 to-red-500/30 backdrop-blur-md px-4 py-2 rounded-full border border-pink-400/50 shadow-lg">
                      <Heart size={16} className="text-pink-500 mr-2" />
                      <span className="text-gray-900 dark:text-white font-medium">{likeCount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Genres */}
                  {show.genres && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {show.genres.map((genre: any) => (
                        <span 
                          key={genre.id}
                          className="px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-gray-900 dark:text-white border border-white/30 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overview */}
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Overview</h2>
                  <p className="netflix-body text-gray-800 dark:text-gray-200 text-lg font-light leading-relaxed transition-colors duration-300">
                    {show.overview}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="netflix-btn netflix-btn-primary text-lg shadow-xl"
                  >
                    <Play size={20} fill="white" />
                    <span>Play</span>
                  </button>
                  
                  {/* Action Buttons Row */}
                  <div className="flex gap-3">
                    {trailer && (
                      <button 
                        onClick={() => {
                          setVideoError(false);
                          setShowTrailer(true);
                        }}
                        className="netflix-btn netflix-btn-secondary shadow-lg"
                      >
                        <Youtube size={18} />
                        <span className="hidden sm:inline">Trailer</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleLike}
                      className={`netflix-btn-icon shadow-lg ${
                        isLiked 
                          ? 'bg-pink-500/30 border-pink-400/50 text-pink-600 dark:text-pink-300' 
                          : 'bg-white/20 hover:bg-white/30 border-white/30 text-gray-900 dark:text-white'
                      }`}
                      title={isLiked ? 'Unlike this show' : 'Like this show'}
                    >
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => handleShare()}
                        className="netflix-btn-icon shadow-lg bg-white/20 hover:bg-white/30 border-white/30 text-gray-900 dark:text-white"
                        title="Share this show"
                      >
                        <Share2 size={18} />
                      </button>
                      
                      {showShareMenu && (
                        <div className="absolute top-full mt-2 right-0 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-lg p-4 border border-gray-200 dark:border-white/20 min-w-[200px] z-50 shadow-xl">
                          <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm">Share this show</h3>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleShare('copy')}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                            >
                              {copySuccess ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                              {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button
                              onClick={() => handleShare('facebook')}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                            >
                              <Facebook size={16} />
                              Facebook
                            </button>
                            <button
                              onClick={() => handleShare('twitter')}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                            >
                              <Twitter size={16} />
                              Twitter
                            </button>
                            <button
                              onClick={() => handleShare('whatsapp')}
                              className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm"
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Show Info Grid with Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              
              {/* Creators */}
              {creators.length > 0 && (
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Award size={24} className="text-purple-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Creators</h3>
                  </div>
                  <div className="space-y-1">
                    {creators.slice(0, 3).map((creator: any, index: number) => (
                      <p key={index} className="text-purple-600 dark:text-purple-400 font-medium">{creator.name}</p>
                    ))}
                    {creators.length > 3 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">+{creators.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Language & Country */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Globe size={24} className="text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Language</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{getLanguageName(show.original_language)}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Original Language</p>
                  </div>
                  {show.production_countries && show.production_countries.length > 0 && (
                    <div>
                      <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{show.production_countries[0].name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Production Country</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Director (if available) */}
              {director && (
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Film size={24} className="text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Director</h3>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{director.name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Episode Director</p>
                </div>
              )}

              {/* Rating & Votes */}
              {show.vote_count && (
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/20 dark:border-white/10 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Users size={24} className="text-orange-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Audience</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{show.vote_count.toLocaleString()}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Total Votes</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reduced Cast Section - Limited to Cast Only */}
            {show.credits?.cast && show.credits.cast.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3 transition-colors duration-300">
                  <Users size={28} className="text-[#E50914]" />
                  Cast
                </h2>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
                  {show.credits.cast.slice(0, 20).map((person: any) => (
                    <Link 
                      key={person.id} 
                      to={`/person/${person.id}`}
                      className="group cursor-pointer bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <div className="relative aspect-square bg-gray-300 dark:bg-gray-700 overflow-hidden">
                        {person.profile_path ? (
                          <img 
                            src={getImageUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&size=185&background=374151&color=ffffff&format=png`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-1.5">
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-[#E50914] transition-colors duration-200 truncate text-xs">
                          {person.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                          {person.character}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Shows with Dark Background */}
            {show.similar?.results && show.similar.results.length > 0 && (
              <div className="mb-8">
                <ContentRow title="Similar Shows" items={show.similar.results} type="tv" isDarkBackground={true} />
              </div>
            )}

            {/* Recommendations with Dark Background */}
            {show.recommendations?.results && show.recommendations.results.length > 0 && (
              <div className="mb-8">
                <ContentRow title="Recommended" items={show.recommendations.results} isDarkBackground={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TVDetails;