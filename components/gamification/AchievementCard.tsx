import React from 'react';
import { motion } from 'framer-motion';
import { Achievement, TOKENS } from '../../lib/gamification';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                relative overflow-hidden rounded-xl border p-4 flex items-center gap-4 transition-all
                ${isUnlocked
                    ? `bg-[${TOKENS.colors.bgCard}] border-[${TOKENS.colors.goldPrimary}]/30 shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)]`
                    : 'bg-white/5 border-white/5 grayscale opacity-70'}
            `}
        >
            {/* Icon Box */}
            <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0
                ${isUnlocked ? 'bg-gradient-to-br from-gray-800 to-black border border-white/10' : 'bg-white/5'}
            `}>
                {isUnlocked ? achievement.icon : '🔒'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg mb-1 truncate ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {achievement.description}
                </p>
            </div>

            {/* Points Badge (if unlocked or always visible?) usually visible to motivate */}
            <div className={`
                flex flex-col items-center justify-center w-12 shrink-0
                ${isUnlocked ? 'text-[#D4AF37]' : 'text-gray-600'}
            `}>
                <span className="font-black text-lg">{achievement.points}</span>
                <span className="text-[9px] uppercase tracking-wider font-bold">XP</span>
            </div>

            {/* Shine Effect if unlocked */}
            {isUnlocked && (
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shine pointer-events-none" />
            )}
        </motion.div>
    );
};

export default AchievementCard;
