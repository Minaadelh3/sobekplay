
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';
import FeedbackSection from '../components/FeedbackSection';
import BackButton from '../components/BackButton';
import { supabase } from '../supabaseClient';

interface TitleDetailsProps {
  posters: PosterItem[];
}

const TitleDetails: React.FC<TitleDetailsProps> = ({ posters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inList, setInList] = useState(false);
  const [user, setUser] = useState<any>(null);

  const poster = posters.find(p => p.id === id);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!poster) return;
    const checkList = async () => {
      if (!user) {
        const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
        setInList(local.includes(poster.id));
        return;
      }
      const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('content_id', poster.id);
      setInList(!!data && data.length > 0);
    };
    checkList();
  }, [user, poster]);

  const toggleWatchlist = async () => {
    if (!poster) return;
    if (!user) {
      const local = JSON.parse(localStorage.getItem('sobek_guest_list') || '[]');
      const newList = inList ? local.filter((lid: string) => lid !== poster.id) : [...local, poster.id];
      localStorage.setItem('sobek_guest_list', JSON.stringify(newList));
      setInList(!inList);
      return;
    }

    if (inList) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('content_id', poster.id);
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, content_id: poster.id });
    }
    setInList(!inList);
  };

  if (!poster) return <div className="min-h-screen bg-nearblack pt-32 text-center text-white font-bold">Title not found</div>;

  const tags = [];
  if (poster.metrics) {
    if (poster.metrics.brightness > 0.6) tags.push("Vivid");
    if (poster.metrics.brightness < 0.4) tags.push("Gritty");
    if (poster.metrics.hue === 'warm') tags.push("Cinematic Warmth");
    if (poster.metrics.edgeDensity > 0.6) tags.push("High Energy");
    if (poster.metrics.impactScore > 0.6) tags.push("Blockbuster");
  }

  return (

    <div className="relative min-h-screen bg-nearblack selection:bg-accent-green">

      <BackButton />

      <div className="absolute inset-0 h-[70vh] pointer-events-none select-none">


        <ImageWithFallback src={poster.src} alt="" className="w-full h-full object-cover blur-sm opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/80 to-transparent" />
      </div>

      <div className="relative z-10 pt-32 px-4 md:px-24 pb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full md:w-[380px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
          >
            <ImageWithFallback src={poster.src} alt={poster.title} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-8"
          >
            <div>
              {poster.isOriginal && <p className="text-accent-green font-black uppercase tracking-[0.3em] text-xs mb-3">Sobek Original Film</p>}
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.95]">{poster.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-bold text-accent-gold uppercase tracking-widest border border-white/5">{poster.type}</span>
                {tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 rounded-md text-xs font-semibold text-muted uppercase tracking-wider border border-white/5">{tag}</span>
                ))}
              </div>
            </div>

            {poster.description && (
              <p className="text-xl md:text-2xl text-muted/80 leading-relaxed max-w-3xl font-medium">
                {poster.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate(`/watch/${poster.id}`)}
                className="bg-white text-black px-12 py-5 rounded-xl font-black text-xl hover:brightness-90 transition-all shadow-2xl flex items-center space-x-3 active:scale-95"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                <span>Watch Now</span>
              </button>

              <button
                onClick={toggleWatchlist}
                className={`px-8 py-5 rounded-xl font-bold text-lg flex items-center space-x-3 border transition-all active:scale-95 ${inList ? 'bg-accent-green/20 border-accent-green text-accent-green' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                {inList ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
                <span>My List</span>
              </button>

              <button className="p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white active:scale-95">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feedback Section */}
        <div className="max-w-5xl border-t border-white/5 pt-16">
          <FeedbackSection movieId={poster.id} />
        </div>
      </div>
    </div>
  );
};

export default TitleDetails;
