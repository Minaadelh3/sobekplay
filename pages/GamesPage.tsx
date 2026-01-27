import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sendGameMessage, ChatMessage, AIResponse } from '../services/gameAI';

// --- CONFIG ---
const UX = {
    loading: "سوبيك بيفكر... 🤔",
    newCard: "كارت جديد 🎴",
    retry: "نجرب تاني 🔄",
    timeUp: "فرقعت 💥",
    passPhone: "ادي الموبايل للي جنبك 📱",
    placeholder: "اكتب ردك هنا...",
    send: "إرسال 🚀"
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

// --- CHAT COMPONENTS ---

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
    const isModel = msg.role === 'model';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isModel ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-lg leading-relaxed font-arabic ${isModel
                    ? 'bg-charcoal border border-white/10 text-white rounded-tl-none'
                    : 'bg-accent-green text-white rounded-tr-none'
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

    // Timer State
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [boom, setBoom] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages, loading]);

    // Initial Start
    useEffect(() => {
        handleSendMessage(true); // Initial trigger
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
        setBoom(false); // Reset boom on new interaction

        try {
            // Include the new user message in history sent to API
            const historyToSend = userMsg ? [...messages, userMsg] : [...messages];

            const response = await sendGameMessage(mode, settings.category, historyToSend);

            if (response) {
                const aiMsg: ChatMessage = { role: 'model', text: response.text };
                setMessages(prev => [...prev, aiMsg]);

                // Handle Actions
                if (response.action === 'START_TIMER') {
                    setTimer(response.timerSeconds || settings.timer || 30);
                    setTimerActive(true);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] transition-colors duration-500 ${boom ? 'bg-red-900/50' : ''}`}>

            {/* Header */}
            <div className="w-full h-16 bg-nearblack/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-4 z-20 shadow-lg">
                <button onClick={onExit} className="text-white/60 font-bold font-arabic hover:text-white transition-colors">← خروج</button>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-white font-arabic">{mode}</span>
                    <span className="text-xs text-accent-gold">{settings.category}</span>
                </div>
                <div className="w-16 flex justify-end">
                    {timer > 0 && (
                        <div className={`font-black text-xl font-mono ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timer}s
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-2">
                {messages.map((msg, idx) => (
                    <MessageBubble key={idx} msg={msg} />
                ))}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
                        <div className="bg-charcoal/50 rounded-2xl px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                {boom && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8">
                        <div className="text-6xl mb-2">💥</div>
                        <div className="text-2xl font-black text-white font-arabic">{UX.timeUp}</div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-nearblack border-t border-white/10 z-20">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={UX.placeholder}
                        disabled={loading}
                        className="flex-1 bg-white/10 border border-white/10 rounded-full px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-green font-arabic transition-colors text-right"
                        dir="rtl"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={loading || !input.trim()}
                        className={`px-6 rounded-full font-bold font-arabic transition-all shadow-lg
                            ${loading || !input.trim()
                                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                : 'bg-accent-green text-white hover:bg-accent-green/80 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {UX.send}
                    </button>
                </div>
            </div>

        </div>
    );
};

// --- GAME HUB (User Design Merge) ---

// UI Configuration with Internal Mode Mapping
const gameModes = [
    {
        id: "pass-boom",
        mode: "عدّيها 💣", // Must match the string expected by GameLobby/ActiveGame
        title: "عدّيها 💣",
        description: "الموبايل بيلف… واللي يفرقع عليه يتحاسب!",
        accent: "from-red-500/70 to-orange-500/60",
    },
    {
        id: "truth-dare",
        mode: "قول ولا تفوّت؟ 😏",
        title: "قول ولا تعمل 😏",
        description: "سؤال محرج ولا تحدّي مجنون…؟ انت وحظك.",
        accent: "from-pink-500/70 to-purple-500/60",
    },
    {
        id: "emoji-movie",
        mode: "فيلم بالإيموجي 🎬",
        title: "فيلم بالإيموجي 🎬",
        description: "إيموجيز بس… وتخمّن اسم الفيلم قبل صحابك.",
        accent: "from-blue-500/70 to-cyan-500/60",
    },
    {
        id: "proverbs",
        mode: "كمّلها بقى…",
        title: "كمّل المثل 🧠",
        description: "أمثال مصرية ناقصة… كمّلها قبل ما حد يسبقك.",
        accent: "from-emerald-500/70 to-lime-500/60",
    },
    {
        id: "story-chain",
        mode: "حدوتة على الطاير ✨",
        title: "حدوتة على الطاير ✨",
        description: "كل واحد يزوّد جملة… ونشوف القصّة هتوصل لفين.",
        accent: "from-amber-500/70 to-rose-500/60",
    },
];

const GamesPage = () => {
    const [view, setView] = useState<'HUB' | 'LOBBY' | 'GAME'>('HUB');
    const [selection, setSelection] = useState<string | null>(null);
    const [lobbyState, setLobbyState] = useState({ category: 'عام', timer: 0 });

    const handleSelect = (mode: string) => {
        setSelection(mode);
        // Default Settings
        setLobbyState({
            category: CATEGORIES[mode]?.[0] || 'عام',
            timer: mode.includes("عدّيها") ? 30 : 0
        });
        setView('LOBBY');
    };

    return (
        <div className="min-h-screen bg-nearblack font-sans text-white pb-24" dir="rtl">
            {view === 'HUB' && (
                <div className="flex flex-col min-h-screen pt-24 pb-16">
                    {/* Hero */}
                    <header className="text-center px-4 mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 font-arabic">
                            سوبيك جيمز 🐊🎮
                        </h1>
                        <p className="text-sm md:text-base text-white/60 font-arabic">
                            اختار لعبة ونولّع القعدة… الكروت هتجيلك جاهزة على طول.
                        </p>
                    </header>

                    {/* Games Grid */}
                    <main className="flex-1 px-4 md:px-12 lg:px-20 max-w-6xl mx-auto w-full">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {gameModes.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => handleSelect(game.mode)}
                                    className={`
                                group relative overflow-hidden rounded-3xl p-[1px]
                                bg-gradient-to-br ${game.accent}
                                hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200
                                text-right w-full
                            `}
                                >
                                    <div className="h-full w-full bg-[#121212] rounded-3xl p-6 flex flex-col justify-between min-h-[180px]">
                                        <div>
                                            <h2 className="text-xl font-bold mb-2 text-white group-hover:text-accent-gold font-arabic">
                                                {game.title}
                                            </h2>
                                            <p className="text-sm text-white/50 leading-relaxed font-arabic">
                                                {game.description}
                                            </p>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between text-sm">
                                            <span className="text-accent-gold font-semibold font-arabic">
                                                العب دلوقتي
                                            </span>
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold/15 text-accent-gold">
                                                <span className="rotate-180 group-hover:-translate-x-1 transition-transform">
                                                    ↩
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </main>
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
                                    <button key={c} onClick={() => setLobbyState({ ...lobbyState, category: c })} className={`px-4 py-2 rounded-full border transition-colors ${lobbyState.category === c ? 'bg-white text-black border-white' : 'border-white/20 hover:bg-white/10'}`}>{c}</button>
                                ))}
                            </div>
                        </div>

                        {selection.includes("عدّيها") && (
                            <div>
                                <label className="block text-white/50 font-bold font-arabic mb-4">الوقت (ثواني)</label>
                                <div className="flex gap-2 justify-center">
                                    {TIMERS.map(t => (
                                        <button key={t} onClick={() => setLobbyState({ ...lobbyState, timer: t })} className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold transition-all ${lobbyState.timer === t ? 'bg-white text-black border-white scale-110' : 'border-white/20'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 w-full max-w-sm">
                        <button onClick={() => setView('HUB')} className="flex-1 py-3 border border-white/20 rounded-xl font-bold font-arabic hover:bg-white/10">رجوع</button>
                        <button onClick={() => setView('GAME')} className="flex-[2] py-3 bg-white text-black rounded-xl font-black font-arabic shadow-lg hover:scale-105 transition-transform">يلا بينا 🚀</button>
                    </div>
                </div>
            )}

            {view === 'GAME' && selection && (
                <ActiveGame mode={selection} settings={lobbyState} onExit={() => setView('HUB')} />
            )}
        </div>
    );
};

export default GamesPage;
