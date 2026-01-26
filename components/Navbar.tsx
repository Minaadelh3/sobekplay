import React, { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { scrollDirection, isAtTop } = useScrollDirection();
  const location = useLocation();
  
  // Show navbar if at top OR scrolling up. Hide if scrolling down and NOT at top.
  const isVisible = isAtTop || scrollDirection === 'up';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveDropdown(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isLinkActive = (path: string) => location.pathname === path;

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

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
    <>
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isAtTop && !isMobileMenuOpen ? 'bg-gradient-to-b from-nearblack/90 to-transparent' : 'bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-lg'}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-12">
          <div className="h-16 md:h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 lg:gap-12">
              {/* Hamburger Menu Button (Mobile) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white p-2 focus:outline-none"
                aria-label="Toggle menu"
              >
                <div className="w-6 flex flex-col items-start gap-1.5">
                  <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 w-3/4 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>

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

              {/* Subscription Button - Desktop Only */}
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
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden ring-1 ring-black/5 origin-top-right z-50"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
             />
             <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-nearblack z-50 lg:hidden border-r border-white/10 overflow-y-auto"
             >
                <div className="p-6 pt-8 flex flex-col h-full">
                   <div className="mb-8 flex justify-between items-center">
                      <Link to="/" onClick={handleNavClick}>
                         <BrandLogo className="h-8 w-auto" />
                      </Link>
                      <button 
                         onClick={() => setIsMobileMenuOpen(false)} 
                         className="p-2 text-white/50 hover:text-white"
                      >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>

                   <div className="flex-1 space-y-1">
                      {primaryTabs.map((tab) => (
                         <Link
                            key={tab.path}
                            to={tab.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                               isLinkActive(tab.path) 
                                  ? 'bg-white/10 text-accent-green font-bold' 
                                  : 'text-white hover:bg-white/5'
                            }`}
                         >
                            {tab.name}
                         </Link>
                      ))}

                      <div className="pt-4 pb-2">
                         <p className="px-4 text-xs font-bold text-muted uppercase tracking-widest">Explore</p>
                      </div>
                      
                      {exploreDropdown.map((item) => (
                         <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                               isLinkActive(item.path) 
                                  ? 'bg-white/10 text-accent-green font-bold' 
                                  : 'text-white/80 hover:bg-white/5'
                            }`}
                         >
                            {item.name}
                         </Link>
                      ))}

                      <div className="pt-4 pb-2">
                         <p className="px-4 text-xs font-bold text-muted uppercase tracking-widest">More</p>
                      </div>

                      {moreDropdown.map((item) => (
                         <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                               isLinkActive(item.path) 
                                  ? 'bg-white/10 text-accent-green font-bold' 
                                  : 'text-white/80 hover:bg-white/5'
                            }`}
                         >
                            {item.name}
                         </Link>
                      ))}
                   </div>

                   <div className="pt-8 mt-4 border-t border-white/5">
                      <Link
                         to="/subscription"
                         onClick={handleNavClick}
                         className="block w-full text-center bg-accent-gold text-black font-bold py-4 rounded-xl text-lg"
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