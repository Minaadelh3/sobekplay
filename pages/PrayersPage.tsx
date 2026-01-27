
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrayersPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('prime');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const prayers = [
    {
      id: 'prime',
      title: "صلاة باكر",
      subtitle: "The Morning Prayer",
      timeNote: "توافق الساعة السادسة صباحًا، وتُقال بعد الاستيقاظ.",
      icon: "🌅"
    },
    {
      id: 'terce',
      title: "صلاة الساعة الثالثة",
      subtitle: "The Third Hour",
      timeNote: "تُصَلَّى في الساعة التاسعة صباحًا.",
      icon: "🕊️"
    },
    {
      id: 'sext',
      title: "صلاة الساعة السادسة",
      subtitle: "The Sixth Hour",
      timeNote: "تُصَلَّى الساعة الثانية عشر ظهرًا.",
      icon: "☀️"
    },
    {
      id: 'none',
      title: "صلاة الساعة التاسعة",
      subtitle: "The Ninth Hour",
      timeNote: "توافق الساعة الثالثة بعد الظهر.",
      icon: "✝️"
    },
    {
      id: 'vespers',
      title: "صلاة الغروب",
      subtitle: "Vespers",
      timeNote: "تُصَلَّى في الساعة الخامسة مساءً قبل حلول الليل.",
      icon: "🌇"
    },
    {
      id: 'compline',
      title: "صلاة النوم",
      subtitle: "Compline",
      timeNote: "تُصَلَّى قبل النوم.",
      icon: "🌙"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090b10] pt-24 pb-32 text-white selection:bg-accent-gold/40 flex flex-col items-center">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 px-4"
      >
        <span className="text-accent-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Sacred Moments</span>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">El Agpyea – Daily Prayers</h1>
        <p className="text-white/50 text-lg font-serif italic max-w-xl mx-auto">
          A spiritual journey through the hours of the day.
        </p>
      </motion.div>

      <div className="w-full max-w-3xl px-4 space-y-4">
        {prayers.map((prayer) => (
          <div key={prayer.id} className="w-full">
            <motion.button
              onClick={() => toggleSection(prayer.id)}
              className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 group ${openSection === prayer.id
                  ? 'bg-charcoal border-accent-gold/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
                  : 'bg-charcoal/40 border-white/5 hover:bg-charcoal/60'
                }`}
            >
              <div className="flex items-center gap-4 md:gap-6 w-full">
                <span className={`text-3xl filter drop-shadow-lg transition-transform duration-300 ${openSection === prayer.id ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {prayer.icon}
                </span>
                <div className="text-left flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className={`text-xl font-bold transition-colors ${openSection === prayer.id ? 'text-white' : 'text-white/80'}`}>
                      {prayer.title}
                    </h2>
                    {/* Mobile visible subtitle */}
                    <span className="md:hidden text-white/40 text-xs">{prayer.subtitle}</span>
                  </div>
                  <p className="text-accent-gold/80 text-sm mt-1" dir="rtl">{prayer.timeNote}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${openSection === prayer.id ? 'bg-accent-gold border-accent-gold rotate-180' : 'bg-transparent'}`}>
                  <svg className={`w-4 h-4 ${openSection === prayer.id ? 'text-black' : 'text-white/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {openSection === prayer.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div className="p-8 md:p-12 bg-white/5 border-x border-b border-white/5 rounded-b-2xl -mt-2 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* CONTENT PLACEHOLDER */}
                    <div className="w-full flex flex-col items-center justify-center py-12 text-white/20">
                      <p className="font-mono text-sm uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full">
                        {prayer.title} Content Placeholder
                      </p>
                      <p className="mt-4 text-xs">Insert prayer text here...</p>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <footer className="mt-24 text-white/30 text-sm font-mono tracking-widest uppercase">
        Pray without ceasing
      </footer>

    </div>
  );
};

export default PrayersPage;