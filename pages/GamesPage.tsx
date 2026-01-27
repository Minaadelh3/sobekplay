
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type GameType = 'draw' | 'quest' | 'memory';

// --- Shared Components ---
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
    >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </button>
);

// --- Draw Sobek (Advanced) ---
const DrawSobekGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [level, setLevel] = useState(1);
    const [completedLines, setCompletedLines] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStart, setCurrentStart] = useState<number | null>(null);

    // Levels configuration
    const levels = [
        { id: 1, name: "The Smile", points: [[50, 60], [40, 65], [30, 65], [20, 60]], hint: "Connect the smile" },
        { id: 2, name: "The Crown", points: [[35, 30], [50, 20], [65, 30], [50, 40]], hint: "Draw the crown" },
        { id: 3, name: "The Eye", points: [[45, 45], [55, 45], [50, 50], [45, 45]], hint: "The all-seeing eye" },
    ];

    /* 
      Simplify for this demo: Just connecting dots in order.
      In a real full implementation, we'd use Canvas API for freehand drawing or complex svg paths.
      Here we simulate "connecting" by clicking points in sequence.
    */
    const currentLevelData = levels[level - 1];
    const [connectedPoints, setConnectedPoints] = useState<number[]>([]);

    const handlePointClick = (index: number) => {
        if (connectedPoints.length === 0) {
            if (index === 0) setConnectedPoints([0]);
        } else {
            const lastPoint = connectedPoints[connectedPoints.length - 1];
            if (index === lastPoint + 1) {
                setConnectedPoints([...connectedPoints, index]);
                if (index === currentLevelData.points.length - 1) {
                    // Level Complete
                    setTimeout(() => {
                        if (level < levels.length) {
                            setLevel(level + 1);
                            setConnectedPoints([]);
                        } else {
                            alert("You are a Master Artist!"); // Replace with nice UI
                            setLevel(1);
                            setConnectedPoints([]);
                        }
                    }, 1000);
                }
            }
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#1a1a1a] p-4 text-center">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-gold mb-2">DRAW SOBEK</h2>
            <p className="text-white/60 mb-8">Level {level}: {currentLevelData.hint}</p>

            <div className="relative w-full max-w-sm aspect-square bg-[#2a2a2a] rounded-3xl border border-white/10 shadow-2xl p-8">
                {/* Render Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {connectedPoints.map((pIndex, i) => {
                        if (i === 0) return null;
                        const start = currentLevelData.points[connectedPoints[i - 1]];
                        const end = currentLevelData.points[pIndex];
                        return (
                            <line
                                key={i}
                                x1={`${start[0]}%`} y1={`${start[1]}%`}
                                x2={`${end[0]}%`} y2={`${end[1]}%`}
                                stroke="#E5A00D" strokeWidth="4" strokeLinecap="round"
                            />
                        );
                    })}
                </svg>

                {/* Render Points */}
                {currentLevelData.points.map((p, i) => {
                    const isConnected = connectedPoints.includes(i);
                    const isNext = connectedPoints.length === i;

                    return (
                        <motion.button
                            key={i}
                            className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-colors z-10
                 ${isConnected ? 'bg-accent-gold border-accent-gold text-black' :
                                    isNext ? 'bg-white border-white text-black animate-pulse' : 'bg-transparent border-white/30 text-white/30'}
               `}
                            style={{ left: `${p[0]}%`, top: `${p[1]}%` }}
                            onClick={() => handlePointClick(i)}
                            whileTap={{ scale: 0.9 }}
                        >
                            {i + 1}
                        </motion.button>
                    );
                })}
            </div>
            <p className="mt-8 text-white/40 text-sm">Tap the glowing numbers in order!</p>
        </div>
    );
};


// --- Sobek Quest (New) ---
const SobekQuestGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [step, setStep] = useState(0);

    const storyline = [
        {
            text: "You arrive at the edge of the Nile. The water is calm, but something ripples beneath the surface...",
            choices: [
                { label: "Dive in", next: 1 },
                { label: "Wait and watch", next: 2 }
            ]
        },
        {
            text: "You dive! It's refreshing. Suddenly, a friendly crocodile nudges you. It's Sobek!",
            visual: "🐊",
            choices: [
                { label: "High five him", next: 3 },
                { label: "Swim away fast", next: 2 }
            ]
        },
        {
            text: "You decide to stay dry. A felucca drifts by. The captain waves at you.",
            visual: "⛵",
            choices: [
                { label: "Hop on board", next: 3 },
                { label: "Walk along the bank", next: 3 }
            ]
        },
        {
            text: "Whatever path you took, you found the hidden temple! A golden light shines from within.",
            visual: "✨",
            choices: [
                { label: "Enter the light", next: 4 }
            ]
        },
        {
            text: "Congratulations! You found the ancient playlist of the Pharaohs. The party never ends!",
            visual: "🎉",
            choices: [
                { label: "Play Again", next: 0 }
            ]
        }
    ];

    const currentScene = storyline[step];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d1416] p-6 text-center">
            <BackButton onClick={onBack} />

            <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {currentScene.visual && (
                    <div className="text-8xl mb-8 animate-bounce">{currentScene.visual}</div>
                )}

                <p className="text-2xl md:text-3xl text-white font-medium mb-12 leading-relaxed">
                    {currentScene.text}
                </p>

                <div className="space-y-4">
                    {currentScene.choices.map((choice, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(choice.next)}
                            className="w-full py-4 bg-white/10 hover:bg-accent-gold hover:text-black border border-white/20 rounded-xl text-lg font-bold transition-all"
                        >
                            {choice.label}
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// --- Quick Challenges (Memory) ---
const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const initialCards = [
        { id: 1, emoji: '🐊' }, { id: 2, emoji: '🐊' },
        { id: 3, emoji: '🌴' }, { id: 4, emoji: '🌴' },
        { id: 5, emoji: '⛵' }, { id: 6, emoji: '⛵' },
        { id: 7, emoji: '☀️' }, { id: 8, emoji: '☀️' },
    ].sort(() => Math.random() - 0.5);

    const [cards, setCards] = useState(initialCards.map(c => ({ ...c, flipped: false, matched: false })));
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

    const handleCardClick = (index: number) => {
        if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) return;

        const newCards = [...cards];
        newCards[index].flipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            const c1 = newCards[newFlipped[0]];
            const c2 = newCards[newFlipped[1]];

            if (c1.emoji === c2.emoji) {
                c1.matched = true;
                c2.matched = true;
                setFlippedIndices([]);
            } else {
                setTimeout(() => {
                    const resetCards = [...cards];
                    resetCards[newFlipped[0]].flipped = false;
                    resetCards[newFlipped[1]].flipped = false;
                    setCards(resetCards);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    const isWin = cards.every(c => c.matched);

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#151515] p-6 text-center">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-green mb-8">MIND OF THE NILE</h2>

            <div className="grid grid-cols-4 gap-4 max-w-sm w-full">
                {cards.map((card, i) => (
                    <motion.button
                        key={i}
                        className={`aspect-square rounded-xl text-4xl flex items-center justify-center border-2 transition-colors ${card.flipped || card.matched ? 'bg-white border-white text-black' : 'bg-white/10 border-white/10 text-transparent'}`}
                        onClick={() => handleCardClick(i)}
                        whileTap={{ scale: 0.9 }}
                        animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                    >
                        <div style={{ transform: 'rotateY(180deg)' }}>
                            {(card.flipped || card.matched) ? card.emoji : '?'}
                        </div>
                    </motion.button>
                ))}
            </div>

            {isWin && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 p-4 bg-accent-gold text-black rounded-xl font-bold"
                >
                    Memory Master! 🧠
                    <button className="block mt-2 text-sm underline opacity-70" onClick={() => window.location.reload()}>Play Again</button>
                </motion.div>
            )}
        </div>
    );
}

// --- Main Games Hub ---
const GamesPage: React.FC = () => {
    const [activeGame, setActiveGame] = useState<GameType | null>(null);

    if (activeGame === 'draw') return <DrawSobekGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'quest') return <SobekQuestGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame(null)} />;

    return (
        <div className="min-h-screen bg-nearblack pt-24 pb-32 px-6 overflow-hidden relative">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
                    ARCADE <span className="text-accent-gold">SOBEK</span>
                </h1>
                <p className="text-xl text-white/60 mb-16">
                    Play, Explore, and Challenge the Gods.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Game Card 1 */}
                    <motion.button
                        onClick={() => setActiveGame('draw')}
                        whileHover={{ y: -10 }}
                        className="group relative h-64 rounded-3xl overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black opacity-80" />
                        <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h3 className="text-3xl font-black text-white mb-2">DRAW SOBEK</h3>
                            <p className="text-white/60 text-sm">Connect the stars.<br />Create the legend.</p>
                        </div>
                    </motion.button>

                    {/* Game Card 2 */}
                    <motion.button
                        onClick={() => setActiveGame('quest')}
                        whileHover={{ y: -10 }}
                        className="group relative h-64 rounded-3xl overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black opacity-80" />
                        <img src="https://images.unsplash.com/photo-1544377045-81640523e3cb?q=80&w=2072&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h3 className="text-3xl font-black text-white mb-2">SOBEK QUEST</h3>
                            <p className="text-white/60 text-sm">A choice-based<br />Nile adventure.</p>
                        </div>
                    </motion.button>

                    {/* Game Card 3 */}
                    <motion.button
                        onClick={() => setActiveGame('memory')}
                        whileHover={{ y: -10 }}
                        className="group relative h-64 rounded-3xl overflow-hidden text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-black opacity-80" />
                        <img src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <h3 className="text-3xl font-black text-white mb-2">MEMORY</h3>
                            <p className="text-white/60 text-sm">Train your brain.<br />Master the symbols.</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
