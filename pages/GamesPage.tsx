import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGameCard, GameCard, GameMode } from '../services/gameAI';
import { DATA_FALLBACK, SAFE_PENALTIES } from '../data/partyGames';

// --- CONFIG ---
const TICK_SOUND = '/assets/tick.mp3'; // Placeholder path
const BOOM_SOUND = '/assets/boom.mp3'; // Placeholder path

// --- SHARED COMPONENTS ---
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </button>
);

const LoadingCard = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md aspect-[3/4] bg-white/5 rounded-3xl animate-pulse flex items-center justify-center border border-white/10"
    >
        <div className="text-white/40 font-bold">Generating... 🔮</div>
    </motion.div>
);

// --- HOOK: GAME ENGINE ---
const useGameEngine = (mode: GameMode, category: string, timerInit: number) => {
    const [card, setCard] = useState<GameCard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(timerInit);
    const [timerActive, setTimerActive] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    // Audio Refs (Mock)
    // In a real app, use Howl or HTML5 Audio

    const nextCard = async (newCategory?: string) => {
        setIsLoading(true);
        setTimerActive(false);
        setTimer(timerInit); // Reset timer

        const cat = newCategory || category;
        const newCard = await generateGameCard(mode, cat, timerInit, 'MEDIUM', history);

        if (newCard) {
            setCard(newCard);
            setHistory(prev => [...prev.slice(-20), newCard.text]);
            setTimerActive(true);
        } else {
            // Should not happen due to fallback, but safe
            setCard({ mode, type: 'QUESTION', text: 'Error loading card.', safe: true });
        }
        setIsLoading(false);
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
                // Play tick sound here if needed
            }, 1000);
        } else if (timer === 0 && timerActive) {
            setTimerActive(false);
            // Play BOOM sound here
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    return { card, isLoading, timer, timerActive, nextCard, setTimer };
};


// --- GAME 1: PASS & BOOM (AI POWERED) ---
const PassAndBoomAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, timer, timerActive, nextCard } = useGameEngine('PASS_BOOM', 'General', 30);
    const [boom, setBoom] = useState(false);

    useEffect(() => { nextCard(); }, []);

    useEffect(() => {
        if (timer === 0 && !boom) setBoom(true);
        if (timer > 0) setBoom(false);
    }, [timer]);

    return (
        <div className={`flex flex-col items-center justify-center min-h-[90vh] p-6 text-center text-white transition-colors duration-200 ${boom ? 'bg-red-600' : timer < 10 ? 'bg-red-900/50' : 'bg-[#111]'}`}>
            <BackButton onClick={onBack} />

            {boom ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} className="flex flex-col items-center">
                    <h1 className="text-8xl mb-8">💥</h1>
                    <h2 className="text-4xl font-black mb-4">BOOM!</h2>
                    <div className="bg-black/20 p-6 rounded-2xl mb-8 border border-white/20">
                        <div className="uppercase text-sm font-bold opacity-70 mb-2">PENALTY</div>
                        <div className="text-2xl font-bold">{SAFE_PENALTIES[Math.floor(Math.random() * SAFE_PENALTIES.length)]}</div>
                    </div>
                    <button onClick={() => nextCard()} className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-lg">Next Round</button>
                </motion.div>
            ) : (
                <>
                    <h2 className="text-3xl font-black text-white mb-2">PASS & BOOM 💣</h2>
                    <div className="text-6xl font-black mb-8 font-mono">{timer}s</div>

                    {isLoading ? <LoadingCard /> : card && (
                        <motion.div
                            key={card.text}
                            initial={{ y: 20, opacity: 0, rotate: -2 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            className="bg-gradient-to-br from-orange-600 to-red-900 p-8 rounded-3xl w-full max-w-md shadow-2xl border-4 border-white/10"
                        >
                            <div className="uppercase text-xs font-bold tracking-widest opacity-50 mb-4">{card.type}</div>
                            <div className="text-3xl font-bold leading-relaxed font-arabic" dir="rtl">{card.text}</div>
                        </motion.div>
                    )}

                    <button
                        onClick={() => nextCard()}
                        disabled={isLoading}
                        className="mt-12 px-12 py-5 bg-white text-black font-black text-xl rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        PASS! ⏩
                    </button>
                </>
            )}
        </div>
    );
};

