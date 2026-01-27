
import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const TripAnthem: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.8, delayChildren: 1.5 }
    }
  };

  const lineVariant = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-nearblack pt-24 px-4 md:px-12 flex flex-col items-center text-center relative overflow-hidden pb-48">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-gold/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full flex flex-col items-center max-w-3xl"
      >
        {/* Header - Opening Title Style */}
        <div className="mb-20 mt-12">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent mb-6 mx-auto"
          />
          <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            EL SHE3AR
          </h1>
          <p className="text-accent-gold text-sm md:text-base font-bold tracking-[0.5em] uppercase">
            The Official Anthem
          </p>
        </div>

        {siteConfig.OPTIONAL_AUDIO_PATH && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mb-24 cursor-pointer relative group"
          >
            <div className="absolute inset-0 bg-accent-gold blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md relative z-10">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </motion.div>
        )}

        {/* Lyrics Container */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col gap-16 md:gap-20"
          dir="rtl"
        >
          {/* Stanza 1 */}
          <div className="space-y-4">
            <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
              صحّينا وابتدت رحلتنا
            </motion.p>
            <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-white/90 leading-relaxed">
              وأسوان بقت محطتنا
            </motion.p>
            <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-white/80 leading-relaxed">
              فيها هنعرف حكايتنا
            </motion.p>
            <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-accent-gold/90 leading-relaxed">
              ومعاكوا تكمل فرحتنا
            </motion.p>
          </div>

          {/* Stanza 2 */}
          <div className="space-y-4">
            <motion.p variants={lineVariant} className="text-xl md:text-3xl font-medium text-white/70 leading-relaxed">
              هنتعرّف على الأسرار ... وعين سوبيك فيها نار
            </motion.p>
            <motion.p variants={lineVariant} className="text-xl md:text-3xl font-medium text-white/70 leading-relaxed">
              والنيل ماشي بهزار ... والدنيا تحلى بعد مرار
            </motion.p>
          </div>

          {/* Stanza 3 */}
          <div className="space-y-4 relative py-8">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-accent-green/50 to-transparent" />
            <div className="pr-6">
              <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
                حدوتة مثيرة ومحبوبة
              </motion.p>
              <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-white leading-relaxed">
                ماشية من أسوان للنوبة
              </motion.p>
              <motion.p variants={lineVariant} className="text-xl md:text-3xl text-white/60 mt-2">
                فيها لعنة وكنوز منهوبة ... وقوالب الدنيا مقلوبة
              </motion.p>
            </div>
          </div>

          {/* Stanza 4 - Climax */}
          <div className="space-y-6">
            <motion.p variants={lineVariant} className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-white/50">
              ياما قلت وياما حكيت
            </motion.p>
            <motion.p variants={lineVariant} className="text-3xl md:text-5xl font-black text-white">
              وبصوت عالي أنا غنيت
            </motion.p>
            <motion.p variants={lineVariant} className="text-2xl md:text-4xl font-bold text-accent-gold">
              يا حبيبتي يا مصر أنا جيت
            </motion.p>
          </div>

          {/* Chorus */}
          <motion.div
            variants={lineVariant}
            className="mt-8 py-12 border-y border-white/10 bg-white/5 backdrop-blur-sm rounded-3xl"
          >
            <p className="text-4xl md:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-6">
              إيكادولي
            </p>
            <div className="flex flex-col gap-4 text-2xl md:text-4xl text-white/80 font-serif tracking-widest">
              <span>يا كيميت ... يا كيميت</span>
              <span className="text-white/40 text-lg md:text-xl font-sans tracking-normal mt-2">(x2)</span>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default TripAnthem;
