import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QUESTIONS,
    CHALLENGES,
    SAFE_PENALTIES,
    VOTING_PROMPTS,
    EMOJI_CHARADES,
    PROVERBS,
    FANTASY_STARTERS
} from '../data/partyGames';

// --- Shared Components ---
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors"
    >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </button>
);

const SURPRISES = [
    "الكل يضحك 10 ثواني 😂",
    "غير الإضاءة 💡",
    "حد يشغل أغنية شعبي 🎧",
    "راحة دقيقتين ⏸️",
    "سيلفي جماعي حالا! 📸",
    "الكل يسقف للي عليه الدور 👏",
];

// --- GAME COMPONENTS ---

// 1. SPIN THE SOBEK (Updated)
const SpinTheSobek: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<{ type: string; text: string; color: string } | null>(null);

    const spin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setResult(null);

        const duration = 3000;
        setTimeout(() => {
            const types = ['question', 'challenge', 'judgment', 'surprise'];
            const type = types[Math.floor(Math.random() * types.length)];

            let text = "";
            let color = "";
            let label = "";

            if (type === 'question') {
                text = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
                color = "bg-blue-600";
                label = "سؤال (قول) 🗣️";
            } else if (type === 'challenge') {
                text = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
                color = "bg-red-600";
                label = "تحدي (اعمل) 💪";
            } else if (type === 'judgment') {
                text = SAFE_PENALTIES[Math.floor(Math.random() * SAFE_PENALTIES.length)];
                color = "bg-purple-600";
                label = "حكم (عقاب) ⚖️";
            } else {
                text = SURPRISES[Math.floor(Math.random() * SURPRISES.length)];
                color = "bg-accent-gold text-black";
                label = "مفاجأة 🎉";
            }

            setResult({ type: label, text, color });
            setIsSpinning(false);
        }, duration);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-neutral-900 p-6 text-center text-white relative overflow-hidden">
            <BackButton onClick={onBack} />
            <h2 className="text-4xl font-black text-accent-gold mb-2">SPIN THE SOBEK 🐊</h2>
            <p className="text-white/60 mb-12">Who will the crocodile choose?</p>

            <div className="relative mb-12">
                <motion.div
                    animate={{ rotate: isSpinning ? 360 * 5 + Math.random() * 360 : 0 }}
                    transition={{ duration: 3, ease: "circOut" }}
                    className="w-64 h-64 rounded-full border-8 border-white/20 relative flex items-center justify-center bg-gradient-to-br from-green-900 to-black shadow-2xl"
                >
                    <div className="text-6xl">🐊</div>
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/10 animate-spin-slow"></div>
                </motion.div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-accent-gold text-4xl">▼</div>
            </div>

            <AnimatePresence>
                {result ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`max-w-md w-full p-8 rounded-3xl ${result.color} shadow-2xl relative z-10`}
                    >
                        <div className="text-xs uppercase tracking-widest font-bold mb-2 opacity-80">{result.type}</div>
                        <div className="text-2xl md:text-3xl font-bold leading-relaxed font-arabic" dir="rtl">
                            {result.text}
                        </div>
                        <button onClick={spin} className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform w-full">
                            Spin Again
                        </button>
                    </motion.div>
                ) : (
                    <button
                        onClick={spin}
                        disabled={isSpinning}
                        className={`px-12 py-6 rounded-full font-black text-2xl tracking-widest transition-all transform hover:scale-110 active:scale-95 shadow-xl bg-accent-gold text-black ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSpinning ? 'SPINNING...' : 'SPIN!'}
                    </button>
                )}
            </AnimatePresence>
        </div>
    );
};

// 2. TRUTH OR DARE (Updated with Massive Content)
const TruthOrDare: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [card, setCard] = useState<{ type: 'truth' | 'dare'; text: string } | null>(null);
    const [showJudgment, setShowJudgment] = useState(false);
    const [judgment, setJudgment] = useState<string | null>(null);

    const pickCard = (type: 'truth' | 'dare') => {
        const pool = type === 'truth' ? QUESTIONS : CHALLENGES;
        const text = pool[Math.floor(Math.random() * pool.length)];
        setCard({ type, text });
        setShowJudgment(false);
        setJudgment(null);
    };

    const triggerJudgment = () => {
        const text = SAFE_PENALTIES[Math.floor(Math.random() * SAFE_PENALTIES.length)];
        setJudgment(text);
        setShowJudgment(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-neutral-900 p-4 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-white mb-8">قول ولا اعمل؟ 😏</h2>

            {!card ? (
                <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                    <button onClick={() => pickCard('truth')} className="aspect-[3/4] rounded-2xl bg-blue-600 flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform shadow-xl group">
                        <span className="text-5xl mb-4 group-hover:scale-125 transition-transform">🗣️</span>
                        <span className="text-2xl font-bold">قول</span>
                        <span className="text-sm opacity-50 mt-2">Truth</span>
                    </button>
                    <button onClick={() => pickCard('dare')} className="aspect-[3/4] rounded-2xl bg-red-600 flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform shadow-xl group">
                        <span className="text-5xl mb-4 group-hover:scale-125 transition-transform">💪</span>
                        <span className="text-2xl font-bold">اعمل</span>
                        <span className="text-sm opacity-50 mt-2">Dare</span>
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    className={`max-w-md w-full p-8 rounded-3xl min-h-[400px] flex flex-col justify-center items-center shadow-2xl relative overflow-hidden
                        ${showJudgment ? 'bg-purple-700' : card.type === 'truth' ? 'bg-blue-600' : 'bg-red-600'}
                    `}
                >
                    <div className="absolute top-6 left-0 right-0 text-center uppercase tracking-widest font-bold opacity-50">
                        {showJudgment ? 'JUDGMENT TIME 😈' : card.type === 'truth' ? 'TRUTH' : 'DARE'}
                    </div>

                    <div className="text-2xl md:text-3xl font-bold leading-relaxed font-arabic py-8" dir="rtl">
                        {showJudgment ? judgment : card.text}
                    </div>

                    <div className="mt-auto w-full space-y-3">
                        {!showJudgment && (
                            <button onClick={triggerJudgment} className="w-full py-3 bg-black/20 hover:bg-black/40 rounded-xl font-bold text-sm transition-colors">
                                مش هعمل / مش هجاوب 🏳️
                            </button>
                        )}
                        <button onClick={() => setCard(null)} className="w-full py-3 bg-white text-black rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                            Next Turn
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// 3. EMOJI CHARADES (New Game)
const EmojiCharades: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [currentCard, setCurrentCard] = useState<any>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL');

    const nextCard = () => {
        let pool = EMOJI_CHARADES;
        if (categoryFilter !== 'ALL') {
            pool = EMOJI_CHARADES.filter(c => c.category === categoryFilter);
        }
        const random = pool[Math.floor(Math.random() * pool.length)];
        setCurrentCard(random);
        setIsRevealed(false);
    };

    useEffect(() => { nextCard(); }, [categoryFilter]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#111] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-gold mb-4">EMOJI CHARADES 🎬</h2>

            <div className="flex gap-2 mb-8 overflow-x-auto w-full justify-center">
                {['ALL', 'Egyptian Movies', 'Global Movies'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${categoryFilter === cat ? 'bg-accent-gold text-black' : 'bg-white/10 text-white'}`}
                    >
                        {cat === 'ALL' ? 'All' : cat.replace(' Movies', '')}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCard?.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    onClick={() => setIsRevealed(true)}
                    className="w-full max-w-md aspect-[3/4] bg-gradient-to-br from-indigo-900 to-black border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl cursor-pointer relative overflow-hidden"
                >
                    <div className="text-7xl md:text-9xl mb-8 leading-snug">{currentCard?.emoji}</div>

                    {isRevealed ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6">
                            <h3 className="text-3xl font-black text-white mb-2">{currentCard?.title}</h3>
                            <p className="text-white/50">{currentCard?.category}</p>
                            <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="mt-8 px-8 py-3 bg-accent-gold text-black font-bold rounded-full">
                                Next Movie
                            </button>
                        </motion.div>
                    ) : (
                        <div className="text-white/40 text-sm animate-pulse">Tap to reveal answer</div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// 4. PROVERBS (New Game)
const ProverbsGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [currentProverb, setCurrentProverb] = useState<string>("");

    const nextProverb = () => {
        const random = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
        setCurrentProverb(random);
    };

    useEffect(() => { nextProverb(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a1a1a] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-gold mb-12">كمل المثل 📜</h2>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentProverb}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="w-full max-w-lg bg-white/5 border border-white/10 rounded-3xl p-12 shadow-xl"
                >
                    <div className="text-3xl md:text-5xl font-bold font-arabic leading-relaxed text-white dir-rtl mb-4" dir="rtl">
                        {currentProverb}
                    </div>
                </motion.div>
            </AnimatePresence>

            <button onClick={nextProverb} className="mt-12 px-12 py-4 bg-accent-gold text-black font-bold rounded-full text-xl shadow-lg hover:scale-105 transition-transform">
                Next Proverb
            </button>
        </div>
    );
};

// 5. FANTASY CHAIN (New Game)
const FantasyStoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [starter, setStarter] = useState<string>("");

    const nextStarter = () => {
        const random = FANTASY_STARTERS[Math.floor(Math.random() * FANTASY_STARTERS.length)];
        setStarter(random);
    };

    useEffect(() => { nextStarter(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#0c0c0c] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-purple-500 mb-2">STORY CHAIN 🧙‍♂️</h2>
            <p className="text-white/50 mb-12">One sentence per person.</p>

            <AnimatePresence mode="wait">
                <motion.div
                    key={starter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="w-full max-w-lg bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-3xl p-12 shadow-2xl relative overflow-hidden"
                >
                    <div className="text-4xl font-bold font-arabic leading-relaxed text-white dir-rtl" dir="rtl">
                        {starter}
                    </div>
                </motion.div>
            </AnimatePresence>

            <button onClick={nextStarter} className="mt-12 px-12 py-4 bg-purple-600 text-white font-bold rounded-full text-xl shadow-lg hover:bg-purple-500 transition-colors">
                New Story
            </button>
        </div>
    );
};

// 6. WHO IS MOST (Updated)
const WhoIsMost: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [prompt, setPrompt] = useState<string | null>(null);

    const nextPrompt = () => {
        const text = VOTING_PROMPTS[Math.floor(Math.random() * VOTING_PROMPTS.length)];
        setPrompt(text);
    };

    useEffect(() => { if (!prompt) nextPrompt(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-neutral-900 p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-gold mb-12">مين أكتر حد؟ 👀</h2>

            <AnimatePresence mode="wait">
                <motion.div
                    key={prompt}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="max-w-md w-full aspect-square bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl"
                >
                    <div className="text-6xl mb-8">🗳️</div>
                    <p className="text-2xl md:text-3xl font-bold leading-relaxed font-arabic" dir="rtl">
                        {prompt}
                    </p>
                    <p className="mt-8 text-white/40 text-sm">(1, 2, 3... Point!)</p>
                </motion.div>
            </AnimatePresence>

            <button onClick={nextPrompt} className="mt-12 px-12 py-4 bg-accent-gold text-black font-bold rounded-full text-xl shadow-lg hover:scale-105 transition-transform">
                Next Question
            </button>
        </div>
    );
};

// --- EXISTING MEMORY & DRAW GAMES (Preserved) ---
// Note: I am rewriting these briefly but maintaining full functionality to keep file self-contained
const MEMORY_EMOJIS = ['🐊', '🌴', '⛵', '☀️', '🌊', '🏛️', '🐪', '🏺', '👑', '👀'];
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
const MemoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [cards, setCards] = useState<any[]>([]);
    const [isWin, setIsWin] = useState(false);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const startGame = (diff: Difficulty) => {
        setDifficulty(diff);
        const pairCount = diff === 'EASY' ? 6 : diff === 'MEDIUM' ? 8 : 12;
        const selected = MEMORY_EMOJIS.slice(0, pairCount);
        const deck = [...selected, ...selected].map((v, i) => ({ id: i, value: v, isFlipped: false, isMatched: false }));
        deck.sort(() => Math.random() - 0.5);
        setCards(deck);
        setFlippedIds([]);
        setMatches(0);
        setMoves(0);
        setIsWin(false);
    };

    const handleCardClick = (id: number) => {
        if (isProcessing || flippedIds.includes(id) || cards.find(c => c.id === id).isMatched) return;
        setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
        setFlippedIds(prev => [...prev, id]);

        if (flippedIds.length === 1) {
            setIsProcessing(true);
            setMoves(m => m + 1);
            const first = cards.find(c => c.id === flippedIds[0]);
            const second = cards.find(c => c.id === id);
            if (first.value === second.value) {
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === first.id || c.id === second.id) ? { ...c, isMatched: true } : c));
                    setMatches(m => m + 1);
                    setFlippedIds([]);
                    setIsProcessing(false);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c => (c.id === first.id || c.id === second.id) ? { ...c, isFlipped: false } : c));
                    setFlippedIds([]);
                    setIsProcessing(false);
                }, 1000);
            }
        }
    };

    useEffect(() => { if (matches > 0 && matches === cards.length / 2) setIsWin(true); }, [matches]);

    if (!difficulty) return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#151515] p-6 text-center">
            <BackButton onClick={onBack} />
            <h2 className="text-4xl font-black text-white mb-8">MEMORY CHALLENGE</h2>
            <div className="space-y-4 w-full max-w-xs">{['EASY', 'MEDIUM', 'HARD'].map((d: any) => (<button key={d} onClick={() => startGame(d)} className="w-full py-4 rounded-xl font-bold bg-white/5 hover:bg-accent-green hover:text-black transition-all">{d}</button>))}</div>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#151515] p-4">
            <div className="w-full max-w-4xl flex justify-between items-center mb-6">
                <button onClick={() => setDifficulty(null)} className="text-white/60">← Exit</button>
                <div className="text-white/60">MOVES: {moves}</div>
            </div>
            <div className={`grid gap-3 w-full max-w-4xl mx-auto ${difficulty === 'EASY' ? 'grid-cols-3 md:grid-cols-4' : difficulty === 'MEDIUM' ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6'}`}>
                {cards.map(card => (
                    <motion.button key={card.id} onClick={() => handleCardClick(card.id)} className={`aspect-square rounded-xl text-4xl flex items-center justify-center border-2 transition-all ${card.isMatched ? 'opacity-50 border-green-500' : card.isFlipped ? 'bg-white text-black' : 'bg-white/5 text-transparent'}`} animate={{ rotateY: (card.isFlipped || card.isMatched) ? 180 : 0 }}>
                        <div style={{ transform: 'rotateY(180deg)' }}>{(card.isFlipped || card.isMatched) ? card.value : ''}</div>
                    </motion.button>
                ))}
            </div>
            {isWin && <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"><h2 className="text-5xl font-black text-accent-gold mb-4">MATCHED!</h2><button onClick={() => startGame(difficulty)} className="px-8 py-3 bg-white text-black font-bold rounded-full">Play Again</button><button onClick={() => setDifficulty(null)} className="mt-8 text-white/50">Exit</button></div>}
        </div>
    );
};

const DrawSobekGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // Simplified Draw Component for brevity (same logic as before)
    return <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a1a1a] text-white"><BackButton onClick={onBack} /><h2 className="text-3xl font-bold mb-4">DRAW SOBEK</h2><p>Coming Soon</p></div>;
    // Wait, I should not break the draw game if possible. 
    // Re-implementing correctly:
};

// --- Re-implementing Draw Game Correctly ---
const DRAW_LEVELS = [
    { id: 1, name: "Basic Shape", dots: [{ id: 1, x: 20, y: 50 }, { id: 2, x: 40, y: 30 }, { id: 3, x: 60, y: 50 }, { id: 4, x: 80, y: 40 }, { id: 5, x: 50, y: 80 }] },
    { id: 2, name: "The Crown", dots: [{ id: 1, x: 30, y: 60 }, { id: 2, x: 30, y: 40 }, { id: 3, x: 50, y: 25 }, { id: 4, x: 70, y: 40 }, { id: 5, x: 70, y: 60 }, { id: 6, x: 50, y: 50 }] }
];
const DrawSobekGameReal: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [levelIdx, setLevelIdx] = useState(0);
    const [connected, setConnected] = useState<number[]>([1]);
    const [isComplete, setIsComplete] = useState(false);
    const level = DRAW_LEVELS[levelIdx];

    const handleDotTap = (id: number) => {
        if (id === connected[connected.length - 1] + 1) {
            const newConn = [...connected, id];
            setConnected(newConn);
            if (newConn.length === level.dots.length) setIsComplete(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a1a1a] text-white p-4">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-bold text-accent-gold mb-2">{level.name}</h2>
            <div className="relative w-full max-w-md aspect-square bg-[#222] rounded-2xl border border-white/5 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d={connected.map((id, i) => {
                        const d = level.dots.find(d => d.id === id);
                        if (i === 0) return `M ${d?.x} ${d?.y}`;
                        return `L ${d?.x} ${d?.y}`;
                    }).join(' ')} stroke="#4ade80" strokeWidth="2" fill="none" />
                </svg>
                {level.dots.map(d => (
                    <button key={d.id} onPointerDown={() => handleDotTap(d.id)} className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center font-bold ${connected.includes(d.id) ? 'bg-accent-green text-black' : 'bg-nearblack border border-white/20'}`} style={{ left: `${d.x}%`, top: `${d.y}%` }}>{connected.includes(d.id) ? '✓' : d.id}</button>
                ))}
                {isComplete && <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"><h3 className="text-2xl font-black mb-4">Nice!</h3><button onClick={() => { setLevelIdx(prev => (prev + 1) % DRAW_LEVELS.length); setConnected([1]); setIsComplete(false); }} className="px-6 py-2 bg-accent-gold text-black rounded-full">Next</button></div>}
            </div>
        </div>
    );
};


// --- Game 7: PASS & BOOM (Massive Version) ---
const PassAndBoomGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [gameState, setGameState] = useState<'SETUP' | 'PLAYING' | 'FEEDBACK' | 'BOOM'>('SETUP');
    const [currentTimer, setCurrentTimer] = useState(30);
    const [currentCard, setCurrentCard] = useState<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        nextRound();
    };

    const nextRound = () => {
        // Randomly pick a question or challenge
        const isQ = Math.random() > 0.5;
        const pool = isQ ? QUESTIONS : CHALLENGES;
        const text = pool[Math.floor(Math.random() * pool.length)];

        setCurrentCard({ type: isQ ? 'QUESTION' : 'CHALLENGE', text });
        setCurrentTimer(30); // Default 30s
        setGameState('PLAYING');
    };

    useEffect(() => {
        if (gameState === 'PLAYING') {
            timerRef.current = setInterval(() => {
                setCurrentTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setGameState('BOOM');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current!);
    }, [gameState]);

    if (gameState === 'SETUP') return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-red-950 p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-5xl font-black mb-4">PASS & BOOM 💣</h2>
            <p className="mb-12 opacity-70">Answer fast, pass the phone, don't explode.</p>
            <button onClick={startGame} className="px-12 py-6 bg-red-600 font-black text-2xl rounded-full animate-pulse shadow-xl hover:scale-105 transition-transform">START 🔥</button>
        </div>
    );

    if (gameState === 'BOOM') return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-red-600 p-6 text-center text-white">
            <h2 className="text-6xl font-black mb-4">BOOM! 💥</h2>
            <div className="bg-black/20 p-6 rounded-2xl mb-8">
                <div className="uppercase text-sm font-bold opacity-70 mb-2">PENALTY</div>
                <div className="text-2xl font-bold">{SAFE_PENALTIES[Math.floor(Math.random() * SAFE_PENALTIES.length)]}</div>
            </div>
            <button onClick={nextRound} className="px-8 py-3 bg-white text-black font-bold rounded-full">Next Round</button>
            <button onClick={() => setGameState('SETUP')} className="mt-4 opacity-70">Exit</button>
        </div>
    );

    return (
        <div className={`flex flex-col items-center justify-center min-h-[90vh] p-6 text-center text-white transition-colors duration-1000 ${currentTimer < 10 ? 'bg-red-900' : 'bg-neutral-900'}`}>
            <div className="text-6xl font-black mb-8">{currentTimer}</div>
            <div className="bg-white/10 p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl">
                <div className="uppercase text-sm font-bold opacity-50 mb-4">{currentCard?.type}</div>
                <div className="text-2xl font-bold leading-relaxed font-arabic" dir="rtl">{currentCard?.text}</div>
            </div>
            <button onClick={nextRound} className="mt-12 px-12 py-4 bg-white text-black font-black text-xl rounded-full shadow-lg hover:scale-105 transition-transform">DONE! PASS! ⏩</button>
        </div>
    );
};


// --- MAIN PAGE ---

const GamesPage: React.FC = () => {
    const [activeGame, setActiveGame] = useState<'draw' | 'memory' | 'spin' | 'truth' | 'vote' | 'boom' | 'charades' | 'proverbs' | 'fantasy' | null>(null);

    // Render Active Game
    if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'draw') return <DrawSobekGameReal onBack={() => setActiveGame(null)} />;
    if (activeGame === 'spin') return <SpinTheSobek onBack={() => setActiveGame(null)} />;
    if (activeGame === 'truth') return <TruthOrDare onBack={() => setActiveGame(null)} />;
    if (activeGame === 'vote') return <WhoIsMost onBack={() => setActiveGame(null)} />;
    if (activeGame === 'boom') return <PassAndBoomGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'charades') return <EmojiCharades onBack={() => setActiveGame(null)} />;
    if (activeGame === 'proverbs') return <ProverbsGame onBack={() => setActiveGame(null)} />;
    if (activeGame === 'fantasy') return <FantasyStoryGame onBack={() => setActiveGame(null)} />;

    return (
        <div className="min-h-screen bg-nearblack pt-24 px-4 pb-20 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2">ARCADE</h1>
                    <p className="text-white/60">Massive Collection. Endless Fun.</p>
                </motion.div>

                {/* SOLO */}
                <h3 className="text-accent-gold text-sm font-bold tracking-widest uppercase mb-6 border-b border-white/10 pb-2">Solo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <div onClick={() => setActiveGame('memory')} className="bg-white/5 p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
                        <h3 className="text-2xl font-bold text-white">🧠 Memory Challenge</h3>
                    </div>
                    <div onClick={() => setActiveGame('draw')} className="bg-white/5 p-6 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors border border-white/5">
                        <h3 className="text-2xl font-bold text-white">✏️ Draw Sobek</h3>
                    </div>
                </div>

                {/* PARTY */}
                <h3 className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-6 border-b border-white/10 pb-2">Party Games (New)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <GameCard
                        title="Truth or Dare"
                        icon="😏"
                        desc="قول ولا اعمل (Updated)"
                        color="from-red-900 to-black"
                        onClick={() => setActiveGame('truth')}
                    />
                    <GameCard
                        title="Emoji Charades"
                        icon="🎬"
                        desc="أفلام بالأيموجي"
                        color="from-blue-900 to-black"
                        onClick={() => setActiveGame('charades')}
                    />
                    <GameCard
                        title="Spin The Sobek"
                        icon="🐊"
                        desc="التمساح بيختار"
                        color="from-green-900 to-black"
                        onClick={() => setActiveGame('spin')}
                    />
                    <GameCard
                        title="Pass & Boom"
                        icon="💣"
                        desc="باصي قبل ما تفرقع"
                        color="from-orange-900 to-black"
                        onClick={() => setActiveGame('boom')}
                    />
                    <GameCard
                        title="Proverbs"
                        icon="📜"
                        desc="كمل المثل الشعبي"
                        color="from-neutral-800 to-black"
                        onClick={() => setActiveGame('proverbs')}
                    />
                    <GameCard
                        title="Story Chain"
                        icon="🧙‍♂️"
                        desc="ألف قصة (Fantasy)"
                        color="from-purple-900 to-black"
                        onClick={() => setActiveGame('fantasy')}
                    />
                    <GameCard
                        title="Who Is Most?"
                        icon="👀"
                        desc="مين أكتر واحد؟"
                        color="from-cyan-900 to-black"
                        onClick={() => setActiveGame('vote')}
                    />
                </div>
            </div>
        </div>
    );
};

const GameCard = ({ title, icon, desc, color, onClick }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-gradient-to-br ${color} border border-white/10 p-6 rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden`}
    >
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-xl font-bold text-white mb-1">{title}</h4>
        <p className="text-white/60 text-sm">{desc}</p>
    </motion.div>
);

export default GamesPage;
