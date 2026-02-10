import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BIBLE_CHARACTERS, getCharactersByTag, BibleCharCategory, BibleCharacter } from '../data/bibleCharactersData';
import { GameScoreSaver } from './games/GameScoreSaver';

type Team = 'A' | 'B';

export const BibleCharGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'CATEGORY' | 'TURN_INTRO' | 'PLAYING' | 'REVEAL' | 'RESULT'>('SETUP');

    // Settings
    const [timerSetting, setTimerSetting] = useState(30);
    const [selectedCategory, setSelectedCategory] = useState<BibleCharCategory | 'RANDOM'>('RANDOM');

    // State
    const [scores, setScores] = useState({ A: 0, B: 0 });
    const [currentTurn, setCurrentTurn] = useState<Team>('A');
    const [currentChar, setCurrentChar] = useState<BibleCharacter | null>(null);
    const [visibleClues, setVisibleClues] = useState<number>(1);
    const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(30);

    // Timer
    useEffect(() => {
        let timer: any;
        if (gameState === 'PLAYING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'PLAYING' && timeLeft === 0) {
            setGameState('REVEAL');
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // --- ACTIONS ---

    const chooseTime = (time: number) => {
        setTimerSetting(time);
        setGameState('CATEGORY');
    };

    const chooseCategory = (cat: BibleCharCategory | 'RANDOM') => {
        setSelectedCategory(cat);
        nextTurn(true);
    };

    const nextTurn = (firstStart = false) => {
        if (!firstStart) {
            setCurrentTurn(prev => prev === 'A' ? 'B' : 'A');
        }

        const list = getCharactersByTag(selectedCategory);

        // Filter out used within this session (simple logic)
        const available = list.filter(c => !usedIds.has(c.id));

        if (available.length === 0) {
            // Reset if all used or just warn? easier to just pick random form full list if exhausted
            const randomChar = list[Math.floor(Math.random() * list.length)];
            setCurrentChar(randomChar);
        } else {
            const char = available[Math.floor(Math.random() * available.length)];
            setCurrentChar(char);
            setUsedIds(prev => new Set(prev).add(char.id));
        }

        setVisibleClues(1);
        setGameState('TURN_INTRO');
    };

    const startRound = () => {
        setTimeLeft(timerSetting);
        setGameState('PLAYING');
    };

    const showNextClue = () => {
        if (currentChar && visibleClues < currentChar.clues.length) {
            setVisibleClues(prev => prev + 1);
        }
    };

    const reveal = () => {
        setGameState('REVEAL');
    };

    const scoreRound = (success: boolean) => {
        if (success) {
            // Bonus points for fewer clues?
            // Let's keep it simple: 1 point for correct answer.
            // Or: 3 points if 1 clue, 2 if 2, 1 if 3+
            let points = 1;
            if (visibleClues === 1) points = 3;
            else if (visibleClues === 2) points = 2;

            setScores(prev => ({
                ...prev,
                [currentTurn]: prev[currentTurn] + points
            }));
        }
        nextTurn();
    };

    // --- RENDERERS ---

    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center text-white relative">
                <button onClick={onExit} className="absolute top-6 left-6 text-white/50">Exit</button>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
                    <div className="text-6xl mb-4">🤔</div>
                    <h1 className="text-5xl font-black mb-4 font-arabic text-purple-400" dir="rtl">
                        مين ده؟
                    </h1>
                    <p className="text-white/70 mb-12 font-arabic">
                        شخصيات كتابية.<br />
                        كل ما تعرف من معلومات أقل، تكسب نقط أكتر.
                    </p>

                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Select Timer</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[15, 20, 30].map(t => (
                                <button
                                    key={t}
                                    onClick={() => chooseTime(t)}
                                    className="py-4 bg-slate-800 hover:bg-purple-500 hover:text-black rounded-xl font-bold transition-colors text-xl"
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

    if (gameState === 'CATEGORY') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center text-white relative">
                <button onClick={() => setGameState('SETUP')} className="absolute top-6 left-6 text-white/50">Back</button>
                <h2 className="text-3xl font-bold mb-8 font-arabic">اختار الشخصيات</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {[
                        { id: 'PROPHETS', label: 'أنبياء' },
                        { id: 'KINGS', label: 'ملوك' },
                        { id: 'DISCIPLES', label: 'تلاميذ' },
                        { id: 'WOMEN', label: 'نساء الكتاب' },
                        { id: 'OT', label: 'عهد قديم' },
                        { id: 'NT', label: 'عهد جديد' },
                        { id: 'RANDOM', label: 'عشوائي' },
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => chooseCategory(cat.id as any)}
                            className="p-6 bg-slate-800 hover:bg-purple-500 hover:text-black rounded-2xl font-bold font-arabic transition-all border border-white/5"
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    if (gameState === 'TURN_INTRO') {
        const isA = currentTurn === 'A';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white transition-colors duration-500 ${isA ? 'bg-indigo-900' : 'bg-rose-900'}`}>
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

                {/* Score Saver Integration */}
                <div className="w-full max-w-lg mb-8">
                    <GameScoreSaver
                        gameId="bible_char"
                        gameName="Bible Characters (مين ده؟)"
                        scoreA={scores.A}
                        scoreB={scores.B}
                    />
                </div>

                <button
                    onClick={startRound}
                    className="w-full max-w-xs py-5 bg-white text-black font-black text-2xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    START GUESSING 🕵️‍♂️
                </button>
            </div>
        );
    }

    if (gameState === 'PLAYING' || gameState === 'REVEAL') {
        const isA = currentTurn === 'A';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-between p-6 transition-colors duration-300 ${isA ? 'bg-indigo-950' : 'bg-rose-950'} relative overflow-hidden`}>

                {gameState === 'PLAYING' && (
                    <motion.div
                        className="absolute top-0 left-0 h-3 bg-purple-400 z-50"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: timeLeft, ease: "linear" }}
                    />
                )}

                <div className="w-full flex justify-between items-center text-white/50 z-10 pt-4">
                    <div className="text-sm font-bold">TEAM {currentTurn}</div>
                    <div className={`text-4xl font-black font-mono ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] text-center"
                    >
                        <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-6">Who is this?</p>

                        <div className="space-y-4 mb-8 min-h-[160px] flex flex-col justify-center">
                            {currentChar?.clues.slice(0, visibleClues).map((clue, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-black/20 rounded-xl font-arabic text-lg md:text-xl font-bold"
                                    dir="rtl"
                                >
                                    {clue}
                                </motion.div>
                            ))}
                        </div>

                        {gameState === 'PLAYING' && visibleClues < (currentChar?.clues.length || 0) && (
                            <button
                                onClick={showNextClue}
                                className="mb-4 text-sm text-white/60 hover:text-white underline font-arabic"
                            >
                                اعرض معلومة كمان (نقط أقل)
                            </button>
                        )}

                        <AnimatePresence>
                            {gameState === 'REVEAL' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="overflow-hidden"
                                >
                                    <h2 className="text-4xl md:text-5xl font-black text-purple-300 font-arabic leading-relaxed border-t border-white/10 pt-6 mt-2 shadow-purple-500/50 drop-shadow-lg" dir="rtl">
                                        {currentChar?.name}
                                    </h2>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <div className="w-full max-w-md z-10 pb-8">
                    {gameState === 'PLAYING' ? (
                        <button
                            onClick={reveal}
                            className="w-full py-5 bg-purple-500 text-white font-black text-xl rounded-2xl shadow-xl hover:bg-purple-600 transition-colors"
                        >
                            I KNOW! 💡
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
