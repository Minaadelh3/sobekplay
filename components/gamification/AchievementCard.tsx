import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/achievements';

interface AchievementCardProps {
    achievement: Achievement;
    status: 'locked' | 'unlocked' | 'progress';
    progress?: number; // 0 to 1
    currentValue?: number;
    targetValue?: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    status,
    progress = 0,
    currentValue = 0,
    targetValue = 0
}) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'unlocked';

    return (
        <motion.div
            layout
            className={`relative p-4 rounded-xl border transition-all duration-300 overflow-hidden group
                ${isCompleted
                    ? 'bg-[#1a1f2e] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'bg-[#121820] border-white/5 opacity-80 hover:opacity-100 hover:border-white/10'
                }
            `}
        >
            {/* Background Gradient for Completed */}
            {isCompleted && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
                {/* Icon / Emoji */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0
                    ${isCompleted
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#F1C40F] text-black shadow-lg animate-pulse-slow'
                        : 'bg-white/5 text-gray-500 grayscale'
                    }
                `}>
                    {achievement.emoji}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-lg ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
                            {achievement.title}
                        </h3>

                        {/* XP Badge */}
                        <div className={`px-2 py-0.5 rounded text-xs font-bold
                            ${isCompleted ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-gray-500'}
                        `}>
                            {achievement.xp} XP
                        </div>
                    </div>

                    <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                        {isLocked && achievement.category === 'Special' ? '???' : achievement.description}
                    </p>

                    {/* Progress Bar (if Progressive and not completed) */}
                    {status === 'progress' && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>فاضلك {targetValue - currentValue}</span>
                                <span>{Math.round(progress * 100)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress * 100}%` }}
                                    className="h-full bg-[#D4AF37]"
                                />
                            </div>
                        </div>
                    )}

                    {/* How to Get Hint (if Locked) */}
                    {isLocked && (
                        <div className="text-xs text-gray-500 italic mt-2">
                            🔒 {achievement.how_to_get}
                        </div>
                    )}

                    {/* Completed Status */}
                    {isCompleted && (
                        <div className="text-xs text-[#D4AF37] font-bold mt-2 flex items-center gap-1">
                            ✓ تم الإنجاز
                        </div>
                    )}
                </div>
            </div>

            {/* Shine Effect on Hover */}
            {isCompleted && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
        </motion.div>
    );
};

export default AchievementCard;
