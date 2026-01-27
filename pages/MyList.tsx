import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../types';
import PosterCard from '../components/PosterCard';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';

interface MyListProps {
  posters: PosterItem[];
}

const MyList: React.FC<MyListProps> = ({ posters }) => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem('uncleJoyWatchlist') || '[]');
    setWatchlistIds(local);
    setLoading(false);
  }, []);

  const removeItem = (id: string) => {
    setWatchlistIds(prev => prev.filter(prevId => prevId !== id));
    const local = JSON.parse(localStorage.getItem('uncleJoyWatchlist') || '[]');
    const newList = local.filter((lid: string) => lid !== id);
    localStorage.setItem('uncleJoyWatchlist', JSON.stringify(newList));
  };

  const savedPosters = posters.filter(p => watchlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-nearblack">
      <Navbar />

      <div className="pt-32 pb-32 px-4 md:px-12 max-w-[1920px] mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-12 bg-accent-green rounded-full shadow-[0_0_15px_rgba(11,93,75,0.5)]" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">My List</h1>
          </div>
          <p className="text-muted text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
            Your personal selection of cinematic journeys.
          </p>
        </motion.header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-accent-gold font-bold tracking-widest animate-pulse uppercase">Retrieving Library...</p>
          </div>
        ) : savedPosters.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
            <AnimatePresence mode="popLayout">
              {savedPosters.map((poster) => (
                <motion.div
                  key={poster.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                  className="relative group"
                >
                  <PosterCard poster={poster} />
                  <button
                    onClick={(e) => { e.preventDefault(); removeItem(poster.id); }}
                    className="absolute -top-2 -right-2 z-40 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 bg-charcoal/20 rounded-[60px] border border-white/5 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Your List is Empty</h2>
              <p className="text-muted text-lg mb-12 max-w-sm mx-auto">Explore our collection and add titles you want to watch later.</p>
              <Link to="/" className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-accent-gold transition-all">
                Start Browsing
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <MobileBottomNav isMenuOpen={false} onMenuToggle={() => { }} />
    </div>
  );
};

export default MyList;