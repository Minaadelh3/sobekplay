
import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config/site';

const Program: React.FC = () => {
  const days = [
    {
      title: "اليوم الأول: الوصول والانطلاق",
      schedule: [
        { time: "09:00", activity: "الوصول وتسجيل الدخول" },
        { time: "10:30", activity: "نشاط صباحي ترحيبي" },
        { time: "12:30", activity: "استراحة الغداء" },
        { time: "14:00", activity: "فقرة استكشافية حرة" },
        { time: "17:00", activity: "وقت حر للراحة" },
        { time: "19:30", activity: "جلسة جماعية (تأمل وإعلانات)" },
      ]
    },
    {
      title: "اليوم الثاني: مغامرة النيل",
      schedule: [
        { time: "08:30", activity: "انطلاق فعاليات الصباح" },
        { time: "10:00", activity: "فقرة المغامرة" },
        { time: "13:00", activity: "استراحة الغداء" },
        { time: "15:00", activity: "لحظات النيل (نشاط مائي)" },
        { time: "18:00", activity: "وقت حر" },
        { time: "20:00", activity: "ليلة الترانيم والأناشيد (اختياري)" },
      ]
    },
    {
      title: "اليوم الثالث: الختام والوداع",
      schedule: [
        { time: "09:00", activity: "جلسة الختام الصباحية" },
        { time: "11:00", activity: "فقرة النشاط الأخير" },
        { time: "13:00", activity: "استراحة الغداء" },
        { time: "15:00", activity: "تلخيص الرحلة وصور جماعية" },
        { time: "17:00", activity: "المغادرة والعودة" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-4">برنامج الرحلة</h1>
            <p className="text-muted text-lg">جدول مفصل لثلاثة أيام من المغامرة والاستكشاف</p>
        </header>

        <div dir="rtl" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {days.map((day, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className="bg-charcoal border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                    <h2 className="text-2xl font-black mb-6 text-accent-gold border-b border-white/10 pb-4">{day.title}</h2>
                    <div className="space-y-4">
                        {day.schedule.map((item, i) => (
                            <div key={i} className="flex items-center space-x-reverse space-x-4">
                                <span className="bg-accent-green/20 text-accent-green px-3 py-1 rounded text-xs font-bold w-16 text-center">{item.time}</span>
                                <span className="text-main-text font-medium text-sm">{item.activity}</span>
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
