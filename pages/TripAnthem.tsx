
import React from 'react';
import { motion } from 'framer-motion';

const TripAnthem: React.FC = () => {
  return (
    <div className="min-h-screen bg-nearblack pt-32 px-4 md:px-12 flex flex-col items-center text-center relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-green/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-6xl font-black text-accent-gold mb-12 drop-shadow-lg tracking-tight">شعار الرحلة</h1>
        
        <div className="max-w-3xl w-full bg-black/30 p-8 md:p-12 rounded-2xl backdrop-blur-md border border-white/5 shadow-2xl hover:border-accent-gold/20 transition-colors duration-500">
          <div className="text-xl md:text-3xl text-white leading-loose font-medium font-sans" dir="rtl">
            <p className="mb-8">
              صحينا وإبتدت رحلتنا<br/>
              وأسوان هي محطتنا<br/>
              فيها هنعرف حكايتنا<br/>
              ومعاكوا هتكمل فرحتنا
            </p>

            <p className="mb-8">
              هنتعرف علي الأسرار<br/>
              وعين سوبيك بتطق شرار<br/>
              وإزاي النيل نازل هزار<br/>
              والدنيا بتحلي بعد مرار
            </p>

            <p className="mb-8">
              حدوتة مثيرة ومحبوبة<br/>
              ماشية من أسوان للنوبة<br/>
              فيها لعنة وكنوز منهوبة<br/>
              وقوالب صارت مقلوبة
            </p>

            <p className="mb-8">
              ياما قلت وياما حكيت<br/>
              وبصوت عالي أنا غنيت<br/>
              ياحبيبتى يامصر أنا جيت<br/>
              إيكادولي يا كيميت ياكيميت
            </p>

            <div className="mt-12 space-y-2">
              <p className="text-accent-green font-bold text-2xl md:text-4xl drop-shadow-md">
                إيكادولي يا كيميت ياكيميت
              </p>
              <p className="text-accent-green font-bold text-2xl md:text-4xl drop-shadow-md opacity-80">
                إيكادولي يا كيميت ياكيميت
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TripAnthem;
