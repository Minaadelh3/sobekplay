import React from 'react';
import { motion } from 'framer-motion';
import { UserProgress } from '../../types/achievements';
import { calculateLevelFromXP, getNextLevelInfo } from '../../lib/gamification';

interface LevelProgressProps {
    progress: UserProgress;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ progress }) => {
    const currentLevelInfo = calculateLevelFromXP(progress.xp);
    const nextLevelInfo = getNextLevelInfo(currentLevelInfo.level);

    // Calculate percentage within current level
    const currentLevelMin = currentLevelInfo.minXP;
    const nextLevelMin = nextLevelInfo ? nextLevelInfo.minXP : currentLevelInfo.maxXP; // If max, use max
    const range = nextLevelMin - currentLevelMin;
    const currentInLevel = progress.xp - currentLevelMin;

    const percentage = nextLevelInfo
        ? Math.min(100, Math.max(0, (currentInLevel / range) * 100))
        : 100; // Max level reached

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#121820] border border-white/10 p-6">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center relative z-10">
                {/* Level Icon */}
                <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] bg-[#1a1f2e] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-3">
                    {currentLevelInfo.icon}
                </div>

                {/* Level Title */}
                <h2 className="text-2xl font-bold text-white mb-1">
                    {currentLevelInfo.title}
                </h2>
                <div className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest mb-4">
                    مستوى {currentLevelInfo.level}
                </div>

                {/* Progress Bar Container */}
                <div className="w-full max-w-sm mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                        <span>{progress.xp} XP</span>
                        {nextLevelInfo ? (
                            <span>{nextLevelInfo.minXP} XP (فاضل {nextLevelInfo.minXP - progress.xp})</span>
                        ) : (
                            <span>MAX LEVEL</span>
                        )}
                    </div>

                    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                        {/* Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] relative"
                        >
                            {/* Shine animation on bar */}
                            <div className="absolute inset-0 bg-white/20 w-full animate-shine" />
                        </motion.div>
                    </div>
                </div>

                {/* Next Level Hint */}
                {nextLevelInfo && (
                    <p className="text-xs text-gray-500 mt-2">
                        المستوى الجاي: <span className="text-gray-300 font-bold">{nextLevelInfo.title} {nextLevelInfo.icon}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default LevelProgress;
