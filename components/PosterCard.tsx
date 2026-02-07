
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface PosterCardProps {
  poster: PosterItem;
}

const PosterCard: React.FC<PosterCardProps> = ({ poster }) => {
  // Defensive check
  if (!poster?.id) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative flex-shrink-0 w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-accent-green/20 transition-shadow duration-300"
    >
      <Link
        to={`/app/movies/${poster.id}`} // Link to Details Page
        className="group block w-full h-full relative"
      >
        <ImageWithFallback
          src={poster.src}
          alt={poster.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20 pointer-events-none">
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

        <div className="absolute inset-0 ring-2 ring-inset ring-accent-green/0 group-hover:ring-accent-green/100 transition-all duration-300 pointer-events-none rounded-xl z-30" />

        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 z-10 pointer-events-none">
          <h4 className="text-[10px] md:text-sm font-black text-white line-clamp-2 uppercase tracking-tight mb-2">
            {poster.title}
          </h4>

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
      </Link>
    </motion.div>
  );
};

export default PosterCard;
