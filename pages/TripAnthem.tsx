
import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const TripAnthem: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-nearblack pt-32 px-4 md:px-12 flex flex-col items-center text-center relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-green/10 blur-[150px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-gold/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col items-center"
      >
        <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-white mb-4 drop-shadow-2xl tracking-tight">
                شعار الرحلة
            </h1>
            <div className="h-1 w-32 bg-accent-green mx-auto rounded-full" />
        </div>

        {siteConfig.OPTIONAL_AUDIO_PATH && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 w-full max-w-md bg-charcoal/80 backdrop-blur-lg rounded-full p-4 border border-white/10 shadow-xl flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-full bg-accent-green flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-accent-gold relative" />
                    </div>
                </div>
                <span className="text-xs font-mono text-muted">Play Anthem</span>
            </motion.div>
        )}
        
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl w-full grid gap-8"
        >
          <motion.div variants={item} className="bg-charcoal/40 p-8 md:p-10 rounded-3xl backdrop-blur-md border border-white/5 shadow-2xl hover:bg-charcoal/60 transition-colors group">
             <div className="text-xl md:text-3xl text-white leading-[2.2] font-medium font-sans" dir="rtl">
                <p>صحينا وإبتدت رحلتنا</p>
                <p>وأسوان هي محطتنا</p>
                <p>فيها هنعرف حكايتنا</p>
                <p className="text-accent-gold">ومعاكوا هتكمل فرحتنا</p>
             </div>
          </motion.div>

          <motion.div variants={item} className="bg-charcoal/40 p-8 md:p-10 rounded-3xl backdrop-blur-md border border-white/5 shadow-2xl hover:bg-charcoal/60 transition-colors">
             <div className="text-xl md:text-3xl text-white leading-[2.2] font-medium font-sans" dir="rtl">
                <p>هنتعرف علي الأسرار</p>
                <p>وعين سوبيك بتطق شرار</p>
                <p>وإزاي النيل نازل هزار</p>
                <p className="text-accent-gold">والدنيا بتحلي بعد مرار</p>
             </div>
          </motion.div>

          <motion.div variants={item} className="bg-charcoal/40 p-8 md:p-10 rounded-3xl backdrop-blur-md border border-white/5 shadow-2xl hover:bg-charcoal/60 transition-colors">
             <div className="text-xl md:text-3xl text-white leading-[2.2] font-medium font-sans" dir="rtl">
                <p>حدوتة مثيرة ومحبوبة</p>
                <p>ماشية من أسوان للنوبة</p>
                <p>فيها لعنة وكنوز منهوبة</p>
                <p className="text-accent-gold">وقوالب صارت مقلوبة</p>
             </div>
          </motion.div>

          <motion.div variants={item} className="bg-charcoal/40 p-8 md:p-10 rounded-3xl backdrop-blur-md border border-white/5 shadow-2xl hover:bg-charcoal/60 transition-colors">
             <div className="text-xl md:text-3xl text-white leading-[2.2] font-medium font-sans" dir="rtl">
                <p>ياما قلت وياما حكيت</p>
                <p>وبصوت عالي أنا غنيت</p>
                <p>ياحبيبتى يامصر أنا جيت</p>
                <p className="text-accent-gold font-bold">إيكادولي يا كيميت ياكيميت</p>
             </div>
          </motion.div>

          <motion.div 
            variants={item}
            className="mt-8 py-12 relative"
          >
             <div className="absolute inset-0 bg-accent-green/5 blur-3xl rounded-full" />
             <div className="relative z-10 space-y-4" dir="rtl">
                <p className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
                  إيكادولي يا كيميت ياكيميت
                </p>
                <p className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-accent-gold to-accent-gold/50 drop-shadow-lg">
                  إيكادولي يا كيميت ياكيميت
                </p>
             </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TripAnthem;
