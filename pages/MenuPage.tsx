import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MenuPage: React.FC = () => {
  const menuItems = [
    { name: 'Movies', path: '/movies', icon: '🎬', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Series', path: '/series', icon: '📺', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Kids', path: '/kids', icon: '🎈', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'El She3ar', path: '/she3ar-al-re7la', icon: '🎵', color: 'text-accent-gold', bg: 'bg-accent-gold/10' },
    { name: 'El Agpeya', path: '/prayers', icon: '🙏', color: 'text-accent-green', bg: 'bg-accent-green/10' },
    { name: 'Subscription', path: '/subscription', icon: '⭐', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Rooms', path: '/rooms', icon: '💬', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { name: 'News', path: '/news', icon: '📰', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { name: 'Shop', path: '/shop', icon: '🛍️', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Gallery', path: '/gallery', icon: '📸', color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { name: 'AI Art', path: '/art', icon: '🎨', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { name: 'Veo Video', path: '/veo', icon: '🎥', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { name: 'About', path: '/about', icon: 'ℹ️', color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { name: 'Help', path: '/help', icon: '❓', color: 'text-gray-400', bg: 'bg-gray-400/10' },
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-24 pb-32 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 pl-2">Menu</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={item.path}
                className="flex flex-col items-center justify-center p-6 bg-charcoal border border-white/5 rounded-2xl hover:bg-white/5 transition-colors group h-full"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 ${item.bg} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <span className={`font-bold text-sm ${item.color} group-hover:text-white transition-colors`}>{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-charcoal rounded-2xl border border-white/5 text-center">
             <p className="text-muted text-sm mb-4">Version 2.0.1 • Sobek Play</p>
             <div className="flex justify-center gap-4">
                 <a href="#" className="text-xs text-white/40 hover:text-white">Privacy</a>
                 <a href="#" className="text-xs text-white/40 hover:text-white">Terms</a>
             </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;