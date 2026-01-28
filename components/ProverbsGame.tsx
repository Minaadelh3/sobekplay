import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVERBS_LIST, splitProverb } from '../data/proverbsData';

type Team = 'A' | 'B';

export const ProverbsGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'TURN_INTRO' | 'PLAYING' | 'REVEAL' | 'RESULT'>('SETUP');

    // Settings
    const [timerSetting, setTimerSetting] = useState(10);

    // State
    const [scores, setScores] = useState({ A: 0, B: 0 });
    const [currentTurn, setCurrentTurn] = useState<Team>('A');
    const [currentProverb, setCurrentProverb] = useState<{ start: string, end: string } | null>(null);
    const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(10);

    // Timer
    useEffect(() => {
        let timer: any;
        if (gameState === 'PLAYING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'PLAYING' && timeLeft === 0) {
            setGameState('REVEAL'); // Auto reveal on timeout
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // --- ACTIONS ---

    const startGame = (time: number) => {
        setTimerSetting(time);
        nextTurn(true);
    };

    const nextTurn = (firstStart = false) => {
        if (!firstStart) {
            setCurrentTurn(prev => prev === 'A' ? 'B' : 'A');
        }

        // Pick random proverb
        let idx = Math.floor(Math.random() * PROVERBS_LIST.length);
        let attempts = 0;
        while (usedIndices.has(idx) && attempts < 100) {
            idx = Math.floor(Math.random() * PROVERBS_LIST.length);
            attempts++;
        }
        setUsedIndices(prev => new Set(prev).add(idx));

        const proverb = PROVERBS_LIST[idx];
        setCurrentProverb(splitProverb(proverb));

        setGameState('TURN_INTRO');
    };

    const startRound = () => {
        setTimeLeft(timerSetting);
        setGameState('PLAYING');
    };

    const reveal = () => {
        setGameState('REVEAL');
    };

    const scoreRound = (success: boolean) => {
        if (success) {
            setScores(prev => ({
                ...prev,
                [currentTurn]: prev[currentTurn] + 1
            }));
        }
        // If fail, no points (or point to opponent? let's stick to no points for simplicity/speed)

        nextTurn();
    };


    // --- RENDERERS ---

    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-emerald-900 text-center text-white relative">
                <button onClick={onExit} className="absolute top-6 left-6 text-white/50">Exit</button>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
                    <h1 className="text-5xl font-black mb-4 font-arabic text-emerald-300" dir="rtl">
                        كمّل المثل 📜
                    </h1>
                    <p className="text-white/70 mb-12 font-arabic">
                        لعبة السرعة والذاكرة المصرية.<br />
                        هتظهر بداية المثل.. كمل الباقي قبل الوقت ما يخلص!
                    </p>

                    <div className="bg-emerald-950/30 p-8 rounded-2xl border border-emerald-500/20">
                        <p className="text-xs uppercase tracking-widest text-emerald-200/50 mb-4">Select Difficulty (Timer)</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[5, 10, 15].map(t => (
                                <button
                                    key={t}
                                    onClick={() => startGame(t)}
                                    className="py-4 bg-emerald-800 hover:bg-emerald-400 hover:text-black rounded-xl font-bold transition-colors text-xl"
                                >
                                    {t}s
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'TURN_INTRO') {
        const isA = currentTurn === 'A';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white transition-colors duration-500 ${isA ? 'bg-blue-900' : 'bg-red-900'}`}>
                <div className="mb-4 text-xs font-bold uppercase tracking-widest opacity-50">Current Turn</div>
                <h1 className="text-8xl font-black mb-8">TEAM {currentTurn}</h1>

                <div className="w-full max-w-sm grid grid-cols-2 gap-8 mb-12 bg-black/20 p-6 rounded-2xl">
                    <div>
                        <span className="text-xs opacity-50 block mb-1">TEAM A</span>
                        <span className="text-3xl font-bold">{scores.A}</span>
                    </div>
                    <div>
                        <span className="text-xs opacity-50 block mb-1">TEAM B</span>
                        <span className="text-3xl font-bold">{scores.B}</span>
                    </div>
                </div>

                <button
                    onClick={startRound}
                    className="w-full max-w-xs py-5 bg-white text-black font-black text-2xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    GO! 🚀
                </button>
            </div>
        );
    }

    // PLAYING & REVEAL (Shared View)
    if (gameState === 'PLAYING' || gameState === 'REVEAL') {
        const isA = currentTurn === 'A';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-between p-6 transition-colors duration-300 ${isA ? 'bg-blue-950' : 'bg-red-950'} relative overflow-hidden`}>

                {/* Progress Bar for Timer */}
                {gameState === 'PLAYING' && (
                    <motion.div
                        className="absolute top-0 left-0 h-3 bg-yellow-400 z-50"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: timeLeft, ease: "linear" }}
                    />
                )}

                {/* Header */}
                <div className="w-full flex justify-between items-center text-white/50 z-10 pt-4">
                    <div className="text-sm font-bold">TEAM {currentTurn}</div>
                    <div className={`text-4xl font-black font-mono ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] text-center"
                    >
                        <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">Complete the Proverb</p>

                        <h2 className="text-3xl md:text-5xl font-black text-white font-arabic leading-relaxed mb-4" dir="rtl">
                            {currentProverb?.start}...
                        </h2>

                        <AnimatePresence>
                            {gameState === 'REVEAL' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    className="overflow-hidden"
                                >
                                    <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 font-arabic leading-relaxed pt-2 border-t border-white/10 mt-4" dir="rtl">
                                        ... {currentProverb?.end}
                                    </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="w-full max-w-md z-10 pb-8">
                    {gameState === 'PLAYING' ? (
                        <button
                            onClick={reveal}
                            className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl shadow-xl hover:bg-gray-100 transition-colors"
                        >
                            STOP & REVEAL 🛑
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => scoreRound(false)}
                                className="py-5 bg-red-500/20 border-2 border-red-500 text-red-200 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                WRONG ❌
                            </button>
                            <button
                                onClick={() => scoreRound(true)}
                                className="py-5 bg-green-500 text-black font-black text-2xl rounded-2xl shadow-xl hover:bg-green-400 transition-colors"
                            >
                                CORRECT ✅
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return <div />;
};
