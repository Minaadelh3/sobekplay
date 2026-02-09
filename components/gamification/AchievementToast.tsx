import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../types/achievements';
// import useSound from 'use-sound'; // Skipped for now

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    // Auto-close after 4 seconds
    useEffect(() => {
        if (achievement) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: -50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                    dir="rtl"
                >
                    <div className="bg-[#1a1f2e] border border-[#D4AF37] rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.4)] p-4 flex items-center gap-4 relative overflow-hidden">
                        {/* Shine BGV */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent skew-x-12 animate-pulse pointer-events-none" />

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F1C40F] flex items-center justify-center text-2xl shadow-lg shrink-0 relative z-10">
                            {achievement.emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative z-10">
                            <div className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-1">
                                إنجاز جديد!
                            </div>
                            <div className="text-white font-bold text-lg leading-none mb-1">
                                {achievement.title}
                            </div>
                            <div className="text-gray-400 text-xs">
                                +{achievement.xp} XP
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="relative z-50 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
