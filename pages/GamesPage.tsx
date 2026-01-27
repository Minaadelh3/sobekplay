import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Components ---
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
    >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </button>
);

// --- Game 1: MEMORY ENGINE (Robust State Machine) ---
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
interface Card {
    id: number;
    value: string; // Emoji
    isFlipped: boolean;
    isMatched: boolean;
}

const MEMORY_EMOJIS = ['🐊', '🌴', '⛵', '☀️', '🌊', '🏛️', '🐪', '🏺', '👑', '👀'];

const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [isWin, setIsWin] = useState(false);

    // Engine: Initialize Game
    const startGame = (diff: Difficulty) => {
        setDifficulty(diff);
        let pairCount = 6; // Easy default
        if (diff === 'MEDIUM') pairCount = 8;
        if (diff === 'HARD') pairCount = 12;

        const selectedEmojis = MEMORY_EMOJIS.slice(0, pairCount);
        // Create pairs
        const deck = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
            id: index,
            value: emoji,
            isFlipped: false,
            isMatched: false,
        }));

        // Fisher-Yates Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        setCards(deck);
        setFlippedIds([]);
        setIsProcessing(false);
        setMoves(0);
        setMatches(0);
        setIsWin(false);
    };

    // Engine: Card Interaction
    const handleCardClick = (id: number) => {
        // Block interaction if:
        // 1. Processing a mismatch (wait state)
        // 2. Card is already flipped
        // 3. Card is already matched
        const card = cards.find(c => c.id === id);
        if (isProcessing || !card || card.isFlipped || card.isMatched) return;

        // Flip logic
        const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlippedIds = [...flippedIds, id];
        setFlippedIds(newFlippedIds);

        // Check for Pair
        if (newFlippedIds.length === 2) {
            setIsProcessing(true); // LOCK BOARD
            setMoves(m => m + 1);

            const c1 = newCards.find(c => c.id === newFlippedIds[0]);
            const c2 = newCards.find(c => c.id === newFlippedIds[1]);

            if (c1 && c2 && c1.value === c2.value) {
                // MATCH
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === c1.id || c.id === c2.id) ? { ...c, isMatched: true } : c
                    ));
                    setMatches(m => m + 1);
                    setFlippedIds([]);
                    setIsProcessing(false); // UNLOCK
                }, 500); // Short delay to see the match
            } else {
                // NO MATCH
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        (c.id === c1?.id || c.id === c2?.id) ? { ...c, isFlipped: false } : c
                    ));
                    setFlippedIds([]);
                    setIsProcessing(false); // UNLOCK
                }, 1000); // 1s delay to memorize
            }
        }
    };

    // Engine: Win Condition
    useEffect(() => {
        if (cards.length > 0 && matches === cards.length / 2) {
            setIsWin(true);
        }
    }, [matches, cards]);

    if (!difficulty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#151515] p-6 text-center">
                <BackButton onClick={onBack} />
                <h2 className="text-4xl font-black text-white mb-8">MEMORY CHALLENGE</h2>
                <div className="space-y-4 w-full max-w-xs">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                        <button key={d} onClick={() => startGame(d)}
                            className="w-full py-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-accent-green hover:text-black transition-all">
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#151515] p-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-6">
                <button onClick={() => setDifficulty(null)} className="text-white/60 hover:text-white">← Exit</button>
                <div className="flex gap-4 text-sm font-mono text-white/60">
                    <span>MOVES: {moves}</span>
                    <span>PAIRS: {matches}</span>
                </div>
            </div>

            <div className={`grid gap-3 w-full max-w-4xl mx-auto
                ${difficulty === 'EASY' ? 'grid-cols-3 md:grid-cols-4' :
                    difficulty === 'MEDIUM' ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6'}`}>
                {cards.map(card => (
                    <motion.button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`aspect-square rounded-xl text-3xl md:text-5xl flex items-center justify-center border-2 transition-all duration-300 transform
                            ${card.isMatched ? 'bg-accent-green/20 border-accent-green/50 opacity-50' :
                                card.isFlipped ? 'bg-white border-white text-black rotate-y-180' : 'bg-white/5 border-white/10 text-transparent hover:bg-white/10'}
                        `}
                        whileTap={{ scale: 0.95 }}
                        animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}
                    >
                        <div style={{ transform: 'rotateY(180deg)' }}>
                            {(card.isFlipped || card.isMatched) ? card.value : ''}
                        </div>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence>
                {isWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        <h2 className="text-5xl font-black text-accent-gold mb-4">MATCHED!</h2>
                        <p className="text-white/60 mb-8">Completed in {moves} moves.</p>
                        <button onClick={() => startGame(difficulty)} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                            Play Again
                        </button>
                        <button onClick={() => setDifficulty(null)} className="mt-4 text-white/40 hover:text-white">
                            Change Difficulty
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


// --- Game 2: DRAW SOBEK (Strict Precision Engine) ---
const DRAW_LEVELS = [
    {
        id: 1,
        name: "Basic Shape",
        dots: [
            { id: 1, x: 20, y: 50 }, { id: 2, x: 40, y: 30 }, { id: 3, x: 60, y: 50 },
            { id: 4, x: 80, y: 40 }, { id: 5, x: 50, y: 80 }
        ]
    },
    {
        id: 2,
        name: "The Crown",
        dots: [
            { id: 1, x: 30, y: 60 }, { id: 2, x: 30, y: 40 }, { id: 3, x: 50, y: 25 },
            { id: 4, x: 70, y: 40 }, { id: 5, x: 70, y: 60 }, { id: 6, x: 50, y: 50 }
        ]
    },
    {
        id: 3,
        name: "Full Crocodile",
        dots: [
            { id: 1, x: 10, y: 50 }, { id: 2, x: 25, y: 40 }, { id: 3, x: 40, y: 45 },
            { id: 4, x: 55, y: 35 }, { id: 5, x: 70, y: 40 }, { id: 6, x: 85, y: 50 }, // Snout
            { id: 7, x: 75, y: 60 }, { id: 8, x: 60, y: 55 }, { id: 9, x: 45, y: 65 },
            { id: 10, x: 30, y: 60 }, { id: 11, x: 20, y: 55 }
        ]
    }
];

const DrawSobekGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [levelIdx, setLevelIdx] = useState(0);
    const [connected, setConnected] = useState<number[]>([1]); // Start with dot 1 active
    const [wrongAttempt, setWrongAttempt] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const level = DRAW_LEVELS[levelIdx];

    const handleDotTap = (dotId: number) => {
        if (isComplete) return;

        const lastConnected = connected[connected.length - 1];

        // STRICT LOGIC: Must be exactly the next number
        if (dotId === lastConnected + 1) {
            const newConnected = [...connected, dotId];
            setConnected(newConnected);

            // Check win
            if (newConnected.length === level.dots.length) {
                setIsComplete(true);
            }
        } else if (dotId !== lastConnected && !connected.includes(dotId)) {
            // Error logic
            setWrongAttempt(dotId);
            setTimeout(() => setWrongAttempt(null), 500);

            // Optional: Haptic feedback here
        }
    };

    const nextLevel = () => {
        if (levelIdx < DRAW_LEVELS.length - 1) {
            setLevelIdx(l => l + 1);
            setConnected([1]);
            setIsComplete(false);
        } else {
            // Loop back or end screen
            setLevelIdx(0);
            setConnected([1]);
            setIsComplete(false);
        }
    };

    // Helper to get lines
    const getLines = () => {
        let path = "";
        for (let i = 0; i < connected.length - 1; i++) {
            const d1 = level.dots.find(d => d.id === connected[i]);
            const d2 = level.dots.find(d => d.id === connected[i + 1]);
            if (d1 && d2) {
                path += `M ${d1.x} ${d1.y} L ${d2.x} ${d2.y} `;
            }
        }
        return path;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a1a1a] p-4 text-white">
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-white/60 hover:text-white">← Exit</button>
                <div className="font-bold text-accent-gold">{level.name.toUpperCase()}</div>
                <div className="text-xs text-white/40">Level {level.id}/{DRAW_LEVELS.length}</div>
            </div>

            <div className="relative w-full max-w-md aspect-square bg-[#222] rounded-2xl border border-white/5 shadow-inner overflow-hidden select-none touch-none">

                {/* Lines Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d={getLines()} stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>

                {/* Dots Layer */}
                {level.dots.map(dot => {
                    const isConnected = connected.includes(dot.id);
                    const isNext = !isComplete && dot.id === connected[connected.length - 1] + 1;
                    const isWrong = wrongAttempt === dot.id;

                    return (
                        <motion.button
                            key={dot.id}
                            onPointerDown={() => handleDotTap(dot.id)} // Specific pointer event for faster response
                            className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10
                                ${isConnected ? 'bg-accent-green text-back' : 'bg-nearblack border-2 border-white/20 text-white/50'}
                                ${isNext ? 'ring-4 ring-accent-gold/40 animate-pulse scale-110 border-accent-gold text-white' : ''}
                                ${isWrong ? 'bg-red-500 animate-shake' : ''}
                            `}
                            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isConnected ? '✓' : dot.id}
                        </motion.button>
                    );
                })}

                {/* Level Complete Overlay */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="text-6xl mb-4"
                            >
                                ✨
                            </motion.div>
                            <h3 className="text-2xl font-black text-white mb-6">Beautiful!</h3>
                            <button onClick={nextLevel} className="px-8 py-3 bg-accent-gold text-black font-bold rounded-full">
                                {levelIdx < DRAW_LEVELS.length - 1 ? "Next Level" : "Replay All"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className="mt-8 text-white/30 text-xs uppercase tracking-widest">Connect the dots in order</p>
        </div>
    );
};

// --- Main Page ---

const GamesPage: React.FC = () => {
    const [activeGame, setActiveGame] = useState<'draw' | 'memory' | null>(null);

    // Render Active Game
    if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'draw') return <DrawSobekGame onBack={() => setActiveGame(null)} />;

    // Render Menu
    return (
        <div className="min-h-screen bg-nearblack pt-24 px-4 pb-20">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2">ARCADE</h1>
                    <p className="text-white/60 mb-12">Train your mind. Explore the Nile.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {/* Card 1: MEMORY */}
                    <div
                        onClick={() => setActiveGame('memory')}
                        className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-accent-green/50 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60" />

                        <div className="absolute bottom-0 left-0 p-8 z-20 text-left">
                            <h3 className="text-3xl font-black text-white mb-1 group-hover:text-accent-green transition-colors">MEMORY</h3>
                            <p className="text-white/70 text-sm">Match the symbols of ancient Egypt.</p>
                        </div>
                    </div>

                    {/* Card 2: DRAW */}
                    <div
                        onClick={() => setActiveGame('draw')}
                        className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-accent-gold/50 transition-all"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547963334-3156637e6d0a?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60" />

                        <div className="absolute bottom-0 left-0 p-8 z-20 text-left">
                            <h3 className="text-3xl font-black text-white mb-1 group-hover:text-accent-gold transition-colors">DRAW SOBEK</h3>
                            <p className="text-white/70 text-sm">Connect the stars to reveal the guardian.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
