import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSoulPrompt, SoulPrompt } from '../data/soulData';
import { GameScoreSaver } from './games/GameScoreSaver';

export const SoulGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'INTRO' | 'BREATHE' | 'QUESTION'>('INTRO');
    const [currentPrompt, setCurrentPrompt] = useState<SoulPrompt | null>(null);
    const [round, setRound] = useState(1);
    const [showScoreSaver, setShowScoreSaver] = useState(false);

    // Actions
    const startGame = () => {
        startDeepRound();
    };

    const startDeepRound = () => {
        setGameState('BREATHE');
        // Slow transition logic
        setTimeout(() => {
            const prompt = getSoulPrompt(round);
            setCurrentPrompt(prompt);
            setGameState('QUESTION');
        }, 4000); // 4 Seconds to breathe
    };

    const handleNext = () => {
        setRound(r => r + 1);
        startDeepRound();
    };

    // --- RENDERERS ---

    if (gameState === 'INTRO') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] text-center text-white relative overflow-hidden">
                <button onClick={onExit} className="absolute top-6 left-6 z-50 text-white/30 hover:text-white transition-colors">Exit</button>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="max-w-md relative z-10">
                    <h1 className="text-4xl md:text-5xl font-light mb-8 font-arabic tracking-wide text-white/90" dir="rtl">
                        سؤال ملوش هزار.
                    </h1>
                    <div className="space-y-6 text-lg text-white/60 font-arabic leading-relaxed" dir="rtl">
                        <p>اللعبة هادية.. ومفهاش وقت.</p>
                        <p>ممنوع المقاطعة. ممنوع النصايح.</p>
                        <p>بنسمع بس.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={startGame}
                        className="mt-12 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-all font-light"
                    >
                        Start Quietly
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'BREATHE') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.95, 1, 0.95] }}
                    transition={{ duration: 4, times: [0, 0.5, 1], ease: "easeInOut" }}
                    className="text-white/40 font-arabic text-xl tracking-widest"
                >
                    خد نفس عميق...
                </motion.div>
            </div>
        );
    }

    // QUESTION STATE
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#050505] relative overflow-hidden transition-colors duration-[2000ms]">

            <button onClick={onExit} className="absolute top-6 left-6 z-50 text-white/10 hover:text-white/50 transition-colors text-sm uppercase tracking-widest">
                End Session
            </button>

            {/* Ambient Light */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-900/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-xl relative z-10 min-h-[50vh] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPrompt?.id}
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="text-center"
                    >
                        <div className="mb-12">
                            <span className="inline-block px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[10px] text-white/30 tracking-[0.3em] uppercase">
                                {currentPrompt?.category}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-4xl font-light text-white font-arabic leading-loose md:leading-loose mb-16" dir="rtl">
                            {currentPrompt?.text}
                        </h2>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3, duration: 1 }} // Button appears VERY late to prevent rushing
                            onClick={handleNext}
                            className="text-white/20 hover:text-white/60 transition-colors text-sm uppercase tracking-widest flex items-center gap-2 mx-auto"
                        >
                            <span className="w-12 h-[1px] bg-current" />
                            Next Question
                            <span className="w-12 h-[1px] bg-current" />
                        </motion.button>

                        <button
                            onClick={() => setShowScoreSaver(!showScoreSaver)}
                            className="mt-8 text-[10px] text-white/20 hover:text-white/50 transition-colors uppercase tracking-widest"
                        >
                            Save Session Points
                        </button>

                        {showScoreSaver && (
                            <div className="mt-6 border-t border-white/5 pt-6">
                                <GameScoreSaver
                                    gameId="soul"
                                    gameName="Soul (أسئلة عميقة)"
                                    scoreA={0}
                                    scoreB={0}
                                    onSaved={() => setShowScoreSaver(false)}
                                />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div >
    );
};
