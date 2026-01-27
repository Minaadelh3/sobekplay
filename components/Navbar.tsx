import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  onSearchOpen: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'My List', path: '/my-list' },
    { name: 'Explore', path: '/program' },
    { name: 'Community', path: '/community' },
  ];

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsProfileOpen(false);
  };

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-2xl h-16 md:h-20">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" onClick={handleNavClick} className="flex-shrink-0 z-50">
          <BrandLogo className="h-6 md:h-8 w-auto text-accent-gold hover:text-white transition-colors" />
        </Link>

        {/* Scrollable Tabs Container */}
        <div className="flex-1 overflow-x-auto no-scrollbar mx-2 md:mx-8">
          <div className="flex items-center space-x-6 md:space-x-8 min-w-max px-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={`text-sm md:text-base font-medium whitespace-nowrap transition-all duration-200 ${isLinkActive(link.path)
                    ? 'text-white font-bold border-b-2 border-accent-green pb-1'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex-shrink-0 flex items-center gap-3 md:gap-6 bg-nearblack/95 pl-2">
          <button
            onClick={onSearchOpen}
            className="text-white/80 hover:text-white transition-transform hover:scale-110 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <div className="hidden sm:block h-6 w-[1px] bg-white/20" />

          <div className="relative group">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-transparent group-hover:ring-white/20 transition-all">
                J
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden origin-top-right z-50"
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">Uncle Joy</p>
                    <p className="text-[10px] text-accent-gold uppercase tracking-wider font-bold">Premium Tribe</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Account</Link>
                  <Link to="/help" className="block px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Help Center</Link>
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button className="w-full text-left px-4 py-3 text-sm text-white hover:underline">
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
  );
};

export default Navbar;