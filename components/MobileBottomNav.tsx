import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Reduced to top 5 items for better UX
  const tabs = [
    {
      label: 'Home',
      path: '/app/home',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      label: 'Rankings',
      path: '/app/rankings',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: 'Games',
      path: '/app/games',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    },
    {
      label: 'Program',
      path: '/app/program',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: 'Prayer',
      path: '/app/prayers',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
  ];

  // Hide Bottom Nav in Game Mode
  // We check if it's a sub-route of games, but NOT the main games listing
  const isGameMode = location.pathname.includes('/games/') && location.pathname !== '/app/games';

  if (isGameMode) return null;

  return (
    // Lowered z-index to 40 so it sits BEHIND the Side Menu (z-101)
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 md:hidden pb-[env(safe-area-inset-bottom)] pointer-events-auto">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            onClick={(e) => {
              if (location.pathname.startsWith(tab.path)) {
                e.preventDefault();
                // Dispatch Custom Event for Reset
                window.dispatchEvent(new CustomEvent('tab-reset', { detail: { path: tab.path } }));
                // Keep legacy state just in case, or replace purely. Let's keep both for robustness.
                navigate(tab.path, { state: { resetTab: Date.now() }, replace: true });
              }
            }}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${isActive ? 'text-accent-gold' : 'text-white/50 hover:text-white/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span
                  initial={false}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  className="text-xl leading-none filter drop-shadow-sm"
                >
                  {tab.icon}
                </motion.span>
                <span className="text-[10px] font-medium tracking-wide">
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute bottom-0 w-8 h-1 bg-accent-gold rounded-t-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;