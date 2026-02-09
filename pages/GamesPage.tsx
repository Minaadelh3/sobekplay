import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import BackButton from '../components/BackButton';

import { GAMES_CONFIG } from '../lib/games';

interface GameItem {
    id: string;
    title: string;
    path: string;
    icon: string;
    color: string;
    description: string;
    isMultiplayer?: boolean;
    isSmart?: boolean;
}

// EXISTING SOLO/GROUP GAMES
const CLASSIC_GAMES: GameItem[] = [
    {
        id: 'proverb',
        title: 'أمثال',
        path: '/games/proverb',
        icon: '📜',
        color: 'from-amber-500 to-orange-600',
        description: 'كمل المثل الشعبي',
    },
    {
        id: 'kamel-elayah',
        title: 'كمل الآية',
        path: '/games/kamel-elayah',
        icon: '✝️',
        color: 'from-blue-500 to-cyan-600',
        description: 'اختبر حفظك للكتاب المقدس',
    },
    {
        id: 'who',
        title: 'مين قال؟',
        path: '/games/who',
        icon: '🗣️',
        color: 'from-purple-500 to-pink-600',
        description: 'مين قال العبارة دي؟',
    },
    {
        id: 'sobek_intel',
        title: 'استجواب',
        path: '/games/sobek_intel',
        icon: '🕵️',
        color: 'from-emerald-500 to-teal-600',
        description: 'جاوب أسئلة سوبِك',
    },
    {
        id: 'mafia',
        title: 'مافيا',
        path: '/games/mafia',
        icon: '🕶️',
        color: 'from-red-600 to-rose-700',
        description: 'اللعبة الجماعية الشهيرة',
        isMultiplayer: true,
    },
    {
        id: 'matlha_law_adak',
        title: 'مطلها لو قدك',
        path: '/games/matlha_law_adak',
        icon: '🎭',
        color: 'from-yellow-400 to-amber-500',
        description: 'لعبة التمثيل الصامت',
        isMultiplayer: true,
    },
    {
        id: 'oul_besor3a',
        title: 'قول بسرعة',
        path: '/games/oul_besor3a',
        icon: '⏱️',
        color: 'from-indigo-500 to-violet-600',
        description: 'جاوب قبل الوقت ما يخلص',
        isMultiplayer: true,
    },
    {
        id: 'mamno3at',
        title: 'ممنوعات',
        path: '/games/mamno3at',
        icon: '🚫',
        color: 'from-rose-500 to-red-600',
        description: 'وصف من غير الكلمات الممنوعة',
        isMultiplayer: true,
    },
    {
        id: 'hekaya_gama3eya',
        title: 'حكاية جماعية',
        path: '/games/hekaya_gama3eya',
        icon: '📖',
        color: 'from-fuchsia-500 to-pink-600',
        description: 'ألفوا قصة سوا',
        isMultiplayer: true,
    },
];

const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            import('../lib/events').then(m => m.trackEvent(user.id, 'GAMES_OPENED'));
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-purple-500/30 overflow-x-hidden" dir="rtl">

            {/* Header */}
            <div className="pt-20 pb-10 px-6 text-center relative">
                <div className="flex items-center justify-end pointer-events-auto w-full">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white/10 p-3 px-6 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-2 text-white font-bold"
                    >
                        <span>الرئيسية</span>
                        <span>🏠</span>
                    </button>
                </div>

                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-indigo-600/20 blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl">
                        <span className="text-white">ملاهي</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mx-2">سوبِك</span>
                        <span className="inline-block animate-bounce">🎡</span>
                    </h1>
                    <p className="text-white/70 text-lg font-bold">
                        ألعاب، مناقشات، وفرهدة!
                    </p>
                </motion.div>
            </div>

            <div className="max-w-6xl mx-auto px-6 pb-24 space-y-16">

                {/* SECTION: MALAHY SOBEK (CHALLENGES) */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🔥</span>
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-white/50">
                            التحديات
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {GAMES_CONFIG.filter(g => g.id !== 'versus_match').map((game, index) => (
                            <motion.button
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, translateY: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/games/${game.id}`)}
                                className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 bg-white/5 hover:border-white/20 transition-all duration-300"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />

                                {/* Icon & Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                                    <span className="text-4xl mb-4 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {game.icon}
                                    </span>
                                    <h3 className="text-xl font-bold mb-1 leading-tight text-white group-hover:text-accent-gold transition-colors">
                                        {game.title}
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-white/60 line-clamp-2">
                                        {game.description}
                                    </p>
                                </div>

                                {/* Multiplayer Badge */}
                                {game.type === 'VERSUS' && (
                                    <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg">
                                        جماعية
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </section>



            </div>

        </div>
    );
};

export default GamesPage;
