
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
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative flex-shrink-0 w-[160px] md:w-[220px] aspect-[2/3] group rounded-lg overflow-hidden cursor-pointer"
    >
      <Link to={`/title/${poster.id}`}>
        <ImageWithFallback 
          src={poster.src} 
          alt={poster.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-75"
        />
        <div className="absolute inset-0 ring-2 ring-accent-green opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h4 className="text-xs md:text-sm font-bold text-white line-clamp-2">{poster.title}</h4>
          <div className="flex space-x-2 mt-2">
            <button className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center text-white">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PosterCard;
