import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  onSearchOpen: () => void;
  // Props are kept for compatibility but mobile menu is handled internally
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleBackdropClick = () => {
    setActiveDropdown(null);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'Games', path: '/games' },
    { name: 'My List', path: '/my-list' },
    { name: 'El Agpyea', path: '/prayers' },
    { name: 'El She3ar', path: '/she3ar-al-re7la' },
    { name: 'Trip Program', path: '/program' },
    { name: 'Hotel Rooms', path: '/rooms' },
    { name: 'Community', path: '/community' },
  ];

  const exploreItems = [
    { name: 'Veo', path: '/veo' },
    { name: 'Art', path: '/art' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const moreItems = [
    { name: 'Subscription', path: '/subscription' },
    { name: 'Coming Soon', path: '/coming-soon' },
    { name: 'News', path: '/news' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Help Center', path: '/help' },
  ];

  const isLinkActive = (path: string) => location.pathname === path;

  // Render a Dropdown Menu
  const renderDropdown = (items: { name: string; path: string }[], alignRight = false) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-full mt-2 w-56 bg-nearblack border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-[110] ${alignRight ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}
    >
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md -z-10" />
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setActiveDropdown(null)}
          className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-white/10 ${isLinkActive(item.path) ? 'text-accent-green font-bold bg-white/5' : 'text-white/70 hover:text-white'
            }`}
        >
          {item.name}
        </Link>
      ))}
    </motion.div>
  );

  return (
    <>
      {/* Backdrop for click-outside */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm cursor-pointer"
          />
        )}
      </AnimatePresence>

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-2xl h-16 md:h-20 transition-all duration-300">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" onClick={() => setActiveDropdown(null)} className="flex-shrink-0 z-[101] relative">
            <BrandLogo className="h-6 md:h-8 w-auto text-accent-gold hover:text-white transition-colors" />
          </Link>

          {/* Scrollable Tabs Container */}
          <div className="flex-1 overflow-x-auto no-scrollbar mx-2 md:mx-8 relative z-[101]">
            <div className="flex items-center space-x-6 md:space-x-8 min-w-max px-2">
              {/* Standard Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setActiveDropdown(null)}
                  className={`text-sm md:text-base font-medium whitespace-nowrap transition-all duration-200 select-none ${isLinkActive(link.path)
                    ? 'text-white font-bold border-b-2 border-accent-green pb-1'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Explore Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'explore' ? null : 'explore'); }}
                  className={`text-sm md:text-base font-medium whitespace-nowrap flex items-center gap-1 transition-all duration-200 ${activeDropdown === 'explore' || exploreItems.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-white/60 hover:text-white'
                    }`}
                >
                  Explore
                  <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'explore' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {activeDropdown === 'explore' && renderDropdown(exploreItems)}
                </AnimatePresence>
              </div>

              {/* More Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'more' ? null : 'more'); }}
                  className={`text-sm md:text-base font-medium whitespace-nowrap flex items-center gap-1 transition-all duration-200 ${activeDropdown === 'more' || moreItems.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-white/60 hover:text-white'
                    }`}
                >
                  More
                  <svg className={`w-3 h-3 transition-transform ${activeDropdown === 'more' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {activeDropdown === 'more' && renderDropdown(moreItems)}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex-shrink-0 flex items-center gap-3 md:gap-6 bg-nearblack/95 pl-2 z-[101] relative">
            <button
              onClick={onSearchOpen}
              className="text-white/80 hover:text-white transition-transform hover:scale-110 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="hidden sm:block h-6 w-[1px] bg-white/20" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'profile' ? null : 'profile'); }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-transparent transition-all hover:ring-white/20">
                  J
                </div>
              </button>

              <AnimatePresence>
                {activeDropdown === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-4 w-64 bg-nearblack border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden origin-top-right z-[110]"
                  >
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-md -z-10" />
                    <div className="px-5 py-4 border-b border-white/5">
                      <p className="text-sm font-bold text-white">Uncle Joy</p>
                      <p className="text-[10px] text-accent-gold uppercase tracking-wider font-bold mt-0.5">Premium Tribe Member</p>
                    </div>
                    <Link to="/profile" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Account Settings</Link>
                    <Link to="/help" onClick={() => setActiveDropdown(null)} className="block px-5 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Help Center</Link>
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button className="w-full text-left px-5 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;