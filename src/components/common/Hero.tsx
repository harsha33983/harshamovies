import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../services/api';

interface HeroProps {
  item: {
    id: number;
    title?: string;
    name?: string;
    backdrop_path: string;
    overview: string;
    media_type?: string;
  };
  type?: 'movie' | 'tv';
}

const Hero: React.FC<HeroProps> = ({ item, type = 'movie' }) => {
  const title = item.title || item.name || '';
  const mediaType = item.media_type || type;
  const detailsPath = `/${mediaType}/${item.id}`;
  
  // Trim overview to a reasonable length
  const truncatedOverview = item.overview.length > 200 
    ? `${item.overview.substring(0, 200)}...` 
    : item.overview;

  return (
    <div className="netflix-hero">
      {/* Background image with enhanced gradient overlays for both themes */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${getImageUrl(item.backdrop_path, 'original')})`,
        }}
      >
        {/* Enhanced gradient overlays that adapt to theme */}
        <div className="netflix-hero-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/60 to-transparent dark:from-[#141414] dark:via-[#141414]/60 dark:to-transparent transition-colors duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/90 dark:to-[#141414]/90 transition-colors duration-500"></div>
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 transition-colors duration-500"></div>
      </div>

      {/* Content with enhanced theme-aware styling */}
      <div className="relative h-full container mx-auto px-3 sm:px-4 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 lg:pb-20 xl:pb-32 z-10">
        <div className="max-w-sm sm:max-w-xl lg:max-w-2xl">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fadeSlideUp text-white drop-shadow-2xl">
            {title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-100 dark:text-gray-200 mb-3 sm:mb-4 md:mb-6 animate-fadeSlideUp animation-delay-200 drop-shadow-lg leading-relaxed">
            {truncatedOverview}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 animate-fadeSlideUp animation-delay-400">
            <Link 
              to={detailsPath} 
              className="netflix-btn netflix-btn-primary text-xs sm:text-sm md:text-base mobile-btn"
            >
              <Play size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" fill="white" />
              Play
            </Link>
            <Link 
              to={detailsPath}
              className="netflix-btn netflix-btn-secondary text-xs sm:text-sm md:text-base mobile-btn"
            >
              <Info size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;