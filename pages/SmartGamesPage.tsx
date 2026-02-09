import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import { SMART_GAMES_DATA } from '../data/smart_games_data';
import { useAuth } from '../context/AuthContext';

const SmartGamesPage: React.FC = () => {
    const navigate = useNavigate();
    const { accountData, isAdmin } = useAuth();

    // Account Points (Admin gets infinite)
    // Account Points (Admin gets infinite)
    const totalPoints = isAdmin ? 999999 : (accountData?.xp || 0);

    const getRequiredPoints = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 0;
            case 'Medium': return 500;
            case 'Hard': return 1000;
            default: return 0;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-arabic safe-area-pb selection:bg-purple-500/30 overflow-x-hidden" dir="rtl">

            {/* Header */}
            <div className="pt-20 pb-10 px-6 text-center relative">
                <BackButton fallbackPath="/" />

                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-indigo-600/20 blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-2xl">
                        <span className="text-white">ذكاء</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mx-2">سوبِك</span>
                        <span className="inline-block animate-bounce">🧠</span>
                    </h1>
                    <p className="text-white/70 text-lg font-bold">
                        15 تحدي.. وريني شطارتك
                    </p>
                    <div className="mt-2 text-indigo-400 font-mono text-sm">
                        رصيد الذكاء: {totalPoints} نقطة
                    </div>
                </motion.div>
            </div>

            {/* Levels Grid */}
            <div className="max-w-4xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {SMART_GAMES_DATA.map((level) => {
                        const needed = getRequiredPoints(level.difficulty);
                        const isLocked = totalPoints < needed;

                        return (
                            <motion.button
                                key={level.id}
                                whileHover={{ scale: isLocked ? 1 : 1.05 }}
                                whileTap={{ scale: isLocked ? 1 : 0.95 }}
                                onClick={() => !isLocked && navigate(`/smart-games/${level.id}`)}
                                className={`
                                    relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 p-4
                                    border transition-all duration-300
                                    ${isLocked
                                        ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed grayscale'
                                        : 'bg-white/10 border-white/10 hover:bg-white/20 hover:border-indigo-500/50 cursor-pointer shadow-lg'
                                    }
                                `}
                            >
                                {/* Level Number & Icon */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black relative
                                    ${isLocked ? 'bg-white/5 text-white/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/50 shadow-lg'}
                                `}>
                                    {isLocked ? '🔒' : level.id}
                                </div>

                                <div className="text-center">
                                    <h3 className="font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2">
                                        {level.title}
                                    </h3>

                                    {isLocked && (
                                        <span className="text-[10px] text-red-400 font-mono block">
                                            مطلوب {needed}
                                        </span>
                                    )}

                                    {!isLocked && (
                                        <span className={`
                                            text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded
                                            ${level.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : ''}
                                            ${level.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                            ${level.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : ''}
                                        `}>
                                            {level.difficulty}
                                        </span>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default SmartGamesPage;
