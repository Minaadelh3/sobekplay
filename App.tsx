
import React, { useMemo, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Carousel from './components/Carousel';
import SearchModal from './components/SearchModal';
import { posters } from './data/posters';
import { usePosterMetrics } from './hooks/usePosterMetrics';
import TitleDetails from './pages/TitleDetails';
import WatchPlayer from './pages/WatchPlayer';
import TripAnthem from './pages/TripAnthem';
import Program from './pages/Program';
import RoomsPage from './pages/RoomsPage';
import PrayersPage from './pages/PrayersPage';
import NewsPage from './pages/NewsPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import PolicyPage from './pages/PolicyPage';
import SubscriptionPage from './pages/SubscriptionPage';
import HelpPage from './pages/HelpPage';
import { motion } from 'framer-motion';

const Home: React.FC<{ posters: any[] }> = ({ posters }) => {
  const rows = useMemo(() => {
    // Filter strictly for Egyptian content
    const topEgyptianContent = posters.filter(p => {
        const t = p.title.toLowerCase();
        const f = p.filename.toLowerCase();

        // 1. Explicitly Exclude International IPs
        if (t.includes('harry potter') || t.includes('lord of rings') || t.includes('la casa')) return false;

        // 2. Exclude Sobek Originals (Platform branding/Fantasy)
        if (p.isOriginal || t.includes('sobek')) return false;

        // 3. Inclusion Criteria: Arabic Titles OR Known Egyptian Productions
        const hasArabic = /[\u0600-\u06FF]/.test(p.title);
        const knownEgyptianFiles = ['grand_hotel', 'crocodile_gangster', 'project_x', 'nubanji', 'bakkar'];
        
        return hasArabic || knownEgyptianFiles.some(k => f.includes(k));
    }).sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0)).slice(0, 10);

    return [
      { title: "Top in Egypt", items: topEgyptianContent },
      // Removed "Sobek Originals" row as requested previously
      { title: "Action & Chaos", items: posters.filter(p => p.metrics && p.metrics.edgeDensity > 0.6 && p.metrics.contrast > 0.5) },
      { title: "Crime & Power", items: posters.filter(p => p.metrics && p.metrics.brightness < 0.4 && p.metrics.contrast > 0.6) },
      { title: "Epic Worlds & Magic", items: posters.filter(p => p.metrics && p.metrics.saturation > 0.7) },
      { title: "Drama by the Nile", items: posters.filter(p => p.metrics && p.metrics.hue === 'warm' && p.metrics.saturation < 0.8) },
      { title: "Egyptian Classics Reimagined", items: posters.filter(p => p.isClassic && !p.isOriginal && !p.title.toLowerCase().includes('harry')) },
      { title: "Comedy Nights", items: posters.filter(p => p.metrics && p.metrics.brightness > 0.6 && p.metrics.edgeDensity < 0.5) },
      { title: "Coming Soon", items: posters.filter(p => p.isComingSoon) },
    ];
  }, [posters]);

  return (
    <div className="pb-24">
      <Hero posters={posters} />
      <div className="relative z-20 -mt-24 md:-mt-48 space-y-8">
        {rows.map((row) => (
          <Carousel key={row.title} title={row.title} posters={row.items} />
        ))}
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="py-12 border-t border-white/5 bg-nearblack text-center">
    <div className="mb-6">
      <img src="/assets/brand/logo.png" alt="Sobek Play" className="h-6 mx-auto grayscale opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
    </div>
    <div className="text-muted text-sm space-x-6 mb-8 flex justify-center">
      <Link to="/policy" className="hover:text-white transition-colors">Trip Policy</Link>
      <Link to="/help" className="hover:text-white transition-colors">Contact Us</Link>
    </div>
    <p className="text-xs text-muted/60 uppercase tracking-[0.2em] font-medium">By Spark Team</p>
  </footer>
);

const MainLayout: React.FC = () => {
  const { analyzedPosters, isAnalyzing } = usePosterMetrics(posters);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-nearblack flex items-center justify-center">
        <div className="text-accent-green animate-pulse flex flex-col items-center">
          <div className="text-xl font-black mb-4 tracking-widest">SOBEK PLAY</div>
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

  const isWatchPage = location.pathname.startsWith('/watch/');

  return (
    <div className="min-h-screen selection:bg-accent-green selection:text-white">
      {!isWatchPage && <Navbar onSearchOpen={() => setIsSearchOpen(true)} />}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        posters={analyzedPosters} 
      />
      <main className={!isWatchPage ? "pt-0" : ""}>
        <Routes>
          <Route path="/" element={<Home posters={analyzedPosters} />} />
          <Route path="/browse" element={<Home posters={analyzedPosters} />} />
          <Route path="/movies" element={<Home posters={analyzedPosters.filter(p => !p.title.includes('مسلسل'))} />} />
          <Route path="/series" element={<Home posters={analyzedPosters.filter(p => p.title.includes('مسلسل'))} />} />
          {/* Originals route removed */}
          <Route path="/kids" element={<Home posters={analyzedPosters.filter(p => p.metrics && p.metrics.brightness > 0.6)} />} />
          <Route path="/coming-soon" element={<Home posters={analyzedPosters.filter(p => p.isComingSoon)} />} />
          <Route path="/title/:id" element={<TitleDetails posters={analyzedPosters} />} />
          <Route path="/watch/:id" element={<WatchPlayer posters={analyzedPosters} />} />
          <Route path="/she3ar-al-re7la" element={<TripAnthem />} />
          <Route path="/program" element={<Program />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/prayers" element={<PrayersPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </main>
      {!isWatchPage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;
