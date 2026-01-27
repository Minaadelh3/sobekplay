import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGameCard, GameCard, GameMode } from '../services/gameAI';
import { SAFE_PENALTIES } from '../data/partyGames';

// --- CONFIG ---
const TICK_SOUND = '/assets/tick.mp3';
const BOOM_SOUND = '/assets/boom.mp3';

// --- SHARED COMPONENTS ---
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button dir="rtl" onClick={onClick} className="absolute top-4 right-4 z-50 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 font-arabic font-bold">
        <span>رجوع</span>
        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    </button>
);

const LoadingCard = ({ text = "بنسخّن الذكاء الاصطناعي... 🤔" }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md aspect-[3/4] bg-white/5 rounded-3xl animate-pulse flex flex-col items-center justify-center border border-white/10 p-6 text-center"
    >
        <div className="text-4xl mb-4">🤖🎲</div>
        <div className="text-white/60 font-bold font-arabic text-xl">{text}</div>
    </motion.div>
);

const ErrorCard = ({ onRetry }: { onRetry: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-md aspect-[3/4] bg-red-900/20 rounded-3xl flex flex-col items-center justify-center border border-red-500/30 p-6 text-center"
    >
        <div className="text-4xl mb-4">😅</div>
        <div className="text-white font-bold font-arabic text-xl mb-6">معلش، الشبكة علّقت شوية.</div>
        <button onClick={onRetry} className="px-8 py-3 bg-white text-black font-bold font-arabic rounded-full shadow-lg hover:scale-105 transition-transform">
            نجرب تاني 🔄
        </button>
    </motion.div>
);

// --- HOOK: GAME ENGINE (Refined for Masry) ---
const useGameEngine = (mode: GameMode, category: string, timerInit: number) => {
    const [card, setCard] = useState<GameCard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [timer, setTimer] = useState(timerInit);
    const [timerActive, setTimerActive] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const nextCard = async (newCategory?: string) => {
        setIsLoading(true);
        setError(false);
        setTimerActive(false);
        setTimer(timerInit);

        try {
            const cat = newCategory || category;
            const newCard = await generateGameCard(mode, cat, timerInit, 'MEDIUM', history);

            if (newCard) {
                setCard(newCard);
                setHistory(prev => [...prev.slice(-20), newCard.text]);
                setTimerActive(true);
            } else {
                setError(true);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && timerActive) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    return { card, isLoading, error, timer, timerActive, nextCard, setTimer };
};


// --- GAME 1: PASS & BOOM (عدةيها) ---
const PassAndBoomAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, error, timer, timerActive, nextCard } = useGameEngine('PASS_BOOM', 'General', 30); // 30s default
    const [boom, setBoom] = useState(false);

    useEffect(() => { nextCard(); }, []);

    useEffect(() => {
        if (timer === 0 && !boom && card) setBoom(true); // Boom on timer 0
        if (timer > 0) setBoom(false);
    }, [timer, card]);

    return (
        <div className={`flex flex-col items-center justify-center min-h-[90vh] p-6 text-center text-white transition-colors duration-200 ${boom ? 'bg-red-600' : timer < 10 ? 'bg-red-900/50' : 'bg-[#111]'}`}>
            <BackButton onClick={onBack} />

            {boom ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} className="flex flex-col items-center">
                    <h1 className="text-9xl mb-4">💥</h1>
                    <h2 className="text-5xl font-black font-arabic mb-8">فرقعت!!</h2>

                    <div className="bg-black/30 p-8 rounded-3xl mb-8 border border-white/20 w-full max-w-sm backdrop-blur-md">
                        <div className="text-accent-gold text-sm font-bold font-arabic mb-4 tracking-widest">حكم عليك</div>
                        <div className="text-3xl font-bold font-arabic leading-relaxed">
                            {SAFE_PENALTIES[Math.floor(Math.random() * SAFE_PENALTIES.length)]}
                        </div>
                    </div>

                    <button onClick={() => nextCard()} className="px-12 py-4 bg-white text-black font-black font-arabic text-xl rounded-full shadow-xl hover:scale-105 transition-transform">
                        الجولة اللي بعدها ▶️
                    </button>
                </motion.div>
            ) : (
                <>
                    <h2 className="text-3xl font-black text-white font-arabic mb-4">عدّيها بسرعة 💣</h2>
                    <div className={`text-7xl font-black mb-8 font-mono tracking-tighter ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timer}<span className="text-2xl ml-1">ث</span>
                    </div>

                    {isLoading ? <LoadingCard text="بنجهز القنبلة... ⏳" /> : error ? <ErrorCard onRetry={() => nextCard()} /> : card && (
                        <motion.div
                            key={card.text}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-gradient-to-br from-gray-800 to-black p-10 rounded-3xl w-full max-w-md shadow-2xl border border-white/10 min-h-[300px] flex flex-col justify-center items-center"
                        >
                            <div className="text-accent-gold font-bold font-arabic mb-6 text-lg">{card.type === 'QUESTION' ? 'سؤال ع السريع' : 'تحدي للمحترفين'}</div>
                            <div className="text-3xl md:text-4xl font-bold leading-relaxed font-arabic" dir="rtl">{card.text}</div>
                        </motion.div>
                    )}

                    <div className="mt-12 w-full max-w-md">
                        <button
                            onClick={() => nextCard()}
                            disabled={isLoading || error}
                            className="w-full py-5 bg-accent-gold text-black font-black font-arabic text-2xl rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            عدّييييها! ⏩
                        </button>
                        <p className="text-white/40 font-arabic mt-4 text-sm">جاوب قبل ما الوقت يخلص!</p>
                    </div>
                </>
            )}
        </div>
    );
};

// --- GAME 2: TRUTH OR DARE (قول ولا تفوّت؟) ---
const TruthDareAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, error, nextCard } = useGameEngine('TRUTH_DARE', 'General', 0);
    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#1a0b0b] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-3xl font-black text-accent-gold font-arabic mb-8">قول ولا تفوّت؟ 😏</h2>

            {isLoading ? <LoadingCard text="بنشوفلك كارت يحرجك... 😈" /> : error ? <ErrorCard onRetry={() => nextCard()} /> : card && (
                <motion.div
                    key={card.text}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className={`max-w-md w-full p-10 rounded-3xl min-h-[420px] flex flex-col justify-center items-center shadow-2xl relative overflow-hidden border-4
                        ${card.type === 'QUESTION' ? 'bg-blue-900 border-blue-500/30' : 'bg-red-900 border-red-500/30'}
                    `}
                >
                    <div className="text-6xl mb-6">{card.type === 'QUESTION' ? '🗣️' : '💪'}</div>
                    <div className="text-white/60 font-bold font-arabic mb-8 tracking-wide">
                        {card.type === 'QUESTION' ? 'سؤال صريح (قول)' : 'تحدي جريء (اعمل)'}
                    </div>

                    <div className="text-2xl md:text-3xl font-bold leading-relaxed font-arabic" dir="rtl">
                        {card.text}
                    </div>
                </motion.div>
            )}

            <div className="flex gap-4 mt-8 w-full max-w-md">
                <button onClick={() => nextCard()} className="flex-1 py-4 bg-white text-black font-bold font-arabic rounded-2xl shadow-lg hover:bg-gray-200">
                    كارت كمان 🎲
                </button>
            </div>
        </div>
    );
};

// --- GAME 3: EMOJI MOVIES (فيلم بالإيموجي) ---
const EmojiMoviesAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, error, nextCard } = useGameEngine('EMOJI_MOVIES', 'Egyptian Movies', 0);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#050510] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl md:text-3xl font-black text-accent-gold font-arabic mb-8">فيلم بالإيموجي 🎬</h2>

            {isLoading ? <LoadingCard text="بنركب الإيموجي... 🧩" /> : error ? <ErrorCard onRetry={() => nextCard()} /> : card && (
                <div onClick={() => setRevealed(true)} className="w-full max-w-md bg-gradient-to-br from-indigo-900 to-black border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl cursor-pointer min-h-[400px] hover:border-accent-gold/50 transition-colors">
                    <div className="text-7xl md:text-8xl mb-12 leading-relaxed flex flex-wrap justify-center gap-2 filter drop-shadow-lg">
                        {card.emoji}
                    </div>

                    {revealed ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                            <div className="text-accent-gold font-arabic font-bold text-sm mb-2">اسم الفيلم هو:</div>
                            <h3 className="text-3xl font-black text-white mb-8 font-arabic leading-relaxed">{card.answer || "معرفتش 😅"}</h3>
                            <button onClick={(e) => { e.stopPropagation(); setRevealed(false); nextCard(); }} className="w-full py-3 bg-accent-gold text-black font-bold font-arabic rounded-full hover:scale-105 transition-transform">
                                اللي بعده ▶️
                            </button>
                        </motion.div>
                    ) : (
                        <div className="mt-auto">
                            <div className="text-white/40 text-sm font-arabic animate-pulse mb-2">دوس عشان تشوف الحل</div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-2 mt-8 overflow-x-auto w-full max-w-md justify-center pb-2">
                {[
                    { id: 'Egyptian Movies', label: 'أفلام مصري 🇪🇬' },
                    { id: 'Global Movies', label: 'أفلام أجنبي 🌎' }
                ].map(cat => (
                    <button key={cat.id} onClick={() => { setRevealed(false); nextCard(cat.id); }} className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold font-arabic hover:bg-white/20 whitespace-nowrap transition-colors border border-white/5">
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- GAME 4: PROVERBS (كمّلها بقى) ---
const ProverbsAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, error, nextCard } = useGameEngine('PROVERBS', 'General', 0);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#101a10] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl md:text-3xl font-black text-accent-green font-arabic mb-8">كمّلها بقى... (أمثال) 📜</h2>

            {isLoading ? <LoadingCard text="بنجيب المثل من جدودنا... 👵" /> : error ? <ErrorCard onRetry={() => nextCard()} /> : card && (
                <div className="w-full max-w-lg">
                    <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/20 rounded-3xl p-10 shadow-xl mb-6 min-h-[250px] flex items-center justify-center">
                        <div className="text-3xl md:text-4xl font-bold font-arabic leading-relaxed text-white dir-rtl" dir="rtl">
                            "{card.text} ..."
                        </div>
                    </div>

                    <AnimatePresence>
                        {revealed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-accent-green text-black rounded-2xl p-6 font-bold text-2xl font-arabic mb-6 shadow-lg"
                            >
                                {card.answer || "لا يوجد إجابة"}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setRevealed(!revealed)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold font-arabic text-lg transition-colors">
                            {revealed ? 'خبّي الحل 🙈' : 'وريني الحل 👀'}
                        </button>
                        <button onClick={() => { setRevealed(false); nextCard(); }} className="px-10 py-3 bg-white text-black font-bold font-arabic text-lg rounded-full shadow-lg hover:scale-105 transition-transform">
                            التالي
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- GAME 5: STORY CHAIN (حدوتة على الطاير) ---
const StoryChainAI: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { card, isLoading, error, nextCard } = useGameEngine('STORY_CHAIN', 'Fantasy', 0);
    useEffect(() => { nextCard(); }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-[#150525] p-6 text-center text-white">
            <BackButton onClick={onBack} />
            <h2 className="text-2xl md:text-3xl font-black text-purple-400 font-arabic mb-2">حدوتة على الطاير 🧙‍♂️</h2>
            <p className="text-white/50 font-arabic mb-8 text-sm">ألف قصة سوا.. كل واحد جملة!</p>

            {isLoading ? <LoadingCard text="بنتخيل القصة... ✨" /> : error ? <ErrorCard onRetry={() => nextCard()} /> : card && (
                <div onClick={() => nextCard()} className="w-full max-w-lg bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 p-10 rounded-3xl cursor-pointer hover:bg-purple-900/40 transition-colors shadow-2xl min-h-[300px] flex flex-col justify-center relative group">
                    <div className="absolute top-6 right-6 text-purple-400 font-bold font-arabic text-sm opacity-50">بداية القصة</div>
                    <p className="text-2xl md:text-4xl font-bold font-arabic leading-relaxed dir-rtl" dir="rtl">
                        {card.text}
                    </p>

                    <div className="mt-12 flex justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-arabic bg-purple-500/20 px-4 py-1 rounded-full text-purple-300">دوس عشان قصة جديدة</span>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- MAIN PAGE (Games Hub) ---
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

    // RENDER ACTIVE GAME
    if (activeGame === 'PASS_BOOM') return <PassAndBoomAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'TRUTH_DARE') return <TruthDareAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'EMOJI_MOVIES') return <EmojiMoviesAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'PROVERBS') return <ProverbsAI onBack={() => setActiveGame(null)} />;
    if (activeGame === 'STORY_CHAIN') return <StoryChainAI onBack={() => setActiveGame(null)} />;

    return (
        <div className="min-h-screen bg-nearblack pt-24 px-4 pb-32 overflow-x-hidden" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 font-arabic">قعدة ونيسة 🎉</h1>
                    <p className="text-white/60 font-arabic text-lg">ألعاب جماعية ذكية.. بالذكاء الاصطناعي 😉</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <GameModeCard
                        title="عدّيها بسرعة 💣"
                        desc="جاوب قبل ما القنبلة تفرقع في وشك!"
                        color="from-red-900 to-black"
                        icon="⏱️"
                        onClick={() => setActiveGame('PASS_BOOM')}
                    />
                    <GameModeCard
                        title="قول ولا تفوّت؟ 😏"
                        desc="أسئلة محرجة وتحديات جريئة."
                        color="from-blue-900 to-black"
                        icon="🎲"
                        onClick={() => setActiveGame('TRUTH_DARE')}
                    />
                    <GameModeCard
                        title="فيلم بالإيموجي 🎬"
                        desc="خمن اسم الفيلم من الإيموجي."
                        color="from-indigo-900 to-black"
                        icon="🧩"
                        onClick={() => setActiveGame('EMOJI_MOVIES')}
                    />
                    <GameModeCard
                        title="كمّلها بقى... 📜"
                        desc="مين الحريف في الأمثال الشعبية؟"
                        color="from-green-900 to-black"
                        icon="🗣️"
                        onClick={() => setActiveGame('PROVERBS')}
                    />
                    <GameModeCard
                        title="حدوتة على الطاير 🧙‍♂️"
                        desc="نألف قصة سوا.. كل واحد كلمة."
                        color="from-purple-900 to-black"
                        icon="✨"
                        onClick={() => setActiveGame('STORY_CHAIN')}
                    />
                </div>
            </div>
        </div>
    );
};

const GameModeCard = ({ title, desc, color, icon, onClick }: { title: string, desc: string, color: string, icon: string, onClick: () => void }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`bg-gradient-to-br ${color} border border-white/10 p-8 rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden min-h-[220px] flex flex-col justify-center`}
    >
        <div className="text-5xl mb-6 group-hover:scale-110 transition-transform origin-right">{icon}</div>
        <h4 className="text-2xl md:text-3xl font-black text-white mb-2 font-arabic">{title}</h4>
        <p className="text-white/60 text-lg font-arabic leading-relaxed">{desc}</p>

        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold font-arabic border border-white/10">
            العب دلوقتي
        </div>
    </motion.div>
);

export default GamesPage;
