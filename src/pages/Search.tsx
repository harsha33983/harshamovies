import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchContent, getImageUrl } from '../services/api';
import { searchHistoryService } from '../services/searchHistory';
import LoadingScreen from '../components/common/LoadingScreen';
import ContentCard from '../components/movies/ContentCard';
import { Filter, X, Globe, Calendar, Film, Tv, User, CheckCircle, AlertTriangle } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeFilter = searchParams.get('type') || 'all';
  const yearFilter = searchParams.get('year') || '';
  const genreFilter = searchParams.get('genre') || '';
  const languageFilter = searchParams.get('language') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  // Language mapping for better display
  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
      'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
      'hi': 'Hindi', 'ar': 'Arabic', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian',
      'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish', 'cs': 'Czech', 'hu': 'Hungarian',
      'ro': 'Romanian', 'bg': 'Bulgarian', 'el': 'Greek', 'tr': 'Turkish', 'he': 'Hebrew',
      'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay', 'tl': 'Tagalog',
      'te': 'Telugu', 'ta': 'Tamil', 'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati',
      'pa': 'Punjabi', 'kn': 'Kannada', 'ml': 'Malayalam', 'ur': 'Urdu'
    };
    return languages[code] || code.toUpperCase();
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        setPage(1);
        
        const data = await searchContent(query);
        let filteredResults = data.results || [];
        
        // Apply accurate filtering
        if (typeFilter !== 'all') {
          filteredResults = filteredResults.filter((item: any) => {
            if (typeFilter === 'movie') {
              return item.media_type === 'movie' || (!item.media_type && item.title && !item.name);
            }
            if (typeFilter === 'tv') {
              return item.media_type === 'tv' || (!item.media_type && item.name && !item.title);
            }
            if (typeFilter === 'person') {
              return item.media_type === 'person' || item.known_for_department;
            }
            return true;
          });
        }
        
        // Filter by year (accurate date matching)
        if (yearFilter) {
          filteredResults = filteredResults.filter((item: any) => {
            const releaseDate = item.release_date || item.first_air_date;
            if (!releaseDate) return false;
            const releaseYear = new Date(releaseDate).getFullYear().toString();
            return releaseYear === yearFilter;
          });
        }
        
        // Filter by genre (improved matching)
        if (genreFilter) {
          filteredResults = filteredResults.filter((item: any) => {
            const overview = (item.overview || '').toLowerCase();
            const title = (item.title || item.name || '').toLowerCase();
            const genreLower = genreFilter.toLowerCase();
            
            // Check if genre is mentioned in overview or title
            return overview.includes(genreLower) || title.includes(genreLower);
          });
        }

        // Filter by language (accurate language code matching)
        if (languageFilter) {
          filteredResults = filteredResults.filter((item: any) => {
            const originalLanguage = (item.original_language || '').toLowerCase();
            const languageLower = languageFilter.toLowerCase();
            
            // Direct language code match or language name match
            return originalLanguage === languageLower || 
                   originalLanguage.includes(languageLower) ||
                   getLanguageName(originalLanguage).toLowerCase().includes(languageLower);
          });
        }
        
        setResults(filteredResults);
        setTotalResults(data.total_results || 0);
        setFilteredCount(filteredResults.length);
        setTotalPages(Math.ceil(filteredResults.length / 20));
        
        // Add to search history with accurate filter info
        const filters = {
          type: typeFilter !== 'all' ? typeFilter : undefined,
          year: yearFilter || undefined,
          genre: genreFilter || undefined,
          language: languageFilter || undefined
        };
        
        searchHistoryService.addToHistory(query, filteredResults.length, filters);
        
      } catch (err) {
        console.error('Error searching content:', err);
        setError('Failed to search content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, typeFilter, yearFilter, genreFilter, languageFilter]);

  const loadMoreResults = async () => {
    if (page >= totalPages || loading) return;
    
    try {
      setLoading(true);
      const nextPage = page + 1;
      const data = await searchContent(query, nextPage);
      
      // Apply the same filtering logic for additional pages
      let filteredResults = data.results || [];
      
      if (typeFilter !== 'all') {
        filteredResults = filteredResults.filter((item: any) => {
          if (typeFilter === 'movie') return item.media_type === 'movie' || (!item.media_type && item.title && !item.name);
          if (typeFilter === 'tv') return item.media_type === 'tv' || (!item.media_type && item.name && !item.title);
          if (typeFilter === 'person') return item.media_type === 'person' || item.known_for_department;
          return true;
        });
      }
      
      if (yearFilter) {
        filteredResults = filteredResults.filter((item: any) => {
          const releaseDate = item.release_date || item.first_air_date;
          if (!releaseDate) return false;
          const releaseYear = new Date(releaseDate).getFullYear().toString();
          return releaseYear === yearFilter;
        });
      }
      
      if (genreFilter) {
        filteredResults = filteredResults.filter((item: any) => {
          const overview = (item.overview || '').toLowerCase();
          const title = (item.title || item.name || '').toLowerCase();
          const genreLower = genreFilter.toLowerCase();
          return overview.includes(genreLower) || title.includes(genreLower);
        });
      }

      if (languageFilter) {
        filteredResults = filteredResults.filter((item: any) => {
          const originalLanguage = (item.original_language || '').toLowerCase();
          const languageLower = languageFilter.toLowerCase();
          return originalLanguage === languageLower || 
                 originalLanguage.includes(languageLower) ||
                 getLanguageName(originalLanguage).toLowerCase().includes(languageLower);
        });
      }
      
      setResults((prevResults) => [...prevResults, ...filteredResults]);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more results:', err);
      setError('Failed to load more results');
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = (filterType: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterType);
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    setSearchParams(newParams);
  };

  const hasActiveFilters = typeFilter !== 'all' || yearFilter || genreFilter || languageFilter;

  if (loading && page === 1) return <LoadingScreen />;

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
      <div className="container mx-auto px-4">
        
        {/* Enhanced Search Results Header */}
        <div className="mb-8 animate-fadeSlideUp">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">
            Search Results
          </h1>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {query ? (
                  <>
                    {filteredCount > 0 ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        Found <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> result{filteredCount !== 1 ? 's' : ''} for <span className="font-semibold">"{query}"</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" />
                        No results found for <span className="font-semibold">"{query}"</span>
                      </span>
                    )}
                  </>
                ) : (
                  'Enter a search term above'
                )}
              </p>
              
              {hasActiveFilters && totalResults > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filtered from {totalResults.toLocaleString()} total results
                </p>
              )}
            </div>
            
            {/* Active Filters Display - Enhanced Netflix Style */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-[#E50914]" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {typeFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      {typeFilter === 'movie' && <Film size={12} />}
                      {typeFilter === 'tv' && <Tv size={12} />}
                      {typeFilter === 'person' && <User size={12} />}
                      Type: {typeFilter}
                      <button
                        onClick={() => clearFilter('type')}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  
                  {yearFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                      <Calendar size={12} />
                      Year: {yearFilter}
                      <button
                        onClick={() => clearFilter('year')}
                        className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  
                  {genreFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                      🎭 Genre: {genreFilter}
                      <button
                        onClick={() => clearFilter('genre')}
                        className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {languageFilter && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                      <Globe size={12} />
                      Language: {getLanguageName(languageFilter)}
                      <button
                        onClick={() => clearFilter('language')}
                        className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5 transition-colors duration-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 border border-red-200 dark:border-red-700"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="netflix-error-card mb-8 animate-fadeSlideUp">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!query && (
          <div className="text-center py-16 animate-fadeSlideUp">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <Filter size={28} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Start Your Search
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Use the search bar above to find movies, TV shows, and people. 
                Apply filters to narrow down your results and find exactly what you're looking for.
              </p>
            </div>
          </div>
        )}

        {query && results.length === 0 && !loading && (
          <div className="text-center py-16 animate-fadeSlideUp">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={28} className="text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Results Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                We couldn't find any content matching "{query}"
                {hasActiveFilters && ' with your current filters'}.
              </p>
              
              {hasActiveFilters ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Try these suggestions:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Remove some filters to see more results</li>
                      <li>• Check your spelling and try different keywords</li>
                      <li>• Try broader search terms</li>
                      <li>• Search for alternative titles or names</li>
                    </ul>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="netflix-btn netflix-btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Search suggestions:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Try different or more general keywords</li>
                    <li>• Use the original title if searching for international content</li>
                    <li>• Try searching for actors or directors instead</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="animate-fadeSlideUp animation-delay-200">
            <div className="netflix-content-grid">
              {results.map((item: any) => (
                <div key={`${item.id}-${item.media_type}`} className="netflix-content-card">
                  <ContentCard 
                    item={item} 
                    type={item.media_type === 'tv' ? 'tv' : 'movie'} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Load More Button */}
        {results.length > 0 && page < totalPages && (
          <div className="flex justify-center mt-12 animate-fadeSlideUp animation-delay-400">
            <button
              onClick={loadMoreResults}
              disabled={loading}
              className="netflix-btn netflix-btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading More...
                </div>
              ) : (
                `Load More Results (${Math.min(20, (totalPages - page) * 20)} remaining)`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;