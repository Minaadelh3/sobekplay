
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

interface TitleDetailsProps {
  posters: PosterItem[];
}

const TitleDetails: React.FC<TitleDetailsProps> = ({ posters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const poster = posters.find(p => p.id === id);

  if (!poster) return <div className="min-h-screen bg-nearblack pt-32 text-center">Title not found</div>;

  const tags = [];
  if (poster.metrics) {
    if (poster.metrics.brightness > 0.6) tags.push("Bright");
    if (poster.metrics.brightness < 0.4) tags.push("Dark");
    if (poster.metrics.hue === 'warm') tags.push("Warm Atmosphere");
    if (poster.metrics.edgeDensity > 0.6) tags.push("High Energy");
    if (poster.metrics.impactScore > 0.6) tags.push("Epic Scale");
  }

  return (
    <div className="relative min-h-screen bg-nearblack">
      <div className="absolute inset-0">
        <ImageWithFallback src={poster.src} alt="" className="w-full h-full object-cover blur-sm opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/80 to-transparent" />
      </div>

      <div className="relative z-10 pt-32 px-4 md:px-24 pb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-[350px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          >
            <ImageWithFallback src={poster.src} alt={poster.title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{poster.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-accent-gold uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>

            {poster.description && (
              <p className="text-lg md:text-xl text-muted leading-relaxed max-w-3xl">
                {poster.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate(`/watch/${poster.id}`)}
                className="bg-accent-green text-white px-10 py-4 rounded-md font-bold text-lg hover:bg-opacity-80 transition-all shadow-xl flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span>Watch Now</span>
              </button>
              <button className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-md font-bold hover:bg-white/20 transition-all">Add to My List</button>
              <button className="p-4 bg-white/10 rounded-md hover:bg-white/20 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TitleDetails;
