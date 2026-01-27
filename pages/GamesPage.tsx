import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGameMessage, ChatMessage, AIResponse } from '../services/gameAI';

// --- CONFIG ---
const UX = {
    loading: "سوبيك بيظبط القعدة... 🐊",
    newCard: "كارت جديد 🎴",
    retry: "نجرب تاني 🔄",
    timeUp: "فرقعت 💥",
    passPhone: "ادي الموبايل للي جنبك 📱",
    placeholder: "اكتب ردك هنا...",
    send: "إرسال",
    difficulty: "الصعوبة (مستوى الشقاوة 😎)"
};

// Map Internal keys to Display Names
const MODES = {
    PASS_BOOM: "عدّيها 💣",
    TRUTH_DARE: "قول ولا تفوّت؟ 😏",
    EMOJI_MOVIES: "فيلم بالإيموجي 🎬",
    PROVERBS: "كمّلها بقى…",
    STORY_CHAIN: "حدوتة على الطاير ✨"
};

const gameModes = [
    {
        id: "pass-boom",
        mode: "عدّيها 💣",
        title: "عدّيها 💣",
        description: "جاوب بسرعة قبل ما الموبايل يفرقع في وشك!",
        accent: "from-red-600 to-orange-600",
    },
    {
        id: "truth-dare",
        mode: "قول ولا تفوّت؟ 😏",
        title: "قول ولا تفوّت؟ 😏",
        description: "أسئلة محرجة وتحديات للمجروحين.",
        accent: "from-purple-600 to-pink-600",
    },
    {
        id: "emoji-movie",
        mode: "فيلم بالإيموجي 🎬",
        title: "فيلم بالإيموجي 🎬",
        description: "خمن الفيلم من الإيموجي... للصيّع بس.",
        accent: "from-blue-600 to-cyan-600",
    },
    {
        id: "aswan-orig",
        mode: "أسواني أصلي 🐊",
        title: "أسواني أصلي 🐊",
        description: "أسئلة عن الرحلة، النوبة، والناس.",
        accent: "from-emerald-600 to-teal-600",
    },
    {
        id: "proverbs",
        mode: "كمّلها بقى…",
        title: "كمّلها بقى…",
        description: "الأمثال الشعبية... على أصولها.",
        accent: "from-amber-600 to-yellow-600",
    },
];

const CATEGORIES: Record<string, string[]> = {
    "عدّيها 💣": ['مشكل', 'أفلام', 'أغاني', 'معلومات عامة'],
    "قول ولا تفوّت؟ 😏": ['خفيف', 'جرأة', 'عميق', 'ضحك'],
    "فيلم بالإيموجي 🎬": ['أفلام مصري', 'مسرحيات', 'مسلسلات'],
    "أسواني أصلي 🐊": ['النوبة', 'الرحلة', 'المعبد', 'أكل وشرب'],
    "كمّلها بقى…": ['أمثال قديمة', 'حكم', 'إيفيهات أفلام']
};

// --- EMOJI SEED DATA (FALLBACK) ---
const EMOJI_SEED_DATA = [
    "الفيل الأزرق: 🐘🟦",
    "الناظر: 👨🏫👓🔴",
    "بوحة: 🐂🔪🥩",
    "كده رضا: 👨👦👦🆔3️⃣",
    "أمير البحار: 🛥️⚓👑",
    "عسل أسود: 🍯⬛🦅",
    "صعيدي في الجامعة الأمريكية: 👨🌾🎓🇺🇸",
    "مدرسة المشاغبين: 🏫👨🏫💥",
    "العيال كبرت: 👨👩👧👦🏠👴",
    "بكار: 👦🏾🐐🛶"
];

