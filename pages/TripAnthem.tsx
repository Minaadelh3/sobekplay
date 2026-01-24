
import React from 'react';
import { motion } from 'framer-motion';

const TripAnthem: React.FC = () => {
  const lyrics = [
    "صحينا وإبتدت رحلتنا",
    "وأسوان هي محطتنا",
    "فيها هنعرف حكايتنا",
    "ومعاكوا هتكمل فرحتنا",
    "",
    "هنتعرف علي الأسرار",
    "وعين سوبيك بتطق شرار",
    "وإزاي النيل نازل هزار",
    "والدنيا بتحلي بعد مرار",
    "",
    "حدوتة مثيرة ومحبوبة",
    "ماشية من أسوان للنوبة",
    "فيها لعنة وكنوز منهوبة",
    "وقوالب صارت مقلوبة",
    "",
    "ياما قلت وياما حكيت",
    "وبصوت عالي أنا غنيت",
    "ياحبيبتى يامصر أنا جيت",
    "إيكادولي يا كيميت ياكيميت",
    "",
    "إيكادولي يا كيميت ياكيميت"
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-green/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-gold/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <p className="text-accent-gold uppercase tracking-[0.3em] font-bold text-sm mb-4">The Anthem</p>
          <h1 className="text-5xl md:text-7xl font-black mb-16 tracking-tight text-white">شعار الرحلة</h1>
          
          <div dir="rtl" className="space-y-6">
            {lyrics.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                className={`text-2xl md:text-3xl font-bold leading-relaxed ${line === "" ? "h-8" : "text-main-text/90"}`}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripAnthem;
