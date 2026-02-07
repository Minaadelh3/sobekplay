
import React from 'react';
import { motion } from 'framer-motion';
import { useNews } from '../hooks/useNews';
import { newsDefaults } from '../data/newsDefaults';

const NewsPage: React.FC = () => {
  const { news, loading } = useNews();
  // Use DB news if available, otherwise fall back to defaults
  const displayNews = news.length > 0 ? news : newsDefaults;
  const sortedNews = [...displayNews].sort((a, b) => (a.order || 0) - (b.order || 0));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black mb-4 tracking-tight">نشرة سوبيك</h1>
          <p className="text-muted text-xl" dir="rtl">أخر أخبار الرحلة، حكايات من الكواليس، وكل جديد من قلب الحدث!</p>
        </header>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          dir="rtl"
        >
          {sortedNews.map((news) => (
            <motion.div
              key={news.id}
              variants={item}
              className="bg-charcoal border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all shadow-xl group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl bg-white/5 w-16 h-16 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  {news.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-accent-gold mb-3">{news.title}</h3>
                  <p className="text-white/90 text-lg leading-relaxed font-medium">
                    {news.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsPage;
