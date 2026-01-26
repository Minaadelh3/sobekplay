import React from 'react';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';
import { Link } from 'react-router-dom';

interface KidsPageProps {
  posters: PosterItem[];
}

const KidsPage: React.FC<KidsPageProps> = ({ posters }) => {
  const kidsContent = posters.filter(p => 
    p.title.toLowerCase().includes('bakkar') || 
    p.title.toLowerCase().includes('cartoon') ||
    (p.metrics && p.metrics.brightness > 0.5 && p.metrics.saturation > 0.5)
  );

  const categories = [
    { name: 'Cartoons', icon: '🎨', color: 'bg-blue-500' },
    { name: 'Educational', icon: '📚', color: 'bg-green-500' },
    { name: 'Stories', icon: '🌙', color: 'bg-purple-500' },
    { name: 'Fun', icon: '🎪', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#1a1d24] pt-24 pb-24 px-4 md:px-12 selection:bg-yellow-400 selection:text-black">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-lg animate-bounce">
                👶
            </div>
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Sobek Kids</h1>
                <p className="text-white/60 font-medium">Safe. Fun. Educational.</p>
            </div>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 mb-12 scrollbar-hide">
        {categories.map(cat => (
            <motion.button
                key={cat.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${cat.color} px-8 py-4 rounded-2xl flex items-center gap-3 shadow-lg min-w-[160px]`}
            >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-white font-black text-lg">{cat.name}</span>
            </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {kidsContent.map((item) => (
            <motion.div
                key={item.id}
                whileHover={{ y: -10 }}
                className="bg-[#252a33] rounded-3xl overflow-hidden shadow-xl border-4 border-transparent hover:border-yellow-400 transition-all group"
            >
                <Link to={`/title/${item.id}`}>
                    <div className="aspect-video relative overflow-hidden">
                        <ImageWithFallback 
                            src={item.src} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{item.title}</h3>
                        <p className="text-white/50 text-sm line-clamp-2">{item.description}</p>
                    </div>
                </Link>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default KidsPage;