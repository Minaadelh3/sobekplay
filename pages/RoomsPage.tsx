import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- B) DATA STRUCTURE (Mock Data) ---
// This matches the structure of a typical hotel rooming list Excel sheet.
interface RoomAssignment {
  id: string;
  fullName: string;
  roomNumber: string;
  roomType: 'Single' | 'Double' | 'Triple';
  floor?: string;
  status: 'Assigned' | 'Pending';
  roommates: string[];
}

const MOCK_DATA: RoomAssignment[] = [
  { id: '1', fullName: "Michael Nabil", roomNumber: "305", roomType: "Double", floor: "3rd Floor", status: "Assigned", roommates: ["George Bassem"] },
  { id: '2', fullName: "George Bassem", roomNumber: "305", roomType: "Double", floor: "3rd Floor", status: "Assigned", roommates: ["Michael Nabil"] },
  { id: '3', fullName: "Sarah Magdy", roomNumber: "412", roomType: "Triple", floor: "4th Floor", status: "Assigned", roommates: ["Mariam Hany", "Nadine Samy"] },
  { id: '4', fullName: "Mariam Hany", roomNumber: "412", roomType: "Triple", floor: "4th Floor", status: "Assigned", roommates: ["Sarah Magdy", "Nadine Samy"] },
  { id: '5', fullName: "Nadine Samy", roomNumber: "412", roomType: "Triple", floor: "4th Floor", status: "Assigned", roommates: ["Sarah Magdy", "Mariam Hany"] },
  { id: '6', fullName: "Ahmed Hassan", roomNumber: "501", roomType: "Single", floor: "5th Wing", status: "Assigned", roommates: [] },
  { id: '7', fullName: "Uncle Joy", roomNumber: "101", roomType: "Single", floor: "VIP Wing", status: "Assigned", roommates: [] },
];

// --- C) FULL COMPONENT CODE ---
const RoomsPage: React.FC = () => {
  const [query, setQuery] = useState('');

  // Search Logic:
  // 1. Clean query (trim, lower case).
  // 2. Filter dataset for Partial Match.
  // 3. Return the FIRST exactish match for simplicity in this UX, usually users look for themselves.
  const result = useMemo(() => {
    if (!query || query.length < 2) return null;
    const lowerQ = query.toLowerCase().trim();
    return MOCK_DATA.find(p => p.fullName.toLowerCase().includes(lowerQ));
  }, [query]);

  return (
    <div className="min-h-screen bg-nearblack pt-32 pb-24 px-6 flex flex-col items-center relative overflow-hidden font-sans selection:bg-accent-gold/30">

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 blur-sm transform scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-[#121212]/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center"
      >
        {/* 1. Header (Preserved) */}
        <div className="mb-8">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-accent-gold font-bold tracking-[0.3em] text-xs uppercase"
          >
            Behind The Scenes
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-black text-white mt-2 mb-6 drop-shadow-2xl font-serif tracking-tight"
          >
            Room Assignments
          </motion.h1>
        </div>

        {/* 2. Intro Text (Preserved & Integrated) */}
        <div className="mb-10 max-w-xl">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-relaxed font-arabic text-center" dir="rtl">
            مين هيكون الـ Co-Star بتاعك؟ 🎬
          </h2>
          <p className="text-base text-white/60 leading-relaxed font-arabic" dir="rtl">
            توزيع الغرف ده فن... مش عن عن!<br />
            اكتب اسمك تحت عشان تعرف غرفتك.<br />
            <span className="text-accent-gold font-bold">جهز نفسك للمفاجأة 😉</span>
          </p>
        </div>

        {/* 3. Search Interaction */}
        <div className="w-full max-w-md relative mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-gold/20 to-accent-blue/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl transition-all focus-within:bg-white/10 focus-within:border-accent-gold/30 focus-within:ring-1 focus-within:ring-accent-gold/30">

              <svg className="w-6 h-6 text-white/40 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your name..."
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/30 text-lg font-medium"
              />

              {query && (
                <button onClick={() => setQuery('')} className="ml-2 text-white/40 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Results Area */}
        <div className="w-full max-w-lg min-h-[300px]">
          <AnimatePresence mode="wait">

            {/* STATE: Found */}
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-3xl p-1 overflow-hidden shadow-2xl relative"
              >
                {/* Decorative Top Gold Strip */}
                <div className="h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 w-full rounded-t-2xl" />

                <div className="p-8 relative">
                  {/* Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] opacity-[0.03] font-serif pointer-events-none text-white select-none">KEY</div>

                  <div className="flex justify-between items-start mb-8">
                    <div className="text-left">
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Room Key</div>
                      <div className="text-3xl font-bold text-white tracking-wide">{result.roomNumber}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-accent-gold tracking-wider">
                      {result.status}
                    </div>
                  </div>

                  <div className="space-y-6 text-left">
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Guest Name</div>
                      <div className="text-2xl font-black text-white font-serif">{result.fullName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Type</div>
                        <div className="text-white font-medium">{result.roomType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</div>
                        <div className="text-white font-medium">{result.floor || 'Standard Wing'}</div>
                      </div>
                    </div>

                    {result.roommates.length > 0 && (
                      <div className="pt-6 border-t border-white/10">
                        <div className="text-xs text-accent-blue uppercase tracking-widest mb-3 font-bold">Roommates (Co-Stars)</div>
                        <ul className="space-y-2">
                          {result.roommates.map(mate => (
                            <li key={mate} className="flex items-center gap-2 text-white/80">
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                {mate.charAt(0)}
                              </div>
                              {mate}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-white/10 text-center">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Sobek Plaza Hotel • 2026</div>
                  </div>
                </div>
              </motion.div>
            ) : query.length > 1 ? (
              // STATE: Not Found
              <motion.div
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-red-500/20 rounded-2xl p-8 backdrop-blur-md"
              >
                <div className="text-4xl mb-4">🕵️‍♂️</div>
                <h3 className="text-xl font-bold text-white mb-2">Room Not Found</h3>
                <p className="text-white/60 mb-4">We couldn't find a reservation for <strong>"{query}"</strong>.</p>
                <p className="text-xs text-white/40">Try typing just your first name, or check back later! The casting list is still being finalized.</p>
              </motion.div>
            ) : (
              // STATE: Empty / Hint
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full opacity-40 hover:opacity-100 transition-opacity"
              >
                <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <p className="text-sm uppercase tracking-widest text-white/60">Search to reveal your destiny</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default RoomsPage;
