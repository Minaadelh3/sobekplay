import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface NavbarProps {
  onSearchOpen: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onSearchOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();
  const location = useLocation();
  const navigate = useNavigate();

  // Smart Navbar: Visible at top, hides on down scroll, shows on up scroll
  const isVisible = isAtTop || scrollDirection === 'up';

  // Desktop Tabs (Netflix Pattern)
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
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-[60] transition-colors duration-500 ${isAtTop ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-2xl'
        }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between">

        {/* Left Side: Logo & Primary Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link to="/" onClick={handleNavClick} className="flex-shrink-0 z-50">
            <BrandLogo className="h-6 md:h-8 w-auto text-accent-gold hover:text-white transition-colors" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={`text-sm font-medium transition-all duration-200 hover:text-white ${isLinkActive(link.path)
                    ? 'text-white font-bold cursor-default'
                    : 'text-white/70'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side: Search & Profile */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Search Icon (Desktop Only - Mobile moves to bottom bar) */}
          <button
            onClick={onSearchOpen}
            className="hidden lg:block text-white/80 hover:text-white transition-transform hover:scale-110 p-2"
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
              <svg className={`w-3 h-3 text-white/50 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">Uncle Joy</p>
                    <p className="text-[10px] text-accent-gold uppercase tracking-wider font-bold">Premium Tribe</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Account</Link>
                  <Link to="/help" className="block px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">Help Center</Link>
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button className="w-full text-left px-4 py-3 text-sm text-white hover:underline">
                      Sign out of Netflix... err, Sobek
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;