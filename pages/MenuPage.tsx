import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MenuPage: React.FC = () => {
  const links = [
    { name: 'Movies', path: '/movies' },
    { name: 'Series', path: '/series' },
    { name: 'Kids', path: '/kids' },
    { name: 'El Agpeya', path: '/prayers' },
    { name: 'Subscription', path: '/subscription' },
    { name: 'News', path: '/news' },
    { name: 'Shop', path: '/shop' },
    { name: 'City Info', path: '/informations' },
    { name: 'Help', path: '/help' },
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">Menu</h1>

        <div className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden">
          {links.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={item.path}
                className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <span className="font-bold text-lg text-white group-hover:text-accent-green transition-colors">{item.name}</span>
                <svg className="w-5 h-5 text-muted group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/policy" className="text-sm text-muted hover:text-white transition-colors mx-4">Privacy Policy</Link>
          <Link to="/about" className="text-sm text-muted hover:text-white transition-colors mx-4">About Sobek</Link>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;