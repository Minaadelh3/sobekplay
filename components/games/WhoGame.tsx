import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCharactersByCategory, CATEGORIES, WhoCategory, WhoCharacter } from '../../data/who';
import { useAuth } from '../../context/AuthContext';
import { performTransaction } from '../../lib/ledger';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import confetti from 'canvas-confetti';

// --- GAME CONFIG & HELPERS ---
const START_TIME = 60; // Default time

export default function WhoGame() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [gameState, setGameState] = useState<'SETUP' | 'CATEGORY' | 'PLAYING' | 'REVEAL' | 'RESULT'>('SETUP');
    const [selectedCategory, setSelectedCategory] = useState<WhoCategory | 'RANDOM'>('RANDOM');
    const [timeSetting, setTimeSetting] = useState(60);

    // Game State
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [currentChar, setCurrentChar] = useState<WhoCharacter | null>(null);
    const [visibleClues, setVisibleClues] = useState<number>(1);
    const [timeLeft, setTimeLeft] = useState(timeSetting);
    const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

    // Timer
    useEffect(() => {
        let timer: any;
        if (gameState === 'PLAYING' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (gameState === 'PLAYING' && timeLeft === 0) {
            setGameState('REVEAL'); // Time's up -> Reveal answer (Fail)
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const startGame = (category: WhoCategory | 'RANDOM') => {
        setSelectedCategory(category);
        setScore(0);
        setStreak(0);
        setUsedIds(new Set());
        nextRound(category, true);
    };

    const nextRound = (cat: WhoCategory | 'RANDOM', isFirst = false) => {
        const pool = getCharactersByCategory(cat);
        // exclude used
        const available = pool.filter(c => !usedIds.has(c.id));

        if (available.length === 0) {
            // Game Over or Reset?
            // For now, reset used if pool exhausted, or end game.
            // Let's just pick random to allow endless play
            const randomChar = pool[Math.floor(Math.random() * pool.length)];
            if (!randomChar) return; // Should not happen
            setCurrentChar(randomChar);
        } else {
            const char = available[Math.floor(Math.random() * available.length)];
            setCurrentChar(char);
            setUsedIds(prev => new Set(prev).add(char.id));
        }

        setVisibleClues(1);
        setTimeLeft(timeSetting);
        setGameState('PLAYING');
    };

    const [lastRoundPoints, setLastRoundPoints] = useState(0);

    const handleAnswer = async (correct: boolean) => {
        if (correct) {
            // Scoring logic
            let points = 1;
            if (visibleClues === 1) points = 10;
            if (visibleClues === 2) points = 5;
            if (visibleClues === 3) points = 3;

            setLastRoundPoints(points);
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);
            setGameState('RESULT'); // New state for round result
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

            // SAVE SCORE
            if (user && points > 0) {
                try {
                    await performTransaction({
                        type: 'GAME_REWARD',
                        amount: points,
                        from: { type: 'SYSTEM', id: 'game_engine', name: 'Who Game' },
                        to: { type: 'USER', id: user.id, name: user.name },
                        reason: `Who Game: ${currentChar?.name}`,
                        metadata: { gameId: 'who', characterId: currentChar?.id, clues: visibleClues }
                    });

                    const userRef = doc(db, 'users', user.id);
                    await updateDoc(userRef, {
                        xp: increment(points),
                        score: increment(points)
                    });
                } catch (err) {
                    console.error("Score save failed", err);
                }
            }
        } else {
            setLastRoundPoints(0);
            setStreak(0);
            setGameState('RESULT');
        }
    };

    const handleNextRound = () => {
        nextRound(selectedCategory);
    };

    // --- RENDERERS ---

    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
                <button onClick={() => navigate('/app/games')} className="self-start text-white/50 mb-8">← Back</button>

                <h1 className="text-5xl font-black mb-2 font-arabic text-yellow-400 text-center">مين ده؟</h1>
                <p className="text-white/60 mb-12 text-center max-w-sm">
                    اختبر معلوماتك في شخصيات من كل المجالات.
                    كل ما تعرف من تلميحات أقل.. تكسب أكتر!
                </p>

                <div className="w-full max-w-md grid grid-cols-2 gap-4">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => startGame(cat.id)}
                            className={`${cat.color} p-6 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg border border-white/10`}
                        >
                            <span className="text-4xl">{cat.icon}</span>
                            <span className="font-bold font-arabic text-lg">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Timer Settings could go here */}
            </div>
        );
    }

    const categoryInfo = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[5]; // Default Random

    return (
        <div className={`min-h-screen ${categoryInfo.color} transition-colors duration-500 text-white p-6 flex flex-col relative overflow-hidden`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <button onClick={() => navigate('/app/games')} className="bg-black/20 p-2 rounded-full px-4 text-sm font-bold flex items-center gap-2 hover:bg-black/40 transition-colors">
                    <span>✕</span> EXIT
                </button>
                <div className="text-center">
                    <div className="text-xs uppercase tracking-widest opacity-70">SCORE</div>
                    <div className="text-3xl font-black">{score}</div>
                </div>
                <div className="bg-black/20 p-2 rounded-full px-4 text-sm font-bold flex items-center gap-2">
                    <span>⏱️</span>
                    <span className={timeLeft < 10 ? 'text-red-300 animate-pulse' : ''}>{timeLeft}s</span>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 max-w-lg mx-auto w-full">

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentChar?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                    >
                        <div className="text-center mb-6">
                            <span className="bg-black/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                {categoryInfo.label} {currentChar?.subcategory ? `• ${currentChar.subcategory}` : ''}
                            </span>
                        </div>

                        {/* Clues */}
                        <div className="space-y-4 mb-8 min-h-[200px] flex flex-col justify-center">
                            {currentChar?.clues.slice(0, visibleClues).map((clue, idx) => (
                                <motion.div
                                    key={`${currentChar.id}-clue-${idx}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-black/20 p-4 rounded-xl text-center font-arabic text-xl font-bold leading-relaxed"
                                    dir="rtl"
                                >
                                    {clue}
                                </motion.div>
                            ))}
                        </div>

                        {/* Controls */}
                        {gameState === 'PLAYING' && (
                            <div className="space-y-4">
                                {visibleClues < (currentChar?.clues.length || 0) && (
                                    <button
                                        onClick={() => setVisibleClues(p => p + 1)}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold tracking-wide transition-colors flex justify-between px-4"
                                    >
                                        <span>SHOW ANOTHER HINT</span>
                                        <span className="text-red-300">
                                            {visibleClues === 1 ? '-5 PTS' : visibleClues === 2 ? '-2 PTS' : '-2 PTS'}
                                        </span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setGameState('REVEAL')}
                                    className="w-full py-4 bg-white text-black font-black text-xl rounded-xl shadow-lg hover:scale-105 transition-transform"
                                >
                                    I KNOW IT! 💡
                                </button>
                            </div>
                        )}

                        {/* Reveal/Result State */}
                        {(gameState === 'REVEAL' || gameState === 'RESULT') && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center pt-6 border-t border-white/10"
                            >
                                <div className="text-sm opacity-50 uppercase tracking-widest mb-2">Answer</div>
                                <h2 className="text-4xl md:text-5xl font-black font-arabic text-yellow-300 mb-8 drop-shadow-md">
                                    {currentChar?.name}
                                </h2>

                                {/* If just revealed (waiting for verification) */}
                                {gameState === 'REVEAL' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleAnswer(false)}
                                            className="py-4 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-xl"
                                        >
                                            Wrong ❌
                                        </button>
                                        <button
                                            onClick={() => handleAnswer(true)}
                                            className="py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl"
                                        >
                                            Correct ✅
                                        </button>
                                    </div>
                                )}

                                {/* If Result determined (show score and Next) */}
                                {gameState === 'RESULT' && (
                                    <div className="space-y-4">
                                        <div className="text-2xl font-bold mb-4">
                                            {lastRoundPoints > 0 ? (
                                                <span className="text-green-400">Correct! +{lastRoundPoints} PTS 🎯</span>
                                            ) : (
                                                <span className="text-red-400">Better luck next time! 😅</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleNextRound}
                                            className="w-full py-4 bg-white text-black font-black text-xl rounded-xl shadow-xl hover:scale-105 transition-transform"
                                        >
                                            NEXT ROUND ➡️
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
