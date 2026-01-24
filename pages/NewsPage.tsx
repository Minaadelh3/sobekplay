
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NewsItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulated fetching from news.json
    // For now returning empty if no items are provided
    const fetchNews = async () => {
        try {
             // Simulate a fetch that might fail or return empty
             // setNews([]); 
             // Intentionally leaving empty as per previous logic, but setting structure for error handling
        } catch (e) {
            setError(true);
        }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-black mb-4 tracking-tight">Sobek News</h1>
          <p className="text-muted text-xl">The latest updates from the world of Sobek Play</p>
        </header>

        {error && (
            <div className="mb-12 text-center p-6 bg-red-500/10 rounded-xl border border-red-500/20">
                <p className="text-red-200">Unable to load news feed. Please try again later.</p>
            </div>
        )}

        {news.length > 0 ? (
          <div className="space-y-12">
            {news.map((item, idx) => (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-charcoal border border-white/5 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              >
                {item.image && (
                  <div className="md:w-1/3 aspect-video md:aspect-auto">
                    <ImageWithFallback src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-8 md:p-12 flex-1">
                  <p className="text-accent-gold text-xs font-black uppercase tracking-widest mb-2">{item.date}</p>
                  <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight">{item.title}</h2>
                  <p className="text-muted text-lg leading-relaxed mb-8">{item.body}</p>
                  <button className="text-accent-green font-bold flex items-center space-x-2 group">
                    <span>Read More</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : !error && (
          <div className="py-24 text-center">
            <p className="text-muted italic">No news items found. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
