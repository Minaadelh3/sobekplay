
import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const TripAnthem: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
    show: { opacity: 1, scale: 1, filter: 'blur(0px)' }
  };

  return (
    <div className="min-h-screen bg-nearblack pt-32 px-4 md:px-12 flex flex-col items-center text-center relative overflow-hidden pb-48">
      {/* Cinematic Spotlight Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-gold/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full flex flex-col items-center"
      >
        {/* Title Sequence */}
        <div className="mb-20">
          <motion.span
            initial={{ letterSpacing: '1em', opacity: 0 }}
            animate={{ letterSpacing: '0.2em', opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-xs md:text-sm text-accent-green font-bold uppercase block mb-4"
          >
            Original Soundtrack
          </motion.span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
            EL SHE3AR
          </h1>
          <p className="text-white/40 text-lg font-serif italic">
            The voice of the journey.
          </p>
        </div>

        {siteConfig.OPTIONAL_AUDIO_PATH && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-24 cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-accent-gold flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-all group-hover:shadow-[0_0_60px_rgba(255,215,0,0.6)]">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <span className="text-white/60 text-xs mt-4 block font-bold tracking-widest uppercase">Play Audio</span>
          </motion.div>
        )}

        {/* Kinetic Typography Lyrics */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl w-full flex flex-col items-center gap-16 md:gap-24"
          dir="rtl"
        >
          {/* Verse 1 */}
          <motion.div variants={item} className="text-center group">
            <p className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-tight group-hover:to-white transition-all duration-500">
              "صحينا وإبتدت رحلتنا"
            </p>
            <p className="text-xl md:text-2xl text-white/50 mt-2 font-light">
              ... ومن أسوان بدأت الحكاية
            </p>
          </motion.div>

          {/* Verse 2 */}
          <motion.div variants={item} className="text-center group">
            <p className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              "وعين سوبيك بتطق شرار"
            </p>
            <p className="text-lg md:text-xl text-accent-gold mt-4 font-bold tracking-wide">
              (والدنيا بتحلو بعد مرار)
            </p>
          </motion.div>

          {/* Verse 3 */}
          <motion.div variants={item} className="text-center group relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent-green/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <p className="text-3xl md:text-5xl font-black text-white leading-tight relative z-10">
              "حدوتة مثيرة ومحبوبة"
            </p>
            <p className="text-2xl md:text-4xl text-white/80 mt-2 font-serif relative z-10">
              ماشية من أسوان للنوبة
            </p>
          </motion.div>

          {/* Chorus - The Climax */}
          <motion.div
            variants={item}
            className="mt-12 py-16 px-8 border-y border-white/10 w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-accent-gold/5 blur-xl" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <p className="text-5xl md:text-8xl font-black text-white drop-shadow-2xl animate-pulse">
                إيكادولي
              </p>
              <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-center">
                <span className="text-2xl md:text-4xl text-white/60 font-medium">يا كيميت</span>
                <span className="w-2 h-2 rounded-full bg-accent-gold hidden md:block" />
                <span className="text-2xl md:text-4xl text-white/60 font-medium">يا كيميت</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default TripAnthem;
