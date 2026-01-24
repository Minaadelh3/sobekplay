
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onSearchOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearchOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'El She3ar', path: '/she3ar-al-re7la' },
    { name: 'Program', path: '/program' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'El Agpeya', path: '/prayers' },
    { name: 'Subscription', path: '/subscription' },
    { name: 'Coming Soon', path: '/coming-soon' },
    { name: 'News', path: '/news' },
    { name: 'Community', path: '/community' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Help', path: '/help' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link to="/">
            <img 
              src="/assets/brand/logo.png" 
              alt="Sobek Play" 
              className="h-10 w-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
          
          <ul className="hidden xl:flex items-center space-x-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`text-sm transition-colors ${link.name === 'Subscription' ? 'text-accent-gold hover:text-white font-medium' : link.name === 'El Agpeya' ? 'text-accent-green hover:text-white font-bold' : 'text-main-text hover:text-accent-green font-medium'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={onSearchOpen}
            className="text-main-text hover:text-accent-green transition-colors p-2"
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
              <div className="w-8 h-8 rounded-md bg-accent-green flex items-center justify-center text-xs font-bold text-white group-hover:ring-2 ring-accent-green transition-all">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-lg shadow-2xl py-2 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-white/5">
                    <p className="text-sm font-semibold text-main-text">Joy</p>
                    <p className="text-xs text-muted">Premium Member</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent-green/20 transition-colors">My List</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent-green/20 transition-colors">Kids Mode</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent-green/20 transition-colors">Settings</button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5 mt-1">Sign Out</button>
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
