import { useEffect, useState } from 'react';
import Hero from '../components/common/Hero';
import ContentRow from '../components/movies/ContentRow';
import LoadingScreen from '../components/common/LoadingScreen';
import SEOHead from '../components/common/SEOHead';
import { fetchTrending, fetchMovies, fetchTVShows } from '../services/api';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroContent, setHeroContent] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          trendingData, 
          popularMoviesData, 
          topRatedMoviesData,
          popularTVData,
          topRatedTVData,
          upcomingMoviesData
        ] = await Promise.all([
          fetchTrending('all', 'day'),
          fetchMovies('popular'),
          fetchMovies('top_rated'),
          fetchTVShows('popular'),
          fetchTVShows('top_rated'),
          fetchMovies('upcoming')
        ]);
        
        // Set states with fetched data
        setTrending(trendingData.results);
        setPopularMovies(popularMoviesData.results);
        setTopRatedMovies(topRatedMoviesData.results);
        setPopularTVShows(popularTVData.results);
        setTopRatedTVShows(topRatedTVData.results);
        setUpcomingMovies(upcomingMoviesData.results);
        
        // Set hero content (randomly select from trending)
        if (trendingData.results && trendingData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * 5); // Pick from top 5
          setHeroContent(trendingData.results[randomIndex]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Streamflix",
    "url": "https://streamflix.app",
    "description": "Premium streaming platform for movies and TV shows",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://streamflix.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Trending Movies and TV Shows",
      "numberOfItems": trending.length,
      "itemListElement": trending.slice(0, 10).map((item: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": item.media_type === 'tv' ? "TVSeries" : "Movie",
          "name": item.title || item.name,
          "description": item.overview,
          "image": `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          "datePublished": item.release_date || item.first_air_date,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": item.vote_average,
            "ratingCount": item.vote_count,
            "bestRating": 10,
            "worstRating": 0
          }
        }
      }))
    }
  };
  
  if (loading) return <LoadingScreen />;
  
  if (error) {
    return (
      <>
        <SEOHead 
          title="Error - Streamflix"
          description="Something went wrong while loading content"
          noIndex={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#141414] transition-colors duration-500 px-4">
          <div className="text-center p-6 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-[#E50914]">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300 text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#E50914] text-white px-4 sm:px-6 py-2 rounded hover:bg-[#f6121d] transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Streamflix - Watch Movies & TV Shows Online | Premium Streaming Platform"
        description="Discover trending movies and TV shows on Streamflix. Stream popular content, get personalized recommendations, and enjoy high-quality entertainment."
        keywords="streaming, movies, TV shows, trending, popular, entertainment, watch online"
        structuredData={structuredData}
      />
      
      <div className="bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
        {/* Hero Section */}
        {heroContent && <Hero item={heroContent} type={heroContent.media_type === 'tv' ? 'tv' : 'movie'} />}
        
        {/* Content Rows */}
        <div className="pt-4 pb-16 bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
          {trending.length > 0 && (
            <ContentRow title="Trending Now" items={trending} />
          )}
          
          {popularMovies.length > 0 && (
            <ContentRow title="Popular Movies" items={popularMovies} type="movie" />
          )}
          
          {popularTVShows.length > 0 && (
            <ContentRow title="Popular TV Shows" items={popularTVShows} type="tv" />
          )}
          
          {topRatedMovies.length > 0 && (
            <ContentRow title="Top Rated Movies" items={topRatedMovies} type="movie" />
          )}
          
          {upcomingMovies.length > 0 && (
            <ContentRow title="Upcoming Movies" items={upcomingMovies} type="movie" />
          )}
          
          {topRatedTVShows.length > 0 && (
            <ContentRow title="Top Rated TV Shows" items={topRatedTVShows} type="tv" />
          )}
        </div>
      </div>
    </>
  );
};

export default Home;