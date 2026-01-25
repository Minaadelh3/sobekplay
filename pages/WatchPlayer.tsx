
import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PosterItem } from '../types';

interface WatchPlayerProps {
  posters: PosterItem[];
}

const WatchPlayer: React.FC<WatchPlayerProps> = ({ posters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const poster = posters.find(p => p.id === id);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!poster) return <div className="min-h-screen bg-nearblack flex items-center justify-center text-white">Title not found</div>;

  useEffect(() => {
    // Attempt autoplay on mount
    if (videoRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center">
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="pointer-events-auto p-2 hover:bg-white/10 rounded-full transition-colors text-white backdrop-blur-sm"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white font-bold text-lg drop-shadow-md opacity-90">{poster.title}</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Main Video Player */}
      <video 
        ref={videoRef}
        className="w-full h-full object-contain focus:outline-none"
        src="/videos/main.mp4"
        controls
        autoPlay
        playsInline
        poster={poster.src}
      >
        <source src="/videos/main.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default WatchPlayer;
