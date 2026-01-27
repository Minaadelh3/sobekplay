
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface MobileBottomNavProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  onSearchOpen: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMenuToggle, isMenuOpen, onSearchOpen }) => {
  const { scrollDirection } = useScrollDirection();
  const location = useLocation();

  // Netflix behavior: Bottom nav usually persistent, but distinct active states
  const isVisible = true; // Always visible on mobile for easier navigation as requested

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Search',
      isAction: true,
      onClick: onSearchOpen,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: 'My List',
      path: '/my-list',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      name: 'Browse',
      path: '/movies', // Simplify browse to movies/main feed
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <path d="M17 2l-5 5-5-5" />
        </svg>
      )
    },
    {
      name: 'More',
      isAction: true,
      onClick: onMenuToggle,
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[120] bg-[#121212]/95 backdrop-blur-md border-t border-white/5 md:hidden pb-safe-area shadow-2xl">
      <div className="flex justify-between items-center h-[60px] px-4">
        {navItems.map((item) => {
          const isActive = item.name === 'More' ? isMenuOpen : location.pathname === item.path;
          // Search doesn't have a path, so active state is transient or handled by modal

          const Content = (
            <>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 ${isActive ? 'text-white' : 'text-gray-500'}`}
              >
                {item.icon(isActive && item.name !== 'Search')}
                <span className="text-[9px] font-medium tracking-wide">{item.name}</span>
              </motion.div>
            </>
          );

          if (item.isAction) {
            return (
              <button key={item.name} onClick={item.onClick} className="flex-1 h-full flex items-center justify-center focus:outline-none">
                {Content}
              </button>
            )
          }

          return (
            <Link key={item.name} to={item.path!} className="flex-1 h-full flex items-center justify-center focus:outline-none">
              {Content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;