
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PosterItem } from '../types';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';
import { supabase } from '../supabaseClient';

interface HeroProps {
  posters: PosterItem[];
}

const Hero: React.FC<HeroProps> = ({ posters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [inList, setInList] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const coverPoster = posters.find(p => p.id === 'sobek_universe_cover');
  const otherHighImpactPosters = posters
    .filter(p => p.id !== 'sobek_universe_cover' && (p.metrics?.impactScore || 0) > 0.4 && (p.metrics?.brightness || 0) > 0.2)
    .sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0))
    .slice(0, 3);

  const heroPosters = coverPoster ? [coverPoster, ...otherHighImpactPosters.slice(0, 2)] : otherHighImpactPosters;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroPosters.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [heroPosters.length]);

  const active = heroPosters[currentIndex];

  useEffect(() => {
    if (!active) return;
    
    const checkWatchlist = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
        setInList(local.includes(active.id));
        return;
      }
      const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('content_id', active.id);
      setInList(!!data && data.length > 0);
    };

    checkWatchlist();
  }, [user, active]);

  const toggleWatchlist = async () => {
    if (!user) {
      const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
      let newList;
      if (inList) {
        newList = local.filter((id: string) => id !== active.id);
      } else {
        newList = [...local, active.id];
      }
      localStorage.setItem('sobek_guest_list', JSON.stringify(newList));
      setInList(!inList);
      return;
    }

    if (inList) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('content_id', active.id);
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, content_id: active.id });
    }
    setInList(!inList);
  };

  if (!active) return null;

  return (
    <div className="relative w-full h-[75vh] md:h-[95vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <ImageWithFallback src={active.src} alt={active.title} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-nearblack via-nearblack/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-transparent to-transparent" />
          <div className="absolute inset-0 cinematic-vignette" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex flex-col justify-center px-6 md:px-24 max-w-5xl z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          {active.isOriginal && (
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-accent-green text-white px-3 py-1 text-[10px] md:text-[12px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/10">
                Sobek Original
              </span>
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Nile Production</span>
            </div>
          )}

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter drop-shadow-2xl">
            {active.title}
          </h1>

          <p className="text-lg md:text-2xl text-muted/90 mb-10 line-clamp-3 max-w-2xl leading-relaxed font-medium">
            {active.description}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/watch/${active.id}`)}
              className="bg-white text-black px-10 py-4 rounded-xl font-black text-lg md:text-xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-white/10 active:scale-95"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span>Play Now</span>
            </button>

            <button
              onClick={toggleWatchlist}
              className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-white/20 transition-all active:scale-95"
            >
              {inList ? (
                <svg className="w-6 h-6 text-accent-green" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              )}
              <span>My List</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 right-12 z-20 flex flex-col gap-3">
        {heroPosters.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group flex items-center gap-4 text-right outline-none"
          >
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${idx === currentIndex ? 'text-accent-gold scale-110 opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-60'}`}>
              {p.title}
            </span>
            <div className={`h-1 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-12 bg-accent-gold shadow-[0_0_15px_rgba(191,160,90,0.5)]' : 'w-4 bg-white/20 hover:bg-white/40'}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Hero;
