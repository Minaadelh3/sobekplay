import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import PrayerView from '../components/prayers/PrayerView';
import TasbehaView from '../components/prayers/TasbehaView';
import HymnsView from '../components/prayers/HymnsView';

type ViewState = 'hub' | 'prayers' | 'tasbeha' | 'hymns';

const HubCard = ({ title, subtitle, icon, onClick, color, delay }: any) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className={`relative group overflow-hidden rounded-3xl p-8 text-right flex flex-col items-end justify-between min-h-[280px] w-full border border-white/10 bg-gradient-to-br ${color} backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300`}
  >
    <div className="absolute top-0 left-0 w-full h-full bg-black/20 group-hover:bg-transparent transition-colors duration-300" />

    {/* Background Pattern */}
    <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />

    <div className="relative z-10 bg-white/10 p-4 rounded-2xl mb-6 backdrop-blur-md border border-white/10 shadow-lg">
      <span className="text-4xl">{icon}</span>
    </div>

    <div className="relative z-10">
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/70 text-lg font-medium mb-6">{subtitle}</p>

      <div className="flex items-center gap-2 text-amber-200 font-bold group-hover:gap-4 transition-all duration-300">
        <span>تصفح</span>
        <ChevronRight className="w-5 h-5 rotate-180" />
      </div>
    </div>
  </motion.button>
);

const BackButton = ({ onClick, label = "العودة للقائمة الرئيسية" }: { onClick: () => void, label?: string }) => (
  <motion.button
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
    className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-black/50 hover:bg-black/80 text-white/90 hover:text-white px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all group shadow-lg cursor-pointer"
  >
    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
    <span className="font-medium">{label}</span>
  </motion.button>
);

const PrayersPage = () => {
  const [view, setView] = useState<ViewState>('hub');

  const handleBack = () => setView('hub');

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans dir-rtl">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AnimatePresence mode="wait">
        {view === 'hub' ? (
          <motion.div
            key="hub"
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-12"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <span className="inline-block py-1 px-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-bold mb-4">
                † بستان الروح
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-6 drop-shadow-2xl">
                الصلوات والتسابيح
              </h1>
              <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                "رنموا للرب أغنية جديدة، رنمي للرب يا كل الأرض"
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
              <HubCard
                title="الأجبية المقدسة"
                subtitle="الصلوات السبع اليومية"
                icon="🙏"
                color="from-blue-600/30 to-indigo-600/30"
                onClick={() => setView('prayers')}
                delay={0.1}
              />
              <HubCard
                title="التسبحة"
                subtitle="تسبحة نصف الليل والابصاليات"
                icon="✨"
                color="from-purple-600/30 to-fuchsia-600/30"
                onClick={() => setView('tasbeha')}
                delay={0.2}
              />
              <HubCard
                title="مكتبة الترانيم"
                subtitle="باقة من الترانيم والألحان الروحية"
                icon="🎵"
                color="from-emerald-600/30 to-teal-600/30"
                onClick={() => setView('hymns')}
                delay={0.3}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen relative z-20 bg-slate-950"
          >
            <BackButton onClick={handleBack} />

            {view === 'prayers' && <PrayerView />}
            {view === 'tasbeha' && <TasbehaView />}
            {view === 'hymns' && <HymnsView />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrayersPage;