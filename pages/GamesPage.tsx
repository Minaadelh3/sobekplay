import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// --- DATA: THE THOUGHT EXHIBITION ---
const MENTAL_GAMES = [
    {
        id: 'pass_boom',
        title: "عدّيها",
        hook: "الكلمة مش بس حرف.. الكلمة قنبلة موقوتة.",
        visual: "💣",
        accent: "#E63946", // Soft Red
        vibe: "خطر • سرعة • بديهة"
    },
    {
        id: 'truth_dare',
        title: "قول ولا تفوّت؟",
        hook: "الحقيقة بتوجع، بس التحدي بيخوف أكتر.",
        visual: "⚖️",
        accent: "#8338EC", // Deep Purple
        vibe: "جرأة • كشف • مواجهة"
    },
    {
        id: 'emoji_movie',
        title: "سينما صامتة",
        hook: "كل فيلم لقطة، وكل لقطة إيموجي.. مين يلقطها؟",
        visual: "🎬",
        accent: "#3A86FF", // Royal Blue
        vibe: "فن • خيال • ذاكرة"
    },
    {
        id: 'proverbs',
        title: "حكم الأجداد",
        hook: "الكلام ليكي يا جارة.. كملي عشان الحكاية توضح.",
        visual: "📜",
        accent: "#FB5607", // Burnt Orange
        vibe: "تراث • حكمة • سرعة"
    },
    {
        id: 'vector_shift',
        title: "ضد الجاذبية",
        hook: "لما الأرض تختفي، والاتجاهات تذوب.. عقلك هو البوصلة.",
        visual: "🌌",
        accent: "#00F5D4", // Cyan
        vibe: "خيال • فضاء • حرية"
    }
];

const GameBlock = ({
    item,
    index
}: {
    item: typeof MENTAL_GAMES[0];
    index: number;
}) => {
    // Parallax & Fade Logic
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Subtle float animation
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section
            ref={ref}
            className="min-h-[80vh] flex flex-col justify-center items-center relative py-20 pointer-events-none"
        >
            <motion.div
                style={{ opacity, y }}
                className="text-center max-w-4xl px-6"
            >
                {/* Visual Centerpiece */}
                <div
                    className="text-8xl md:text-9xl mb-12 opacity-80 drop-shadow-2xl filter blur-[1px]"
                    style={{ textShadow: `0 20px 80px ${item.accent}40` }}
                >
                    {item.visual}
                </div>

                {/* Title */}
                <h2 className="text-6xl md:text-8xl font-black font-arabic mb-8 text-nearblack tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-gray-800 to-gray-600">
                    {item.title}
                </h2>

                {/* The Divider */}
                <div className="w-16 h-[2px] bg-gray-300 mx-auto mb-10" />

                {/* The Hook */}
                <p className="text-xl md:text-3xl font-medium font-arabic text-gray-500 leading-loose max-w-2xl mx-auto">
                    {item.hook}
                </p>

                {/* The Vibe (Subtle Footer) */}
                <div
                    className="mt-12 text-sm font-bold tracking-[0.5em] uppercase text-gray-400 font-sans"
                    dir="ltr"
                >
                    {item.vibe}
                </div>
            </motion.div>
        </section>
    );
};

const GamesPage: React.FC = () => {
    // Intro Scroll Progress
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    return (
        <div className="min-h-[300vh] bg-[#F9F8F6] font-sans selection:bg-gray-200 selection:text-black overflow-hidden relative" dir="rtl">

            {/* Ambient Background Noise */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* Subtle Gradient Spots */}
            <motion.div
                style={{ y: backgroundY }}
                className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-100 rounded-full blur-[120px] opacity-30 pointer-events-none z-0"
            />
            <motion.div
                style={{ top: '40%', left: '-10%' }}
                className="fixed w-[60vw] h-[60vw] bg-purple-50 rounded-full blur-[150px] opacity-40 pointer-events-none z-0"
            />

            {/* Header / Intro */}
            <header className="h-screen flex flex-col justify-center items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-center"
                >
                    <h1 className="text-2xl md:text-3xl font-bold font-arabic text-gray-400 mb-6 tracking-widest">
                        مساحات للتفكير
                    </h1>
                    <div className="h-24 w-[1px] bg-gray-300 mx-auto mb-6" />
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">
                        Start Scrolling
                    </p>
                </motion.div>
            </header>

            {/* The Exhibition */}
            <main className="relative z-10 pb-32">
                {MENTAL_GAMES.map((game, idx) => (
                    <GameBlock key={game.id} item={game} index={idx} />
                ))}
            </main>

            {/* Quiet Footer */}
            <footer className="py-24 text-center opacity-30 relative z-10">
                <p className="font-arabic text-gray-400 text-lg">سوبيك • بلاي</p>
            </footer>

        </div>
    );
};

export default GamesPage;
