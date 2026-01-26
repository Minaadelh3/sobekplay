import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface MobileBottomNavProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuToggle, isMenuOpen }) => {
  const { scrollDirection } = useScrollDirection();
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');
  
  // Always visible on mobile except watch page
  const isVisible = !isWatchPage;

  const navItems = [
    { name: 'Home', path: '/', isToggle: false, icon: (active: boolean) => (
      <svg className={`w-6 h-6 transition-colors ${active ? 'text-accent-green' : 'text-muted'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Browse', path: '/movies', isToggle: false, icon: (active: boolean) => (
      <svg className={`w-6 h-6 transition-colors ${active ? 'text-accent-green' : 'text-muted'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    )},
    { name: 'Journey', path: '/program', isToggle: false, icon: (active: boolean) => (
      <svg className={`w-6 h-6 transition-colors ${active ? 'text-accent-green' : 'text-muted'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )},
    { name: 'Tribe', path: '/community', isToggle: false, icon: (active: boolean) => (
      <svg className={`w-6 h-6 transition-colors ${active ? 'text-accent-green' : 'text-muted'}`} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { name: 'Menu', path: '#', isToggle: true, icon: (active: boolean) => (
      <svg className={`w-6 h-6 transition-colors ${active ? 'text-accent-green' : 'text-muted'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )},
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed bottom-0 left-0 right-0 z-[110] bg-nearblack/80 backdrop-blur-2xl border-t border-white/5 md:hidden pb-safe-area"
        >
          <div className="flex justify-around items-center h-16 relative">
            {navItems.map((item) => {
              const isActive = item.isToggle ? isMenuOpen : location.pathname === item.path;
              
              if (item.isToggle) {
                return (
                  <button
                    key={item.name}
                    onClick={onMenuToggle}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform focus:outline-none"
                  >
                    <div className="relative">
                      {item.icon(isActive)}
                    </div>
                    <span className={`text-[10px] font-bold tracking-tighter uppercase transition-colors ${isActive ? 'text-white' : 'text-muted'}`}>
                      {item.name}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform"
                >
                  <div className="relative">
                    {item.icon(isActive)}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-green rounded-full shadow-[0_0_8px_rgba(11,93,75,1)]"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold tracking-tighter uppercase transition-colors ${isActive ? 'text-white' : 'text-muted'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileBottomNav;