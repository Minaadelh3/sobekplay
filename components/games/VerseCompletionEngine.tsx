import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { GameConfig } from '../../lib/games';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { awardPoints } from '../../services/scoring/scoreEngine';

// Christian Icons (SVG)
const CrossIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M5 8h14" />
    </svg>
);

const DoveIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2 2-2 2-2-2 2-2zM4 14c2-4 6-6 10-6s8 4 8 8-2 6-6 6-6-4-6-6-2-4-6-2z" />
    </svg>
);

// Types
export type Difficulty = 'easy' | 'mid' | 'hard';

interface VerseBlank {
    type: string;
    prompt: string;
    answer: string;
}

interface Verse {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    refAr: string;
    text: string;
    difficulty: Difficulty;
    mode: string;
    blank: VerseBlank;
    hints: string[];
    tags: string[];
}

interface VerseCompletionEngineProps {
    gameConfig: GameConfig;
    onExit: () => void;
}

const DAILY_LIMIT = 10;

const VerseCompletionEngine: React.FC<VerseCompletionEngineProps> = ({ gameConfig, onExit }) => {
    const { user } = useAuth();

    // Game State
    const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'SUMMARY'>('INTRO');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [verses, setVerses] = useState<Verse[]>([]);
    const [sessionVerses, setSessionVerses] = useState<Verse[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Round State
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);

    // Session Stats
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [startTime, setStartTime] = useState(0);

    // Load Data
    useEffect(() => {
        fetch('/data/kamel_elayah.avd.500.json')
            .then(res => res.json())
            .then(data => {
                setVerses(data.verses);
            })
            .catch(err => console.error("Failed to load verses:", err));
    }, []);

    // Start Game
    const startGame = () => {
        if (verses.length === 0) return;

        const filtered = verses.filter(v => v.difficulty === difficulty);
        const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, DAILY_LIMIT);

        if (shuffled.length === 0) {
            alert(`لا يوجد آيات كافية في مستوى ${difficulty}`);
            return;
        }

        setSessionVerses(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setCorrectCount(0);
        setStreak(0);
        setBestStreak(0);
        setStartTime(Date.now());
        prepareRound(shuffled[0]);
        setGameState('PLAYING');
    };

    const getSmartDistractors = (target: Verse, pool: Verse[], count: number, diff: Difficulty): string[] => {
        // 1. Filter candidates: must not be the target verse
        // For HARD/MID: prefer same difficulty to ensure length consistency
        // For EASY: can be any difficulty, but we prioritize similar length via scoring
        let candidates = pool.filter(v => v.id !== target.id);

        if (diff === 'hard') {
            // stricter pool for hard mode
            candidates = candidates.filter(v => v.difficulty === 'hard' || v.difficulty === 'mid');
        }

        // 2. Score candidates
        const scored = candidates.map(candidate => {
            let score = 0;
            const targetAns = target.blank.answer.trim();
            const candAns = candidate.blank.answer.trim();

            // A. Length Similarity (essential for "relatable" choices)
            const lenDiff = Math.abs(targetAns.length - candAns.length);
            if (lenDiff < 5) score += 10;
            else if (lenDiff < 10) score += 5;
            else if (lenDiff > 20) score -= 5; // Too different in length looks obvious

            // B. Word Count Similarity
            const targetWords = targetAns.split(' ').length;
            const candWords = candAns.split(' ').length;
            if (targetWords === candWords) score += 5;

            // C. Same Book (Contextual logic)
            if (candidate.book === target.book) score += 3;

            // D. Starting Letter (Deceptive visual similarity)
            if (targetAns.charAt(0) === candAns.charAt(0)) score += 4;

            // E. Text overlap (reusing words) - naive check
            const targetWordSet = new Set(targetAns.split(' '));
            let overlap = 0;
            candAns.split(' ').forEach(w => {
                if (targetWordSet.has(w) && w.length > 3) overlap++;
            });
            score += (overlap * 2);

            return { ans: candAns, score, rand: Math.random() };
        });

        // 3. Sort and Select
        // We add randomness to score to ensure variety across rounds
        scored.sort((a, b) => (b.score + b.rand) - (a.score + a.rand));

        return scored.slice(0, count).map(s => s.ans);
    };

    const prepareRound = (verse: Verse) => {
        setFeedback('idle');
        setSelectedOption(null);
        setHintsUsed(0);
        setShowHint(false);

        // Generate Options
        const correct = verse.blank.answer;

        // Use smart distractors
        const distractors = getSmartDistractors(verse, verses, 3, difficulty);

        const allOptions = [correct, ...distractors]
            .sort(() => 0.5 - Math.random()); // Random place for correct answer

        setOptions(allOptions);
    };

    const handleOptionSelect = (option: string) => {
        if (feedback !== 'idle') return;

        setSelectedOption(option);
        const currentVerse = sessionVerses[currentIndex];

        if (option === currentVerse.blank.answer) {
            handleCorrect();
        } else {
            handleWrong();
        }
    };

    const handleCorrect = () => {
        setFeedback('correct');
        setScore(prev => prev + 10);
        setCorrectCount(prev => prev + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);

        confetti({
            colors: ['#FFD700', '#C0C0C0', '#FFFFFF', '#4169E1'],
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });

        setTimeout(nextVerse, 2000);
    };

    const handleWrong = () => {
        setFeedback('wrong');
        setStreak(0);
        setTimeout(revealAnswer, 1000);
    };

    const revealAnswer = () => {
        setFeedback('revealed');
        setStreak(0);
        setTimeout(nextVerse, 3000);
    };

    const nextVerse = () => {
        if (currentIndex < sessionVerses.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            prepareRound(sessionVerses[nextIdx]);
        } else {
            finishSession();
        }
    };

    const finishSession = async () => {
        setGameState('SUMMARY');

        if (user && score > 0) {
            try {
                // NEW: Unified Scoring
                await awardPoints({
                    userId: user.id,
                    actionType: 'GAME_COMPLETE',
                    points: score,
                    idempotencyKey: `GAME:${gameConfig.id}:${user.id}:${startTime}`,
                    reason: `Kamel Elayah (${difficulty})`,
                    metadata: {
                        gameId: gameConfig.id,
                        difficulty: difficulty,
                        correct: correctCount,
                        total: sessionVerses.length
                    }
                });

                // 2. Keep Stats Updated
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, {
                    'stats.kamel_ayah_wins': increment(correctCount),
                    'stats.kamel_ayah_played': increment(sessionVerses.length)
                });
            } catch (error) {
                console.error("Error saving progress:", error);
            }
        }
    };

    // --- REUSABLE STYLES ---
    // Christian Color Palette:
    // Background: Deep Blue / Midnight (#0F172A) to Black (#000)
    // Accent: Gold (#FFD700) for divinity, glory
    // Text: White / Cream (#FFFDD0)
    // Font: "Amiri" or "Scheherazade New" for Quran/Bible text (using Amiri here)

    // Renderers
    if (gameState === 'INTRO') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 font-serif bg-gradient-to-b from-[#0F172A] to-black text-[#E2E8F0]">
                <div className="mb-6 text-accent-gold animate-pulse">
                    <CrossIcon />
                </div>
                <h1 className="text-5xl font-bold text-accent-gold mb-4 font-['Amiri'] drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
                    كَمِّل الآيَة
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent mb-6 opacity-50"></div>
                <p className="text-[#94A3B8] mb-10 max-w-md text-lg font-['Amiri'] leading-loose">
                    "خَبَّأْتُ كَلاَمَكَ فِي قَلْبِي لِكَيْلاَ أُخْطِئَ إِلَيْكَ."
                    <br />
                    <span className="text-sm opacity-70">(مزمور 119: 11)</span>
                </p>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-10">
                    {(['easy', 'mid', 'hard'] as Difficulty[]).map(d => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`py-4 px-2 rounded-xl border transition-all duration-300 font-['Amiri'] text-xl ${difficulty === d
                                ? 'bg-accent-gold/10 border-accent-gold text-accent-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                }`}
                        >
                            {d === 'easy' ? 'مبتدئ' : d === 'mid' ? 'متوسط' : 'خادم'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-6">
                    <button onClick={onExit} className="px-8 py-3 rounded-full text-gray-400 font-bold hover:text-white transition-colors font-['Amiri']">
                        خروج
                    </button>
                    <button
                        onClick={startGame}
                        className="px-12 py-3 rounded-full bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-[#1A1A1A] font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.4)] font-['Amiri']"
                    >
                        ابدأ المسابقة
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'SUMMARY') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 text-white bg-gradient-to-b from-[#0F172A] to-black">
                <div className="text-6xl mb-6 text-accent-gold animate-bounce">
                    {score > 50 ? '👑' : '🕊️'}
                </div>
                <h2 className="text-4xl font-bold mb-4 font-['Amiri'] text-accent-gold">
                    {score > 50 ? 'مبارك شعبي!' : 'نعمة وسلام!'}
                </h2>
                <div className="text-xl text-[#CBD5E1] mb-10 font-['Amiri']">
                    لقد أكملت <span className="text-accent-gold font-bold">{correctCount}</span> آيات من {sessionVerses.length}
                </div>

                <div className="flex gap-4 w-full max-w-sm mb-10 justify-center">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex-1 backdrop-blur-sm">
                        <div className="text-sm text-gray-400 mb-2 font-['Amiri']">النقاط</div>
                        <div className="text-3xl font-bold text-accent-gold custom-font-nums">+{score}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex-1 backdrop-blur-sm">
                        <div className="text-sm text-gray-400 mb-2 font-['Amiri']">أطول سلسلة</div>
                        <div className="text-3xl font-bold text-[#4ADE80] custom-font-nums">{bestStreak} 🔥</div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={onExit} className="px-8 py-3 rounded-full bg-white/5 text-white font-bold hover:bg-white/10 font-['Amiri']">
                        الرئيسية
                    </button>
                    <button
                        onClick={() => setGameState('INTRO')}
                        className="px-10 py-3 rounded-full bg-accent-gold text-black font-bold hover:brightness-110 font-['Amiri']"
                    >
                        العب مرة أخرى
                    </button>
                </div>
            </div>
        );
    }

    const currentVerse = sessionVerses[currentIndex];

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-6 min-h-screen bg-transparent relative">
            {/* Top Bar */}
            <div className="w-full flex justify-between items-center mb-10 relative z-10">
                <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-['Amiri']">
                    <span>✕</span> خروج
                </button>

                <div className="flex items-center gap-2">
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <div className="text-accent-gold font-bold font-mono text-lg">{score} <span className="text-xs opacity-50">PTS</span></div>
                </div>
            </div>

            {/* Game Card */}
            <div className="w-full relative z-10">
                <div className="bg-[#1A1F26]/80 backdrop-blur-lg rounded-3xl p-6 md:p-12 border border-[#B8860B]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

                    {/* Corner Ornaments */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#B8860B]/20 rounded-tl-3xl m-4 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#B8860B]/20 rounded-tr-3xl m-4 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#B8860B]/20 rounded-bl-3xl m-4 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#B8860B]/20 rounded-br-3xl m-4 pointer-events-none" />

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-1.5 mb-8">
                        {sessionVerses.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-accent-gold' :
                                i < currentIndex ? 'w-1.5 bg-accent-gold/40' :
                                    'w-1.5 bg-white/10'
                                }`} />
                        ))}
                    </div>

                    {/* Reference Badge */}
                    <div className="flex justify-center mb-8">
                        <span className="bg-[#B8860B]/10 text-accent-gold px-6 py-2 rounded-full text-base font-bold border border-[#B8860B]/20 font-['Amiri'] tracking-wide">
                            ✝ {currentVerse.refAr}
                        </span>
                    </div>

                    {/* Verse Text (Prompt) */}
                    <div className="text-center mb-10">
                        <p className="text-3xl md:text-4xl leading-[2] text-[#E2E8F0] font-['Amiri'] drop-shadow-md" dir="rtl">
                            {currentVerse.blank.prompt}
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto mb-8">
                        {options.map((opt, i) => {
                            let stateClass = "bg-black/40 border-[#B8860B]/20 text-white hover:bg-[#B8860B]/10 hover:border-[#B8860B]/40";
                            if (feedback !== 'idle') {
                                if (opt === currentVerse.blank.answer) {
                                    stateClass = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                                } else if (selectedOption === opt) {
                                    stateClass = "bg-red-500/20 border-red-500 text-red-300";
                                } else {
                                    stateClass = "opacity-40 bg-black/40 border-white/5 text-gray-500";
                                }
                            }

                            return (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    disabled={feedback !== 'idle'}
                                    onClick={() => handleOptionSelect(opt)}
                                    className={`w-full p-5 rounded-2xl border-2 text-2xl font-['Amiri'] text-center transition-all duration-300 ${stateClass}`}
                                    dir="rtl"
                                >
                                    {opt}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Feedback Messages */}
                    <AnimatePresence>
                        {feedback === 'correct' && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-green-400 font-['Amiri'] text-xl font-bold mt-4"
                            >
                                أحسنت صنعاً! 🌟
                            </motion.p>
                        )}
                        {feedback === 'revealed' && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-accent-gold font-['Amiri'] text-xl font-bold mt-4"
                            >
                                الآية الصحيحة هي: {currentVerse.blank.answer}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="flex justify-center mt-8">
                        {feedback === 'idle' && (
                            <button
                                onClick={() => {
                                    if (hintsUsed < Math.min(2, currentVerse.hints.length)) {
                                        setHintsUsed(prev => prev + 1);
                                        setShowHint(true);
                                    }
                                }}
                                disabled={hintsUsed >= 2 || hintsUsed >= currentVerse.hints.length}
                                className={`px-5 py-2 rounded-lg text-base font-medium transition-colors font-['Amiri']
                                    ${hintsUsed >= 2 ? 'text-gray-600 cursor-not-allowed' : 'text-[#60A5FA] hover:bg-[#60A5FA]/10'}`}
                            >
                                تلميح ({Math.min(2, currentVerse.hints.length) - hintsUsed})
                            </button>
                        )}
                    </div>

                    {/* Active Hint */}
                    <AnimatePresence>
                        {showHint && hintsUsed > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-xl p-4 text-center text-[#93C5FD] text-lg font-['Amiri'] mt-6 max-w-md mx-auto"
                            >
                                {currentVerse.hints[hintsUsed - 1]}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VerseCompletionEngine;
