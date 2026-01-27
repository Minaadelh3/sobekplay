import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_HOTEL_DATA } from '../data/mockHotelData';
import { GuestAllocation } from '../types/hotel';

// --- UTILS ---
const normalize = (text: string) => {
    return text.toLowerCase()
        .replace(/أ|إ|آ/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .trim();
};

// --- COMPONENTS ---

const GuestCard = ({ guest, onClear }: { guest: GuestAllocation, onClear: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white text-black rounded-3xl overflow-hidden shadow-2xl relative"
        >
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white relative overflow-hidden">
                <div className="absolute -right-6 -top-6 text-white/10 text-9xl font-black">{guest.roomNumber.replace(/\D/g, '')}</div>
                <h3 className="text-2xl font-bold font-arabic mb-1">{guest.fullName}</h3>
                <span className="text-blue-200 text-sm font-arabic tracking-wide">{guest.roomType} • {guest.building || 'Main Building'}</span>
            </div>

            <div className="p-8 flex flex-col items-center">
                <div className="text-center mb-8">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest block mb-2">ROOM NUMBER</span>
                    <h2 className="text-8xl font-black text-blue-900 font-numeric tracking-tighter">{guest.roomNumber}</h2>
                </div>

                {guest.roommates.length > 0 && (
                    <div className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-3 text-center">ROOMMATES</span>
                        <div className="flex flex-wrap justify-center gap-2">
                            {guest.roommates.map(r => (
                                <span key={r} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-arabic font-bold text-gray-700 shadow-sm">
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={onClear}
                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-transform"
                >
                    Search Another Name
                </button>
            </div>

            <div className="bg-gray-100 p-3 text-center text-[10px] text-gray-400 font-mono">
                Last Updated: {new Date(guest.lastUpdated).toLocaleTimeString()}
            </div>
        </motion.div>
    );
};

const HotelPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [selectedGuest, setSelectedGuest] = useState<GuestAllocation | null>(null);

    // Filter Logic
    const results = useMemo(() => {
        if (query.length < 2) return [];
        const q = normalize(query);
        return MOCK_HOTEL_DATA.guests.filter(g => {
            return normalize(g.fullName).includes(q) ||
                normalize(g.normalizedName).includes(q) ||
                g.roomNumber.toLowerCase().includes(q);
        });
    }, [query]);

    // Handle Selection
    const handleSelect = (g: GuestAllocation) => {
        setSelectedGuest(g);
        setQuery('');
    };

    return (
        <div className="min-h-screen bg-[#0f0f13] text-white p-4 font-sans relative overflow-hidden" dir="rtl">
            {/* Background Ambient */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

            <div className="max-w-md mx-auto pt-12 relative z-10 flex flex-col min-h-[80vh]">

                {/* Header */}
                <motion.div layout className="text-center mb-8">
                    <h1 className="text-3xl font-black font-arabic mb-2">أرقام الغرف 🏨</h1>
                    <p className="text-white/40 font-arabic text-sm">اكتب اسمك واعرف غرفتك في ثانية</p>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center">

                    {/* Search State */}
                    {!selectedGuest ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full h-16 bg-white/10 border border-white/10 rounded-2xl px-6 text-xl font-arabic text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all text-center dir-auto"
                                    placeholder="ابحـث بالاســم..."
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute left-4 top-5 text-2xl opacity-30">🔍</div>
                            </div>

                            {/* Live Results */}
                            <div className="space-y-2 mt-4">
                                {results.map(g => (
                                    <motion.button
                                        key={g.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleSelect(g)}
                                        className="w-full p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 active:scale-98 transition-all"
                                    >
                                        <div className="text-right">
                                            <div className="font-bold font-arabic text-lg">{g.fullName}</div>
                                            <div className="text-xs text-white/40 font-arabic">
                                                {g.roommates.length > 0 ? `مع: ${g.roommates[0]}...` : 'غرفة مفردة'}
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            ➜
                                        </div>
                                    </motion.button>
                                ))}
                                {query.length > 1 && results.length === 0 && (
                                    <div className="text-center py-8 text-white/30 font-arabic">
                                        مش لاقيين الاسم ده... جرب تكتب الاسم الأول بس
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* Result State */
                        <GuestCard guest={selectedGuest} onClear={() => setSelectedGuest(null)} />
                    )}

                </div>

                {/* Footer Status */}
                {!selectedGuest && (
                    <div className="text-center py-6 text-[10px] text-white/20 font-mono">
                        System Online • Last Sync: {new Date(MOCK_HOTEL_DATA.lastUpdated).toLocaleTimeString()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelPage;
