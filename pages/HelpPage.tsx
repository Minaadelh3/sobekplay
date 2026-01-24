
import React from 'react';
import { motion } from 'framer-motion';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full text-center space-y-12 bg-charcoal/30 p-12 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-accent-gold mb-8">كلمة ومعونة</h1>
        <div className="text-xl md:text-4xl text-white leading-[2.5] font-medium font-serif tracking-wide" dir="rtl">
          <p>أبانا الذي في السماوات،</p>
          <p>ليتقدس اسمك،</p>
          <p>ليأت ملكوتك،</p>
          <p>لتكن مشيئتك،</p>
          <p>كما في السماء كذلك على الأرض.</p>
        </div>
        <div className="pt-8 opacity-50">
            <svg className="w-8 h-8 mx-auto text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
      </motion.div>
    </div>
  );
};

export default HelpPage;
