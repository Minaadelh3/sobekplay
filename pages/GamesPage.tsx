import React from 'react';
import { motion } from 'framer-motion';
import { BackButton } from '../components/BackButton.tsx';

// --- ICONS ---
const Icons = {
    Proverbs: () => <span className="text-4xl">🧩</span>,
    Charades: () => <span className="text-4xl">🎭</span>,
    Verse: () => <span className="text-4xl">📖</span>,
    Characters: () => <span className="text-4xl">👥</span>,
    Story: () => <span className="text-4xl">✍️</span>,
    Forbidden: () => <span className="text-4xl">🚫</span>,
    Panic: () => <span className="text-4xl">⚡</span>,
    Song: () => <span className="text-4xl">🎵</span>,
};

// --- DATA ---
const GAMES = [
    {
        id: 'proverbs',
        title: "كمّل المثل",
        desc: "أمثالنا الشعبية.. فاكرها ولا نسيت؟",
        color: "from-amber-600 to-orange-800",
        icon: Icons.Proverbs,
        tag: "سرعة بديهة"
    },
    {
        id: 'charades',
        title: "مثّلها لو تقدر",
        desc: "من غير كلام، ورّينا شطارتك.",
        color: "from-purple-600 to-indigo-900",
        icon: Icons.Charades,
        tag: "تمثيل"
    },
    {
        id: 'verse-complete',
        title: "كمّل الآية",
        desc: "آيات حافظينها، بس يا ترى بدقة؟",
        color: "from-emerald-600 to-teal-900",
        icon: Icons.Verse,
        tag: "روحي"
    },
    {
        id: 'who-am-i',
        title: "مين ده؟",
        desc: "شخصيات كتابية، مين يعرفها الأول؟",
        color: "from-blue-600 to-cyan-800",
        icon: Icons.Characters,
        tag: "معرفة"
    },
    {
        id: 'story-relay',
        title: "احكي يا شهرزاد",
        desc: "أنا كلمة وأنت كلمة.. ونشوف القصة هتروح فين.",
        color: "from-rose-600 to-pink-900",
        icon: Icons.Story,
        tag: "تأليف"
    },
    {
        id: 'forbidden-words',
        title: "ممنوعات",
        desc: "أوعى تقول الكلمة الممنوعة وإنت بتشرح.",
        color: "from-red-600 to-red-900",
        icon: Icons.Forbidden,
        tag: "تركيز عالي"
    },
    {
        id: 'panic-mode',
        title: "قول بسرعة",
        desc: "3 حاجات في 5 ثواني.. لسانك هيلف!",
        color: "from-yellow-600 to-amber-700",
        icon: Icons.Panic,
        tag: "توتر"
    },
    {
        id: 'she3ar',
        title: "شعار الرحلة",
        desc: "اسمع النشيد وعيش في المود.",
        color: "from-sky-600 to-blue-800",
        icon: Icons.Song,
        tag: "مزيكا",
        link: "/she3ar-al-re7la"
    }
];

const GamesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white safe-area-pb font-arabic" dir="rtl">
            <BackButton />

            <div className="pt-24 px-4 pb-32 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center md:text-right">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
                        ملاهي سوبيك
                    </h1>
                    <p className="text-xl text-white/60 font-medium">
                        العب، اضحك، ونافس صحابك! 🎉
                    </p>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {GAMES.map((game, idx) => (
                        <motion.a
                            href={game.link || `#game-${game.id}`} // Using anchors for now as placeholders or internal links
                            key={game.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                relative overflow-hidden rounded-[2rem] p-1 
                                bg-gradient-to-br ${game.color}
                                group cursor-pointer shadow-lg
                            `}
                        >
                            {/* Card Content Wrapper */}
                            <div className="relative h-full bg-black/20 backdrop-blur-sm rounded-[1.8rem] p-6 flex flex-col justify-between min-h-[220px]">

                                {/* Top: Tag & Icon */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white/90 border border-white/10">
                                        {game.tag}
                                    </span>
                                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                        <game.icon />
                                    </div>
                                </div>

                                {/* Middle: Text */}
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">
                                        {game.title}
                                    </h2>
                                    <p className="text-white/80 font-medium text-lg leading-relaxed line-clamp-2">
                                        {game.desc}
                                    </p>
                                </div>

                                {/* Bottom: Action Indicator */}
                                <div className="mt-6 flex items-center gap-2 text-white/40 text-sm font-bold group-hover:text-white transition-colors">
                                    <span>يلا نلعب</span>
                                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>

                                {/* Decorative Background Glow */}
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[60px] group-hover:bg-white/20 transition-all duration-500" />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
