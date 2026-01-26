import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface NavbarProps {
  onSearchOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();
  
  // Show navbar if at top OR scrolling up. Hide if scrolling down and NOT at top.
  const isVisible = isAtTop || scrollDirection === 'up';

  const navLinks = [
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'El She3ar', path: '/she3ar-al-re7la' },
    { name: 'Program', path: '/program' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'El Agpeya', path: '/prayers' },
    { name: 'Subscription', path: '/subscription' },
  ];

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isAtTop ? 'bg-gradient-to-b from-nearblack/90 to-transparent' : 'glass-nav border-b border-white/5'}`}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-12">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link to="/">
              <BrandLogo className="h-8 md:h-10 w-auto text-white hover:opacity-80 transition-opacity" />
            </Link>
            
            {/* Desktop Navigation */}
            <ul className="hidden xl:flex items-center space-x-6">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`text-sm transition-colors ${link.name === 'Subscription' ? 'text-accent-gold hover:text-white font-medium' : link.name === 'El Agpeya' ? 'text-accent-green hover:text-white font-black' : 'text-main-text hover:text-accent-green font-medium'}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={onSearchOpen}
              className="text-main-text hover:text-accent-green transition-colors p-2"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white group-hover:ring-2 ring-accent-green transition-all shadow-lg">
                  J
                </div>
                <span className="hidden md:inline text-sm font-medium">Joy</span>
                <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-charcoal border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden ring-1 ring-black/5"
                  >
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <p className="text-sm font-bold text-white">Joy</p>
                      <p className="text-xs text-muted">Premium Member</p>
                    </div>

                    <div className="py-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-green/20 transition-colors flex items-center gap-2">
                             <span>📺</span> My List
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-green/20 transition-colors flex items-center gap-2">
                             <span>👶</span> Kids Mode
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-accent-green/20 transition-colors flex items-center gap-2">
                             <span>⚙️</span> Settings
                        </button>
                    </div>
                    
                    <button className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5 font-medium flex items-center gap-2">
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