
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

interface WatchPlayerProps {
  posters: PosterItem[];
}

const WatchPlayer: React.FC<WatchPlayerProps> = ({ posters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const poster = posters.find(p => p.id === id);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!poster) return <div className="min-h-screen bg-nearblack flex items-center justify-center">Error</div>;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      <div className="absolute inset-0">
        <ImageWithFallback src={poster.src} alt="" className="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-h-[60vh]"
            >
              <ImageWithFallback 
                src={poster.src} 
                className="max-h-[60vh] rounded-lg shadow-2xl border border-white/20" 
              />
            </motion.div>
        </div>
      </div>

      {/* Top Nav */}
      <div className="relative z-50 p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold tracking-tight">{poster.title}</h2>
        <div className="w-12" />
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setIsPlaying(true)}>
          <button className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30">
            <svg className="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto relative z-50 p-8 space-y-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer group">
                <div className="h-full w-1/3 bg-accent-green relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-green rounded-full shadow-lg opacity-0 group-hover:opacity-100" />
                </div>
            </div>
            <div className="flex justify-between text-xs text-muted font-medium">
                <span>12:45</span>
                <span>45:00</span>
            </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
                <button onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>
                <button className="text-white/80 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg></button>
                <div className="flex items-center space-x-2 group">
                    <svg className="w-6 h-6 text-white/80" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-white" />
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Subscription Support</p>
                <p className="text-xs font-bold text-accent-gold">+20 10 20707076</p>
            </div>

            <div className="flex items-center space-x-6">
                <button className="text-white/80 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
                <button className="text-white/80 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 19h10V7H7v12zm2-10h6v8H9V9z"/></svg></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPlayer;