// --- COMPONENTS ---

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
    const isModel = msg.role === 'model';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-lg leading-relaxed font-arabic shadow-md ${isModel
                ? 'bg-[#1a1a1a] border border-white/10 text-white rounded-tl-none'
                : 'bg-gradient-to-l from-accent-gold to-yellow-600 text-black font-bold rounded-tr-none'
                }`}>
                {msg.text}
            </div>
        </motion.div>
    );
};

// --- ACTIVE GAME VIEW (CHAT) ---
const ActiveGame = ({ mode, settings, onExit }: { mode: string, settings: any, onExit: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Timer State
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [boom, setBoom] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Initial Start
    useEffect(() => {
        handleSendMessage(true);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (!timerActive || timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    setTimerActive(false);
                    setBoom(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const handleSendMessage = async (isInitial = false) => {
        if (!input.trim() && !isInitial) return;

        const userMsg: ChatMessage | null = isInitial
            ? null
            : { role: 'user', text: input };

        if (userMsg) {
            setMessages(prev => [...prev, userMsg]);
            setInput('');
        }

        setLoading(true);
        setBoom(false);
        setError(false);

        try {
            const historyToSend = userMsg ? [...messages, userMsg] : [...messages];
            const response = await sendGameMessage(mode, settings.category, settings.difficulty, historyToSend);

            if (response) {
                let finalResponse = response;

                // FALLBACK INTERCEPTOR
                if (response.safe && mode === "فيلم بالإيموجي 🎬") {
                    const randomSeed = EMOJI_SEED_DATA[Math.floor(Math.random() * EMOJI_SEED_DATA.length)];
                    finalResponse = {
                        ...response,
                        text: `(Offline Mode 📶) خمن دي: ${randomSeed}`
                    };
                }

                const aiMsg: ChatMessage = { role: 'model', text: finalResponse.text };
                setMessages(prev => [...prev, aiMsg]);

                if (finalResponse.action === 'START_TIMER') {
                    setTimer(finalResponse.timerSeconds || 30);
                    setTimerActive(true);
                }
            } else {
                throw new Error("No response");
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#050505] transition-colors duration-500 ${boom ? 'bg-red-900/40' : ''}`}>

            {/* Header */}
            <div className="w-full h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 z-20 shadow-xl">
                <button onClick={onExit} className="text-white/60 font-bold font-arabic hover:text-white transition-colors">← خروج</button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-white font-arabic text-lg">{mode}</span>
                    <div className="flex gap-2 text-xs text-white/50">
                        <span>{settings.category}</span>
                        <span>•</span>
                        <span>Level {settings.difficulty}</span>
                    </div>
                </div>
                <div className="w-16 flex justify-end">
                    {timer > 0 && (
                        <div className={`font-black text-2xl font-mono ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-accent-gold'}`}>
                            {timer}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} msg={msg} />
                ))}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                        <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Error Card */}
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center w-full my-4">
                        <div className="bg-red-900/50 border border-red-500/30 rounded-xl p-4 text-center max-w-sm">
                            <p className="text-white mb-3 font-bold">الشبكة واقعة يا معلم! 🔌</p>
                            <button
                                onClick={() => handleSendMessage()}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors"
                            >
                                {UX.retry}
                            </button>
                        </div>
                    </motion.div>
                )}

                {boom && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-6 text-center">
                        <div className="text-6xl mb-2">💥</div>
                        <div className="text-3xl font-black text-white font-arabic">الوقت خلص يا معلم!</div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/10 z-20 backdrop-blur-lg">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={UX.placeholder}
                        disabled={loading}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-gold/50 font-arabic transition-all text-right shadow-inner"
                        dir="rtl"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={loading || (!input.trim() && !error)}
                        className={`px-6 rounded-full font-bold font-arabic transition-all shadow-lg flex items-center justify-center
                            ${loading || (!input.trim() && !error)
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-accent-gold text-black hover:bg-yellow-400 hover:scale-105 active:scale-95'
                            }`}
                    >
                        ➤
                    </button>
                </div>
            </div>

        </div>
    );
};

// --- GAME HUB ---

