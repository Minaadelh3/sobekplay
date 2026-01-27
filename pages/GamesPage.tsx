import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGameCard, GameCard } from '../services/gameAI';

// --- CONFIG ---
const UX = {
    loading: "ثانية كده بنفكر 🤔",
    newCard: "كارت جديد 🎴",
    retry: "نجرب تاني 🔄",
    timeUp: "فرقعت 💥",
    passPhone: "ادي الموبايل للي جنبك 📱",
};

// Map Internal keys to Display Names (if needed) or use Display Names directly
const MODES = {
    PASS_BOOM: "عدّيها 💣",
    TRUTH_DARE: "قول ولا تفوّت؟ 😏",
    EMOJI_MOVIES: "فيلم بالإيموجي 🎬",
    PROVERBS: "كمّلها بقى…",
    STORY_CHAIN: "حدوتة على الطاير ✨"
};

const CATEGORIES: Record<string, string[]> = {
    [MODES.PASS_BOOM]: ['عام', 'أفلام', 'أغاني', 'تاريخ', 'جغرافيا', 'ضحك'],
    [MODES.TRUTH_DARE]: ['خفيف', 'جرأة', 'عميق', 'ضحك', 'مواقف'],
    [MODES.EMOJI_MOVIES]: ['أفلام مصري', 'أفلام أجنبي', 'مسرحيات', 'كرتون'],
    [MODES.PROVERBS]: ['أمثال قديمة', 'أمثال شعبية', 'حكم'],
    [MODES.STORY_CHAIN]: ['خيال', 'رعب كوميدي', 'مغامرة', 'جريمة']
};

const TIMERS = [10, 20, 30, 45, 60];

// --- COMPONENTS ---

const LoadingCard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
        <div className="text-4xl mb-4 animate-bounce">🤔</div>
        <div className="text-white/60 font-bold font-arabic text-xl">{UX.loading}</div>
    </motion.div>
);

const ErrorCard = ({ onRetry }: { onRetry: () => void }) => (
    <div className="text-center p-8 bg-red-900/20 rounded-3xl border border-red-500/30">
        <div className="text-4xl mb-4">😅</div>
        <div className="text-white font-bold font-arabic mb-4">الذكاء الاصطناعي مهنج شوية</div>
        <button onClick={onRetry} className="px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg">{UX.retry}</button>
    </div>
);

