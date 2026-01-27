
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

  // Hide on scroll down, show on scroll up (or if at top).
  // Also hide if menu is open to give full focus to the menu? 
  // User said "Bottom bar visible on all pages", but "hides slightly on scroll down".
  const isVisible = scrollDirection !== 'down';

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Browse',
      path: '/movies',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <path d="M17 2l-5 5-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      name: 'My List',
      path: '/my-list',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      name: 'Explore',
      path: '/program', // Using program/explore mapping 
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.31 9.69L9.69 14.31 9.69 14.31 14.31 9.69zm-1.62 1.62L12 11.31l-.69.69" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l-8 8m0-8l8 8" />
        </svg>
      )
    },
    {
      name: 'More',
      action: true,
      path: '#',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[120] bg-nearblack/90 backdrop-blur-xl border-t border-white/5 md:hidden pb-safe-area"
          >
            <div className="flex justify-around items-center h-16 sm:h-20">
              {navItems.map((item) => {
                const isActive = item.action ? isMenuOpen : location.pathname === item.path;
                const activeClass = isActive ? "text-accent-gold" : "text-gray-400";

                return item.action ? (
                  <button
                    key={item.name}
                    onClick={onMenuToggle}
                    className="flex flex-col items-center justify-center flex-1 h-full space-y-1 active:scale-95 transition-all"
                  >
                    <div className={`${activeClass} transition-colors duration-200`}>
                      {item.icon(isActive)}
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide ${activeClass}`}>{item.name}</span>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="flex flex-col items-center justify-center flex-1 h-full space-y-1 active:scale-95 transition-all"
                  >
                    <div className={`${activeClass} transition-colors duration-200`}>
                      {item.icon(isActive)}
                    </div>
                    <span className={`text-[10px] font-medium tracking-wide ${activeClass}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileBottomNav;