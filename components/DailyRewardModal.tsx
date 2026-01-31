import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyRewardModal: React.FC = () => {
    const [reward, setReward] = useState<{ points: number, streak: number } | null>(null);

    useEffect(() => {
        const handleReward = (e: CustomEvent) => {
            setReward(e.detail);
        };
        window.addEventListener('daily-reward' as any, handleReward);
        return () => window.removeEventListener('daily-reward' as any, handleReward);
    }, []);

    const close = () => setReward(null);

    return (
        <AnimatePresence>
            {reward && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        className="relative z-10 bg-[#1a1a1a] border border-accent-gold/30 p-8 rounded-2xl text-center max-w-sm w-full shadow-[0_0_50px_rgba(255,193,7,0.2)]"
                    >
                        <div className="w-20 h-20 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <span className="text-4xl">🎁</span>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2">مكافأة يومية!</h2>
                        <p className="text-gray-400 mb-6">عاش يا بطل! استلمت مكافأتك النهاردة.</p>

                        <div className="flex justify-center gap-4 mb-8">
                            <div className="bg-[#2a2a2a] p-3 rounded-lg min-w-[80px]">
                                <div className="text-accent-gold font-bold text-xl">+{reward.points}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Points</div>
                            </div>
                            <div className="bg-[#2a2a2a] p-3 rounded-lg min-w-[80px]">
                                <div className="text-orange-500 font-bold text-xl">{reward.streak} 🔥</div>
                                <div className="text-[10px] text-gray-500 uppercase">Streak</div>
                            </div>
                        </div>

                        <button
                            onClick={close}
                            className="w-full bg-accent-gold hover:bg-accent-gold/90 text-black font-black py-3 rounded-xl transition-all"
                        >
                            استلام
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DailyRewardModal;