// --- ACTIVE GAME VIEW ---
const ActiveGame = ({ mode, settings, onExit }: { mode: string, settings: any, onExit: () => void }) => {
    const [card, setCard] = useState<GameCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(settings.timer);
    const [active, setActive] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [boom, setBoom] = useState(false);

    const loadNewCard = async () => {
        setLoading(true);
        setBoom(false);
        setRevealed(false);
        setActive(false);

        try {
            const newCard = await generateGameCard(mode, settings.category, settings.timer, 2, history); // Difficulty 2 default
            if (newCard) {
                setCard(newCard);
                setHistory(h => [...h, newCard.text].slice(-20));
                setTimer(settings.timer);
                setActive(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadNewCard(); }, []);

    // Timer Logic
    useEffect(() => {
        if (!active || timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    setActive(false);
                    setBoom(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [active, timer]);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center bg-[#0a0a0a] transition-colors duration-500 ${boom ? 'bg-red-900' : ''}`}>

            {/* Header */}
            <div className="w-full p-6 flex justify-between items-center z-10">
                <button onClick={onExit} className="text-white/60 font-bold font-arabic">❌ خروج</button>
                <div className="px-4 py-1 bg-white/10 rounded-full text-sm font-arabic text-white/80">{mode}</div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6">

                {boom ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} className="text-center">
                        <div className="text-9xl mb-4">💥</div>
                        <h1 className="text-6xl font-black text-white font-arabic mb-4">{UX.timeUp}</h1>
                        <button onClick={loadNewCard} className="px-8 py-3 bg-white text-black font-bold font-arabic rounded-full mt-8 shadow-xl">
                            {UX.passPhone}
                        </button>
                    </motion.div>
                ) : loading ? (
                    <LoadingCard />
                ) : card ? (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="w-full bg-gradient-to-b from-gray-800 to-black p-8 rounded-[40px] border border-white/10 shadow-2xl min-h-[400px] flex flex-col items-center text-center relative"
                    >
                        {/* Timer */}
                        {settings.timer > 0 && (
                            <div className={`absolute -top-8 bg-white text-black w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black shadow-lg z-20 ${timer <= 5 ? 'bg-red-500 text-white animate-pulse' : ''}`}>
                                {timer}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col justify-center items-center w-full pt-8">
                            {card.emoji && <div className="text-8xl mb-6">{card.emoji}</div>}

                            <h3 className="text-3xl md:text-5xl font-bold text-white font-arabic leading-relaxed mb-8" dir="rtl">
                                {card.text}
                            </h3>

                            {/* Answer Reveal */}
                            {(card.answer || card.type === 'PROVERB' || mode.includes('فيلم')) && (
                                <div className="w-full mt-auto">
                                    {!revealed ? (
                                        <button onClick={() => setRevealed(true)} className="text-white/40 text-sm font-arabic underline p-2">عرض الإجابة</button>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-900/40 p-4 rounded-xl text-green-400 font-bold font-arabic text-xl border border-green-500/20">
                                            {card.answer}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <ErrorCard onRetry={loadNewCard} />
                )}

            </div>

            {/* Footer Controls */}
            {!loading && !boom && (
                <div className="w-full max-w-md p-6 pb-12">
                    <button onClick={loadNewCard} className="w-full py-5 bg-accent-gold text-black font-black font-arabic text-2xl rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-transform">
                        {UX.newCard}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- GAME HUB ---
const GamesPage = () => {
    const [view, setView] = useState<'HUB' | 'LOBBY' | 'GAME'>('HUB');
    const [selection, setSelection] = useState<string | null>(null);
    const [lobbyState, setLobbyState] = useState({ category: 'عام', timer: 0 });

    const handleSelect = (mode: string) => {
        setSelection(mode);
        setLobbyState({ category: CATEGORIES[mode]?.[0] || 'عام', timer: mode === MODES.PASS_BOOM ? 30 : 0 });
        setView('LOBBY');
    };

    return (
        <div className="min-h-screen bg-nearblack font-sans text-white pb-24" dir="rtl">
            {view === 'HUB' && (
                <div className="max-w-6xl mx-auto pt-24 px-4">
                    <h1 className="text-4xl font-black text-white font-arabic mb-2 text-center">سوبيك جيمز 🐊</h1>
                    <p className="text-white/60 text-center font-arabic mb-12">قعدة ونيسة.. بالذكاء الاصطناعي</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <HubCard title={MODES.PASS_BOOM} icon="💣" desc="بسرعة قبل ما تفرقع!" onClick={() => handleSelect(MODES.PASS_BOOM)} color="from-red-900 via-red-950 to-black" />
                        <HubCard title={MODES.TRUTH_DARE} icon="😏" desc="أسئلة وتحديات" onClick={() => handleSelect(MODES.TRUTH_DARE)} color="from-blue-900 via-blue-950 to-black" />
                        <HubCard title={MODES.EMOJI_MOVIES} icon="🎬" desc="خمن الفيلم" onClick={() => handleSelect(MODES.EMOJI_MOVIES)} color="from-purple-900 via-purple-950 to-black" />
                        <HubCard title={MODES.PROVERBS} icon="🗣️" desc="كمّل المثل" onClick={() => handleSelect(MODES.PROVERBS)} color="from-green-900 via-green-950 to-black" />
                        <HubCard title={MODES.STORY_CHAIN} icon="✨" desc="ألف قصة" onClick={() => handleSelect(MODES.STORY_CHAIN)} color="from-indigo-900 via-indigo-950 to-black" />
                    </div>
                </div>
            )}

            {view === 'LOBBY' && selection && (
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
                    <h2 className="text-3xl font-black mb-8 font-arabic">{selection}</h2>

                    <div className="w-full max-w-sm space-y-8 mb-12">
                        <div>
                            <label className="block text-white/50 font-bold font-arabic mb-4">هنتكلم في إيه؟</label>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {CATEGORIES[selection]?.map(c => (
                                    <button key={c} onClick={() => setLobbyState({ ...lobbyState, category: c })} className={`px-4 py-2 rounded-full border ${lobbyState.category === c ? 'bg-white text-black border-white' : 'border-white/20'}`}>{c}</button>
                                ))}
                            </div>
                        </div>

                        {selection === MODES.PASS_BOOM && (
                            <div>
                                <label className="block text-white/50 font-bold font-arabic mb-4">الوقت (ثواني)</label>
                                <div className="flex gap-2 justify-center">
                                    {TIMERS.map(t => (
                                        <button key={t} onClick={() => setLobbyState({ ...lobbyState, timer: t })} className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold ${lobbyState.timer === t ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full max-w-sm">
                        <button onClick={() => setView('HUB')} className="flex-1 py-3 border border-white/20 rounded-xl font-bold font-arabic">رجوع</button>
                        <button onClick={() => setView('GAME')} className="flex-[2] py-3 bg-white text-black rounded-xl font-black font-arabic shadow-lg">يلا بينا 🚀</button>
                    </div>
                </div>
            )}

            {view === 'GAME' && selection && (
                <ActiveGame mode={selection} settings={lobbyState} onExit={() => setView('HUB')} />
            )}
        </div>
    );
};

const HubCard = ({ title, icon, desc, onClick, color }: any) => (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} className={`bg-gradient-to-br ${color} p-8 rounded-3xl border border-white/10 cursor-pointer shadow-lg min-h-[160px] flex flex-col justify-center relative overflow-hidden`}>
        <div className="absolute right-6 top-6 text-5xl opacity-20">{icon}</div>
        <div className="text-4xl mb-4 relative z-10">{icon}</div>
        <h3 className="text-2xl font-black text-white font-arabic mb-1 relative z-10">{title}</h3>
        <p className="text-white/60 font-arabic relative z-10">{desc}</p>
    </motion.div>
);

export default GamesPage;
