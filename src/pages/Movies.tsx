import { useEffect, useState } from 'react';
import { fetchMovies } from '../services/api';
import ContentRow from '../components/movies/ContentRow';
import LoadingScreen from '../components/common/LoadingScreen';

const Movies = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all movie categories in parallel
        const [
          popularData, 
          topRatedData, 
          upcomingData, 
          nowPlayingData
        ] = await Promise.all([
          fetchMovies('popular'),
          fetchMovies('top_rated'),
          fetchMovies('upcoming'),
          fetchMovies('now_playing')
        ]);
        
        setPopularMovies(popularData.results);
        setTopRatedMovies(topRatedData.results);
        setUpcomingMovies(upcomingData.results);
        setNowPlayingMovies(nowPlayingData.results);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies');
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
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-300">Movies</h1>
        
        {nowPlayingMovies.length > 0 && (
          <ContentRow title="Now Playing" items={nowPlayingMovies} type="movie" />
        )}
        
        {popularMovies.length > 0 && (
          <ContentRow title="Popular" items={popularMovies} type="movie" />
        )}
        
        {topRatedMovies.length > 0 && (
          <ContentRow title="Top Rated" items={topRatedMovies} type="movie" />
        )}
        
        {upcomingMovies.length > 0 && (
          <ContentRow title="Upcoming" items={upcomingMovies} type="movie" />
        )}
      </div>
    </div>
  );
};

export default Movies;