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
    start: "يلا بينا 🚀",
    categories: "هنتكلم في إيه؟",
    timer: "وقت الجولة",
    intensity: "مود اللعب",
    back: "رجوع",
    exit: "خروج",
    reveal: "وريني الحل 👀",
    answer: "الحل هو:"
};

const CATEGORIES = {
    'عدّيها 💣': ['عام', 'أفلام', 'أغاني', 'تاريخ', 'جغرافيا', 'ضحك'],
    'قول ولا تفوّت؟ 😏': ['خفيف', 'جرأة', 'عميق', 'ضحك', 'مواقف'],
    'فيلم بالإيموجي 🎬': ['أفلام مصري', 'أفلام أجنبي', 'مسرحيات', 'كرتون'],
    'كمّلها بقى…': ['أمثال قديمة', 'أمثال شعبية', 'حكم'],
    'حدوتة على الطاير ✨': ['خيال', 'رعب كوميدي', 'مغامرة', 'جريمة']
};
const TIMERS = [10, 20, 30, 45, 60];

// --- COMPONENTS ---

const GameHub = ({ onSelect }: { onSelect: (mode: string) => void }) => (
    <div className="max-w-6xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 font-arabic">سوبيك جيمز 🐊</h1>
            <p className="text-white/60 text-xl font-arabic">الليلة هنلعب إيه؟</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 px-4 pb-32">
            <HubCard title="عدّيها 💣" desc="بسرعة قبل ما تفرقع في وشك" color="from-red-900 to-black" icon="⏱️" onClick={() => onSelect('عدّيها 💣')} />
            <HubCard title="قول ولا تفوّت؟ 😏" desc="أسئلة وتحديات من اللي هي" color="from-blue-900 to-black" icon="🎲" onClick={() => onSelect('قول ولا تفوّت؟ 😏')} />
            <HubCard title="فيلم بالإيموجي 🎬" desc="خمن الفيلم من الرموز" color="from-purple-900 to-black" icon="🧩" onClick={() => onSelect('فيلم بالإيموجي 🎬')} />
            <HubCard title="كمّلها بقى…" desc="يا ترى حافظ أمثال جدودك؟" color="from-green-900 to-black" icon="📜" onClick={() => onSelect('كمّلها بقى…')} />
            <HubCard title="حدوتة على الطاير ✨" desc="كل واحد كلمة والحكاية تكبر" color="from-indigo-900 to-black" icon="🧙‍♂️" onClick={() => onSelect('حدوتة على الطاير ✨')} />
        </div>
    </div>
);

const HubCard = ({ title, desc, color, icon, onClick }: any) => (
    <motion.div
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
        className={`bg-gradient-to-br ${color} border border-white/10 p-8 rounded-3xl cursor-pointer shadow-lg relative overflow-hidden min-h-[220px] flex flex-col justify-center`}
    >
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-3xl font-black text-white mb-2 font-arabic">{title}</h3>
        <p className="text-white/70 font-arabic text-lg">{desc}</p>
    </motion.div>
);