const GamesPage = () => {
    const [view, setView] = useState<'HUB' | 'LOBBY' | 'GAME'>('HUB');
    const [selection, setSelection] = useState<string | null>(null);
    const [lobbyState, setLobbyState] = useState({ category: 'عام', difficulty: 2 });

    const handleSelect = (mode: string) => {
        setSelection(mode);
        // Default Settings
        setLobbyState({
            category: CATEGORIES[mode]?.[0] || 'عام',
            difficulty: 2
        });
        setView('LOBBY');
    };

    return (
        <div className="min-h-screen bg-nearblack font-sans text-white pb-24" dir="rtl">
            {view === 'HUB' && (
                <div className="flex flex-col min-h-screen pt-24 pb-16">
                    <header className="text-center px-4 mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 font-arabic bg-clip-text text-transparent bg-gradient-to-r from-accent-gold to-yellow-600">
                            سوبيك جيمز 🐊
                        </h1>
                        <p className="text-white/60 font-arabic text-lg">
                            محرك ألعاب مصري ١٠٠٪ مدعوم بالذكاء الاصطناعي
                        </p>
                    </header>

                    <main className="flex-1 px-4 md:px-12 lg:px-20 max-w-6xl mx-auto w-full">
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {gameModes.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => handleSelect(game.mode)}
                                    className={`
                                group relative overflow-hidden rounded-3xl p-[1px]
                                bg-gradient-to-br ${game.accent}
                                hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl
                                text-right w-full
                            `}
                                >
                                    <div className="h-full w-full bg-[#121212] rounded-3xl p-6 flex flex-col justify-between min-h-[160px] relative z-10">
                                        <div>
                                            <h2 className="text-2xl font-black mb-2 text-white font-arabic">
                                                {game.title}
                                            </h2>
                                            <p className="text-sm text-white/60 leading-relaxed font-arabic font-medium">
                                                {game.description}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                                🎮
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </main>
                </div>
            )}

            {view === 'LOBBY' && selection && (
                <div className="flex flex-col items-center justify-center min-h-[85vh] px-6">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
                        <h2 className="text-4xl font-black mb-8 font-arabic text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{selection}</h2>

                        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl">
                            {/* Category Selector */}
                            <div>
                                <label className="block text-accent-gold font-bold font-arabic mb-4 text-lg">الموضوع</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES[selection]?.map(c => (
                                        <button key={c} onClick={() => setLobbyState({ ...lobbyState, category: c })} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${lobbyState.category === c ? 'bg-white text-black scale-105 shadow-lg' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{c}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty Selector (Stars) */}
                            <div>
                                <label className="block text-accent-gold font-bold font-arabic mb-4 text-lg">{UX.difficulty} {lobbyState.difficulty}/5</label>
                                <div className="flex justify-between bg-white/5 rounded-2xl p-4">
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setLobbyState({ ...lobbyState, difficulty: lvl })}
                                            className={`text-3xl transition-transform hover:scale-125 ${lvl <= lobbyState.difficulty ? 'grayscale-0' : 'grayscale opacity-30'}`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                                <div className="text-center mt-3 text-sm text-white/40 font-arabic">
                                    {lobbyState.difficulty === 1 && "سهلة (تحفيل)"}
                                    {lobbyState.difficulty === 3 && "متوسطة (شغل فنادق)"}
                                    {lobbyState.difficulty === 5 && "صعبة (عافية وشقاوة)"}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setView('HUB')} className="flex-1 py-4 border border-white/10 rounded-2xl font-bold font-arabic hover:bg-white/10">رجوع</button>
                            <button onClick={() => setView('GAME')} className="flex-[2] py-4 bg-accent-gold text-black rounded-2xl font-black font-arabic shadow-xl hover:scale-[1.02] transition-transform text-xl">
                                يلا بينا 🚀
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {view === 'GAME' && selection && (
                <ActiveGame mode={selection} settings={lobbyState} onExit={() => setView('HUB')} />
            )}
        </div>
    );
};

export default GamesPage;
