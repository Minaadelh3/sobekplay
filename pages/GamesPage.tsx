import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Level Data (Mock Shapes) ---
// Coordinates are % based (0-100)
const LEVELS = [
    {
        id: 1,
        name: "Baby Sobek 🥚",
        dots: [
            { x: 30, y: 60 }, { x: 40, y: 50 }, { x: 50, y: 40 }, { x: 60, y: 50 },
            { x: 70, y: 60 }, { x: 60, y: 70 }, { x: 50, y: 75 }, { x: 40, y: 70 },
            { x: 30, y: 60 } // Loop back
        ]
    },
    {
        id: 2,
        name: "Growing Croc 🐊",
        dots: [
            { x: 20, y: 60 }, { x: 25, y: 55 }, { x: 35, y: 55 }, { x: 40, y: 50 },
            { x: 50, y: 45 }, { x: 60, y: 50 }, { x: 70, y: 55 }, { x: 80, y: 60 },
            { x: 90, y: 65 }, { x: 80, y: 70 }, { x: 60, y: 75 }, { x: 40, y: 70 },
            { x: 20, y: 60 }
        ]
    },
    {
        id: 3,
        name: "Mighty Sobek 👑",
        dots: [
            { x: 10, y: 60 }, { x: 15, y: 55 }, { x: 20, y: 50 }, { x: 30, y: 45 },
            { x: 40, y: 40 }, { x: 50, y: 35 }, { x: 60, y: 40 }, { x: 70, y: 35 },
            { x: 80, y: 45 }, { x: 90, y: 55 }, { x: 95, y: 65 }, { x: 85, y: 75 },
            { x: 70, y: 80 }, { x: 50, y: 85 }, { x: 30, y: 80 }, { x: 10, y: 70 },
            { x: 10, y: 60 }
        ]
    }
];

const GamesPage: React.FC = () => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [activeDotIndex, setActiveDotIndex] = useState(0); // The next dot to click
    const [completed, setCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const currentLevel = LEVELS[currentLevelIndex];

    // Reset when level changes
    useEffect(() => {
        setActiveDotIndex(0);
        setCompleted(false);
        setShowCelebration(false);
    }, [currentLevelIndex]);

    const handleDotClick = (index: number) => {
        if (completed) return;

        if (index === activeDotIndex + 1) {
            // Correct next dot
            setActiveDotIndex(index);
            if (index === currentLevel.dots.length - 1) {
                setCompleted(true);
                setShowCelebration(true);
            }
        } else if (index === 0 && activeDotIndex === 0) {
            // Starting dot
            setActiveDotIndex(0);
        }
    };

    const nextLevel = () => {
        if (currentLevelIndex < LEVELS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        } else {
            // Loop or finish
            setCurrentLevelIndex(0);
        }
    };

    const resetLevel = () => {
        setActiveDotIndex(0);
        setCompleted(false);
        setShowCelebration(false);
    };

    return (
        <div className="min-h-screen bg-[#090b10] text-white pt-24 pb-32 px-4 flex flex-col items-center select-none">

            {/* Celebration Overlay */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="bg-[#1a202c] border border-accent-gold p-8 rounded-3xl text-center max-w-sm mx-4 shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 10, scale: 1.2 }}
                                transition={{
                                    yoyo: Infinity,
                                    duration: 0.5,
                                    repeatType: "reverse"
                                }}
                                className="text-6xl mb-6 block"
                            >
                                🐊✨
                            </motion.div>
                            <h2 className="text-3xl font-black text-accent-gold mb-2">Sobek is Awake!</h2>
                            <p className="text-white/60 mb-8 font-serif">Level {currentLevel.id} Complete</p>

                            <button
                                onClick={nextLevel}
                                className="bg-accent-gold text-black font-bold py-3 px-8 rounded-full text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
                            >
                                {currentLevelIndex < LEVELS.length - 1 ? "Next Challenge ➡️" : "Play Again 🔄"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-2xl text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Draw Sobek 🐊</h1>
                <p className="text-white/40 text-lg font-serif italic">Connect the dots to wake him up!</p>

                <div className="flex justify-center gap-2 mt-6">
                    {LEVELS.map((lvl, idx) => (
                        <button
                            key={lvl.id}
                            onClick={() => setCurrentLevelIndex(idx)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${idx === currentLevelIndex
                                    ? 'bg-accent-blue text-white shadow-lg scale-105'
                                    : 'bg-white/10 text-white/40 hover:bg-white/20'
                                }`}
                        >
                            Lvl {lvl.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* Game Canvas */}
            <div className="w-full max-w-2xl aspect-square md:aspect-video bg-[#0c1015] rounded-3xl border border-white/10 relative shadow-2xl overflow-hidden touch-none">

                {/* Helper Instructions */}
                {!activeDotIndex && (
                    <div className="absolute top-4 left-0 w-full text-center text-white/30 text-sm animate-pulse pointer-events-none">
                        Tap dot #1 to start
                    </div>
                )}

                {/* SVG Layer for Lines */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                    {/* Completed Lines */}
                    <motion.polyline
                        points={currentLevel.dots.slice(0, activeDotIndex + 1).map(d => `${d.x}%,${d.y}%`).join(' ')}
                        fill="none"
                        stroke="#4ADE80"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />

                    {/* Hint Line (Dashed) to next point */}
                    {!completed && activeDotIndex < currentLevel.dots.length - 1 && activeDotIndex >= 0 && (
                        <line
                            x1={`${currentLevel.dots[activeDotIndex].x}%`}
                            y1={`${currentLevel.dots[activeDotIndex].y}%`}
                            x2={`${currentLevel.dots[activeDotIndex + 1].x}%`}
                            y2={`${currentLevel.dots[activeDotIndex + 1].y}%`}
                            stroke="white"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            className="opacity-20"
                        />
                    )}

                    {/* Full Shape Fill (Reveal on completion) */}
                    {completed && (
                        <motion.polygon
                            points={currentLevel.dots.map(d => `${d.x}%,${d.y}%`).join(' ')}
                            fill="rgba(74, 222, 128, 0.1)"
                            stroke="none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </svg>

                {/* Interactive Dots */}
                {currentLevel.dots.map((dot, index) => {
                    // Determine dot state
                    const isActive = index === activeDotIndex;
                    const isNext = index === activeDotIndex + 1;
                    const isDone = index <= activeDotIndex;
                    const isLast = index === currentLevel.dots.length - 1;

                    // Don't show the last dot if it's just closing the loop on top of start dot, unless we want to click it to finish
                    // Actually we specifically want to click it to finish.

                    return (
                        <motion.button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold text-sm transition-all z-20 focus:outline-none ${isDone
                                    ? 'bg-accent-green text-black scale-90'
                                    : isNext
                                        ? 'bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-bounce'
                                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                                }`}
                            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                            disabled={completed || (!isNext && index !== 0)} // Only next dot is clickable, or start dot (though logic handles ignores)
                            initial={{ scale: 0 }}
                            animate={{ scale: isDone ? 1 : isNext ? 1.2 : 1 }}
                        >
                            {index + 1}
                        </motion.button>
                    );
                })}

            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={resetLevel}
                    className="px-6 py-2 rounded-full border border-white/10 text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                >
                    Reset
                </button>
            </div>

        </div>
    );
};

export default GamesPage;
