
import React from 'react';
import { motion } from 'framer-motion';

const RoomsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex items-center justify-center text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full bg-charcoal/30 p-12 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm"
      >
        <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight" dir="rtl">
          استنى تعرف هتبات في أنهي أوضة… ومع مين 😄
          <br />
          <span className="text-accent-gold">الموضوع لسه مفاجأة!</span>
        </h1>
        
        <p className="text-xl text-muted font-medium" dir="rtl">
          تسكين الغرف لسه متعملش، أول ما يظبط هنعلن عنه.
        </p>
      </motion.div>
    </div>
  );
};

export default RoomsPage;
