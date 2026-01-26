import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';
import { Link } from 'react-router-dom';

interface SeriesPageProps {
  posters: PosterItem[];
}

const SeriesPage: React.FC<SeriesPageProps> = ({ posters }) => {
  const [filter, setFilter] = useState<'All' | 'Drama' | 'Comedy' | 'Thriller'>('All');

  const series = posters.filter(p => p.type === 'series' || p.title.includes('مسلسل') || p.title.includes('Series'));

  const filteredSeries = series.filter(s => {
    if (filter === 'All') return true;
    if (filter === 'Drama') return s.metrics?.hue === 'warm';
    if (filter === 'Comedy') return (s.metrics?.brightness || 0) > 0.6;
    if (filter === 'Thriller') return (s.metrics?.brightness || 0) < 0.4;
    return true;
  });

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-[1920px] mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">TV Shows & Series</h1>
            <p className="text-muted text-xl">Binge-worthy stories from Egypt and beyond.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'Drama', 'Comedy', 'Thriller'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-accent-green text-white' 
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredSeries.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <Link to={`/title/${item.id}`}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative">
                  <ImageWithFallback 
                    src={item.src} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <p className="text-white text-sm line-clamp-3">{item.description}</p>
                     <div className="mt-2 flex items-center gap-2 text-xs font-bold text-accent-gold">
                        <span>{Math.floor(Math.random() * 3) + 1} Seasons</span>
                        <span>•</span>
                        <span>{item.isComingSoon ? 'Coming Soon' : 'Ongoing'}</span>
                     </div>
                  </div>
                </div>
                <h3 className="font-bold text-white group-hover:text-accent-green transition-colors truncate">{item.title}</h3>
                <p className="text-xs text-muted">New Episodes This Week</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;