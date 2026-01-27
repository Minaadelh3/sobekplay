
import React from 'react';
import { motion } from 'framer-motion';
import Carousel from '../components/Carousel';

interface KidsPageProps {
  posters?: any[];
}

// Fallback data in case props aren't passed (though they should be)
const MOCK_KIDS_CONTENT = [
  { filename: 'lion_king', title: 'The Lion King', image_url: 'https://image.tmdb.org/t/p/w500/b0MxU37DNZYxs8W889wszsfDC7y.jpg' },
  { filename: 'moana', title: 'Moana', image_url: 'https://image.tmdb.org/t/p/w500/4JeejGugONWskkbn4lK2htrUSsV.jpg' },
  { filename: 'frozen', title: 'Frozen', image_url: 'https://image.tmdb.org/t/p/w500/kgwjIb2JDKY2h9602HbPbMXPRq.jpg' },
  { filename: 'finding_nemo', title: 'Finding Nemo', image_url: 'https://image.tmdb.org/t/p/w500/gg7VdDRR0bOWWtKeLbdFvXz17fP.jpg' },
  { filename: 'toy_story', title: 'Toy Story', image_url: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg' },
  { filename: 'coco', title: 'Coco', image_url: 'https://image.tmdb.org/t/p/w500/askg3SMvhqEl4OL52YuvdtY40Yb.jpg' },
  { filename: 'encanto', title: 'Encanto', image_url: 'https://image.tmdb.org/t/p/w500/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg' },
  { filename: 'zootopia', title: 'Zootopia', image_url: 'https://image.tmdb.org/t/p/w500/sM33SANp9z6rXW8Itn7NnG1GOEs.jpg' },
];

const KidsPage: React.FC<KidsPageProps> = ({ posters = [] }) => {
  // Filter for potential kids content if available, otherwise mix or use mock
  const kidsContent = posters.length > 0
    ? posters.filter(p => p.genres?.includes('Animation') || p.genres?.includes('Family') || p.keywords?.includes('kids'))
    : [];

  // Combine real and mock for a full feeling page
  const displayContent = [...kidsContent, ...MOCK_KIDS_CONTENT].slice(0, 20);

  const categories = [
    { name: 'Favorites', emoji: '⭐', color: 'from-yellow-400 to-orange-500' },
    { name: 'Adventures', emoji: '🗺️', color: 'from-blue-400 to-cyan-500' },
    { name: 'Funny', emoji: '😂', color: 'from-green-400 to-emerald-500' },
    { name: 'Animals', emoji: '🦁', color: 'from-purple-400 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-32 overflow-x-hidden selection:bg-pink-500">

      {/* Kids Header - Fun & Bouncy */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 drop-shadow-sm tracking-tight">KIDS</span>
          <span className="text-3xl animate-bounce">🎈</span>
        </motion.div>
        {/* Simple Profile/Settings for easy exit */}
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
          <span className="text-xl">👶</span>
        </div>
      </div>

      {/* Category Pills - Big Touch Targets */}
      <div className="px-6 mb-12 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${cat.color} shadow-lg shadow-white/5 active:scale-95 transition-transform`}
            >
              <span className="text-3xl mb-1 filter drop-shadow-md">{cat.emoji}</span>
              <span className="text-xs font-black text-white uppercase tracking-wide drop-shadow-sm">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content Rows - Horizontal Scrolling with Snap */}
      <div className="space-y-12">
        <KidsRow title="Popular Now 🚀" items={displayContent.slice(0, 5)} />
        <KidsRow title="Laugh Out Loud 🤣" items={displayContent.slice(3, 8)} />
        <KidsRow title="Magical Worlds ✨" items={displayContent.slice(1, 6)} />
        <KidsRow title="Animal Friends 🐾" items={displayContent.slice(4, 9)} />
      </div>

    </div>
  );
};

// Simplified Row Component for Mobile Performance
const KidsRow = ({ title, items }: { title: string, items: any[] }) => (
  <div className="pl-6">
    <h2 className="text-xl font-black text-white mb-4 tracking-wide drop-shadow-md">{title}</h2>
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 pr-6 snap-x snap-mandatory">
      {items.map((item, i) => (
        <motion.div
          key={i}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-40 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden relative snap-center shadow-lg bg-charcoal"
        >
          <img
            src={item.image_url || "/assets/placeholder-kids.jpg"}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
            {/* Logo or Title could go here, keeping it minimal for visual impact */}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default KidsPage;