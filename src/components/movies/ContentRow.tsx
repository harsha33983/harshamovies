import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from './ContentCard';

interface ContentRowProps {
  title: string;
  items: any[];
  type?: 'movie' | 'tv';
  isDarkBackground?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({ title, items, type = 'movie', isDarkBackground = false }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  // Handle scroll to show/hide arrows based on scroll position
  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll functions
  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = direction === 'left' ? -rowRef.current.clientWidth * 0.75 : rowRef.current.clientWidth * 0.75;
      
      rowRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Reset the scrolling state after animation completes
      setTimeout(() => {
        setIsScrolling(false);
        handleScroll();
      }, 500);
    }
  };

  return (
    <div className={`netflix-content-row group ${isDarkBackground ? 'bg-black/90 dark:bg-black/95 py-8 -mx-4 px-4' : ''}`}>
      <h2 className={`netflix-content-row-title ${isDarkBackground ? 'text-white' : ''}`}>{title}</h2>
      
      {/* Enhanced navigation arrows with better theme support */}
      {showLeftArrow && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full w-12 bg-black/40 hover:bg-black/60 dark:bg-black/60 dark:hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
          aria-label="Scroll left"
        >
          <ChevronLeft size={32} className="text-white drop-shadow-lg" />
        </button>
      )}
      
      {showRightArrow && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full w-12 bg-black/40 hover:bg-black/60 dark:bg-black/60 dark:hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
          aria-label="Scroll right"
        >
          <ChevronRight size={32} className="text-white drop-shadow-lg" />
        </button>
      )}
      
      {/* Content row with enhanced scrollbar styling */}
      <div 
        ref={rowRef}
        className="netflix-content-row-container"
        onScroll={handleScroll}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item) => (
          <ContentCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  );
};

export default ContentRow;