import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

// Game Components
import { StoryGame } from '../components/StoryGame';
import { PanicGame } from '../components/PanicGame';
import { PressureGame } from '../components/PressureGame';
import { SoulGame } from '../components/SoulGame';
import { ForbiddenGame } from '../components/ForbiddenGame';
import { CharadesGame } from '../components/CharadesGame';
import { ProverbsGame } from '../components/ProverbsGame';
import { BibleVerseGame } from '../components/BibleVerseGame';
import { BibleCharGame } from '../components/BibleCharGame';

// --- ICONS ---
const PlayIcon = () => (
    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- DATA: GAMES ---

interface GameDef {
    id: string;
    title: string;
    desc: string;
    icon: string;
    gradient: string;
    shadow: string;
    details: {
        intro: string;
        players: string;
        time: string;
        howTo: string[];
    };
    isHeavy: boolean;
}

const GAMES_CATALOG: GameDef[] = [
    {
        id: 'charades',
        title: "مثّلها لو قدّك",
        desc: "جسمك بس اللي يتكلم",
        icon: "🎭",
        gradient: "from-yellow-400 via-yellow-500 to-orange-500",
        shadow: "shadow-yellow-500/40",
        isHeavy: false,
        details: {
            intro: "لعبة كلاسيكية بس بلمسة مصرية. هتقدر توصل المعنى من غير ولا كلمة؟",
            players: "كتييير",
            time: "مفتوح",
            howTo: ["اختار كارت", "مثّل اللي فيه من غير كلام", "الكل بيخمن"]
        }
    },
    {
        id: 'panic',
        title: "قول بسرعة",
        desc: "٣ كلمات في ٣ ثواني",
        icon: "💣",
        gradient: "from-rose-500 via-red-500 to-red-600",
        shadow: "shadow-rose-500/40",
        isHeavy: false,
        details: {
            intro: "مفيش وقت للتفكير! لسانك هيسبق عقلك، والضحك هيشتغل.",
            players: "فريقين نار",
            time: "سريع جدًا",
            howTo: ["اسمع السؤال", "قول ٣ إجابات", "قبل الانفجار"]
        }
    },
    {
        id: 'proverbs',
        title: "كمّل المثل",
        desc: "يا ابن البلد",
        icon: "📜",
        gradient: "from-emerald-400 via-green-500 to-green-600",
        shadow: "shadow-emerald-500/40",
        isHeavy: false,
        details: {
            intro: "أمثالنا الشعبية كنز. اختبر ذاكرتك وشوف مين 'ابن بلد' بجد.",
            players: "أي عدد",
            time: "٣٠ ثانية",
            howTo: ["بداية المثل", "كمّله أنت", "بسرعة!"]
        }
    },
    {
        id: 'story_game',
        title: "كان قصده إيه؟",
        desc: "نية صافية ولا..",
        icon: "💭",
        gradient: "from-blue-400 via-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/40",
        isHeavy: false,
        details: {
            intro: "نفس الجملة ممكن تتقال بـ ١٠٠ طريقة. وريهم شاطرتك في التمثيل.",
            players: "٣+",
            time: "مفتوح",
            howTo: ["اسحب جملة", "اسحب شعور", "مثلها بالشعور ده"]
        }
    },
    {
        id: 'bible_verse',
        title: "كمّل الآية",
        desc: "مسابقة الأبطال",
        icon: "✨",
        gradient: "from-cyan-400 via-sky-500 to-blue-600",
        shadow: "shadow-cyan-500/40",
        isHeavy: false,
        details: {
            intro: "مين اللي مذاكر؟ راجع آياتك ونافس صحابك في مسابقة سريعة.",
            players: "مجموعات",
            time: "دقيقة",
            howTo: ["شوف بداية الآية", "كمّلها صح", "اكسب النقطة"]
        }
    },
    {
        id: 'pressure',
        title: "شايفينه إزاي؟",
        desc: "بدون زعل بقى",
        icon: "👀",
        gradient: "from-violet-400 via-purple-500 to-fuchsia-600",
        shadow: "shadow-purple-500/40",
        isHeavy: false,
        details: {
            intro: "لعبة الصراحة والمواجهة. بنعرف مين فينا بيعمل إيه.. والكل بيشاور.",
            players: "الشلة كلها",
            time: "للصبح",
            howTo: ["سؤال محرج", "٣، ٢، ١ شاور!", "أكتر واحد اتشار عليه خسران"]
        }
    },
    {
        id: 'bible_char',
        title: "مين ده؟",
        desc: "شخصية غامضة",
        icon: "🕵️‍♂️",
        gradient: "from-amber-300 via-yellow-400 to-orange-500",
        shadow: "shadow-amber-500/40",
        isHeavy: false,
        details: {
            intro: "تخمين وذكاء. كل معلومة بتقربك للحل، بس يا ترى هتعرف من بدري؟",
            players: "أي عدد",
            time: "مفتوح",
            howTo: ["معلومة ورا معلومة", "خمن الشخصية", "اكسب الجولة"]
        }
    },
    {
        id: 'story_collab',
        title: "حكاية جماعية",
        desc: "تأليف عالحلو",
        icon: "🧩",
        gradient: "from-pink-400 via-pink-500 to-rose-500",
        shadow: "shadow-pink-500/40",
        isHeavy: false,
        details: {
            intro: "الخيال ملوش حدود لما نتجمع. قصة غريبة هتطلع منكم كلمة بكلمة.",
            players: "٤+",
            time: "مفتوح",
            howTo: ["أنا كلمة", "أنت كلمة", "القصة تكمل"]
        }
    },
    {
        id: 'soul',
        title: "سؤال عميق",
        desc: "كلام من القلب",
        icon: "🌑",
        gradient: "from-slate-600 via-slate-700 to-gray-800",
        shadow: "shadow-white/10",
        isHeavy: true,
        details: {
            intro: "مش وقت ضحك.. ده وقت نعرف بعض بجد. مساحة للكلام الحقيقي.",
            players: "٢+",
            time: "براحتكم",
            howTo: ["اسحب كارت", "جاوب من قلبك", "اسمع غيرك للاخر"]
        }
    },
    {
        id: 'forbidden',
        title: "ممنوعات",
        desc: "خطر جدًا",
        icon: "⛔",
        gradient: "from-red-600 via-red-700 to-black",
        shadow: "shadow-red-900/50",
        isHeavy: true,
        details: {
            intro: "منطقة خطر. أسئلة وتحديات مش لأي حد. لو قلبك خفيف بلاش.",
            players: "للكبار فقط",
            time: "؟",
            howTo: ["وافقت تدخل؟", "استحمل بقى", "مفيش انسحاب"]
        }
    }
];

// --- ANIMATION VARIANTS ---
const containerVar = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const cardVar = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", bounce: 0.4 }
    }
};

