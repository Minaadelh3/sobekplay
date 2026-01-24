
import React, { useRef } from 'react';
import PosterCard from './PosterCard';
import { PosterItem } from '../types';

interface CarouselProps {
  title: string;
  posters: PosterItem[];
}

const Carousel: React.FC<CarouselProps> = ({ title, posters }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (posters.length < 4) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth; // Scroll one full screen width
      const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      // Custom animation for faster/controlled scroll speed
      const start = scrollLeft;
      const change = targetScroll - start;
      const duration = 400; // 400ms duration (faster than default browser smooth scroll)
      const startTime = performance.now();

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        if (elapsed < duration) {
          // Ease-out cubic function for a quick start and smooth stop
          const t = elapsed / duration;
          const easeOut = 1 - Math.pow(1 - t, 3);
          
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = start + change * easeOut;
            requestAnimationFrame(animateScroll);
          }
        } else {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = targetScroll;
          }
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <div className="mb-12 relative group px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-main-text">{title}</h2>
      
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x pb-4"
        >
          {posters.map((poster) => (
            <div key={poster.id} className="snap-start">
              <PosterCard poster={poster} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Carousel;
