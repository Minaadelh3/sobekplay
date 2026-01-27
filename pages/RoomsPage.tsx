
import React from 'react';
import { motion } from 'framer-motion';

const RoomsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex items-center justify-center text-center relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-nearblack via-nearblack/80 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl w-full"
      >
        <div className="mb-8">
          <span className="text-accent-gold font-bold tracking-widest text-sm uppercase">Behind The Scenes</span>
          <h1 className="text-5xl md:text-7xl font-black text-white mt-2 mb-6 drop-shadow-2xl">
            Room Assignments
          </h1>
        </div>

        <div className="bg-charcoal/40 p-8 md:p-12 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl mx-auto max-w-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <div className="w-20 h-20 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-accent-gold/10 animate-pulse">
            <svg className="w-10 h-10 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed" dir="rtl">
            مين هيكون الـ Co-Star بتاعك؟ 🎬
          </h2>

          <p className="text-lg text-white/70 leading-relaxed mb-8" dir="rtl">
            توزيع الغرف ده فن... مش عن عن!<br />
            هنعلن عن الـ Casting النهائي للغرف قريب جدًا.<br />
            <span className="text-accent-gold font-bold">جهز نفسك للمفاجأة 😉</span>
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-white/60">STATUS: LOCKED CONTENT</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomsPage;
