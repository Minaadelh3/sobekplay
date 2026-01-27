import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface NavbarProps {
  onSearchOpen?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onSearchOpen,
  isMobileMenuOpen: externalIsMobileMenuOpen,
  setIsMobileMenuOpen: externalSetIsMobileMenuOpen
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [internalIsMobileMenuOpen, setInternalIsMobileMenuOpen] = useState(false);

  const isMobileMenuOpen = externalIsMobileMenuOpen !== undefined ? externalIsMobileMenuOpen : internalIsMobileMenuOpen;
  const setIsMobileMenuOpen = externalSetIsMobileMenuOpen || setInternalIsMobileMenuOpen;

  const { scrollDirection, isAtTop } = useScrollDirection();
  const location = useLocation();

  const isVisible = isAtTop || scrollDirection === 'up';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveDropdown(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isLinkActive = (path: string) => location.pathname === path;

  // Desktop Tabs
  const primaryTabs = [
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'El Agpeya', path: '/prayers' },
    { name: 'Community', path: '/community' },
  ];

  const exploreDropdown = [
    { name: 'El She3ar', path: '/she3ar-al-re7la' },
    { name: 'Program', path: '/program' },
    { name: 'Rooms', path: '/rooms' },
  ];

  const moreDropdown = [
    { name: 'Coming Soon', path: '/coming-soon' },
    { name: 'News', path: '/news' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
  ];

  // Mobile Menu Links
  const mobileLinks = [
    { name: 'Subscription', path: '/subscription', emoji: '💳' },
    { name: 'Coming Soon', path: '/coming-soon', emoji: '⏳' },
    { name: 'News', path: '/news', emoji: '📰' },
    { name: 'Community', path: '/community', emoji: '👥' },
    { name: 'Shop', path: '/shop', emoji: '🛍️' },
    { name: 'About', path: '/about', emoji: 'ℹ️' },
    { name: 'Settings', path: '/profile', emoji: '⚙️' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 w-full z-[60] transition-all duration-300 ${isAtTop && !isMobileMenuOpen ? 'bg-gradient-to-b from-nearblack/90 to-transparent' : 'bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-lg'}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-12">
          <div className="h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-12">
              <Link to="/" onClick={handleNavClick}>
                <BrandLogo className="h-8 md:h-10 w-auto text-white hover:opacity-80 transition-opacity" />
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center space-x-6">
                {primaryTabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={handleNavClick}
                    className={`text-sm font-medium transition-colors hover:text-accent-green tracking-wide ${isLinkActive(tab.path) ? 'text-white font-bold' : 'text-muted'
                      }`}
                  >
                    {tab.name}
                  </Link>
                ))}

                {/* Explore Dropdown Desktop */}
                <div
                  className="relative h-full flex items-center group"
                  onMouseEnter={() => setActiveDropdown('explore')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`text-sm font-medium transition-colors hover:text-accent-green flex items-center gap-1 tracking-wide ${exploreDropdown.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-muted'
                      }`}
                  >
                    Explore
                    <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'explore' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'explore' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden"
                      >
                        {exploreDropdown.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-3 text-sm ${isLinkActive(item.path) ? 'text-accent-green font-bold bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* More Dropdown Desktop */}
                <div
                  className="relative h-full flex items-center group"
                  onMouseEnter={() => setActiveDropdown('more')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`text-sm font-medium transition-colors hover:text-accent-green flex items-center gap-1 tracking-wide ${moreDropdown.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-muted'
                      }`}
                  >
                    More
                    <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'more' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden"
                      >
                        {moreDropdown.map(item => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-3 text-sm ${isLinkActive(item.path) ? 'text-accent-green font-bold bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 md:space-x-6">
              <button
                onClick={onSearchOpen}
                className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link
                to="/subscription"
                onClick={handleNavClick}
                className="hidden sm:inline-flex bg-gradient-to-r from-accent-gold to-yellow-600 text-black px-6 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20 transform hover:scale-105"
              >
                Subscribe
              </Link>

              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white group-hover:ring-2 ring-accent-green transition-all shadow-lg">
                    J
                  </div>
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-bold text-white">Joy</p>
                        <p className="text-xs text-muted">Premium Member</p>
                      </div>
                      <button className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 font-medium flex items-center gap-3">
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay - Activated by Bottom Nav 'More' */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Sheet */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsMobileMenuOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-[100] bg-nearblack rounded-t-3xl overflow-hidden flex flex-col max-h-[85vh] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-white/10"
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-3 pb-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Header Area */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <span className="text-xl font-bold text-white">More Options</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-white/5 rounded-full text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Scrollable Links */}
              <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
                <div className="grid grid-cols-1 gap-2">
                  {mobileLinks.map((link, idx) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all ${isLinkActive(link.path)
                          ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                          : 'text-white/80 hover:bg-white/5 active:bg-white/10 border border-transparent'
                        }`}
                    >
                      <span className="text-xl">{link.emoji}</span>
                      <span className="text-base font-bold tracking-wide">{link.name}</span>
                      <div className="flex-1" />
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    to="/subscription"
                    onClick={handleNavClick}
                    className="flex items-center justify-center w-full bg-accent-gold text-black py-4 rounded-xl text-lg font-black shadow-lg shadow-accent-gold/20 active:scale-95 transition-transform"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;