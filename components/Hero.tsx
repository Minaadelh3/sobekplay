
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../types';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

interface HeroProps {
  posters: PosterItem[];
}

const Hero: React.FC<HeroProps> = ({ posters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Logic: 
  // 1. Find the specific "Cover" image (sobek_universe_cover)
  // 2. Select other high-impact posters
  // 3. Combine them, putting the cover first
  
  const coverPoster = posters.find(p => p.id === 'sobek_universe_cover');
  
  const otherHighImpactPosters = posters
    .filter(p => p.id !== 'sobek_universe_cover' && (p.metrics?.impactScore || 0) > 0.4 && (p.metrics?.brightness || 0) > 0.2)
    .sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0))
    .slice(0, 3);

  const heroPosters = coverPoster 
    ? [coverPoster, ...otherHighImpactPosters.slice(0, 2)] 
    : otherHighImpactPosters;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroPosters.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroPosters.length]);

  if (heroPosters.length === 0) return null;

  const active = heroPosters[currentIndex];

  return (
    <div className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <ImageWithFallback 
            src={active.src} 
            alt={active.title} 
            className="w-full h-full object-cover object-top" // object-top ensures the top part of the image (often faces/logos) isn't cut off if dimensions mismatch
          />
          <div className="absolute inset-0 bg-gradient-to-r from-nearblack via-nearblack/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex flex-col justify-center px-4 md:px-24 max-w-4xl z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {active.isOriginal && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-accent-green px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest">Sobek Original</div>
            </div>
          )}
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
            {active.title}
          </h1>
          <p className="text-base md:text-lg text-muted mb-8 line-clamp-3 max-w-xl">
            {active.description}
          </p>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(`/watch/${active.id}`)}
              className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center space-x-2 hover:bg-opacity-80 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span>Play</span>
            </button>
            <button 
              onClick={() => navigate(`/title/${active.id}`)}
              className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-md font-bold flex items-center space-x-2 hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>My List</span>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
        {heroPosters.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-accent-green' : 'w-4 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
