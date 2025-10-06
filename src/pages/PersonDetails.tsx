import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Star, Film, Tv } from 'lucide-react';
import { fetchPersonDetails, getImageUrl } from '../services/api';
import ContentCard from '../components/movies/ContentCard';
import LoadingScreen from '../components/common/LoadingScreen';

const PersonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchPersonDetails(id);
        setPerson(data);
      } catch (err) {
        console.error('Error fetching person details:', err);
        setError('Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (error || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#141414]">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#E50914]">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'Person not found'}</p>
          <Link 
            to="/"
            className="bg-[#E50914] text-white px-6 py-2 rounded hover:bg-[#f6121d] transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate age
  const calculateAge = (birthday: string, deathday?: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Get known for department
  const getKnownFor = () => {
    if (person.known_for_department) {
      return person.known_for_department;
    }
    return 'Acting';
  };

  // Sort credits by popularity and release date
  const sortCredits = (credits: any[]) => {
    return credits
      .filter(credit => credit.poster_path) // Only show items with posters
      .sort((a, b) => {
        // Sort by popularity first, then by release date
        const popularityDiff = (b.popularity || 0) - (a.popularity || 0);
        if (popularityDiff !== 0) return popularityDiff;
        
        const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
        const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 20); // Limit to top 20
  };

  const movieCredits = person.movie_credits?.cast || [];
  const tvCredits = person.tv_credits?.cast || [];
  const sortedMovies = sortCredits(movieCredits);
  const sortedTVShows = sortCredits(tvCredits);

  const age = calculateAge(person.birthday, person.deathday);

  return (
    <div className="min-h-screen pb-16 bg-gray-50 dark:bg-[#141414] transition-colors duration-300">
      {/* Back button */}
      <Link 
        to="/"
        className="fixed top-20 left-4 z-40 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft size={24} className="text-white" />
      </Link>

      {/* Hero section */}
      <div className="relative pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 animate-fadeSlideUp">
            {/* Profile Image */}
            <div className="flex-none">
              <div className="relative group">
                {person.profile_path ? (
                  <img 
                    src={getImageUrl(person.profile_path, 'h632')}
                    alt={person.name}
                    className="rounded-lg shadow-2xl w-64 h-auto mx-auto lg:mx-0 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-64 h-96 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto lg:mx-0">
                    <span className="text-6xl font-bold text-gray-600 dark:text-gray-400">
                      {person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 animate-fadeSlideUp animation-delay-200">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                {person.name}
              </h1>

              {/* Info row */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                {/* Known for */}
                <div className="flex items-center">
                  <Star size={16} className="text-yellow-400 mr-1" />
                  <span>Known for {getKnownFor()}</span>
                </div>

                {/* Birthday and age */}
                {person.birthday && (
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      {formatDate(person.birthday)}
                      {age && ` (${age} years old)`}
                      {person.deathday && ` - ${formatDate(person.deathday)}`}
                    </span>
                  </div>
                )}

                {/* Place of birth */}
                {person.place_of_birth && (
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    <span>{person.place_of_birth}</span>
                  </div>
                )}
              </div>

              {/* Biography */}
              {person.biography && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Biography</h2>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {person.biography.split('\n').map((paragraph: string, index: number) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-[#E50914]">{movieCredits.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Movies</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-[#E50914]">{tvCredits.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">TV Shows</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="text-2xl font-bold text-[#E50914]">
                    {person.popularity ? Math.round(person.popularity) : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Popularity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="container mx-auto px-4 animate-fadeSlideUp animation-delay-400">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'movies'
                ? 'bg-[#E50914] text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Film size={20} />
            Movies ({movieCredits.length})
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'tv'
                ? 'bg-[#E50914] text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Tv size={20} />
            TV Shows ({tvCredits.length})
          </button>
        </div>

        {/* Credits Grid */}
        <div className="mb-8">
          {activeTab === 'movies' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Movies</h2>
              {sortedMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {sortedMovies.map((movie: any) => (
                    <div key={movie.id} className="flex justify-center">
                      <ContentCard 
                        item={{
                          ...movie,
                          media_type: 'movie'
                        }} 
                        type="movie" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-400">No movies found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tv' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">TV Shows</h2>
              {sortedTVShows.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {sortedTVShows.map((show: any) => (
                    <div key={show.id} className="flex justify-center">
                      <ContentCard 
                        item={{
                          ...show,
                          media_type: 'tv'
                        }} 
                        type="tv" 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-400">No TV shows found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonDetails;