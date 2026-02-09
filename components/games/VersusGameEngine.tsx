import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MatchState, VersusPlayer } from '../../lib/versus';
import { PROVERBS, VERSES, Question } from '../../lib/questionBank';
import confetti from 'canvas-confetti';
import { performTransaction } from '../../lib/ledger';
import { useGame } from '../../hooks/useGameControl';

interface VersusGameEngineProps {
    matchId: string;
    currentUser: { id: string, name: string };
    initialMatchState: MatchState;
    onExit: () => void;
}

const VersusGameEngine: React.FC<VersusGameEngineProps> = ({ matchId, currentUser, initialMatchState, onExit }) => {
    const [match, setMatch] = useState<MatchState>(initialMatchState);
    const [timeLeft, setTimeLeft] = useState(10);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Dynamic Config
    const { game: gameConfig } = useGame(match.gameId || 'versus_match');

    // Determine Role
    const isHost = match.createdBy === currentUser.id;
    const myPlayer = match.players[currentUser.id];
    const opponent = Object.values(match.players).find(p => p.id !== currentUser.id);

    // Load Questions
    const GAME_QUESTIONS = match.gameId === 'verse' ? VERSES : PROVERBS;
    const currentQ = GAME_QUESTIONS[match.currentQuestionIndex || 0];

    // Real-time Sync
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'matches', matchId), (doc) => {
            if (doc.exists()) {
                const data = doc.data() as MatchState;
                setMatch(data);

                // Reset local state on new question
                if (data.currentQuestionIndex !== match.currentQuestionIndex) {
                    setIsAnswered(false);
                    setSelectedOption(null);
                    setTimeLeft(10);
                }
            }
        });
        return () => unsub();
    }, [matchId, match.currentQuestionIndex]);

    // HOST LOGIC: Timer & Progression
    useEffect(() => {
        if (!isHost || match.status !== 'in_progress') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    handleHostNextTurn();
                    return 10;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isHost, match.status, match.currentQuestionIndex]);

    const handleHostNextTurn = async () => {
        const nextIndex = (match.currentQuestionIndex || 0) + 1;

        if (nextIndex >= GAME_QUESTIONS.length) {
            await updateDoc(doc(db, 'matches', matchId), { status: 'finished' });
        } else {
            await updateDoc(doc(db, 'matches', matchId), {
                currentQuestionIndex: nextIndex,
            });
        }
    };

    const handleAnswer = async (optionIndex: number) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedOption(optionIndex);

        const isCorrect = currentQ.options[optionIndex] === currentQ.correctAnswer;

        if (isCorrect) {
            // Optimistic Points (Visual only, real points at end)
            // Use config or default 10
            const points = 10;

            // Database Update
            const playerRefStr = `players.${currentUser.id}.score`;
            await updateDoc(doc(db, 'matches', matchId), {
                [playerRefStr]: increment(points),
                [`players.${currentUser.id}.lastAnswerCorrect`]: true
            });
        } else {
            await updateDoc(doc(db, 'matches', matchId), {
                [`players.${currentUser.id}.lastAnswerCorrect`]: false
            });
        }
    };

    // --- FINISH & SAVE LOGIC ---
    useEffect(() => {
        const diff = match.players && Object.keys(match.players).length > 1; // Ensure 2 players
        if (match.status === 'finished' && diff) {
            saveMatchResult();
        }
    }, [match.status]);

    const saveMatchResult = async () => {
        const players = Object.values(match.players);
        const myP = match.players[currentUser.id];
        // Only proceed if I have my player data AND game config is loaded
        if (!myP || !gameConfig) return;

        // Determine Winner
        const sorted = players.sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const isDraw = players.every(p => p.score === winner.score);

        let outcome: 'WIN' | 'LOSS' | 'DRAW' = 'LOSS';
        if (isDraw) outcome = 'DRAW';
        else if (winner.id === currentUser.id) outcome = 'WIN';

        // Calculate Rewards using Dynamic Config
        let xpReward = 0;
        let scoreReward = 0;

        if (outcome === 'WIN') {
            xpReward = gameConfig.rewards.win;
            scoreReward = gameConfig.rewards.win;
        } else if (outcome === 'DRAW') {
            xpReward = gameConfig.rewards.draw || 0;
            scoreReward = gameConfig.rewards.draw || 0;
        } else {
            xpReward = gameConfig.rewards.loss || 0;
            scoreReward = gameConfig.rewards.loss || 0;
        }

        // 1. Transaction: User Rewards
        // Check if I am NOT admin (or pseudo admin check)
        const isAdmin = currentUser.id === 'admin';

        if (!isAdmin) {
            try {
                // TRACK EVENT: GAME_COMPLETED
                import('../../lib/events').then(m => {
                    m.trackEvent(currentUser.id, 'GAME_COMPLETED', {
                        gameId: match.gameId || 'versus_match',
                        score: myP.score,
                        result: outcome,
                        opponentScore: opponent?.score || 0
                    });
                });

                // Award XP/Points to User
                if (xpReward > 0) {
                    await performTransaction({
                        type: 'GAME_REWARD',
                        amount: xpReward,
                        from: { type: 'SYSTEM', id: 'versus_arena', name: 'Versus Arena' },
                        to: { type: 'USER', id: currentUser.id, name: currentUser.name },
                        reason: `Versus Result: ${outcome} (Match ${match.code || matchId})`
                    });
                }

                // Award Points to Team
                if (myP.teamId && scoreReward > 0) {
                    await performTransaction({
                        type: 'ADJUSTMENT',
                        amount: scoreReward,
                        from: { type: 'SYSTEM', id: 'versus_arena', name: 'Versus Arena' },
                        to: { type: 'TEAM', id: myP.teamId, name: myP.teamId },
                        reason: `Member ${currentUser.name} won Versus Match`
                    });
                }

            } catch (e) {
                console.error("Error saving points", e);
            }
        }
    };

    if (match.status === 'finished') {
        const sorted = Object.values(match.players).sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const isWinner = winner.id === currentUser.id;
        const isDraw = Object.values(match.players).every(p => p.score === winner.score);

        return (
            <div className="fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-5xl font-black text-white mb-4">
                    {isDraw ? '🤝 تعادل!' : isWinner ? '🎉 مبروك يا بطل!' : 'حظ أوفر!'}
                </h1>
                <div className="flex items-end gap-8 mb-12">
                    <div className="flex flex-col items-center">
                        <img src={myPlayer?.avatar} className="w-20 h-20 rounded-full border-4 border-accent-gold mb-2" />
                        <span className="text-2xl font-bold text-white">{myPlayer?.score}</span>
                    </div>
                    <span className="text-4xl text-gray-600 mb-8">VS</span>
                    <div className="flex flex-col items-center">
                        <img src={opponent?.avatar} className="w-20 h-20 rounded-full border-4 border-gray-600 mb-2 grayscale" />
                        <span className="text-2xl font-bold text-gray-400">{opponent?.score}</span>
                    </div>
                </div>
                <button onClick={onExit} className="px-8 py-3 bg-white/10 rounded-xl text-white font-bold">
                    خروج
                </button>
            </div>
        );
    }

    if (!currentQ) return <div>Loading Question...</div>;

    return (
        <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4">

            {/* HUD */}
            <div className="w-full max-w-md flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                    <img src={myPlayer?.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                    <div className="text-right">
                        <div className="text-xs text-gray-400">أنت</div>
                        <div className="font-black text-accent-gold text-xl">{myPlayer?.score}</div>
                    </div>
                </div>

                <div className="text-2xl font-black text-white bg-red-600 px-4 py-1 rounded-lg shadow-lg shadow-red-500/20">
                    {timeLeft}
                </div>

                <div className="flex items-center gap-2 flex-row-reverse">
                    <img src={opponent?.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                    <div className="text-left">
                        <div className="text-xs text-gray-400">الخصم</div>
                        <div className="font-black text-gray-300 text-xl">{opponent?.score}</div>
                    </div>
                </div>
            </div>

            {/* Question */}
            <motion.div
                key={match.currentQuestionIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md text-center mb-8"
            >
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed" dir="rtl">
                    {currentQ.text}
                </h2>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                {currentQ.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered}
                        className={`
                            w-full p-4 rounded-xl border text-lg font-bold transition-all
                            ${isAnswered && idx === selectedOption
                                ? 'bg-accent-gold text-black border-accent-gold'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        dir="rtl"
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <div className="mt-8 text-gray-500 text-sm">
                Question {(match.currentQuestionIndex || 0) + 1} / {GAME_QUESTIONS.length}
            </div>
        </div>
    );
};

export default VersusGameEngine;
