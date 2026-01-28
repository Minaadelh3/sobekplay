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
    { name: 'Home 🏠', path: '/' },
    { name: 'Games 🎮', path: '/games' },
    { name: 'Program 🧭', path: '/program' },
    { name: 'Reminders 🔔', path: '/reminders' },
    { name: 'Agpeya 🕯️', path: '/prayers' },
    { name: 'El-She3ar 🎶', path: '/she3ar-al-re7la' },
    { name: 'Kids 🎈', path: '/kids' },
    { name: 'Rooms 🔑', path: '/rooms' },
    { name: 'Community 💬', path: '/community' },
  ];

  const isLinkActive = (path: string) => location.pathname === path;

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Lock body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Combined nav items for mobile
  const allNavItems = [...navLinks];

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

      <nav className="fixed top-0 left-0 right-0 z-[100] bg-nearblack/95 backdrop-blur-xl border-b border-white/5 shadow-2xl h-[calc(4rem+env(safe-area-inset-top))] md:h-[calc(5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] transition-all duration-300 pointer-events-auto touch-pan-y">
        <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" onClick={() => { setActiveDropdown(null); setIsMobileMenuOpen(false); }} className="flex-shrink-0 z-[102] relative flex items-center gap-2">
            <BrandLogo className="h-6 md:h-8 w-auto text-accent-gold hover:text-white transition-colors" />
          </Link>

          {/* Mobile Burger Trigger (Visible Only on Mobile) */}
          <div className="md:hidden z-[102] flex items-center gap-2">
            {/* Search in Header for Mobile */}
            <button
              onClick={onSearchOpen}
              className="text-white/80 p-3 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-3 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Menu"
            >
              <div className="space-y-1.5 w-6">
                <motion.span animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }} className="block h-0.5 w-full bg-accent-gold transform origin-center transition-transform" />
                <motion.span animate={{ opacity: isMobileMenuOpen ? 0 : 1 }} className="block h-0.5 w-full bg-accent-gold transition-opacity" />
                <motion.span animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }} className="block h-0.5 w-full bg-accent-gold transform origin-center transition-transform" />
              </div>
            </button>
          </div>

          {/* DESKTOP NAV (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 overflow-x-auto mx-8 relative z-[101]">
            <div className="flex items-center space-x-8 min-w-max px-2">
              {/* Standard Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setActiveDropdown(null)}
                  className={`text-base font-medium whitespace-nowrap transition-all duration-200 select-none ${isLinkActive(link.path)
                    ? 'text-white font-bold border-b-2 border-accent-green pb-1'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions (Desktop Only) */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-6 bg-nearblack/95 pl-2 z-[101] relative">
            <button
              onClick={onSearchOpen}
              className="text-white/80 hover:text-white transition-transform hover:scale-110 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="h-6 w-[1px] bg-white/20" />

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

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-[#121212] z-[101] shadow-2xl border-l border-white/10 md:hidden flex flex-col pt-24 pb-8 overflow-y-auto"
            >
              <div className="px-6 mb-8">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Navigation</h3>
                <div className="space-y-2">
                  {allNavItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors
                                            ${isLinkActive(item.path) ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}
                                        `}
                    >
                      <span>{item.name}</span>
                      {isLinkActive(item.path) && <span className="ml-auto text-accent-green">●</span>}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-auto px-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-accent-green flex items-center justify-center text-white font-bold">J</div>
                  <div>
                    <div className="text-white font-bold text-sm">Uncle Joy</div>
                    <div className="text-accent-gold text-[10px]">Premium Member</div>
                  </div>
                </div>
                <button className="w-full py-3 text-center text-red-500 font-bold bg-red-500/10 rounded-xl">
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;