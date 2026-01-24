
import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const Program: React.FC = () => {
  const days = [
    {
      title: "اليوم الأول: ١٠ فبراير - الوصول وبداية الرحلة",
      schedule: [
        { time: "الصبح / الضهر", activity: "الوصول لأسوان والتسكين في الفندق" },
        { time: "آخر النهار", activity: "راحة ووقت حر بسيط" },
        { time: "بليل", activity: "تمشية ع النيل أو خروجة بسيطة" },
        { time: "السهرة", activity: "تجمع للجروب عشان ندخل في مود الرحلة" },
      ]
    },
    {
      title: "اليوم الثاني: ١١ فبراير - التجربة النوبية",
      schedule: [
        { time: "الصبح", activity: "فطار والتحرك للنوبة" },
        { time: "الضحى - الضهر", activity: "تجربة نوبية، تمشية، وثقافة المكان" },
        { time: "بعد الضهر", activity: "وقت حر واسترخاء" },
        { time: "بليل", activity: "أنشطة جماعية ولحظات مشاركة" },
      ]
    },
    {
      title: "اليوم الثالث: ١٢ فبراير - فسح وأنشطة ولعب",
      schedule: [
        { time: "الصبح", activity: "جولات أو زيارات خارجية" },
        { time: "بعد الضهر", activity: "أنشطة وألعاب وتحديات للجروب" },
        { time: "آخر النهار", activity: "استكشاف حر أو راحة" },
        { time: "السهرة", activity: "سهرة وتجمع وضحك ووقت للتواصل" },
      ]
    },
    {
      title: "اليوم الرابع: ١٣ فبراير - الختام والعودة",
      schedule: [
        { time: "الصبح", activity: "فطار، توضيب الشنط، وتشيك أوت من الفندق" },
        { time: "الضحى", activity: "آخر تمشية أو نشاط ختامي" },
        { time: "بعد الضهر", activity: "تجمع ختامي وملخص للرحلة" },
        { time: "بليل", activity: "الاستعداد للرجوع" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-4" dir="rtl">برنامج الرحلة – ٤ أيام</h1>
            <p className="text-accent-gold text-xl font-bold mb-4" dir="rtl">من ١٠ فبراير لـ ١٣ فبراير</p>
            <p className="text-muted text-lg max-w-2xl mx-auto leading-relaxed" dir="rtl">
              برنامج الرحلة متقسم بوضوح بالأيام والتوقيتات علشان الكل يبقى عارف هنبدأ إمتى وهنعمل إيه، من غير تفاصيل معقدة.
            </p>
        </header>

        <div dir="rtl" className="grid grid-cols-1 gap-8 mb-20">
            {days.map((day, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-charcoal border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
                >
                    <div className="absolute top-0 left-0 w-32 h-32 bg-accent-green/5 rounded-full -ml-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                    
                    <h2 className="text-2xl font-black mb-8 text-accent-gold border-b border-white/10 pb-4 relative z-10">{day.title}</h2>
                    
                    <div className="space-y-6 relative z-10">
                        {day.schedule.map((item, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:space-x-reverse sm:space-x-6 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="sm:w-40 shrink-0 mb-2 sm:mb-0">
                                  <span className="inline-block bg-white/5 text-accent-green px-4 py-2 rounded-lg text-sm font-bold w-full text-center border border-white/5">
                                    {item.time}
                                  </span>
                                </div>
                                <span className="text-main-text font-medium text-lg leading-relaxed">{item.activity}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="flex flex-col items-center space-y-8">
            {siteConfig.UPLOAD_FOLDER_URL && (
                <a 
                    href={siteConfig.UPLOAD_FOLDER_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-accent-green text-white px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
                >
                    Upload Your Trip Photos
                </a>
            )}

            {siteConfig.OPTIONAL_AUDIO_PATH && (
                <div className="w-full max-w-xl bg-charcoal p-6 rounded-2xl border border-white/5">
                    <h3 className="text-center font-bold mb-4 uppercase tracking-widest text-sm text-accent-gold">Song & Hymns Player</h3>
                    <audio controls className="w-full grayscale brightness-50 contrast-200">
                        <source src={siteConfig.OPTIONAL_AUDIO_PATH} type="audio/mpeg" />
                    </audio>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Program;
