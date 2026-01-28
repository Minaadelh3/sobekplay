import React from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../components/BackButton';

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
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-amber-500/30 overflow-hidden flex flex-col relative" dir="rtl">

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
          className="text-center w-full space-y-12"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2 drop-shadow-sm">
              شِعَار الرِّحْلَة
            </h1>
            <div className="w-24 h-1 bg-amber-500/30 mx-auto rounded-full" />
          </div>
          {/* Stanza 1 */}
          <div className="space-y-3">
            <motion.p variants={verseVars} className="text-xl md:text-3xl text-white/90 font-medium leading-loose">
              صحينا وإبتدت رحلتنا
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-3xl text-white/90 font-medium leading-loose">
              وأسوان هي محطتنا
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-3xl text-white/90 font-medium leading-loose">
              فيها هنعرف حكايتنا
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-3xl text-amber-500/90 font-medium leading-loose">
              ومعاكوا هتكمل فرحتنا
            </motion.p>
          </div>

          {/* Stanza 2 */}
          <div className="space-y-3">
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              هنتعرف علي الأسرار
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              وعين سوبيك بتطق شرار
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              وإزاي النيل نازل هزار
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              والدنيا بتحلي بعد مرار
            </motion.p>
          </div>

          {/* Stanza 3 */}
          <div className="space-y-3">
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              حدوتة مثيرة ومحبوبة
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              ماشية من أسوان للنوبة
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              فيها لعنة وكنوز منهوبة
            </motion.p>
            <motion.p variants={verseVars} className="text-xl md:text-2xl text-white/70 leading-loose">
              وقوالب صارت مقلوبة
            </motion.p>
          </div>

          {/* Stanza 4 - Climax */}
          <div className="space-y-4 pt-4">
            <motion.p variants={verseVars} className="text-2xl md:text-4xl font-bold text-white/90 leading-relaxed">
              ياما قلت وياما حكيت
            </motion.p>
            <motion.p variants={verseVars} className="text-2xl md:text-4xl font-bold text-white/90 leading-relaxed">
              وبصوت عالي أنا غنيت
            </motion.p>
            <motion.p variants={verseVars} className="text-2xl md:text-4xl font-bold text-amber-400 drop-shadow-md leading-relaxed">
              ياحبيبتى يامصر أنا جيت
            </motion.p>
            <motion.p variants={verseVars} className="text-3xl md:text-5xl font-black text-white/90 mt-4 tracking-wide">
              إيكادولي يا كيميت ياكيميت
            </motion.p>
          </div>

          <motion.div variants={verseVars} className="pt-6 pb-2">
            <p className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-amber-600 to-amber-300 opacity-80">
              إيكادولي يا كيميت ياكيميت
            </p>
          </motion.div>

          {/* SoundCloud Link */}
          <motion.div
            variants={verseVars}
            className="pt-12"
          >
            <a
              href="https://soundcloud.com/ahmed-ismail-19/ekadoli-nubian-song" // Best guess placeholder or functional link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff7700]/10 hover:bg-[#ff7700]/20 text-[#ff7700] border border-[#ff7700]/20 rounded-full transition-all duration-300 hover:scale-105 group"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.56,8.87V17h-1.5V8.87H7.72l3.09-4.73l3.09,4.73H11.56z M10.81,0c-4.63,0-8.38,3.75-8.38,8.38c0,4.63,3.75,8.38,8.38,8.38 c4.63,0,8.38-3.75,8.38-8.38C19.19,3.75,15.44,0,10.81,0z M12.92,8.87H15l-3.09,4.73l-3.09-4.73h2.08V17h1.02V8.87z" />
                {/* Simple Cloud Icon for SoundCloud feel */}
                <path d="M19.3,10.8c-0.2,0-0.4,0-0.6,0.1c-0.7-2.6-3.1-4.4-5.9-4.4c-2.3,0-4.3,1.2-5.4,3.1C7.1,9.4,6.8,9.4,6.5,9.4c-2.7,0-4.9,2.2-4.9,4.9 s2.2,4.9,4.9,4.9h12.8c2.4,0,4.4-2,4.4-4.4S21.7,10.8,19.3,10.8z" />
              </svg>
              <span className="text-lg font-bold font-arabic">اسمع النشيد على ساوند كلاود</span>
              <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">➜</span>
            </a>
          </motion.div>

          {/* Poetic Footer */}
          <motion.div variants={verseVars} className="pb-32 pt-12 text-center">
            <p className="text-xl md:text-2xl text-white/50 font-medium italic font-arabic">
              اسمعها... وسيب النيل يكمل الباقي
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripAnthem;
