import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface NavbarProps {
  onSearchOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { scrollDirection, isAtTop } = useScrollDirection();
  const location = useLocation();
  
  // Show navbar if at top OR scrolling up. Hide if scrolling down and NOT at top.
  const isVisible = isAtTop || scrollDirection === 'up';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveDropdown(null);
    setIsProfileOpen(false);
  };

  const isLinkActive = (path: string) => location.pathname === path;

  // Navigation Data Structure
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

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isAtTop ? 'bg-gradient-to-b from-nearblack/90 to-transparent' : 'bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-lg'}`}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link to="/" onClick={handleNavClick}>
              <BrandLogo className="h-8 md:h-10 w-auto text-white hover:opacity-80 transition-opacity" />
            </Link>
            
            {/* Desktop Navigation Group */}
            <div className="hidden lg:flex items-center space-x-6">
              
              {/* Primary Tabs */}
              {primaryTabs.map((tab) => (
                <Link 
                  key={tab.path}
                  to={tab.path} 
                  onClick={handleNavClick}
                  className={`text-sm font-medium transition-colors hover:text-accent-green tracking-wide ${
                    isLinkActive(tab.path) ? 'text-white font-bold' : 'text-muted'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}

              {/* Explore Dropdown */}
              <div 
                className="relative h-full flex items-center group"
                onMouseEnter={() => setActiveDropdown('explore')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`text-sm font-medium transition-colors hover:text-accent-green flex items-center gap-1 tracking-wide ${
                    exploreDropdown.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-muted'
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
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden ring-1 ring-black/5"
                    >
                      {exploreDropdown.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleNavClick}
                          className={`block px-4 py-3 text-sm transition-colors ${
                            isLinkActive(item.path) ? 'text-accent-green font-bold bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* More Dropdown */}
              <div 
                className="relative h-full flex items-center group"
                onMouseEnter={() => setActiveDropdown('more')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  className={`text-sm font-medium transition-colors hover:text-accent-green flex items-center gap-1 tracking-wide ${
                    moreDropdown.some(i => isLinkActive(i.path)) ? 'text-white font-bold' : 'text-muted'
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
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden ring-1 ring-black/5"
                    >
                      {moreDropdown.map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={handleNavClick}
                          className={`block px-4 py-3 text-sm transition-colors ${
                            isLinkActive(item.path) ? 'text-accent-green font-bold bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'
                          }`}
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

          {/* Right Side Actions */}
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

            {/* Subscription Button - Desktop Only (Mobile has it in menu) */}
            <Link 
              to="/subscription" 
              onClick={handleNavClick}
              className="hidden sm:inline-flex bg-gradient-to-r from-accent-gold to-yellow-600 text-black px-6 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20 transform hover:scale-105"
            >
              Subscribe
            </Link>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white group-hover:ring-2 ring-accent-green transition-all shadow-lg">
                  J
                </div>
                <svg className={`w-4 h-4 transition-transform duration-200 text-muted group-hover:text-white ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden ring-1 ring-black/5 origin-top-right"
                  >
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-sm font-bold text-white">Joy</p>
                      <p className="text-xs text-muted">Premium Member</p>
                    </div>

                    <div className="py-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                             <span>📺</span> My List
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                             <span>👶</span> Kids Mode
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3">
                             <span>⚙️</span> Settings
                        </button>
                    </div>
                    
                    <button className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 font-medium flex items-center gap-3">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
  );
};

export default Navbar;