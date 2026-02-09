import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { GameConfig } from '../../lib/games';
import { Question, DIFFICULTY_RULES, Difficulty } from '../../lib/questionBank';
import { calculateGameResult, calculateStageResult } from '../../lib/scoring';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { performTransaction } from '../../lib/ledger';
import Navbar from '../../components/Navbar';
import UserAvatar from '../../components/UserAvatar';
import ExitButton from './ExitButton';

interface MalahyEngineProps {
    gameConfig: GameConfig;
    questions: Question[];
    onExit: () => void;
}

const MalahyEngine: React.FC<MalahyEngineProps> = ({ gameConfig, questions, onExit }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State
    const [gameState, setGameState] = useState<'INTRO' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULT'>('INTRO');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0); // Competitive Score
    const [xp, setXp] = useState(0);       // Progression XP
    const [correctCount, setCorrectCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [streak, setStreak] = useState(0);

    // Timer & Security
    const startTimeRef = React.useRef(0);

    // Derived
    const currentQ = filteredQuestions[qIndex];
    const isLastQ = qIndex === filteredQuestions.length - 1;
    const rules = DIFFICULTY_RULES[difficulty];
    const isSobekLogic = gameConfig.id === 'sobek_intel';

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'PLAYING' || isAnswered || !currentQ) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0.1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 0.1;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [gameState, isAnswered, qIndex]);

    // 🔄 FORCE RESET when switching games (Fix for "Games opening other games")
    useEffect(() => {
        setGameState('INTRO');
        setScore(0);
        setXp(0);
        setCorrectCount(0);
        setStreak(0);
        setQIndex(0);
        setFilteredQuestions([]);
        setIsAnswered(false);
        setSelectedOption(null);
    }, [gameConfig.id]);

    const startGame = (diff: Difficulty) => {
        setDifficulty(diff);
        let gameQs = questions;

        if (!isSobekLogic) {
            gameQs = questions.filter(q => q.difficulty === diff);
            gameQs = gameQs.sort(() => Math.random() - 0.5).slice(0, 5);
        } else {
            gameQs = questions.sort((a, b) => { // Logic: Sort by difficulty easy -> hard
                const order = { easy: 1, medium: 2, hard: 3 };
                return order[a.difficulty] - order[b.difficulty];
            });
        }

        if (gameQs.length === 0) {
            alert("لا يوجد أسئلة لهذا المستوى حالياً!");
            return;
        }

        setFilteredQuestions(gameQs);
        setQIndex(0);
        setScore(0);
        setXp(0);
        setCorrectCount(0);
        setStreak(0);
        setIsAnswered(false);
        setSelectedOption(null);
        setTimeLeft(DIFFICULTY_RULES[diff].time);
        setGameState('PLAYING');
        startTimeRef.current = Date.now(); // ⏱️ Start Timer for Security
    };

    const handleTimeUp = () => {
        setIsAnswered(true);
        setStreak(0);
        setTimeout(nextQuestion, 2000);
    };

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedOption(optionIndex);

        const currentOptionText = currentQ.options[optionIndex];
        const isCorrect = currentOptionText === currentQ.correctAnswer;

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
            setStreak(prev => prev + 1);
            if (streak + 1 >= 3) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } else {
            setStreak(0);
        }

        // --- SCORING CALCULATION (Per Question Logic mainly for Feedback, Final Calc is at end for Level) ---
        // For Sobek Logic, we accumulate points per Stage immediately
        if (isSobekLogic) {
            const stageRes = calculateStageResult(isCorrect);
            setScore(prev => prev + stageRes.score);
            setXp(prev => prev + stageRes.xp);
        }

        setTimeout(nextQuestion, 1500);
    };

    const nextQuestion = () => {
        if (isLastQ) {
            finishGame();
        } else {
            setQIndex(prev => prev + 1);
            setTimeLeft(rules.time);
            setIsAnswered(false);
            setSelectedOption(null);
        }
    };

    const finishGame = async () => {
        setGameState('RESULT');
        const won = correctCount > filteredQuestions.length / 2;
        const endTime = Date.now();
        const duration = endTime - startTimeRef.current;
        const minDuration = filteredQuestions.length * 1000; // Minimum 1 sec per question

        // 🛡️ Security Check
        if (won && duration < minDuration) {
            console.warn("Security Flag: Game completed too fast", duration);
            alert("⚠️ تم اكتشاف نشاط غير طبيعي. لن يتم احتساب النقاط.");
            return;
        }

        if (won) {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        }

        // Calculate Final Level Result (Standard Games)
        let finalScore = score;
        let finalXp = xp;

        if (!isSobekLogic) {
            const res = calculateGameResult({
                mode: 'SOLO',
                outcome: won ? 'WIN' : 'LOSS',
                isPerfect: correctCount === filteredQuestions.length,
                isFast: false // TODO: Track total time
            });
            finalScore = res.score;
            finalXp = res.xp;
            setScore(finalScore);
            setXp(finalXp);
        }

        // SAVE (Accumulate)
        if (user && (finalScore !== 0 || finalXp !== 0)) {
            try {
                // Admin Rule: Admins get 0 Score/XP
                if (user.role === 'ADMIN') {
                    // Toast or visual indicator
                    // console.log("Admin score skipped"); 
                } else {
                    // 1. Transaction for User Points (XP + Score)
                    // NEW: Event-Driven Logic
                    await import('../../lib/events').then(m => m.trackEvent(user.id, 'GAME_COMPLETED', {
                        gameId: gameConfig.id,
                        xp: finalXp, // Dynamic XP (allowed by malahy_score_base rule)
                        score: finalScore,
                        correct: correctCount,
                        durationMs: duration,
                        result: won ? 'WIN' : 'LOSS'
                    }));

                    // 2. We still need to update the User doc specifically if we want to store 'score' separate from 'points/xp'
                    // Ledger updates 'points'. 
                    // Let's update XP/Score specifically here if needed, or rely on performTransaction if it handles both.
                    // Implementation Detail: performTransaction updates user.points.
                    // We need to update user.xp manually if it differs, or maybe user.points IS xp.
                    // Score (Competitive) is definitely separate.

                    const userRef = doc(db, 'users', user.id);
                    await updateDoc(userRef, {
                        // points: increment(finalXp), // Handled by Ledger
                        xp: increment(finalXp),
                        score: increment(finalScore) // Competitive Score
                        // We duplicate the 'points' update logic inside performTransaction, so we don't need to do it here for 'points'.
                    });

                    // Team Points (Only on Win)
                    if (user.teamId && finalScore > 0) {
                        let teamPts = 0;
                        if (!isSobekLogic) {
                            const res = calculateGameResult({ mode: 'SOLO', outcome: won ? 'WIN' : 'LOSS' });
                            teamPts = res.teamPoints;
                        } else {
                            teamPts = Math.floor(finalScore * 0.5);
                        }

                        if (teamPts > 0) {
                            await performTransaction({
                                type: 'TEAM_REWARD',
                                amount: teamPts,
                                from: { type: 'USER', id: user.id, name: user.name },
                                to: { type: 'TEAM', id: user.teamId, name: 'Team' },
                                reason: `Team Contrib: ${gameConfig.title}`,
                                metadata: { gameId: gameConfig.id }
                            });
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to update points", err);
            }
        }
    };

    // --- RENDERERS ---

    if (gameState === 'INTRO') {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-center safe-area-pb">
                <div className="text-6xl mb-6 animate-bounce">{gameConfig.icon}</div>
                <h1 className={`text-4xl font-black text-white mb-4`}>{gameConfig.title}</h1>
                <p className="text-xl text-gray-300 mb-8 max-w-md">{gameConfig.description}</p>

                <div className="flex gap-4">
                    <ExitButton onConfirm={onExit} showConfirm={false} className="hover:bg-white/5" />
                    <button
                        onClick={() => isSobekLogic ? startGame('medium') : setGameState('LEVEL_SELECT')}
                        className="px-10 py-3 rounded-full bg-accent-gold text-black font-black text-lg hover:scale-105 transition-transform"
                    >
                        {isSobekLogic ? 'ابدأ التحدي 🧠' : 'اختار المستوى ▶️'}
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'LEVEL_SELECT') {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-center safe-area-pb">
                <h2 className="text-3xl font-black text-white mb-8">اختار مستوى الصعوبة</h2>

                <div className="grid gap-4 w-full max-w-md">
                    {Object.entries(DIFFICULTY_RULES).map(([key, rule]) => (
                        <button
                            key={key}
                            onClick={() => startGame(key as Difficulty)}
                            className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-accent-gold transition-all group"
                        >
                            <div className="text-right">
                                <div className="text-xl font-bold text-white group-hover:text-accent-gold">{rule.label}</div>
                                <div className="text-sm text-gray-400">{rule.time} ثواني • {rule.points} نقطة</div>
                            </div>
                            <div className="text-2xl">
                                {key === 'easy' ? '🟢' : key === 'medium' ? '🟡' : '🔴'}
                            </div>
                        </button>
                    ))}
                </div>

                <button onClick={() => setGameState('INTRO')} className="mt-8 text-gray-500 hover:text-white">الرجوع</button>
            </div>
        );
    }

    if (gameState === 'RESULT') {
        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-center safe-area-pb">
                <div className="text-6xl mb-4">{score > 0 ? '🏆' : '😅'}</div>
                <h2 className="text-3xl font-black text-white mb-2">
                    {score > 0 ? 'عاش يا بطل!' : 'حظ أوفر المرة الجاية'}
                </h2>
                <div className="text-gray-400 mb-8 flex flex-col items-center gap-1">
                    <span>جاوبت {correctCount} من {filteredQuestions.length} صح</span>
                    <span className="text-accent-gold font-bold">+{score} نقطة</span>
                </div>

                <div className="flex gap-4">
                    <ExitButton onConfirm={onExit} showConfirm={false} className="px-8 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20" />
                    <button onClick={() => setGameState('INTRO')} className="px-8 py-3 rounded-xl bg-accent-gold text-black font-bold hover:scale-105 transition-transform">
                        العب تاني 🔄
                    </button>
                </div>
            </div>
        );
    }

    // PLAYING STATE
    if (!currentQ) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0B0F14] flex flex-col safe-area-pb">
            {/* Top Bar */}
            <div className="px-4 py-6 flex items-center justify-between mx-auto w-full max-w-2xl">
                <ExitButton
                    onConfirm={onExit}
                    confirmMessage="Are you sure you want to quit? Current progress will be lost."
                    className="text-gray-500 hover:text-white transition-colors"
                />
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{gameConfig.title} - {DIFFICULTY_RULES[difficulty].label}</span>
                    <div className="flex gap-1 mt-1">
                        {filteredQuestions.map((_, i) => (
                            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < qIndex ? 'bg-accent-gold' : i === qIndex ? 'bg-white' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
                <div className="text-accent-gold font-black text-xl">
                    {score} <span className="text-xs opacity-70">PTS</span>
                </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-2xl mx-auto pb-10">
                {/* Timer Bar */}
                <div className="w-full h-2 bg-white/5 rounded-full mb-8 overflow-hidden relative">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / rules.time) * 100}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                        className={`h-full absolute right-0 top-0 bottom-0 ${timeLeft < 3 ? 'bg-red-500' : 'bg-accent-green'}`}
                    />
                </div>

                <div className="w-full mb-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed" dir="rtl">
                        {currentQ.text}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                    {currentQ.options.map((opt, idx) => {
                        let btnColor = "bg-white/5 border-white/10 hover:bg-white/10";
                        if (isAnswered) {
                            if (opt === currentQ.correctAnswer) btnColor = "bg-green-500/20 border-green-500 text-green-400";
                            else if (idx === selectedOption) btnColor = "bg-red-500/20 border-red-500 text-red-400";
                            else btnColor = "bg-white/5 border-white/5 opacity-50";
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(idx)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-xl border text-lg font-bold transition-all duration-200 ${btnColor} ${!isAnswered && 'hover:scale-[1.02]'}`}
                                dir="rtl"
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MalahyEngine;
