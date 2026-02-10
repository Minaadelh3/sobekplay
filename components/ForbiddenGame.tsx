import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getForbiddenPrompt, ForbiddenPrompt } from '../data/forbiddenData';
import { GameScoreSaver } from './games/GameScoreSaver';

export const ForbiddenGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'WARNING' | 'AGREEMENT' | 'PLAYING' | 'END'>('WARNING');
    const [currentPrompt, setCurrentPrompt] = useState<ForbiddenPrompt | null>(null);
    const [round, setRound] = useState(1);
    const [isRevealed, setIsRevealed] = useState(false);

    // Actions
    const acceptRisk = () => {
        setGameState('AGREEMENT');
    };

    const startForbidden = () => {
        pullCard();
        setGameState('PLAYING');
    };

    const pullCard = () => {
        setIsRevealed(false);
        const prompt = getForbiddenPrompt(round);
        if (!prompt) {
            setGameState('END');
            return;
        }
        setCurrentPrompt(prompt);

        // Long tension delay
        setTimeout(() => {
            setIsRevealed(true);
        }, 1500);
    };

    const nextCard = () => {
        setRound(r => r + 1);
        pullCard();
    };

    const emergencyExit = () => {
        setGameState('END');
    };

    // --- RENDERERS ---

    if (gameState === 'WARNING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-center text-red-600 relative overflow-hidden font-mono z-50">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,0,0,0.05)_0,rgba(255,0,0,0.05)_10px,transparent_10px,transparent_20px)]" />

                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md relative z-10 border border-red-900/50 p-8 bg-black">
                    <h1 className="text-4xl font-black mb-6 tracking-tighter uppercase text-red-500">
                        Warning // تحذير
                    </h1>
                    <p className="text-red-400/80 mb-8 font-arabic leading-relaxed text-sm">
                        هذه اللعبة تحتوي على أسئلة قد تسبب وتوتر أو إنهاء علاقات.<br />
                        الهدف هو "الحقيقة"، لكن الحقيقة مش دايماً مريحة.<br />
                        <br />
                        Only proceed if your group has high intimacy.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={acceptRisk}
                            className="w-full py-4 bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all font-bold tracking-widest uppercase text-sm"
                        >
                            I Accept The Risk
                        </button>
                        <button
                            onClick={onExit}
                            className="w-full py-4 bg-transparent text-stone-500 hover:text-white transition-colors text-xs uppercase tracking-widest"
                        >
                            Take me back to safety
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'AGREEMENT') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0a0000] text-center text-white relative">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md font-arabic">
                    <h2 className="text-2xl font-bold text-red-500 mb-6">قواعد الاشتباك</h2>
                    <ul className="text-right space-y-4 text-stone-400 mb-12 list-disc list-inside">
                        <li>سؤال واحد في الجولة.</li>
                        <li>الصمت إجباري بعد الإجابة (١٠ ثواني).</li>
                        <li>ممنوع الزعل. ممنوع العتاب.</li>
                        <li>أي حد يقدر يوقف اللعبة في أي وقت.</li>
                    </ul>
                    <button
                        onClick={startForbidden}
                        className="w-20 h-20 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-all flex items-center justify-center mx-auto"
                    >
                        Start
                    </button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'END') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                <h2 className="text-3xl font-light mb-4">Game Over.</h2>
                <p className="text-stone-500 mb-8 max-w-sm">Take a breath. Remember: What happens in the game, helps us understand reality.</p>
                <div className="w-full max-w-lg mb-8">
                    <GameScoreSaver
                        gameId="forbidden"
                        gameName="Forbidden (الممنوع)"
                        scoreA={0}
                        scoreB={0}
                        onSaved={() => { }}
                    />
                </div>
                <button
                    onClick={onExit}
                    className="px-8 py-3 bg-white text-black font-bold rounded-full"
                >
                    Return to Lobby
                </button>
            </div>
        );
    }

    // PLAYING STATE
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F0101] relative overflow-hidden transition-colors duration-[2000ms]">

            <button onClick={emergencyExit} className="absolute top-6 right-6 z-50 text-red-900 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest border border-red-900 hover:border-red-500 px-4 py-2 rounded">
                Emergency Stop
            </button>

            {/* Ambient Danger */}
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />

            <div className="w-full max-w-xl relative z-10 flex flex-col justify-center min-h-[60vh]">
                <div className="text-center mb-12">
                    <span className="text-red-900 font-mono text-xs tracking-[0.5em] uppercase">
                        Level {round} // {currentPrompt?.category}
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    {!isRevealed ? (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="aspect-video bg-black border border-red-900/30 flex items-center justify-center"
                        >
                            <span className="text-red-900 animate-pulse tracking-widest uppercase font-bold text-xs">
                                Decrypting...
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 0.8 }}
                            className="text-center"
                        >
                            <div className="text-red-500 text-xs font-bold tracking-widest uppercase mb-6">{currentPrompt?.intensity} Intensity</div>

                            <h2 className="text-2xl md:text-4xl font-bold text-stone-200 font-arabic leading-loose md:leading-loose mb-16" dir="rtl">
                                {currentPrompt?.text}
                            </h2>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={nextCard}
                                    className="px-8 py-3 bg-red-900/10 text-red-500 border border-red-900/30 hover:bg-red-500 hover:text-black transition-all font-bold text-sm uppercase tracking-widest"
                                >
                                    Next Card
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
