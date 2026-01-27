
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import PosterCard from '../components/PosterCard';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

interface MyListPageProps {
  posters: PosterItem[];
}

const MyListPage: React.FC<MyListPageProps> = ({ posters }) => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Fallback to local storage for guest users to remain "functional"
        const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
        setWatchlistIds(local);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('watchlist')
        .select('content_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setWatchlistIds(data.map(item => item.content_id));
      }
      setLoading(false);
    };

    fetchWatchlist();
  }, []);

  const savedPosters = posters.filter(p => watchlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-[1920px] mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">My List</h1>
          <p className="text-muted text-xl">Your personal collection of Sobek favorites.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : savedPosters.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {savedPosters.map((poster) => (
              <motion.div
                key={poster.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
              >
                <PosterCard poster={poster} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-charcoal/30 rounded-[40px] border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-muted mb-4">Your list is empty</h2>
            <p className="text-muted/60 mb-8 max-w-sm mx-auto">Start adding movies and series to your list to keep track of what you want to watch.</p>
            <Link to="/movies" className="inline-block bg-accent-green text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all">
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListPage;
