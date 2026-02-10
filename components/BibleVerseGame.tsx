import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BIBLE_VERSES_DATA, splitVerse, BibleCategory } from '../data/bibleVersesData';
import BackButton from './BackButton';
import { GameScoreSaver } from './games/GameScoreSaver';

type Team = 'A' | 'B';

export const BibleVerseGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'CATEGORY' | 'TURN_INTRO' | 'PLAYING' | 'REVEAL' | 'RESULT'>('SETUP');

    // Settings
    const [timerSetting, setTimerSetting] = useState(15);
    const [selectedCategory, setSelectedCategory] = useState<BibleCategory>('RANDOM');

    // State
    const [scores, setScores] = useState({ A: 0, B: 0 });
    const [currentTurn, setCurrentTurn] = useState<Team>('A');
    const [currentVerse, setCurrentVerse] = useState<{ start: string, end: string } | null>(null);
    const [usedVerses, setUsedVerses] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(15);

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

    const chooseCategory = (cat: BibleCategory) => {
        setSelectedCategory(cat);
        nextTurn(true);
    };

    const nextTurn = (firstStart = false) => {
        if (!firstStart) {
            setCurrentTurn(prev => prev === 'A' ? 'B' : 'A');
        }

        // Get list based on category
        let list: string[] = [];
        if (selectedCategory === 'RANDOM') {
            // Combine all
            list = Object.values(BIBLE_VERSES_DATA).flat();
        } else {
            list = BIBLE_VERSES_DATA[selectedCategory] || BIBLE_VERSES_DATA['GOSPELS'];
        }

        // Pick random verse
        let verse = list[Math.floor(Math.random() * list.length)];
        let attempts = 0;

        // Basic duplicate avoidance
        while (usedVerses.has(verse) && attempts < 50) {
            verse = list[Math.floor(Math.random() * list.length)];
            attempts++;
        }

        setUsedVerses(prev => new Set(prev).add(verse));
        setCurrentVerse(splitVerse(verse));

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
        nextTurn();
    };

    // --- RENDERERS ---

    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center text-white relative">
                <button onClick={onExit} className="absolute top-6 left-6 text-white/50">Exit</button>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
                    <div className="text-6xl mb-4">✝️</div>
                    <h1 className="text-5xl font-black mb-4 font-arabic text-blue-300" dir="rtl">
                        كمّل الآية
                    </h1>
                    <p className="text-white/70 mb-12 font-arabic">
                        مسابقة الكتاب المقدس.<br />
                        كمل الآية صح عشان تكسب نقطة لفريقك.
                    </p>

                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-4">Select Timer</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[10, 15, 20].map(t => (
                                <button
                                    key={t}
                                    onClick={() => chooseTime(t)}
                                    className="py-4 bg-slate-800 hover:bg-blue-500 hover:text-black rounded-xl font-bold transition-colors text-xl"
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
                <h2 className="text-3xl font-bold mb-8 font-arabic">اختار السفر</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    {[
                        { id: 'GOSPELS', label: 'الأناجيل' },
                        { id: 'PSALMS', label: 'المزامير' },
                        { id: 'EPISTLES', label: 'الرسائل' },
                        { id: 'OLD_TESTAMENT', label: 'العهد القديم' },
                        { id: 'NEW_TESTAMENT', label: 'العهد الجديد' }, // wait, need to implement NT Logic if needed, but for now RANDOM covers mixed. Actually let's map keys properly
                        { id: 'RANDOM', label: 'كوكتيل (عشوائي)' },
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => chooseCategory(cat.id as BibleCategory)}
                            className="p-6 bg-slate-800 hover:bg-blue-500 hover:text-black rounded-2xl font-bold font-arabic transition-all border border-white/5"
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
                    START 📖
                </button>

                <div className="mt-8 w-full max-w-md border-t border-white/10 pt-8">
                    <p className="text-xs text-white/30 mb-4 uppercase tracking-widest">End Game & Save Scores</p>
                    <GameScoreSaver
                        gameId="bible_verse"
                        gameName="Bible Verse (كمل الآية)"
                        scoreA={scores.A}
                        scoreB={scores.B}
                        onSaved={onExit}
                    />
                </div>
            </div>
        );
    }

    if (gameState === 'PLAYING' || gameState === 'REVEAL') {
        const isA = currentTurn === 'A';
        return (
            <div className={`min-h-screen flex flex-col items-center justify-between p-6 transition-colors duration-300 ${isA ? 'bg-blue-950' : 'bg-red-950'} relative overflow-hidden`}>

                {gameState === 'PLAYING' && (
                    <motion.div
                        className="absolute top-0 left-0 h-3 bg-blue-300 z-50"
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

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl z-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-[2rem] text-center"
                    >
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-8">Complete the Verse</p>

                        <h2 className="text-3xl md:text-4xl font-black text-white font-arabic leading-loose mb-6" dir="rtl">
                            "{currentVerse?.start}..."
                        </h2>

                        <AnimatePresence>
                            {gameState === 'REVEAL' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    className="overflow-hidden"
                                >
                                    <h2 className="text-3xl md:text-4xl font-bold text-blue-200 font-arabic leading-loose pt-4 border-t border-white/10 mt-6" dir="rtl">
                                        ...{currentVerse?.end}"
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
