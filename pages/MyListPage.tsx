import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../types';
import PosterCard from '../components/PosterCard';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

interface MyListPageProps {
  posters: PosterItem[];
}

const MyListPage: React.FC<MyListPageProps> = ({ posters }) => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      if (!authUser) {
        // Guest mode fallback
        const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
        setWatchlistIds(local);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('watchlist')
        .select('content_id')
        .eq('user_id', authUser.id);

      if (!error && data) {
        setWatchlistIds(data.map(item => item.content_id));
      }
      setLoading(false);
    };

    init();
  }, []);

  const removeItem = async (id: string) => {
    // Optimistic UI update
    setWatchlistIds(prev => prev.filter(prevId => prevId !== id));

    if (!user) {
      const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
      const newList = local.filter((lid: string) => lid !== id);
      localStorage.setItem('sobek_guest_list', JSON.stringify(newList));
      return;
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', id);

    if (error) {
      console.error("Error removing from watchlist:", error);
      // Revert if failed
      const { data } = await supabase
        .from('watchlist')
        .select('content_id')
        .eq('user_id', user.id);
      if (data) setWatchlistIds(data.map(item => item.content_id));
    }
  };

  const savedPosters = posters.filter(p => watchlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-32 px-4 md:px-12 selection:bg-accent-green">
      <div className="max-w-[1920px] mx-auto">
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
            {user ? `Welcome back! Here are the titles you've saved to watch later.` : `You're browsing as a guest. Titles are saved locally to this device.`}
          </p>
        </motion.header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
            <p className="text-accent-gold font-bold tracking-widest animate-pulse">RETRIEVING YOUR LIBRARY...</p>
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
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative group"
                >
                  <PosterCard poster={poster} />
                  
                  {/* Remove Button Overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(poster.id);
                    }}
                    className="absolute -top-3 -right-3 z-40 bg-nearblack/80 backdrop-blur-xl border border-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 hover:text-red-400 active:scale-90"
                    title="Remove from list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="mt-4 flex justify-between items-center px-1">
                    <button 
                      onClick={() => removeItem(poster.id)}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                    <span className="text-[10px] font-bold text-accent-green/60 uppercase">
                      {poster.type}
                    </span>
                  </div>
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
            <div className="absolute inset-0 bg-gradient-to-b from-accent-green/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-white/10">
                <svg className="w-12 h-12 text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Your List is Calling...</h2>
              <p className="text-muted text-lg mb-12 max-w-sm mx-auto leading-relaxed">
                Add your favorite Egyptian classics and Sobek Originals here to build your personal library.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/movies" className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-2xl font-black text-lg hover:bg-accent-gold transition-all active:scale-95 shadow-2xl">
                  Browse Movies
                </Link>
                <Link to="/series" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                  Browse Series
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;