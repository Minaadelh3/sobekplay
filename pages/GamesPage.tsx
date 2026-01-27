import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Game Data: Levels & Dot Coordinates ---
const LEVELS = [
    {
        id: 1,
        name: "Baby Sobek",
        dots: [
            { id: 1, x: 20, y: 50 },
            { id: 2, x: 40, y: 30 },
            { id: 3, x: 60, y: 50 },
            { id: 4, x: 80, y: 40 },
            { id: 5, x: 50, y: 80 },
        ]
    },
    {
        id: 2,
        name: "Growing Croc",
        dots: [
            { id: 1, x: 10, y: 60 },
            { id: 2, x: 25, y: 40 },
            { id: 3, x: 40, y: 60 },
            { id: 4, x: 55, y: 35 },
            { id: 5, x: 70, y: 55 },
            { id: 6, x: 90, y: 45 },
            { id: 7, x: 80, y: 75 },
            { id: 8, x: 45, y: 85 },
        ]
    },
    {
        id: 3,
        name: "Sobek Awakens",
        dots: [
            { id: 1, x: 15, y: 55 }, // Tail tip
            { id: 2, x: 30, y: 45 }, // Tail base
            { id: 3, x: 45, y: 35 }, // Back
            { id: 4, x: 60, y: 40 }, // Neck
            { id: 5, x: 75, y: 30 }, // Head top
            { id: 6, x: 90, y: 45 }, // Snout
            { id: 7, x: 75, y: 60 }, // Jaw
            { id: 8, x: 60, y: 55 }, // Neck bottom
            { id: 9, x: 50, y: 70 }, // Front leg
            { id: 10, x: 40, y: 60 }, // Belly
            { id: 11, x: 25, y: 65 }, // Back leg
            { id: 12, x: 15, y: 55 }, // Connect back to tail
        ]
    }
];

const DrawSobekGame: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [connectedDots, setConnectedDots] = useState<number[]>([1]);
    const [isLevelComplete, setIsLevelComplete] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const level = LEVELS[currentLevelIndex];
    const nextTarget = connectedDots[connectedDots.length - 1] + 1;
    const isLastMove = nextTarget > level.dots.length;

    useEffect(() => {
        if (connectedDots.length === level.dots.length && level.id !== 3 && !isLevelComplete) {
            // Loop closure check for level 3 or just linear for others?
            // Logic: if all dots connected.
            completeLevel();
        } else if (level.id === 3 && connectedDots.length === level.dots.length) {
            completeLevel();
        }
    }, [connectedDots]);

    const completeLevel = () => {
        setIsLevelComplete(true);
    };

    const handleDotClick = (dotId: number) => {
        if (isLevelComplete) return;

        const lastDot = connectedDots[connectedDots.length - 1];

        // Special case for closing the loop in Level 3 if needed, but simplistic approach:
        // Just connect 1->2->3...

        if (dotId === lastDot + 1) {
            setConnectedDots([...connectedDots, dotId]);
            setFeedback(null);
            // Haptic feedback if available or sound could go here
        } else if (dotId !== lastDot && !connectedDots.includes(dotId)) {
            setFeedback("Not that one! Try the next number.");
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const nextLevel = () => {
        if (currentLevelIndex < LEVELS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
            setConnectedDots([1]);
            setIsLevelComplete(false);
        } else {
            // Restart or done
            setCurrentLevelIndex(0);
            setConnectedDots([1]);
            setIsLevelComplete(false);
        }
    };

    const resetLevel = () => {
        setConnectedDots([1]);
        setIsLevelComplete(false);
        setFeedback(null);
    };

    // Convert % to coordinates for SVG line drawing
    const getLinePoints = () => {
        return connectedDots.map(id => {
            const dot = level.dots.find(d => d.id === id);
            return dot ? `${dot.x},${dot.y}` : '';
        }).join(' ');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto p-4 text-white">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-6">
                <button onClick={onExit} className="text-white/60 hover:text-white">
                    ← Exit
                </button>
                <div className="text-xl font-bold text-accent-gold">{level.name}</div>
                <div className="text-sm text-white/40">Level {level.id}/{LEVELS.length}</div>
            </div>

            {/* Game Canvas */}
            <div className="relative w-full aspect-square bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-4 overflow-hidden">

                {/* Success Message Overlay */}
                <AnimatePresence>
                    {isLevelComplete && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="text-6xl mb-4"
                            >
                                🐊✨
                            </motion.div>
                            <h2 className="text-2xl font-bold text-accent-green mb-2">Sobek is Awake!</h2>
                            <button
                                onClick={nextLevel}
                                className="mt-4 px-6 py-2 bg-accent-gold text-black font-bold rounded-full hover:scale-105 transition-transform"
                            >
                                {currentLevelIndex < LEVELS.length - 1 ? "Next Level" : "Play Again"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feedback Toast */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"
                        >
                            <span className="bg-red-500/80 text-white px-3 py-1 rounded-full text-sm">
                                {feedback}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* SVG Layer for Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.polyline
                        points={getLinePoints()}
                        fill="none"
                        stroke="#4ade80" // accent-green
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                    {/* Dashed faint line for full shape hint in easy mode? maybe not, keep it mystery */}
                </svg>

                {/* Dots Layer */}
                {level.dots.map((dot) => {
                    const isConnected = connectedDots.includes(dot.id);
                    const isNext = !isLevelComplete && dot.id === connectedDots[connectedDots.length - 1] + 1;

                    return (
                        <motion.button
                            key={dot.id}
                            onClick={() => handleDotClick(dot.id)}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 z-10
                            ${isConnected ? 'bg-accent-green text-black scale-110' : 'bg-nearblack border-2 border-white/30 text-white'}
                            ${isNext ? 'ring-4 ring-accent-gold/50 animate-pulse' : ''}
                        `}
                            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isConnected ? '✓' : dot.id}
                        </motion.button>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4">
                <button onClick={resetLevel} className="text-sm text-white/50 hover:text-white uppercase tracking-wider">
                    Reset
                </button>
            </div>
        </div>
    );
};

const GamesPage: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    if (isPlaying) {
        return <DrawSobekGame onExit={() => setIsPlaying(false)} />;
    }

    return (
        <div className="min-h-screen pt-24 px-4 pb-20 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Games 🎮</h1>
                <p className="text-white/60">Relax, play, and discover the Nile.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsPlaying(true)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-colors group"
                >
                    <div className="aspect-video bg-gradient-to-br from-green-900 to-black rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547963334-3156637e6d0a?q=80&w=600&auto=format&fit=crop')] bg-cover opacity-20 group-hover:opacity-40 transition-opacity mix-blend-overlay"></div>
                        <div className="text-6xl group-hover:scale-125 transition-transform duration-500">🐊</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-green">Draw Sobek</h3>
                    <p className="text-sm text-white/60">Connect the dots to reveal the guardian of the Nile.</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-accent-gold uppercase tracking-wider">
                        <span>Play Now</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                </motion.div>

                {/* Placeholder for future games */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 opacity-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                        <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-bold border border-white/10">Coming Soon</span>
                    </div>
                    <div className="aspect-video bg-white/5 rounded-xl mb-4"></div>
                    <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 w-full bg-white/5 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
