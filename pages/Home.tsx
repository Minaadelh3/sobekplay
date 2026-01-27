import React, { useMemo, useState } from 'react';
import { useSession } from '../components/SessionProvider';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import SearchModal from '../components/SearchModal';
import { posters as initialPosters } from '../data/posters';
import { usePosterMetrics } from '../hooks/usePosterMetrics';
import SobekChatbot from '../components/SobekChatbot';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { analyzedPosters, isAnalyzing } = usePosterMetrics(initialPosters);
  const { recentlyWatched } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const rows = useMemo(() => {
    if (isAnalyzing) return [];

    // Sort recently watched by index in the array (most recent first)
    const cwItems = recentlyWatched
      .map(id => analyzedPosters.find(p => p.id === id))
      .filter((p): p is typeof analyzedPosters[0] => !!p);

    // Reverse to show most recent first if array is ordered chronologically by push
    // In SessionProvider we did [id, ...old], so index 0 is newest.
    // So simple mapping is fine.

    const continueWatching = cwItems;
    const sobekExclusives = analyzedPosters.filter(p => p.isOriginal);

    const topEgyptianContent = analyzedPosters.filter(p => {
      const t = p.title.toLowerCase();
      const f = p.filename.toLowerCase();
      if (t.includes('harry potter') || t.includes('lord of rings') || t.includes('la casa')) return false;
      if (p.isOriginal || t.includes('sobek')) return false;
      const hasArabic = /[\u0600-\u06FF]/.test(p.title);
      const knownEgyptianFiles = ['grand_hotel', 'crocodile_gangster', 'project_x', 'nubanji', 'bakkar'];
      return hasArabic || knownEgyptianFiles.some(k => f.includes(k));
    }).sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0)).slice(0, 10);

    return [
      ...(continueWatching.length > 0 ? [{ title: "Continue Watching", items: continueWatching }] : []),
      { title: "Sobek Exclusives", items: sobekExclusives },
      { title: "Top in Egypt", items: topEgyptianContent },
      { title: "Action & Chaos", items: analyzedPosters.filter(p => p.metrics && p.metrics.edgeDensity > 0.6 && p.metrics.contrast > 0.5) },
      { title: "Epic Worlds & Magic", items: analyzedPosters.filter(p => p.metrics && p.metrics.saturation > 0.7) },
      { title: "Egyptian Classics Reimagined", items: analyzedPosters.filter(p => p.isClassic && !p.isOriginal && !p.title.toLowerCase().includes('harry')) },
      { title: "Coming Soon", items: analyzedPosters.filter(p => p.isComingSoon) },
    ];
  }, [analyzedPosters, isAnalyzing, recentlyWatched]);

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-nearblack flex items-center justify-center">
        <div className="text-accent-green animate-pulse flex flex-col items-center">
          <div className="text-xl font-black mb-4 tracking-widest uppercase">SOBEK PLAY</div>
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-full bg-accent-green"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nearblack selection:bg-accent-green selection:text-white">
      <Navbar
        onSearchOpen={() => setIsSearchOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <MobileBottomNav
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posters={analyzedPosters}
      />

      <main className="pb-24">
        <Hero posters={analyzedPosters} />
        <div className="relative z-20 -mt-24 md:-mt-48 space-y-12">
          {rows.map((row) => (
            <Carousel key={row.title} title={row.title} posters={row.items} />
          ))}
        </div>
      </main>

      <SobekChatbot isHidden={isMobileMenuOpen} />
    </div>
  );
};

export default Home;