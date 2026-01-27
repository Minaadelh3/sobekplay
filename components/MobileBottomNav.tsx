
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const MobileBottomNav: React.FC = () => {
  const tabs = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Program', path: '/program', icon: '🎬' },
    { name: 'El She3ar', path: '/she3ar-al-re7la', icon: '🎶' },
    { name: 'El Agpyea', path: '/prayers', icon: '🙏' },
    { name: 'Rooms', path: '/rooms', icon: '🏨' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
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
                  {tab.name}
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