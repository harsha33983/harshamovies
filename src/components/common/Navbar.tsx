import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Tv, LogOut, Menu, X, User, Sun, Moon, Play, AlertCircle, Mic, Filter, Clock, History, Globe, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { searchHistoryService } from '../../services/searchHistory';
import VoiceSearch from './VoiceSearch';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    type: 'all',
    year: '',
    genre: '',
    language: ''
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [voiceError, setVoiceError] = useState('');
  const [showVoiceError, setShowVoiceError] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, systemPreference } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setRecentSearches(searchHistoryService.getRecentUniqueSearches(5));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      
      if (searchFilters.type !== 'all') {
        params.set('type', searchFilters.type);
      }
      if (searchFilters.year) {
        params.set('year', searchFilters.year);
      }
      if (searchFilters.genre) {
        params.set('genre', searchFilters.genre);
      }
      if (searchFilters.language) {
        params.set('language', searchFilters.language);
      }
      
      navigate(`/search?${params.toString()}`);
      setSearchQuery('');
      setShowMobileMenu(false);
      setShowSearchFilters(false);
      setShowSearchSuggestions(false);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    if (transcript.trim()) {
      setSearchQuery(transcript);
      setTimeout(() => {
        const params = new URLSearchParams();
        params.set('q', transcript.trim());
        
        if (searchFilters.type !== 'all') {
          params.set('type', searchFilters.type);
        }
        if (searchFilters.year) {
          params.set('year', searchFilters.year);
        }
        if (searchFilters.genre) {
          params.set('genre', searchFilters.genre);
        }
        if (searchFilters.language) {
          params.set('language', searchFilters.language);
        }
        
        navigate(`/search?${params.toString()}`);
        setSearchQuery('');
        setShowMobileMenu(false);
        setShowSearchFilters(false);
        setShowSearchSuggestions(false);
      }, 500);
    }
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setShowVoiceError(true);
    setTimeout(() => {
      setShowVoiceError(false);
    }, 5000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      type: 'all',
      year: '',
      genre: '',
      language: ''
    });
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setShowSearchSuggestions(false);
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', query);
      navigate(`/search?${params.toString()}`);
      setSearchQuery('');
    }, 100);
  };

  const hasActiveFilters = searchFilters.type !== 'all' || searchFilters.year || searchFilters.genre || searchFilters.language;

  // Enhanced theme toggle component
  const GeeksThemeToggle = ({ isMobile = false }) => (
    <div className="flex items-center gap-2">
      {!isMobile && (
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block font-medium">
          {theme === systemPreference ? 'Auto' : theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
      <div className="relative">
        <button
          onClick={toggleTheme}
          className={`relative w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 touch-target ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-gradient-to-r from-orange-400 to-yellow-400'
          }`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Current: ${theme} mode${theme === systemPreference ? ' (matches system)' : ''}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-in-out flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0.5'
          }`}>
            {theme === 'dark' ? (
              <Moon size={10} className="sm:w-3 sm:h-3 text-blue-600" />
            ) : (
              <Sun size={10} className="sm:w-3 sm:h-3 text-orange-500" />
            )}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-between px-1 sm:px-1.5">
            <Sun size={10} className="sm:w-3 sm:h-3 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-30' : 'opacity-70'} text-white" />
            <Moon size={10} className="sm:w-3 sm:h-3 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-70' : 'opacity-30'} text-white" />
          </div>
        </button>
      </div>
    </div>
  );

  // Clear and accurate search filters component
  const SearchFilters = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 z-50 animate-fadeSlideUp backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Filter size={16} className="sm:w-5 sm:h-5 text-[#E50914]" />
          Search Filters
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveFilters && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {Object.values(searchFilters).filter(v => v && v !== 'all').length} active
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 touch-target"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowSearchFilters(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 touch-target"
          >
            <ChevronUp size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Content Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Content Type
          </label>
          <select
            value={searchFilters.type}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 mobile-form-input"
          >
            <option value="all">🎬 All Content</option>
            <option value="movie">🎥 Movies Only</option>
            <option value="tv">📺 TV Shows Only</option>
            <option value="person">👤 People</option>
          </select>
        </div>

        {/* Year Filter with Calendar Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
            Release Year
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g. 2024"
              value={searchFilters.year}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 mobile-form-input"
              min="1900"
              max="2030"
              list="years"
            />
            <datalist id="years">
              {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Genre
          </label>
          <select
            value={searchFilters.genre}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, genre: e.target.value }))}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 mobile-form-input"
          >
            <option value="">🎭 All Genres</option>
            <option value="action">⚡ Action</option>
            <option value="adventure">🗺️ Adventure</option>
            <option value="animation">🎨 Animation</option>
            <option value="comedy">😂 Comedy</option>
            <option value="crime">🔍 Crime</option>
            <option value="documentary">📚 Documentary</option>
            <option value="drama">🎭 Drama</option>
            <option value="family">👨‍👩‍👧‍👦 Family</option>
            <option value="fantasy">🧙‍♂️ Fantasy</option>
            <option value="history">📜 History</option>
            <option value="horror">👻 Horror</option>
            <option value="music">🎵 Music</option>
            <option value="mystery">🕵️ Mystery</option>
            <option value="romance">💕 Romance</option>
            <option value="science fiction">🚀 Sci-Fi</option>
            <option value="thriller">😰 Thriller</option>
            <option value="war">⚔️ War</option>
            <option value="western">🤠 Western</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Globe size={12} className="sm:w-3.5 sm:h-3.5" />
            Language
          </label>
          <select
            value={searchFilters.language}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 mobile-form-input"
          >
            <option value="">🌍 All Languages</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
            <option value="it">🇮🇹 Italian</option>
            <option value="pt">🇵🇹 Portuguese</option>
            <option value="ru">🇷🇺 Russian</option>
            <option value="ja">🇯🇵 Japanese</option>
            <option value="ko">🇰🇷 Korean</option>
            <option value="zh">🇨🇳 Chinese</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="ar">🇸🇦 Arabic</option>
            <option value="nl">🇳🇱 Dutch</option>
            <option value="sv">🇸🇪 Swedish</option>
            <option value="no">🇳🇴 Norwegian</option>
            <option value="da">🇩🇰 Danish</option>
            <option value="fi">🇫🇮 Finnish</option>
            <option value="pl">🇵🇱 Polish</option>
            <option value="cs">🇨🇿 Czech</option>
            <option value="hu">🇭🇺 Hungarian</option>
            <option value="ro">🇷🇴 Romanian</option>
            <option value="bg">🇧🇬 Bulgarian</option>
            <option value="el">🇬🇷 Greek</option>
            <option value="tr">🇹🇷 Turkish</option>
            <option value="he">🇮🇱 Hebrew</option>
            <option value="th">🇹🇭 Thai</option>
            <option value="vi">🇻🇳 Vietnamese</option>
            <option value="id">🇮🇩 Indonesian</option>
            <option value="ms">🇲🇾 Malay</option>
            <option value="tl">🇵🇭 Tagalog</option>
            <option value="te">🇮🇳 Telugu</option>
            <option value="ta">🇮🇳 Tamil</option>
            <option value="bn">🇮🇳 Bengali</option>
            <option value="mr">🇮🇳 Marathi</option>
            <option value="gu">🇮🇳 Gujarati</option>
            <option value="pa">🇮🇳 Punjabi</option>
            <option value="kn">🇮🇳 Kannada</option>
            <option value="ml">🇮🇳 Malayalam</option>
            <option value="ur">🇵🇰 Urdu</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Quick Presets:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchFilters({ type: 'movie', year: '2024', genre: '', language: '' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full hover:from-blue-200 hover:to-blue-300 dark:hover:from-blue-800/50 dark:hover:to-blue-700/50 transition-all duration-200 font-medium border border-blue-200 dark:border-blue-700 touch-target"
          >
            🎬 2024 Movies
          </button>
          <button
            onClick={() => setSearchFilters({ type: 'tv', year: '', genre: 'action', language: '' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-800 dark:text-red-300 rounded-full hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/50 dark:hover:to-red-700/50 transition-all duration-200 font-medium border border-red-200 dark:border-red-700 touch-target"
          >
            ⚡ Action TV
          </button>
          <button
            onClick={() => setSearchFilters({ type: 'movie', year: '', genre: 'comedy', language: '' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-300 rounded-full hover:from-yellow-200 hover:to-yellow-300 dark:hover:from-yellow-800/50 dark:hover:to-yellow-700/50 transition-all duration-200 font-medium border border-yellow-200 dark:border-yellow-700 touch-target"
          >
            😂 Comedy
          </button>
          <button
            onClick={() => setSearchFilters({ type: 'all', year: '', genre: '', language: 'hi' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-800 dark:text-orange-300 rounded-full hover:from-orange-200 hover:to-orange-300 dark:hover:from-orange-800/50 dark:hover:to-orange-700/50 transition-all duration-200 font-medium border border-orange-200 dark:border-orange-700 touch-target"
          >
            🇮🇳 Hindi Content
          </button>
          <button
            onClick={() => setSearchFilters({ type: 'all', year: '', genre: '', language: 'ja' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 text-pink-800 dark:text-pink-300 rounded-full hover:from-pink-200 hover:to-pink-300 dark:hover:from-pink-800/50 dark:hover:to-pink-700/50 transition-all duration-200 font-medium border border-pink-200 dark:border-pink-700 touch-target"
          >
            🇯🇵 Japanese
          </button>
          <button
            onClick={() => setSearchFilters({ type: 'all', year: '', genre: 'horror', language: '' })}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-800 dark:text-purple-300 rounded-full hover:from-purple-200 hover:to-purple-300 dark:hover:from-purple-800/50 dark:hover:to-purple-700/50 transition-all duration-200 font-medium border border-purple-200 dark:border-purple-700 touch-target"
          >
            👻 Horror
          </button>
        </div>
      </div>
    </div>
  );

  // Search suggestions dropdown
  const SearchSuggestions = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-fadeSlideUp backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
          Recent Searches
        </h3>
        <Link
          to="/search-history"
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 touch-target"
          onClick={() => setShowSearchSuggestions(false)}
        >
          <History size={10} className="sm:w-3 sm:h-3" />
          View All
        </Link>
      </div>
      
      {recentSearches.length > 0 ? (
        <div className="space-y-1">
          {recentSearches.map((query, index) => (
            <button
              key={index}
              onClick={() => handleRecentSearchClick(query)}
              className="w-full text-left p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 sm:gap-3 text-sm text-gray-700 dark:text-gray-300 group touch-target"
            >
              <Search size={12} className="sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-[#E50914] transition-colors duration-200" />
              <span className="truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">{query}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent searches</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start searching to see your history here</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <header 
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled || showMobileMenu 
            ? 'bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md shadow-lg' 
            : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-[#E50914] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#E50914] rounded-lg flex items-center justify-center shadow-lg">
              <Play size={10} className="sm:w-3 sm:h-3 md:w-5 md:h-5" fill="white" />
            </div>
            <span className="bg-gradient-to-r from-[#E50914] to-[#f6121d] bg-clip-text text-transparent hidden sm:inline">
              STREAMFLIX
            </span>
            <span className="bg-gradient-to-r from-[#E50914] to-[#f6121d] bg-clip-text text-transparent sm:hidden">
              SF
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6">
            <Link 
              to="/" 
              className={`netflix-nav-link ${
                location.pathname === '/' ? 'netflix-nav-link-active' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className={`netflix-nav-link ${
                location.pathname === '/movies' ? 'netflix-nav-link-active' : ''
              }`}
            >
              <Film size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              Movies
            </Link>
            <Link 
              to="/tv" 
              className={`netflix-nav-link ${
                location.pathname === '/tv' ? 'netflix-nav-link-active' : ''
              }`}
            >
              <Tv size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
              TV Shows
            </Link>

            {/* Enhanced search form */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search movies, shows, people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    className="netflix-search-input"
                  />
                  <Search size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  
                  {/* Enhanced filter button */}
                  <button
                    type="button"
                    onClick={() => setShowSearchFilters(!showSearchFilters)}
                    className={`absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 rounded-lg transition-all duration-200 touch-target ${
                      hasActiveFilters
                        ? 'text-[#E50914] bg-red-50 dark:bg-red-900/20 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title={hasActiveFilters ? `${Object.values(searchFilters).filter(v => v && v !== 'all').length} filters active` : 'Advanced search filters'}
                  >
                    {showSearchFilters ? <ChevronUp size={12} className="sm:w-3.5 sm:h-3.5" /> : <Filter size={12} className="sm:w-3.5 sm:h-3.5" />}
                    {hasActiveFilters && (
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E50914] rounded-full"></div>
                    )}
                  </button>
                </div>
                
                <div className="ml-1 sm:ml-2">
                  <VoiceSearch
                    onResult={handleVoiceResult}
                    onError={handleVoiceError}
                    disabled={false}
                  />
                </div>
              </form>
              
              {showSearchSuggestions && <SearchSuggestions />}
              {showSearchFilters && <SearchFilters />}
            </div>

            <GeeksThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2 lg:gap-3 xl:gap-4">
                <Link 
                  to="/search-history"
                  className="netflix-nav-link"
                  title="Search History"
                >
                  <History size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden xl:inline">History</span>
                </Link>
                <Link 
                  to="/profile"
                  className="netflix-nav-link"
                >
                  <User size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="netflix-nav-link"
                >
                  <LogOut size={12} className="sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="netflix-btn netflix-btn-primary"
              >
                Sign In
              </Link>
            )}
          </nav>

          <button 
            className="md:hidden text-gray-700 dark:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 touch-target"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-gray-700 shadow-lg mobile-nav-overlay">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Mobile search form */}
              <div className="relative mobile-search-container">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search movies, shows, people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                      className="netflix-search-input-mobile"
                    />
                    <Search size={14} className="sm:w-4 sm:h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    
                    <button
                      type="button"
                      onClick={() => setShowSearchFilters(!showSearchFilters)}
                      className={`absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200 touch-target ${
                        hasActiveFilters
                          ? 'text-[#E50914] bg-red-50 dark:bg-red-900/20 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      title="Advanced search filters"
                    >
                      {showSearchFilters ? <ChevronUp size={14} className="sm:w-4 sm:h-4" /> : <Filter size={14} className="sm:w-4 sm:h-4" />}
                      {hasActiveFilters && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E50914] rounded-full"></div>
                      )}
                    </button>
                    
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <VoiceSearch
                        onResult={handleVoiceResult}
                        onError={handleVoiceError}
                        disabled={false}
                      />
                    </div>
                  </div>
                </form>
                
                {showSearchSuggestions && <SearchSuggestions />}
                {showSearchFilters && <SearchFilters />}
              </div>
              
              <nav className="flex flex-col space-y-2 sm:space-y-3">
                <Link 
                  to="/" 
                  className={`netflix-mobile-nav-link ${
                    location.pathname === '/' ? 'netflix-mobile-nav-link-active' : ''
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/movies" 
                  className={`netflix-mobile-nav-link ${
                    location.pathname === '/movies' ? 'netflix-mobile-nav-link-active' : ''
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Film size={14} className="sm:w-4 sm:h-4" />
                  Movies
                </Link>
                <Link 
                  to="/tv" 
                  className={`netflix-mobile-nav-link ${
                    location.pathname === '/tv' ? 'netflix-mobile-nav-link-active' : ''
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Tv size={14} className="sm:w-4 sm:h-4" />
                  TV Shows
                </Link>

                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Theme</span>
                  <GeeksThemeToggle isMobile={true} />
                </div>
                
                {currentUser ? (
                  <>
                    <Link 
                      to="/search-history"
                      className="netflix-mobile-nav-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <History size={14} className="sm:w-4 sm:h-4" />
                      Search History
                    </Link>
                    <Link 
                      to="/profile"
                      className="netflix-mobile-nav-link"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User size={14} className="sm:w-4 sm:h-4" />
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="netflix-mobile-nav-link w-full text-left"
                    >
                      <LogOut size={14} className="sm:w-4 sm:h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="netflix-btn netflix-btn-primary text-center mobile-btn"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Voice Error Toast */}
      {showVoiceError && (
        <div className="fixed top-16 sm:top-20 md:top-24 right-2 sm:right-4 z-50 bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg animate-fadeSlideUp max-w-xs sm:max-w-sm">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-xs sm:text-sm">Voice Search Error</p>
              <p className="text-xs opacity-90 mt-1">{voiceError}</p>
            </div>
            <button
              onClick={() => setShowVoiceError(false)}
              className="ml-2 text-white/80 hover:text-white transition-colors touch-target"
            >
              <X size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;