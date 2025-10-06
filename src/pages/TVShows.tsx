import { useEffect, useState } from 'react';
import { fetchTVShows } from '../services/api';
import ContentRow from '../components/movies/ContentRow';
import LoadingScreen from '../components/common/LoadingScreen';

const TVShows = () => {
  const [popularShows, setPopularShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [airingTodayShows, setAiringTodayShows] = useState([]);
  const [onTheAirShows, setOnTheAirShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all TV show categories in parallel
        const [
          popularData, 
          topRatedData, 
          airingTodayData, 
          onTheAirData
        ] = await Promise.all([
          fetchTVShows('popular'),
          fetchTVShows('top_rated'),
          fetchTVShows('airing_today'),
          fetchTVShows('on_the_air')
        ]);
        
        setPopularShows(popularData.results);
        setTopRatedShows(topRatedData.results);
        setAiringTodayShows(airingTodayData.results);
        setOnTheAirShows(onTheAirData.results);
      } catch (err) {
        console.error('Error fetching TV shows:', err);
        setError('Failed to load TV shows');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#E50914]">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#E50914] text-white px-6 py-2 rounded hover:bg-[#f6121d] transition-all duration-300 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 dark:bg-[#141414] transition-colors duration-500">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">TV Shows</h1>
        
        {airingTodayShows.length > 0 && (
          <ContentRow title="Airing Today" items={airingTodayShows} type="tv" />
        )}
        
        {popularShows.length > 0 && (
          <ContentRow title="Popular" items={popularShows} type="tv" />
        )}
        
        {topRatedShows.length > 0 && (
          <ContentRow title="Top Rated" items={topRatedShows} type="tv" />
        )}
        
        {onTheAirShows.length > 0 && (
          <ContentRow title="On The Air" items={onTheAirShows} type="tv" />
        )}
      </div>
    </div>
  );
};

export default TVShows;