export const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [selectedGame, setSelectedGame] = useState<GameDef | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameKey, setGameKey] = useState(0);

    // Reset Logic
    useEffect(() => {
        if (location.state && (location.state as any).resetTab) {
            setSelectedGame(null);
            setIsPlaying(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location.state]);

    // Handlers
    const openDetails = (game: GameDef) => {
        setSelectedGame(game);
        setIsPlaying(false);
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameKey(p => p + 1);
    };

    const exitGame = () => {
        setIsPlaying(false);
    };

    const closeDetails = () => {
        setSelectedGame(null);
        setIsPlaying(false);
    };

    // --- RENDERERS ---

    // 1. ACTIVE GAME COMPONENT
    if (selectedGame && isPlaying) {
        const props = { key: gameKey, onExit: exitGame };
        return (
            <div className="fixed inset-0 z-[100] bg-black overflow-y-auto w-full h-full flex flex-col">
                {/* IN-GAME HEADER */}
                <div className="sticky top-0 z-[110] flex items-center p-4 bg-[#080808] border-b border-white/10 shadow-md">
                    <button
                        onClick={exitGame}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
                    >
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-bold text-base">رجوع للألعاب</span>
                    </button>
                    <div className="flex-1 text-center mr-8 font-black text-xl text-white tracking-wide">
                        {selectedGame.title}
                    </div>
                    {/* Placeholder for balance */}
                    <div className="w-24"></div>
                </div>

                <div className="flex-1 relative">
                    {selectedGame.id === 'charades' && <CharadesGame {...props} />}
                    {selectedGame.id === 'story_game' && <StoryGame {...props} />}
                    {selectedGame.id === 'panic' && <PanicGame {...props} />}
                    {selectedGame.id === 'proverbs' && <ProverbsGame {...props} />}
                    {selectedGame.id === 'bible_verse' && <BibleVerseGame {...props} />}
                    {selectedGame.id === 'pressure' && <PressureGame {...props} />}
                    {selectedGame.id === 'bible_char' && <BibleCharGame {...props} />}
                    {selectedGame.id === 'soul' && <SoulGame {...props} />}
                    {selectedGame.id === 'forbidden' && <ForbiddenGame {...props} />}
                    {selectedGame.id === 'story_collab' && <StoryGame {...props} />}
                </div>
            </div>
        );
    }

    // 2. MAIN PLAYGROUND
    return (
        <div className="min-h-screen bg-[#080808] text-white font-arabic safe-area-pb selection:bg-purple-500/30 overflow-x-hidden" dir="rtl">

            {/* Header */}
            <div className="pt-20 pb-10 px-6 text-center relative">
                <BackButton />
                {/* Ambient Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-purple-600/20 blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ y: -30, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter drop-shadow-2xl">
                        <span className="text-white">ملاهي</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mx-2">سوبِك</span>
                        <span className="inline-block animate-bounce">🎡</span>
                    </h1>
                    <p className="text-white/70 text-xl font-bold">
                        إيه ده؟ نلعب إيه الأول؟!
                    </p>
                </motion.div>
            </div>

            {/* Games Grid */}
            <motion.div
                variants={containerVar}
                initial="hidden"
                animate="show"
                className="px-4 pb-40 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto"
            >
                {GAMES_CATALOG.map((game) => (
                    <motion.div
                        key={game.id}
                        variants={cardVar}
                        whileHover={{ scale: 1.05, rotate: 1, y: -5 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => openDetails(game)}
                        className={`
                            relative aspect-[4/5] rounded-[2.5rem] p-6 cursor-pointer
                            bg-gradient-to-br ${game.gradient}
                            flex flex-col justify-between overflow-hidden
                            ${game.shadow} shadow-2xl ring-4 ring-white/5
                            group
                        `}
                    >
                        {/* Huge Icon Background */}
                        <div className="absolute -right-6 -top-6 text-[8rem] opacity-20 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                            {game.icon}
                        </div>

                        {/* Top Area: Icon & Title */}
                        <div className="relative z-10 pt-2">
                            <span className="text-5xl mb-4 block filter drop-shadow-md group-hover:animate-pulse">
                                {game.icon}
                            </span>
                            <h3 className={`text-2xl md:text-3xl font-black leading-[0.9] tracking-tight ${game.isHeavy ? 'text-white' : 'text-[#0a0a0a]'}`}>
                                {game.title}
                            </h3>
                        </div>

                        {/* Bottom Area: Desc & CTA */}
                        <div className="relative z-10">
                            <p className={`text-sm md:text-base font-bold leading-tight mb-4 line-clamp-2 ${game.isHeavy ? 'text-white/70' : 'text-[#0a0a0a]/70'}`}>
                                {game.desc}
                            </p>

                            {/* CTA Pill */}
                            <div className={`
                                w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-sm
                                ${game.isHeavy ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}
                                backdrop-blur-sm group-hover:bg-black/20 transition-colors
                            `}>
                                <span>يلا</span>
                                <PlayIcon />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* --- GAME LOBBY MODAL --- */}
            <AnimatePresence>
                {selectedGame && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 50 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="fixed inset-0 z-[200] bg-[#080808] flex flex-col"
                    >
                        {/* Immersive Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${selectedGame.gradient} opacity-20 blur-3xl`} />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                        {/* Navbar */}
                        <div className="relative z-20 p-6 flex justify-between items-center">
                            <button
                                onClick={closeDetails}
                                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-md"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Lobby Content */}
                        <div className="flex-1 overflow-y-auto px-6 pb-48 relative z-10">
                            <div className="text-center mt-4 mb-10">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="text-8xl mb-6 inline-block filter drop-shadow-2xl"
                                >
                                    {selectedGame.icon}
                                </motion.div>
                                <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                                    {selectedGame.title}
                                </h1>
                                <p className="text-2xl text-white/80 font-bold max-w-md mx-auto leading-relaxed">
                                    {selectedGame.details.intro}
                                </p>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
                                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 text-center backdrop-blur-sm">
                                    <span className="block text-white/40 text-xs font-black uppercase tracking-widest mb-1">اللاعبين</span>
                                    <span className="text-xl font-black text-white">{selectedGame.details.players}</span>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 text-center backdrop-blur-sm">
                                    <span className="block text-white/40 text-xs font-black uppercase tracking-widest mb-1">الوقت</span>
                                    <span className="text-xl font-black text-white">{selectedGame.details.time}</span>
                                </div>
                            </div>

                            {/* Rules List */}
                            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 max-w-lg mx-auto backdrop-blur-sm">
                                <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <span className="text-yellow-400">⚡</span>
                                    نلعب إزاي؟
                                </h3>
                                <div className="space-y-5">
                                    {selectedGame.details.howTo.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 items-start">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-white">
                                                {idx + 1}
                                            </div>
                                            <p className="text-xl text-white/90 font-bold leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Action Button area - STICKY BOTTOM */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#080808] via-[#080808] to-transparent z-30">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startGame}
                                className={`
                                    w-full py-5 rounded-3xl font-black text-2xl shadow-2xl
                                    flex items-center justify-center gap-4
                                    bg-gradient-to-r ${selectedGame.gradient}
                                    ${selectedGame.isHeavy ? 'text-white' : 'text-[#0a0a0a]'}
                                    max-w-md mx-auto ring-4 ring-white/10
                                `}
                            >
                                <span>ابدأ اللعب</span>
                                <PlayIcon />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GamesPage;
