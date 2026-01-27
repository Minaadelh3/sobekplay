import React from 'react';
import { motion } from 'framer-motion';

// --- ASSETS & DATA ---
// We use a robust fallback system. If an image fails, show the Mascot.
const SOBEK_MASCOT_URL = '/posters/sobek_kids_mascot.png';
const BAKKAR_URL = '/posters/bakkar.png';
const NILE_FRIENDS_URL = '/posters/sobek_nile_friends.png';
const COMING_SOON_URL = '/posters/nubanji_coming_soon.png';

// Safe, Colorful, Complete Data
const KIDS_CONTENT = [
  { id: 1, title: "Sobek's Big Day", image: SOBEK_MASCOT_URL, category: "Favorites" },
  { id: 2, title: "Bakkar & Friends", image: BAKKAR_URL, category: "Classics" },
  { id: 3, title: "Nile Adventure", image: NILE_FRIENDS_URL, category: "Adventure" },
  { id: 4, title: "Sobek in Space", image: SOBEK_MASCOT_URL, category: "Space" }, // Reuse mascot for now (consistency)
  { id: 5, title: "Nubanji", image: COMING_SOON_URL, category: "Adventure" },
  { id: 6, title: "Jungle Fun", image: SOBEK_MASCOT_URL, category: "Animals" },
  { id: 7, title: "Magic School", image: SOBEK_MASCOT_URL, category: "Magic" },
  { id: 8, title: "Bakkar 2", image: BAKKAR_URL, category: "Classics" },
  { id: 9, title: "River Race", image: NILE_FRIENDS_URL, category: "Adventure" },
  { id: 10, title: "Sobek the Hero", image: SOBEK_MASCOT_URL, category: "Favorites" },
];

const CATEGORIES = [
  { name: 'Favorites', emoji: '⭐', color: 'from-yellow-400 to-orange-500' },
  { name: 'Adventures', emoji: '🗺️', color: 'from-blue-400 to-cyan-500' },
  { name: 'Funny', emoji: '😂', color: 'from-green-400 to-emerald-500' },
  { name: 'Animals', emoji: '🦁', color: 'from-purple-400 to-pink-500' },
  { name: 'Learning', emoji: '🧠', color: 'from-pink-400 to-rose-500' },
];

const KidsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#101010] pb-32 overflow-x-hidden font-sans selection:bg-pink-500">

      {/* 1) HERO SECTION */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#101010] z-10" />
        <img
          src={SOBEK_MASCOT_URL}
          alt="Sobek Hero"
          className="w-full h-full object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4"
          >
            <span className="text-6xl md:text-8xl drop-shadow-2xl filter">🐊</span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-pink-500 drop-shadow-lg tracking-tight mb-4"
          >
            SOBEK KIDS
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white font-bold max-w-lg drop-shadow-md"
          >
            Safe. Fun. Magical.
          </motion.p>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 px-10 py-4 bg-white text-black font-black text-xl rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            PLAY NOW ▶️
          </motion.button>
        </div>
      </div>

      {/* 2) CATEGORY PILLS */}
      <div className="px-6 -mt-8 relative z-30 mb-12 overflow-x-auto no-scrollbar py-4">
        <div className="flex gap-4 min-w-max">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br ${cat.color} shadow-lg shadow-white/5 active:scale-95 transition-transform border-4 border-white/10`}
            >
              <span className="text-4xl mb-1 filter drop-shadow-md">{cat.emoji}</span>
              <span className="text-xs font-black text-white uppercase tracking-wide drop-shadow-sm">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 3) CONTENT ROWS (NETFLIX STYLE) */}
      <div className="space-y-16 pb-20">
        <KidsRow title="Sobek's Adventures 🐊" items={KIDS_CONTENT} />
        <KidsRow title="Popular Movies 🍿" items={[...KIDS_CONTENT].reverse()} />
        <KidsRow title="Learn & Play 🧠" items={KIDS_CONTENT.slice(2, 8)} />
        <KidsRow title="Funny Cartoons 😂" items={[...KIDS_CONTENT].sort(() => Math.random() - 0.5)} />
      </div>

    </div>
  );
};

// --- ROW COMPONENT ---
const KidsRow = ({ title, items }: { title: string, items: any[] }) => (
  <div className="pl-6">
    <h3 className="text-2xl md:text-3xl font-black text-white mb-6 tracking-wide drop-shadow-md flex items-center gap-2">
      <span className="w-2 h-8 bg-pink-500 rounded-full inline-block" />
      {title}
    </h3>
    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 pr-6 snap-x snap-mandatory">
      {items.map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-48 md:w-64 aspect-[3/4] rounded-3xl overflow-hidden relative snap-center shadow-xl group border-4 border-transparent hover:border-pink-500 transition-all bg-[#202020]"
        >
          {/* Image with Failsafe */}
          <img
            src={item.image}
            onError={(e) => { e.currentTarget.src = SOBEK_MASCOT_URL; }} // CRITICAL FAILSAFE
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-50 group-hover:scale-100 duration-300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-black text-2xl ml-1">▶️</span>
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h4 className="text-white font-black text-lg text-center leading-tight drop-shadow-md">{item.title}</h4>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default KidsPage;