const GameLobby = ({ mode, onStart, onBack }: { mode: string, onStart: (s: any) => void, onBack: () => void }) => {
    const [cat, setCat] = useState((CATEGORIES as any)[mode]?.[0] || 'عام');
    const [time, setTime] = useState(mode === 'عدّيها 💣' ? 30 : 0);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center text-white font-arabic">
            <h2 className="text-4xl font-black mb-12">{mode}</h2>
            <div className="w-full max-w-md space-y-8 mb-12">
                <div>
                    <label className="block text-white/50 mb-4 text-lg font-bold">{UX.categories}</label>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {(CATEGORIES as any)[mode]?.map((c: string) => (
                            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full border transition-all ${cat === c ? 'bg-white text-black border-white' : 'bg-transparent border-white/20 text-white/60'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
                {mode === 'عدّيها 💣' && (
                    <div>
                        <label className="block text-white/50 mb-4 text-lg font-bold">{UX.timer}</label>
                        <div className="flex gap-2 justify-center">
                            {TIMERS.map(t => (
                                <button key={t} onClick={() => setTime(t)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold ${time === t ? 'bg-red-500 border-red-500' : 'border-white/20'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex gap-4 w-full max-w-md">
                <button onClick={onBack} className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/10">{UX.back}</button>
                <button onClick={() => onStart({ category: cat, timer: time })} className="flex-[2] py-4 bg-white text-black rounded-xl font-black text-xl shadow-lg hover:scale-105 transition-transform">
                    {UX.start}
                </button>
            </div>
        </div>
    );
};

const ActiveGame = ({ mode, settings, onExit }: { mode: string, settings: any, onExit: () => void }) => {
    const [card, setCard] = useState<GameCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<string[]>([]);
    const [timer, setTimer] = useState(settings.timer);
    const [active, setActive] = useState(false);
    const [boom, setBoom] = useState(false);
    const [revealed, setRevealed] = useState(false);

    const fetchCard = async () => {
        setLoading(true);
        setBoom(false);
        setRevealed(false);
        setActive(false);
        const newCard = await generateGameCard(mode, settings.category, settings.timer, 2, history);

        if (newCard) {
            setCard(newCard);
            setHistory(h => [...h, newCard.text].slice(-20));
            setTimer(settings.timer);
            setActive(true);
        }
        setLoading(false);
    };

    useEffect(() => { fetchCard(); }, []);

    useEffect(() => {
        if (!active || timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) { setActive(false); setBoom(true); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [active, timer]);

    return (
        <div className={`min-h-screen pt-20 px-4 flex flex-col items-center relative transition-colors duration-500 ${boom ? 'bg-red-900' : 'bg-[#0a0a0a]'}`}>
            <div className="w-full max-w-md flex justify-between items-center mb-8">
                <button onClick={onExit} className="text-white/50 hover:text-white font-arabic">❌ {UX.exit}</button>
                <div className="text-white/50 font-arabic text-sm px-3 py-1 bg-white/5 rounded-full">{settings.category}</div>
            </div>

            <div className="flex-1 w-full max-w-md flex flex-col justify-center items-center">
                {loading ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <span className="text-6xl mb-4">🤔</span>
                        <span className="text-white/50 font-arabic text-xl">{UX.loading}</span>
                    </div>
                ) : boom ? (
                    <div className="text-center animate-bounce">
                        <span className="text-9xl block mb-4">💥</span>
                        <h2 className="text-6xl font-black text-white font-arabic">{UX.timeUp}</h2>
                        <button onClick={fetchCard} className="mt-8 px-8 py-3 bg-white text-black font-bold font-arabic rounded-full">{UX.retry}</button>
                    </div>
                ) : card ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-full bg-gradient-to-b from-gray-800 to-black p-8 rounded-[40px] border border-white/10 shadow-2xl min-h-[400px] flex flex-col items-center text-center relative"
                    >
                        {settings.timer > 0 && (
                            <div className={`absolute -top-6 bg-white text-black w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-lg shadow-red-500/20 ${timer <= 5 ? 'animate-ping bg-red-500 text-white' : ''}`}>
                                {timer}
                            </div>
                        )}
                        <div className="flex-1 flex flex-col justify-center items-center w-full">
                            {card.emoji && <div className="text-7xl mb-6">{card.emoji}</div>}
                            <h3 className="text-2xl md:text-3xl font-bold text-white font-arabic leading-relaxed mb-6" dir="rtl">{card.text}</h3>
                            {(card.answer || card.type === 'PROVERB') && (
                                <div className="mt-4">
                                    {!revealed ? (
                                        <button onClick={() => setRevealed(true)} className="text-white/40 text-sm font-arabic underline">{UX.reveal}</button>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-900/40 p-4 rounded-xl text-green-400 font-bold font-arabic">
                                            {card.answer || "No Answer"}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center">
                        <p className="text-white/50 font-arabic mb-4">حصلت مشكلة بسيطة 😅</p>
                        <button onClick={fetchCard} className="px-6 py-2 bg-white/10 rounded-full">{UX.retry}</button>
                    </div>
                )}
            </div>

            {!loading && !boom && (
                <div className="w-full max-w-md pt-8 pb-12">
                    <button onClick={fetchCard} className="w-full py-4 bg-accent-gold text-black font-black font-arabic text-xl rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                        {UX.newCard}
                    </button>
                    {mode === 'عدّيها 💣' && timer <= 5 && <div className="text-center mt-2 text-white/30 text-sm">{UX.passPhone}</div>}
                </div>
            )}
        </div>
    );
};

const GamesPage: React.FC = () => {
    const [view, setView] = useState<'HUB' | 'LOBBY' | 'GAME'>('HUB');
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [gameSettings, setGameSettings] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
        if ((location.state as any)?.resetTab) {
            setView('HUB');
            setSelectedMode(null);
        }
    }, [location.state]);

    const handleSelect = (mode: string) => { setSelectedMode(mode); setView('LOBBY'); };
    const handleStart = (settings: any) => { setGameSettings(settings); setView('GAME'); };

    return (
        <div className="min-h-screen bg-nearblack font-sans text-white pb-32" dir="rtl">
            <AnimatePresence mode='wait'>
                {view === 'HUB' && <motion.div key="hub"><GameHub onSelect={handleSelect} /></motion.div>}
                {view === 'LOBBY' && selectedMode && <motion.div key="lobby"><GameLobby mode={selectedMode} onStart={handleStart} onBack={() => setView('HUB')} /></motion.div>}
                {view === 'GAME' && selectedMode && gameSettings && <motion.div key="game" className="fixed inset-0 z-50 bg-[#0a0a0a]"><ActiveGame mode={selectedMode} settings={gameSettings} onExit={() => setView('HUB')} /></motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default GamesPage;
