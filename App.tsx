
import React, { useMemo, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
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
import PhotosPage from './pages/PhotosPage';
import ImageGenPage from './pages/ImageGenPage';
import VeoPage from './pages/VeoPage';
import MoviesPage from './pages/MoviesPage';
import SeriesPage from './pages/SeriesPage';
import KidsPage from './pages/KidsPage';
import MenuPage from './pages/MenuPage';
import MyListPage from './pages/MyListPage';
import { motion } from 'framer-motion';
import SobekChatbot from './components/SobekChatbot';
import ScrollToTop from './components/ScrollToTop';


const VerseOfTheDay: React.FC = () => {
  const [verse, setVerse] = useState<{ text: string; ref: string } | null>(null);

  useEffect(() => {
    const verses = [
      { text: "الرَّبُّ فِي الْعُلاَ أَقْدَرُ مِنْ أَصْوَاتِ مِيَاهٍ كَثِيرَةٍ، مِنْ أَمْوَاجِ الْبَحْرِ الْعَظِيمَةِ.", ref: "مزامير ٩٣: ٤" }, // Mighty waters
      { text: "يَرْوِيكَ الرَّبُّ دَائِمًا، وَيُشْبِعُ نَفْسَكَ فِي الْيَبُوسِ... فَتَكُونُ كَجَنَّةٍ رَيَّا وَكَنَبْعِ مِيَاهٍ لاَ تَنْقَطِعُ مِيَاهُهُ.", ref: "إشعياء ٥٨: ١١" }, // Spring of water
      { text: "مَجَارِي الْمِيَاهِ تَفْرَحُ مَدِينَةَ اللهِ، مَقْدِسَ مَسَاكِنِ الْعَلِيِّ.", ref: "مزامير ٤٦: ٤" }, // Streams make glad
      { text: "لأَنَّهُ يَشُقُّ صُخُورًا فِي الْبَرِّيَّةِ وَيَسْقِيهِمْ كَأَنَّهُ مِنْ لُجَجٍ عَظِيمَةٍ.", ref: "مزامير ٧٨: ١٥" }, // Split rocks/water
      { text: "كُلُّ الأَنْهَارِ تَجْرِي إِلَى الْبَحْرِ، وَالْبَحْرُ لَيْسَ بِمَلآنَ. إِلَى الْمَكَانِ الَّذِي جَرَتْ مِنْهُ الأَنْهَارُ إِلَى هُنَاكَ تَذْهَبُ رَاجِعَةً.", ref: "الجامعة ١: ٧" }, // Rivers to sea
      { text: "مُبَارَكٌ الرَّجُلُ الَّذِي يَتَّكِلُ عَلَى الرَّبِّ... فَيَكُونُ كَشَجَرَةٍ مَغْرُوسَةٍ عَلَى الْمِيَاهِ، وَعَلَى النَّهْرِ تَمُدُّ أُصُولَهَا.", ref: "إرميا ١٧: ٧-٨" }, // Planted by water
      { text: "أَنَا أُعْطِيَّ الْعَطْشَانَ مِنْ يَنْبُوعِ مَاءِ الْحَيَاةِ مَجَّانًا.", ref: "رؤيا ٢١: ٦" }, // Water of life
    ];
    // Randomly select one on mount
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    setVerse(randomVerse);
  }, []);

  if (!verse) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative w-full max-w-4xl mx-auto my-16 px-6 text-center z-30"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-accent-gold/5 blur-[80px] rounded-full" />
      <div className="relative border-y border-white/10 py-8 md:py-10">
        <span className="text-accent-gold text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Verse of the Day 🌊</span>
        <p className="text-xl md:text-3xl text-white font-medium leading-relaxed font-serif" dir="rtl">
          "{verse.text}"
        </p>
        <p className="text-white/40 text-sm mt-4 font-mono">{verse.ref}</p>
      </div>
    </motion.div>
  );
};

