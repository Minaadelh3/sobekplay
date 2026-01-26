
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface PosterCardProps {
  poster: PosterItem;
}

const PosterCard: React.FC<PosterCardProps> = ({ poster }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex-shrink-0 w-40 md:w-56 aspect-[2/3] group rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-accent-green/20 transition-shadow duration-300"
    >
      <Link to={`/title/${poster.id}`} className="block w-full h-full">
        {/* Background Image */}
        <ImageWithFallback 
          src={poster.src} 
          alt={poster.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
          {poster.isOriginal && (
            <div className="bg-accent-green text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest border border-white/10">
              Sobek
            </div>
          )}
          {poster.isComingSoon && (
            <div className="bg-accent-gold text-black text-[8px] md:text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest">
              Soon
            </div>
          )}
        </div>

        {/* Selection Ring */}
        <div className="absolute inset-0 ring-2 ring-inset ring-accent-green/0 group-hover:ring-accent-green/100 transition-all duration-300 pointer-events-none rounded-xl z-30" />
        
        {/* Hover Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 z-10">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h4 className="text-[10px] md:text-sm font-black text-white line-clamp-2 uppercase tracking-tight mb-2">
              {poster.title}
            </h4>
            
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center text-black hover:bg-accent-green hover:text-white transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <span className="text-[8px] md:text-[10px] font-bold text-accent-green uppercase tracking-wider">
                  {poster.type === 'series' ? 'Series' : 'Movie'}
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[8px] md:text-[10px] font-bold text-muted uppercase tracking-wider">
                  {poster.isClassic ? 'Classic' : 'New'}
                </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PosterCard;
