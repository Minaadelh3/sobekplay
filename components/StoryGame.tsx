import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_STARTERS, getCurvedPrompt, StoryPrompt } from '../data/storyData';
import { GameScoreSaver } from './games/GameScoreSaver';

export const StoryGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'PASSING' | 'REVEAL'>('SETUP');
    const [story, setStory] = useState<string[]>([]);
    const [turn, setTurn] = useState(0);
    const [totalRounds, setTotalRounds] = useState(5);

    const [currentInput, setCurrentInput] = useState('');
    const [activePrompt, setActivePrompt] = useState<StoryPrompt | null>(null);
    const [isPromptRevealed, setIsPromptRevealed] = useState(false);

    // --- GAME LOGIC ---

    const startGame = (rounds: number) => {
        const starter = STORY_STARTERS[Math.floor(Math.random() * STORY_STARTERS.length)];
        setStory([starter]);
        setTotalRounds(rounds);
        setTurn(1);
        prepareNextTurn(1, rounds);
        setGameState('PLAYING');
    };

    const prepareNextTurn = (nextTurn: number, rounds: number) => {
        // 1. Reset State
        setCurrentInput('');
        setIsPromptRevealed(false);

        // 2. Get Curved Prompt
        const prompt = getCurvedPrompt(nextTurn, rounds);
        setActivePrompt(prompt);

        // 3. Auto Reveal Delay (Theatrical)
        setTimeout(() => {
            setIsPromptRevealed(true);
        }, 800);
    };

    const submitTurn = () => {
        if (!currentInput.trim()) return;
        const newLine = currentInput.trim();
        setStory(prev => [...prev, newLine]);

        // Check End
        if (turn >= totalRounds) {
            setGameState('REVEAL');
        } else {
            setGameState('PASSING');
        }
    };

    const confirmPass = () => {
        const nextTurn = turn + 1;
        setTurn(nextTurn);
        prepareNextTurn(nextTurn, totalRounds);
        setGameState('PLAYING');
    };

    // --- RENDERERS ---

    // 1. SETUP SCREEN
    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-nearblack text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-indigo-900/20 pointer-events-none" />

                <button onClick={onExit} className="absolute top-6 left-6 opacity-60 hover:opacity-100 z-50">← Exit</button>

                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                    <div className="inline-block px-4 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs tracking-widest uppercase mb-6">
                        Social Story Engine v2.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 font-arabic drop-shadow-2xl text-white" dir="rtl">
                        كمّلها وإنت ساكت 🤫
                    </h1>
                    <p className="text-white/60 mb-12 max-w-md mx-auto leading-relaxed font-arabic" dir="rtl">
                        لعبة تأليف جماعي. كل واحد بيكتب جملة واحدة بس بناءً على تعليمات سرية.. وفي الآخر بنشوف القصة العجيبة اللي طلعت!
                    </p>

                    <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mb-8">
                        {[3, 5, 7].map(num => (
                            <button
                                key={num}
                                onClick={() => startGame(num)}
                                className="aspect-square rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500 hover:bg-indigo-500/20 transition-all flex flex-col items-center justify-center gap-2 group"
                            >
                                <span className="text-3xl font-bold group-hover:text-indigo-400">{num}</span>
                                <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-100">Rounds</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-white/30 tracking-widest uppercase">Choose story length</p>
                </motion.div>
            </div>
        );
    }

    // 2. PASSING SCREEN
    if (gameState === 'PASSING') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-center text-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-[#111] p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

                    <div className="text-6xl mb-8 animate-bounce">📱</div>
                    <h2 className="text-2xl md:text-3xl font-black mb-4 font-arabic" dir="rtl">سلّم الموبايل</h2>
                    <p className="text-white/50 mb-10 font-arabic leading-relaxed" dir="rtl">
                        للاعب اللي عليه الدور.. ومن غير ما يشوف اللي فات!
                    </p>

                    <button
                        onClick={confirmPass}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                        أنا جاهز
                    </button>
                </motion.div>
            </div>
        );
    }

    // 3. REVEAL SCREEN
    if (gameState === 'REVEAL') {
        return (
            <div className="min-h-screen bg-[#050505] text-white relative overflow-y-auto">
                <div className="max-w-3xl mx-auto py-24 px-6">
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                            className="text-3xl md:text-5xl font-black mb-4 font-arabic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                        >
                            النهاية ✨
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="text-white/40 text-sm tracking-widest uppercase"
                        >
                            Written by The Crew
                        </motion.p>
                    </div>

                    <div className="space-y-6 font-arabic leading-loose text-lg md:text-xl text-right" dir="rtl">
                        {story.map((line, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.4 }}
                                className={`relative p-6 rounded-3xl ${idx === 0
                                    ? 'bg-indigo-900/10 border border-indigo-500/20 text-indigo-100 font-bold'
                                    : 'bg-white/5 border border-white/5 text-gray-200'
                                    }`}
                            >
                                {/* Avatar / Number */}
                                <div className="absolute top-6 -left-3 md:-left-12 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-white/40">
                                    {idx + 1}
                                </div>
                                {line}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <button
                            onClick={() => setGameState('SETUP')}
                            className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            New Story 🔄
                        </button>

                        <div className="mt-12 border-t border-white/10 pt-12 max-w-md mx-auto">
                            <h3 className="text-white/30 text-xs uppercase tracking-widest mb-6">Award Creative Points</h3>
                            <GameScoreSaver
                                gameId="story"
                                gameName="Story Game (كمّلها)"
                                scoreA={0}
                                scoreB={0}
                                onSaved={() => { }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. PLAYING STATE
    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-nearblack relative overflow-hidden transition-colors duration-1000">

            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-black z-0" />

            {/* Progress Pill */}
            <div className="relative z-10 glass-panel px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 mb-8 mt-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">
                    Round {turn} / {totalRounds}
                </span>
            </div>

            <div className="w-full max-w-xl relative z-10 flex flex-col flex-1 pb-10">

                {/* LAST SENTENCE CONTEXT */}
                <div className="mb-6">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 pl-1">Previous Line</div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1a1a1a] border-r-2 border-white/20 p-6 rounded-l-2xl text-right"
                    >
                        <p className="text-lg md:text-xl text-white/80 font-serif italic font-arabic leading-relaxed" dir="rtl">
                            "... {story[story.length - 1]}"
                        </p>
                    </motion.div>
                </div>

                {/* PROMPT CARD (The Core Mechanic) */}
                <div className="my-4 relative min-h-[140px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!isPromptRevealed ? (
                            <motion.div
                                key="hidden"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full h-full bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-6"
                            >
                                <span className="text-xs text-white/20 animate-pulse tracking-[0.3em] uppercase">Incoming Instruction...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="revealed"
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="w-full bg-gradient-to-br from-[#222] to-[#111] border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl"
                            >
                                {/* Card Decor */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <div className="absolute top-3 right-4 text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded">
                                    {activePrompt?.mood}
                                </div>

                                <p className="text-xl md:text-2xl font-bold text-white font-arabic leading-relaxed pr-2 pt-4" dir="rtl">
                                    {activePrompt?.text}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* INPUT AREA */}
                <div className="flex-1 flex flex-col justify-end mt-4">
                    <div className="relative group">
                        <textarea
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder="اكتب جملة واحدة هنا..."
                            rows={3}
                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 text-right text-xl text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-[#111] transition-all resize-none font-arabic leading-normal"
                            dir="rtl"
                        />
                    </div>

                    <button
                        disabled={!currentInput.trim()}
                        onClick={submitTurn}
                        className="mt-6 w-full py-4 bg-white text-black font-black rounded-xl shadow-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span>Confirm & Pass</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

            </div>
        </div>
    );
};