const Home: React.FC<{ posters: any[] }> = ({ posters }) => {
  const rows = useMemo(() => {
    // Mocks for a production feel
    const continueWatching = posters.slice(3, 7);
    const sobekExclusives = posters.filter(p => p.isOriginal);

    const topEgyptianContent = posters.filter(p => {
      const t = p.title.toLowerCase();
      const f = p.filename.toLowerCase();
      if (t.includes('harry potter') || t.includes('lord of rings') || t.includes('la casa')) return false;
      if (p.isOriginal || t.includes('sobek')) return false;
      const hasArabic = /[\u0600-\u06FF]/.test(p.title);
      const knownEgyptianFiles = ['grand_hotel', 'crocodile_gangster', 'project_x', 'nubanji', 'bakkar'];
      return hasArabic || knownEgyptianFiles.some(k => f.includes(k));
    }).sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0)).slice(0, 10);

    return [
      { title: "Continue Watching", items: continueWatching },
      { title: "Sobek Exclusives", items: sobekExclusives },
      { title: "Top in Egypt", items: topEgyptianContent },
      { title: "Action & Chaos", items: posters.filter(p => p.metrics && p.metrics.edgeDensity > 0.6 && p.metrics.contrast > 0.5) },
      { title: "Epic Worlds & Magic", items: posters.filter(p => p.metrics && p.metrics.saturation > 0.7) },
      { title: "Egyptian Classics Reimagined", items: posters.filter(p => p.isClassic && !p.isOriginal && !p.title.toLowerCase().includes('harry')) },
      { title: "Coming Soon", items: posters.filter(p => p.isComingSoon) },
    ];
  }, [posters]);

  return (
    <div className="pb-24">
      <Hero posters={posters} />

      {/* Verse of the Day Injection */}
      <VerseOfTheDay />

      <div className="relative z-20 -mt-12 md:-mt-24 space-y-12">
        {rows.map((row) => (
          <Carousel key={row.title} title={row.title} posters={row.items} />
        ))}
      </div>
    </div>
  );
};

const Footer: React.FC = () => (
  <footer className="py-12 bg-nearblack border-t border-white/5 w-full relative z-10 mb-16 md:mb-0">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="text-muted text-sm font-medium">
        © 2025 Sobek Play. Built for the modern Nile explorer.
      </div>
      <div className="flex justify-center items-center gap-8">
        <a
          href="https://www.facebook.com/profile.php?id=61553908212285"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-white transition-colors duration-300 transform hover:scale-110"
          aria-label="Facebook"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          href="https://www.instagram.com/spark_graduates?igsh=cXZscTRrNXVlODFx"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-white transition-colors duration-300 transform hover:scale-110"
          aria-label="Instagram"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      </div>
    </div>
  </footer>
);

const MainLayout: React.FC = () => {
  const { analyzedPosters, isAnalyzing } = usePosterMetrics(posters);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

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
  const isAgpeyaPage = location.pathname === '/prayers';
  const isTripPage = ['/', '/program', '/she3ar-al-re7la', '/prayers', '/rooms'].includes(location.pathname);

  return (
    <div className="min-h-screen selection:bg-accent-green selection:text-white">
      {!isWatchPage && (
        <Navbar
          onSearchOpen={() => setIsSearchOpen(true)}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        posters={analyzedPosters}
      />

      <main className={`${!isWatchPage ? "pt-20" : ""} ${isTripPage ? "pb-28 md:pb-0" : ""}`}>
        <Routes>
          <Route path="/" element={<Home posters={analyzedPosters} />} />
          <Route path="/movies" element={<MoviesPage posters={analyzedPosters} />} />
          <Route path="/series" element={<SeriesPage posters={analyzedPosters} />} />
          <Route path="/kids" element={<KidsPage posters={analyzedPosters} />} />
          <Route path="/my-list" element={<MyListPage posters={analyzedPosters} />} />
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
          <Route path="/gallery" element={<PhotosPage />} />
          <Route path="/art" element={<ImageGenPage />} />
          <Route path="/veo" element={<VeoPage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Routes>
      </main>

      <SobekChatbot isHidden={isMobileMenuOpen || isWatchPage || isAgpeyaPage} />
      {isTripPage && <MobileBottomNav />}
      {!isWatchPage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout />
    </Router>
  );
};

export default App;
