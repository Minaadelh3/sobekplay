
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../types';
import PosterCard from './PosterCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  posters: PosterItem[];
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, posters }) => {
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    return posters.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, posters]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-nearblack/95 backdrop-blur-xl flex flex-col"
        >
          <div className="p-8 flex justify-end">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-w-7xl mx-auto w-full px-6 flex-1 flex flex-col">
            <div className="relative mb-12">
              <input
                autoFocus
                type="text"
                placeholder="Search titles, characters, or movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/10 text-3xl md:text-5xl font-black py-4 focus:outline-none focus:border-accent-green transition-colors text-white placeholder-white/20"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {query && filteredResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
                  {filteredResults.map(poster => (
                    <motion.div 
                      key={poster.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={onClose}
                    >
                      <PosterCard poster={poster} />
                    </motion.div>
                  ))}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted">
                  <p className="text-2xl font-bold">No results found for "{query}"</p>
                  <p className="mt-2">Try searching for something else.</p>
                </div>
              ) : (
                <div className="text-muted/40 text-center py-20">
                  <p className="text-xl font-medium tracking-widest uppercase">Start typing to search</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