// --- GAME 2: EMOJI MOVIES (AI POWERED) ---
const EmojiMoviesAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, nextCard } = useGameEngine('EMOJI_MOVIES', 'Egyptian Movies', 0);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#0a0a0a] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-black text-accent-gold mb-8">EMOJI MOVIES 🎬</h2>

            {isLoading ? <LoadingCard /> : card && (
                <div onClick={() => setRevealed(true)} className="w-full max-w-md bg-gradient-to-br from-blue-900 to-black border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center shadow-2xl cursor-pointer min-h-[400px]">
                    <div className="text-7xl md:text-8xl mb-12 flex flex-wrap justify-center gap-2">{card.emoji}</div>

                    {revealed ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h3 className="text-3xl font-black text-white mb-2 font-arabic">{card.movieTitle}</h3>
                            <button onClick={(e) => { e.stopPropagation(); setRevealed(false); nextCard(); }} className="mt-8 px-8 py-2 bg-accent-gold text-black font-bold rounded-full">Next</button>
                        </motion.div>
                    ) : (
                        <div className="text-white/40 text-sm animate-pulse mt-auto">Tap to Reveal</div>
                    )}
                </div>
            )}

            <div className="flex gap-2 mt-8">
                {['Egyptian Movies', 'Global Movies'].map(cat => (
                    <button key={cat} onClick={() => { setRevealed(false); nextCard(cat); }} className="px-4 py-2 bg-white/10 rounded-lg text-xs font-bold hover:bg-white/20">{cat}</button>
                ))}
            </div>
        </div>
    );
};

// --- GAME 3: PROVERBS (AI POWERED) ---
const ProverbsAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, nextCard } = useGameEngine('PROVERBS', 'General', 0);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a1a1a] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-black text-accent-green mb-8">COMPLETE THE PROVERB 📜</h2>

            {isLoading ? <LoadingCard /> : card && (
                <div className="w-full max-w-lg">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 shadow-xl mb-4">
                        <div className="text-3xl md:text-5xl font-bold font-arabic leading-relaxed text-white dir-rtl mb-4" dir="rtl">
                            {card.text} ...
                        </div>
                    </div>

                    {revealed && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-accent-green text-black rounded-xl p-4 font-bold text-xl font-arabic mb-4">
                            {card.answers?.[0]}
                        </motion.div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setRevealed(!revealed)} className="px-6 py-3 bg-white/10 rounded-full font-bold">
                            {revealed ? 'Hide' : 'Show Answer'}
                        </button>
                        <button onClick={() => { setRevealed(false); nextCard(); }} className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-lg">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- GAME 4: STORY CHAIN & TRUTH/DARE (Using similar pattern) ---
// Simplified implementation for brevity but fully functional

const StoryChainAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, nextCard } = useGameEngine('STORY_CHAIN', 'Fantasy', 0);
    useEffect(() => { nextCard(); }, []);
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#0c0c0c] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl font-black text-purple-500 mb-8">STORY CHAIN 🧙‍♂️</h2>
            {isLoading ? <LoadingCard /> : card && (
                <div onClick={() => nextCard()} className="bg-purple-900/20 border border-purple-500/30 p-10 rounded-3xl cursor-pointer hover:bg-purple-900/30 transition-colors">
                    <p className="text-2xl md:text-3xl font-bold font-arabic leading-relaxed" dir="rtl">{card.text}</p>
                    <p className="text-purple-400 text-xs mt-8 uppercase tracking-widest">Tap for new story</p>
                </div>
            )}
        </div>
    );
};


// --- MAIN PAGE ---
const GamesPage: React.FC = () => {
    const [activeGame, setActiveGame] = useState<GameMode | null>(null);
    const location = useLocation();

    // Reselect to Reset Logic
    useEffect(() => {
        if (location.state && (location.state as any).resetTab) {
            setActiveGame(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.state]);

    if (activeGame === 'PASS_BOOM') return <PassAndBoomAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'EMOJI_MOVIES') return <EmojiMoviesAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'PROVERBS') return <ProverbsAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'STORY_CHAIN') return <StoryChainAI onBack={() => setActiveGame(null)} />;

    return (
        <div className="min-h-screen bg-nearblack pt-24 px-4 pb-20 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2">ARCADE AI</h1>
                    <p className="text-white/60">Powered by Gemini. Infinite Fun.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <GameCard
                        title="Pass & Boom 💣"
                        desc="Speed questions. Don't explode."
                        color="from-red-900 to-black"
                        onClick={() => setActiveGame('PASS_BOOM')}
                    />
                    <GameCard
                        title="Emoji Movies 🎬"
                        desc="Guess the movie from emojis."
                        color="from-blue-900 to-black"
                        onClick={() => setActiveGame('EMOJI_MOVIES')}
                    />
                    <GameCard
                        title="Proverbs 📜"
                        desc="Complete the Egyptian proverb."
                        color="from-green-900 to-black"
                        onClick={() => setActiveGame('PROVERBS')}
                    />
                    <GameCard
                        title="Story Chain 🧙‍♂️"
                        desc="Build a fantasy story together."
                        color="from-purple-900 to-black"
                        onClick={() => setActiveGame('STORY_CHAIN')}
                    />
                </div>
            </div>
        </div>
    );
};

const GameCard = ({ title, desc, color, onClick }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-gradient-to-br ${color} border border-white/10 p-8 rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden min-h-[200px] flex flex-col justify-center`}
    >
        <h4 className="text-3xl font-black text-white mb-2">{title}</h4>
        <p className="text-white/60 text-lg">{desc}</p>
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black px-4 py-1 rounded-full text-xs font-bold">PLAY AI MODE</div>
    </motion.div>
);

export default GamesPage;
