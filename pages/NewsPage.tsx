
import React from 'react';
import { motion } from 'framer-motion';
import { useNews } from '../hooks/useNews';


const NewsPage: React.FC = () => {
  const { news, loading } = useNews();

  const sortedNews = [...news].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Get current date in Arabic
  const date = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f0e6d2] text-[#1a1a1a] pt-24 pb-24 font-serif overflow-x-hidden selection:bg-[#BFA05A] selection:text-black">
      {/* Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 1.79 4 4 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24 5 5 2.24-5-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5z" fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* MASTHEAD */}
        <header className="mb-12 text-center border-b-4 border-double border-black pb-8">
          <div className="flex justify-between items-end border-b border-black/20 pb-2 mb-4 font-sans text-xs sm:text-sm uppercase tracking-widest text-[#5a5a5a] px-2">
            <span>Issue No. 242</span>
            <span>{date}</span>
            <span>Daily Edition</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
            SOBEK TIMES
          </h1>

          <div className="flex items-center justify-center gap-4 text-sm md:text-base font-bold uppercase tracking-wider border-t border-b border-black py-2 mt-6">
            <span className="flex-1 text-right">أخبار</span>
            <span className="text-2xl text-accent-gold">♦</span>
            <span className="flex-1 text-center">كواليس</span>
            <span className="text-2xl text-accent-gold">♦</span>
            <span className="flex-1 text-left">أحداث</span>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">🗞️</div>
            <p className="font-serif italic text-xl">Loading the press...</p>
          </div>
        ) : sortedNews.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-black/20 rounded-lg p-12 bg-white/40">
            <div className="text-8xl mb-6 opacity-50">📰</div>
            <h3 className="text-3xl font-bold mb-3 font-serif">Extra! Extra! No News Today!</h3>
            <p className="text-xl text-gray-600 font-serif italic">The presses are silent. Check back later for updates.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
            dir="rtl"
          >
            {sortedNews.map((news, index) => (
              <motion.div
                key={`${news.id}-${index}`}
                variants={item}
                className={`break-inside-avoid bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] border border-black p-6 hover:-translate-y-1 transition-transform duration-300 ${index === 0 ? 'md:col-span-2 bg-[#faf9f6]' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-4 border-b border-black/10 pb-4">
                  <span className="bg-black text-white text-xs px-2 py-1 font-bold uppercase tracking-wider">
                    {index === 0 ? 'HEADLINE' : 'NEWS'}
                  </span>
                  <div className="text-2xl opacity-80 filter sepia-[.5]">{news.icon}</div>
                </div>

                <h3 className={`font-bold text-black mb-4 leading-tight font-serif ${index === 0 ? 'text-4xl md:text-5xl' : 'text-2xl'
                  }`}>
                  {news.title}
                </h3>

                <div className={`prose prose-lg text-gray-800 font-serif leading-relaxed ${index === 0 ? 'text-lg md:text-xl column-count-2' : 'text-base'
                  }`}>
                  <p>{news.content}</p>
                </div>

                {index === 0 && (
                  <div className="mt-6 pt-4 border-t border-black/20 text-xs text-gray-500 font-sans uppercase tracking-widest text-left">
                    Featured Story • Continued on Page 2
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
