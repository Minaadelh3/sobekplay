import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPressurePrompt, PressurePrompt } from '../data/pressureData';

export const PressureGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'INTRO' | 'REVEAL' | 'REACTION'>('INTRO');
    const [currentPrompt, setCurrentPrompt] = useState<PressurePrompt | null>(null);
    const [round, setRound] = useState(1);
    const [isCardVisible, setIsCardVisible] = useState(false);

    // Actions
    const startGame = () => {
        nextRound();
    };

    const nextRound = () => {
        setIsCardVisible(false);
        const prompt = getPressurePrompt(round);
        setCurrentPrompt(prompt);
        setGameState('REVEAL');

        // Theatrical Delay
        setTimeout(() => {
            setIsCardVisible(true);
        }, 700);
    };

    const handleNext = () => {
        setRound(r => r + 1);
        nextRound();
    };

    // --- RENDERERS ---

    if (gameState === 'INTRO') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center text-white relative overflow-hidden">
                <button onClick={onExit} className="absolute top-6 left-6 z-50 text-white/60 hover:text-white">← Back</button>

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md relative z-10">
                    <div className="text-6xl mb-4">👀</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 font-arabic drop-shadow-lg" dir="rtl">
                        إنتو شايفينه إزاي؟
                    </h1>
                    <p className="text-lg text-white/70 mb-8 font-arabic leading-relaxed" dir="rtl">
                        لعبة المواجهة.. بس من غير كلام.<br />
                        السؤال هيظهر.. شاوروا كلكم على شخص واحد.<br />
                        استعدوا للضحك (أو الخناق).
                    </p>
                    <button
                        onClick={startGame}
                        className="px-10 py-4 bg-white text-slate-900 font-black text-xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                    >
                        Start Judging ⚖️
                    </button>
                </motion.div>
            </div>
        );
    }

    // REVEAL & REACTION STATE
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0B1120] relative overflow-hidden">

            <button onClick={onExit} className="absolute top-6 left-6 z-50 text-white/30 hover:text-white">Exit</button>

            {/* Progress */}
            <div className="absolute top-8 right-6 z-10">
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                    Round {round}
                </div>
            </div>

            {/* CARD CONTAINER */}
            <div className="w-full max-w-md perspective-1000">
                <AnimatePresence mode="wait">
                    {!isCardVisible ? (
                        <motion.div
                            key="hidden"
                            initial={{ opacity: 0, rotateX: 90 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            exit={{ opacity: 0, rotateX: -90 }}
                            transition={{ duration: 0.5 }}
                            className="aspect-[3/4] w-full bg-slate-800 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                            <div className="text-white/20 animate-pulse tracking-[0.3em] uppercase font-bold">Incoming...</div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="visible"
                            initial={{ opacity: 0, rotateX: 20, scale: 0.95 }}
                            animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                            className="aspect-[3/4] w-full bg-gradient-to-br from-slate-800 to-black rounded-3xl border border-white/10 p-8 flex flex-col justify-between shadow-2xl relative group"
                        >
                            {/* Danger Meter */}
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full ${i <= (currentPrompt?.dangerLevel || 0) ? 'bg-indigo-500' : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>

                            <div className="flex-1 flex flex-col justify-center text-center">
                                <div className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4">
                                    {currentPrompt?.category}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white font-arabic leading-relaxed drop-shadow-md" dir="rtl">
                                    {currentPrompt?.text}
                                </h2>
                            </div>

                            <div className="text-center pt-8 border-t border-white/5">
                                <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
                                    Point at the person. Wait for reaction.
                                </p>
                                <button
                                    onClick={handleNext}
                                    className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-black font-bold rounded-xl transition-all"
                                >
                                    Next Card ➜
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};
