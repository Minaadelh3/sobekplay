import React from 'react';
import { useTabReset } from '../hooks/useTabReset';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';

const TripAnthem: React.FC = () => {
  // Animation for verses
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5
      }
    }
  };

  const verseVars = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" as const }
    }
  };

  // Reset Logic for Replaying Animations
  const [resetKey, setResetKey] = React.useState(0);
  useTabReset('/she3ar-al-re7la', () => {
    setResetKey(prev => prev + 1);
  });

  return (
    <div key={resetKey} className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-amber-500/30 overflow-hidden flex flex-col relative" dir="rtl">

      {/* Ambient Background - Sunset on the Nile */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-amber-600/10 blur-[120px] rounded-full opacity-40" />
        <div className="absolute bottom-[-10%] right-0 w-[60vw] h-[40vh] bg-blue-900/10 blur-[100px] rounded-full opacity-30" />
      </div>

      <BackButton />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 relative z-10 w-full max-w-2xl mx-auto">

        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="text-center w-full space-y-16"
        >
          {/* Main Title */}
          <motion.h1
            variants={verseVars}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-amber-600 mb-12 drop-shadow-sm font-sans tracking-tight"
          >
            شِعار الرحلة
          </motion.h1>

          {/* Stanzas with Lyrics Layout */}
          <div className="space-y-12">
            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-medium leading-[2.5] tracking-wide">
                صحينا وإبتدت رحلتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-medium leading-[2.5] tracking-wide">
                وأسوان هي محطتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-white/90 font-medium leading-[2.5] tracking-wide">
                فيها هنعرف حكايتنا
              </motion.p>
              <motion.p variants={verseVars} className="text-2xl md:text-3xl text-amber-400 font-bold leading-[2.5] tracking-wide">
                ومعاكوا هتكمل فرحتنا
              </motion.p>
            </div>

            <div className="w-16 h-0.5 bg-white/10 mx-auto rounded-full" />

            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                هنتعرف علي الأسرار
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                وعين سويبك بتطق شرار
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                وإزاي النيل نازل هزار
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                والدنيا بتحلي بعد مرار
              </motion.p>
            </div>

            <div className="w-16 h-0.5 bg-white/10 mx-auto rounded-full" />

            <div className="space-y-4">
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                حدوتة مثيرة ومحبوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                ماشية من أسوان للنوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                فيها لعنة وكنوز منهوبة
              </motion.p>
              <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/80 leading-[2.5] font-light">
                وقوالب صارت مقلوبة
              </motion.p>
            </div>

            <div className="w-16 h-0.5 bg-white/10 mx-auto rounded-full" />

            {/* Climax */}
            <div className="space-y-6 pt-4">
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                ياما قلت وياما حكيت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                وبصوت عالي أنا غنيت
              </motion.p>
              <motion.p variants={verseVars} className="text-3xl md:text-4xl font-black text-amber-500 drop-shadow-lg leading-relaxed scale-105 inline-block">
                ياحبيبتى يامصر أنا جيت
              </motion.p>
            </div>

            <motion.div variants={verseVars} className="pt-8 pb-8">
              <p className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-amber-500 to-amber-200 opacity-90 leading-tight">
                إيكادولي يا كيميت ياكيميت
              </p>
            </motion.div>
          </div>

          {/* SoundCloud Link - Clean & Centered */}
          <motion.div
            variants={verseVars}
            className="flex justify-center pt-8 pb-12"
          >
            <a
              href="https://soundcloud.com/ahmed-ismail-19/ekadoli-nubian-song"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center w-20 h-20 bg-[#ff7700] rounded-full shadow-2xl shadow-orange-600/30 transition-all duration-300 hover:scale-110 hover:shadow-orange-600/50"
              aria-label="Play on SoundCloud"
            >
              <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-110 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                <path d="M19.3,10.8c-0.2,0-0.4,0-0.6,0.1c-0.7-2.6-3.1-4.4-5.9-4.4c-2.3,0-4.3,1.2-5.4,3.1C7.1,9.4,6.8,9.4,6.5,9.4c-2.7,0-4.9,2.2-4.9,4.9 s2.2,4.9,4.9,4.9h12.8c2.4,0,4.4-2,4.4-4.4S21.7,10.8,19.3,10.8z" />
              </svg>
            </a>
          </motion.div>

          <div className="pb-24"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripAnthem;
