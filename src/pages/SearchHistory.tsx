import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, X, Search, Trash2, ArrowRight, TrendingUp, Star, Calendar } from 'lucide-react';
import { searchContent } from '../services/api';
import ContentCard from '../components/movies/ContentCard';
import SEOHead from '../components/common/SEOHead';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters?: {
    type?: string;
    year?: string;
    genre?: string;
  };
}

const SearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SearchHistoryItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const parsedHistory = history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    })).sort((a: SearchHistoryItem, b: SearchHistoryItem) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    setSearchHistory(parsedHistory);
  };

  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
    setRecentResults([]);
    setSelectedHistoryItem(null);
  };

  const removeHistoryItem = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
    
    if (selectedHistoryItem?.id === id) {
      setSelectedHistoryItem(null);
      setRecentResults([]);
    }
  };

  const handleHistoryItemClick = async (item: SearchHistoryItem) => {
    setSelectedHistoryItem(item);
    setLoading(true);
    
    try {
      const data = await searchContent(item.query);
      setRecentResults(data.results?.slice(0, 12) || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setRecentResults([]);
    } finally {
      setLoading(false);
    }
  };

  const repeatSearch = (item: SearchHistoryItem) => {
    const params = new URLSearchParams();
    params.set('q', item.query);
    
    if (item.filters?.type && item.filters.type !== 'all') {
      params.set('type', item.filters.type);
    }
    if (item.filters?.year) {
      params.set('year', item.filters.year);
    }
    if (item.filters?.genre) {
      params.set('genre', item.filters.genre);
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  };

  const getPopularSearches = () => {
    const queryCount: { [key: string]: number } = {};
    searchHistory.forEach(item => {
      queryCount[item.query.toLowerCase()] = (queryCount[item.query.toLowerCase()] || 0) + 1;
    });
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([query, count]) => ({ query, count }));
  };

  const popularSearches = getPopularSearches();

  return (
    <>
      <SEOHead 
        title="Search History - Streamflix"
        description="View your search history and discover content you've previously searched for on Streamflix"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-[#141414] pt-20 pb-16 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Netflix-style Header */}
          <div className="mb-8 animate-fadeSlideUp">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Search History
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Revisit your previous searches and discover content you've explored
                </p>
              </div>
              
              {searchHistory.length > 0 && (
                <button
                  onClick={clearSearchHistory}
                  className="netflix-btn netflix-btn-secondary flex items-center gap-2 px-6 py-3"
                >
                  <Trash2 size={18} />
                  Clear All History
                </button>
              )}
            </div>
          </div>

          {searchHistory.length === 0 ? (
            /* Empty State - Netflix Style */
            <div className="text-center py-16 animate-fadeSlideUp">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                  <Search size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Search History Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Start exploring our vast collection of movies and TV shows. 
                  Your search history will appear here to help you quickly find content you've looked for before.
                </p>
                <Link 
                  to="/search"
                  className="netflix-btn netflix-btn-primary inline-flex items-center gap-2 px-8 py-3"
                >
                  <Search size={18} />
                  Start Searching
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Search History List - Netflix Style */}
              <div className="lg:col-span-1 space-y-6 animate-fadeSlideUp">
                
                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <div className="netflix-card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp size={20} className="text-[#E50914]" />
                      Popular Searches
                    </h3>
                    <div className="space-y-2">
                      {popularSearches.map(({ query, count }) => (
                        <button
                          key={query}
                          onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                          className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white font-medium group-hover:text-[#E50914] transition-colors duration-200">
                              {query}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {count}x
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                <div className="netflix-card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-[#E50914]" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                    {searchHistory.slice(0, 20).map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer group ${
                          selectedHistoryItem?.id === item.id
                            ? 'bg-red-50 dark:bg-red-900/20 border-[#E50914]/30'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleHistoryItemClick(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-[#E50914] transition-colors duration-200">
                              {item.query}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar size={12} />
                              <span>{formatTimeAgo(item.timestamp)}</span>
                              {item.resultsCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{item.resultsCount} results</span>
                                </>
                              )}
                            </div>
                            
                            {/* Filters Display */}
                            {(item.filters?.type !== 'all' || item.filters?.year || item.filters?.genre) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.filters.type !== 'all' && (
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                                    {item.filters.type}
                                  </span>
                                )}
                                {item.filters.year && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                                    {item.filters.year}
                                  </span>
                                )}
                                {item.filters.genre && (
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                                    {item.filters.genre}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                repeatSearch(item);
                              }}
                              className="p-2 text-gray-400 hover:text-[#E50914] transition-colors duration-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Repeat search"
                            >
                              <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeHistoryItem(item.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                              title="Remove from history"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Preview - Netflix Style */}
              <div className="lg:col-span-2 animate-fadeSlideUp animation-delay-200">
                {selectedHistoryItem ? (
                  <div className="netflix-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Results for "{selectedHistoryItem.query}"
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Searched {formatTimeAgo(selectedHistoryItem.timestamp)} • {selectedHistoryItem.resultsCount} total results
                        </p>
                      </div>
                      <button
                        onClick={() => repeatSearch(selectedHistoryItem)}
                        className="netflix-btn netflix-btn-primary flex items-center gap-2 px-4 py-2"
                      >
                        <Search size={16} />
                        Search Again
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="netflix-spinner"></div>
                      </div>
                    ) : recentResults.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {recentResults.map((item: any) => (
                          <div key={`${item.id}-${item.media_type}`} className="netflix-content-card">
                            <ContentCard 
                              item={item} 
                              type={item.media_type === 'tv' ? 'tv' : 'movie'} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                          No results available for this search
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="netflix-card p-12 text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                      <Search size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select a Search
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Click on any search from your history to preview the results
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchHistory;