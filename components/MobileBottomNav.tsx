
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
  const isVisible = scrollDirection !== 'down';

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
      name: 'Browse',
      path: '/movies',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <path d="M17 2l-5 5-5-5" />
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
      name: 'Explore',
      path: '/program',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M14.31 9.69L9.69 14.31 9.69 14.31 14.31 9.69zm-1.62 1.62L12 11.31l-.69.69" />
        </svg>
      )
    },
    {
      name: 'More',
      action: true,
      path: '#',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom spring-like easing
          className="fixed bottom-0 left-0 right-0 z-[120] bg-nearblack/80 backdrop-blur-2xl border-t border-white/5 md:hidden pb-safe-area shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"
        >
          <div className="flex justify-around items-center h-[72px] px-2 relative">
            {/* Background blur/gradient enhancement */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {navItems.map((item) => {
              const isActive = item.action ? isMenuOpen : location.pathname === item.path;

              return (
                <div key={item.name} className="flex-1 h-full relative z-10">
                  <Component
                    item={item}
                    isActive={isActive}
                    onMenuToggle={onMenuToggle}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Sub-component for cleaner render logic
const Component = ({ item, isActive, onMenuToggle }: { item: any, isActive: boolean, onMenuToggle: () => void }) => {
  const Tag = item.action ? 'button' : Link;
  const props = item.action ? { onClick: onMenuToggle } : { to: item.path };

  return (
    <Tag
      {...props}
      className="w-full h-full flex flex-col items-center justify-center space-y-1.5 focus:outline-none group active:scale-90 transition-transform duration-200"
    >
      <div className={`relative p-1 rounded-xl transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
        {/* Active Indicator Glow */}
        {isActive && (
          <motion.div
            layoutId="nav-bg"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="absolute inset-0 bg-white/10 rounded-xl blur-sm"
          />
        )}
        <div className="relative z-10">
          {item.icon(isActive)}
        </div>
      </div>
      <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40'}`}>
        {item.name}
      </span>
    </Tag>
  )
}

export default MobileBottomNav;