
import React, { useMemo, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Carousel from './components/Carousel';
import SearchModal from './components/SearchModal';
import { posters } from './data/manifest';
import { usePosterMetrics } from './hooks/usePosterMetrics';
import TitleDetails from './pages/TitleDetails';
import WatchPlayer from './pages/WatchPlayer';
import TripAnthem from './pages/TripAnthem';
import Program from './pages/Program';
import NewsPage from './pages/NewsPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import PhotosPage from './pages/PhotosPage';
import { motion } from 'framer-motion';

const Home: React.FC<{ posters: any[] }> = ({ posters }) => {
  const rows = useMemo(() => {
    return [
      { title: "Trending Now on Sobek Play", items: posters.sort((a, b) => b.metrics.impactScore - a.metrics.impactScore).slice(0, 10) },
      { title: "Sobek Originals", items: posters.filter(p => p.isOriginal) },
      { title: "Action & Chaos", items: posters.filter(p => p.metrics.edgeDensity > 0.6 && p.metrics.contrast > 0.5) },
      { title: "Crime & Power", items: posters.filter(p => p.metrics.brightness < 0.4 && p.metrics.contrast > 0.6) },
      { title: "Epic Worlds & Magic", items: posters.filter(p => p.metrics.saturation > 0.7) },
      { title: "Drama by the Nile", items: posters.filter(p => p.metrics.hue === 'warm' && p.metrics.saturation < 0.8) },
      { title: "Egyptian Classics Reimagined", items: posters.filter(p => p.isClassic) },
      { title: "Comedy Nights", items: posters.filter(p => p.metrics.brightness > 0.6 && p.metrics.edgeDensity < 0.5) },
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
      <img src="/public/assets/brand/logo.png" alt="Sobek Play" className="h-6 mx-auto grayscale opacity-50" />
    </div>
    <div className="text-muted text-sm space-x-6 mb-8">
      <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
      <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
      <a href="#" className="hover:text-white transition-colors">Contact Us</a>
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
          <img src="/public/assets/brand/logo.png" className="h-12 mb-4" alt="Loading..." />
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
          <Route path="/originals" element={<Home posters={analyzedPosters.filter(p => p.isOriginal)} />} />
          <Route path="/kids" element={<Home posters={analyzedPosters.filter(p => p.metrics && p.metrics.brightness > 0.6)} />} />
          <Route path="/coming-soon" element={<Home posters={analyzedPosters.filter(p => p.isComingSoon)} />} />
          <Route path="/title/:id" element={<TitleDetails posters={analyzedPosters} />} />
          <Route path="/watch/:id" element={<WatchPlayer posters={analyzedPosters} />} />
          <Route path="/she3ar-al-re7la" element={<TripAnthem />} />
          <Route path="/program" element={<Program />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/help" element={<AboutPage />} />
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
