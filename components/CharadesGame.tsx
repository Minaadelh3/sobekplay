import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARADES_DATA, CharadesCategory } from '../data/charadesData';

type Team = 'A' | 'B';

export const CharadesGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'TURN_INTRO' | 'SELECTOR' | 'READY' | 'ACTING' | 'RESULT' | 'GAME_OVER'>('SETUP');

    // Settings
    const [roundTimeSetting, setRoundTimeSetting] = useState(60);

    // Game State
    const [currentTurn, setCurrentTurn] = useState<Team>('A'); // Who is ACTING
    const [scores, setScores] = useState({ A: 0, B: 0 });
    const [usedTitles, setUsedTitles] = useState<Set<string>>(new Set());

    // Round State
    const [selectedCategory, setSelectedCategory] = useState<CharadesCategory | null>(null);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);

    // Timer
    useEffect(() => {
        let timer: any;
        if (gameState === 'ACTING' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'ACTING' && timeLeft === 0) {
            handleTimeUp();
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // --- ACTIONS ---

    const startGame = (time: number) => {
        setRoundTimeSetting(time);
        setGameState('TURN_INTRO');
    };

    const startTurn = () => {
        // The OPPOSITE team selects the title
        // If Team A is acting, Team B selects
        setGameState('SELECTOR');
    };

    const selectTitle = (title: string, category: CharadesCategory) => {
        if (usedTitles.has(title)) return;

        setCurrentTitle(title);
        setSelectedCategory(category);
        setUsedTitles(prev => new Set(prev).add(title));

        setGameState('READY');
        setTimeLeft(roundTimeSetting);
    };

    const startActing = () => {
        setGameState('ACTING');
    };

    const handleCorrect = () => {
        setScores(prev => ({
            ...prev,
            [currentTurn]: prev[currentTurn] + 1
        }));
        setGameState('RESULT');
    };

    const handleTimeUp = () => {
        // Point goes to NO ONE (or opposing team if we want to be mean, but typically no point)
        setGameState('RESULT');
    };

    const nextTurn = () => {
        setCurrentTurn(prev => prev === 'A' ? 'B' : 'A');
        setCurrentTitle(null);
        setSelectedCategory(null);
        setGameState('TURN_INTRO');
    };

    // --- RENDERERS ---

    // 1. SETUP
    if (gameState === 'SETUP') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-center text-white relative">
                <button onClick={onExit} className="absolute top-6 left-6 text-white/50">Exit</button>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
                    <h1 className="text-5xl font-black mb-2 font-arabic text-yellow-500" dir="rtl">
                        مثّلها لو قدّك 🎭
                    </h1>
                    <p className="text-white/60 mb-12 font-arabic">Team vs Team Charades</p>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
                        <p className="text-sm uppercase tracking-widest text-white/40 mb-4">Round Duration</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[30, 60, 90].map(t => (
                                <button
                                    key={t}
                                    onClick={() => startGame(t)}
                                    className="py-4 bg-slate-800 hover:bg-yellow-500 hover:text-black rounded-xl font-bold transition-colors border border-white/5"
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

    // 2. TURN INTRO
    if (gameState === 'TURN_INTRO') {
        const actingTeam = currentTurn;
        const selectingTeam = currentTurn === 'A' ? 'B' : 'A';

        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white transition-colors ${actingTeam === 'A' ? 'bg-blue-900' : 'bg-red-900'}`}>
                <div className="mb-12">
                    <h2 className="text-2xl opacity-60 font-arabic mb-2">الدور على</h2>
                    <h1 className="text-6xl font-black mb-4">TEAM {actingTeam}</h1>
                    <p className="text-xl font-bold opacity-80 font-arabic">هما اللي هيمثلوا</p>
                </div>

                <div className="bg-black/20 p-8 rounded-3xl mb-12 max-w-sm w-full backdrop-blur-sm border border-white/10">
                    <h3 className="text-xl font-bold mb-4 font-arabic text-yellow-400">المطلوب:</h3>
                    <p className="text-lg leading-relaxed font-arabic" dir="rtl">
                        يا <span className="font-black">Team {selectingTeam}</span> خدوا الموبايل.<br />
                        اختاروا حاجة صعبة عشان Team {actingTeam} يمثلها!
                    </p>
                </div>

                <button
                    onClick={startTurn}
                    className="w-full max-w-xs py-5 bg-white text-black font-black text-xl rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                    Ready Selectors? 😈
                </button>
            </div>
        );
    }

    // 3. SELECTOR (Opposing team chooses)
    if (gameState === 'SELECTOR') {
        const selectingTeam = currentTurn === 'A' ? 'B' : 'A';
        return (
            <div className="min-h-screen flex flex-col bg-slate-900 text-white">
                {/* Header */}
                <div className="p-4 bg-slate-800 border-b border-white/10 flex justify-between items-center relative z-20 shadow-xl">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50">Team {selectingTeam} Choosing</div>
                    <div className="font-arabic font-bold text-yellow-500">اختاروا حاجة تعجزهم</div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-12 pb-20">
                    {Object.entries(CHARADES_DATA).map(([catKey, titles]) => (
                        <div key={catKey}>
                            <h3 className="text-2xl font-black mb-4 text-yellow-500 font-arabic text-right px-2 border-r-4 border-yellow-500">
                                {catKey === 'MOVIES_EG' && 'أفلام مصرية 🎥'}
                                {catKey === 'SERIES_EG' && 'مسلسلات مصرية 📺'}
                                {catKey === 'PLAYS_EG' && 'مسرحيات 😂'}
                                {catKey === 'MOVIES_EN' && 'English Movies 🎬'}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {titles.filter(t => !usedTitles.has(t)).map(title => (
                                    <button
                                        key={title}
                                        onClick={() => selectTitle(title, catKey as CharadesCategory)}
                                        className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-right font-bold transition-all active:scale-95 text-lg"
                                    >
                                        {title}
                                    </button>
                                ))}
                                {titles.filter(t => !usedTitles.has(t)).length === 0 && (
                                    <p className="text-center opacity-30 py-4">All used!</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 4. READY (Actor View)
    if (gameState === 'READY') {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center text-white ${currentTurn === 'A' ? 'bg-blue-900' : 'bg-red-900'}`}>
                <p className="text-white/50 text-xs tracking-widest uppercase mb-4">Actor View • Team {currentTurn}</p>

                <div className="mb-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-black/20 text-xs font-bold mb-4 uppercase tracking-widest border border-white/10">Target</span>
                    <h1 className="text-4xl md:text-6xl font-black font-arabic leading-relaxed drop-shadow-2xl text-yellow-400" dir="rtl">
                        {currentTitle}
                    </h1>
                </div>

                <p className="max-w-xs mx-auto text-white/60 text-sm mb-8 font-arabic leading-relaxed">
                    افهم الاسم كويس.<br />
                    ممنوع الكلام. ممنوع الأصوات.<br />
                    أول ما تدوس "مثّل" الوقت هيبدأ.
                </p>

                <button
                    onClick={startActing}
                    className="w-full max-w-xs py-5 bg-white text-black font-black text-2xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                >
                    START ACTING 🎬
                </button>
            </div>
        );
    }

    // 5. ACTING
    if (gameState === 'ACTING') {
        return (
            <div className="min-h-screen flex flex-col bg-black text-white relative overflow-hidden">
                {/* Timer Bar */}
                <motion.div
                    className={`absolute top-0 left-0 h-2 ${timeLeft < 10 ? 'bg-red-500' : 'bg-yellow-500'} z-50`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: timeLeft, ease: 'linear' }}
                />

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
                    <div className="text-[10rem] font-black font-mono leading-none opacity-20 select-none">
                        {timeLeft}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-4xl md:text-6xl font-black font-arabic text-yellow-500 leading-relaxed px-4" dir="rtl">
                            {currentTitle}
                        </h1>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4 relative z-20">
                    <button
                        onClick={handleTimeUp}
                        className="py-6 bg-red-900/20 border border-red-500/30 text-red-500 rounded-2xl font-bold text-lg"
                    >
                        Failed / Skip ❌
                    </button>
                    <button
                        onClick={handleCorrect}
                        className="py-6 bg-green-500 text-black rounded-2xl font-black text-xl shadow-lg hover:bg-green-400 transition-colors"
                    >
                        SOLVED! ✅
                    </button>
                </div>
            </div>
        );
    }

    // 6. RESULT
    if (gameState === 'RESULT') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
                <div className="mb-12 w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Current Score</h2>
                    <div className="flex justify-between items-center text-5xl font-black">
                        <div className="text-blue-400">
                            <span className="text-xs block font-bold mb-2 opacity-50 tracking-widest">TEAM A</span>
                            {scores.A}
                        </div>
                        <div className="text-white/10 text-3xl">VS</div>
                        <div className="text-red-400">
                            <span className="text-xs block font-bold mb-2 opacity-50 tracking-widest">TEAM B</span>
                            {scores.B}
                        </div>
                    </div>
                </div>

                <button
                    onClick={nextTurn}
                    className="w-full max-w-xs py-4 bg-yellow-500 text-black font-bold text-xl rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                    Next Round ➜
                </button>

                <button onClick={onExit} className="mt-8 text-white/30 text-sm hover:text-white">End Game</button>
            </div>
        );
    }

    return <div />;
};
