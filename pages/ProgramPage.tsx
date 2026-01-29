import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackButton } from '../components/BackButton';

// --- ICONS ---
const PlayIcon = () => (
    <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const BackIcon = () => (
    <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

// --- DATA: EPISODES ---

interface Episode {
    id: number;
    title: string;
    subtitle: string;
    date: string;
    gradient: string;
    intro: string;
    details: { time: string; event: string }[];
}

export const EPISODES: Episode[] = [
    {
        id: 1,
        title: "ليلة الخروج",
        subtitle: "كلنا بنهرب من حاجة... عشان نلاقي حاجة.",
        date: "ليلة ٩ فبراير - فجر ١٠ فبراير",
        gradient: "from-slate-900 to-blue-900", // Night / Departure
        intro: "الشنط جاهزة، والوشوش بتضحك، بس القلوب بتدق. الليلة دي مش مجرد سفر.. دي بداية فصل جديد في الحكاية.",
        details: [
            { time: "09:00 PM", event: "التجمع في محطة مصر (رمسيس)" },
            { time: "10:00 PM", event: "تحرك قطار Vip" },
            { time: "11:00 PM", event: "سهرة في القطر" },
        ]
    },
    {
        id: 2,
        title: "عروس النيل",
        subtitle: "أول مرة تشوف النيل... كأنك بتشوفه لأول مرة.",
        date: "١٠ فبراير - الاثنين",
        gradient: "from-teal-800 to-cyan-900", // Nile / Water
        intro: "الهوا هنا ليه ريحة تانية. النيل فاتح دراعاته وبيقولك: نورت بيتك. هنا الزمن بيبطأ، والروح بتهدى.",
        details: [
            { time: "11:00 AM", event: "الوصول لمحطة أسوان" },
            { time: "12:00 PM", event: "التسكين في الفندق (إطلالة نيلية)" },
            { time: "02:00 PM", event: "غداء نوبي" },
            { time: "05:00 PM", event: "جولة حرة في السوق" },
            { time: "08:00 PM", event: "قعدة سمر" }
        ]
    },
    {
        id: 3,
        title: "أطياف الجنوب",
        subtitle: "الزمن هنا واقف... والقلوب لسه خضرة.",
        date: "١١ فبراير - الثلاثاء",
        gradient: "from-orange-700 to-amber-900", // Nostalgia / Warmth
        intro: "بين البيوت الملونة والوشوش السمرا الطيبة، بنرجع أطفال تاني. ذكريات بنعيشها لأول مرة، بس كأننا عارفينها من زمان.",
        details: [
            { time: "09:00 AM", event: "زيارة القرية النوبية" },
            { time: "12:00 PM", event: "لعب وتصوير مع التمساح" },
            { time: "03:00 PM", event: "جولة بالمراكب" },
            { time: "07:00 PM", event: "حفلة نوبية" }
        ]
    },
    {
        id: 4,
        title: "مملكة التمساح",
        subtitle: "القوة... الهدوء... والجمال اللي يخوف.",
        date: "١٢ فبراير - الأربعاء",
        gradient: "from-emerald-800 to-green-950", // Nature / Strength
        intro: "في حضرة الطبيعة، كل الأصوات بتسكت. عظمة الخالق بتشوفها عينك، وبتحس إنك صغير أوي قدام الجمال ده.",
        details: [
            { time: "08:00 AM", event: "زيارة معبد فيلة" },
            { time: "01:00 PM", event: "الحديقة النباتية" },
            { time: "04:00 PM", event: "غروب الشمس من الجزيرة" },
            { time: "08:00 PM", event: "العشا الأخير" }
        ]
    },
    {
        id: 5,
        title: "المشهد الأخير",
        subtitle: "مش كل وداع نهاية... فيه وداع بداية.",
        date: "١٣ فبراير - الخميس",
        gradient: "from-indigo-900 to-slate-900", // Closure
        intro: "الستارة بتنزل، بس المسرحية لسه مخلصتش. بنقفل الشنط، بس بناخد معانا حاجات متتشالش في شنط.. بناخد روح.",
        details: [
            { time: "10:00 AM", event: "شراء الهدايا والتذكارات" },
            { time: "02:00 PM", event: "التحرك للمحطة" },
            { time: "04:00 PM", event: "قطار العودة للقاهرة" },
            { time: "Next Day", event: "الوصول بالسلامة" }
        ]
    },
];

// --- COMPONENTS ---

const EpisodeCard: React.FC<{ episode: Episode; onClick: () => void; index: number }> = ({ episode, onClick, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onClick={onClick}
            className="group relative h-52 w-full rounded-2xl overflow-hidden cursor-pointer shadow-xl mb-6 border border-white/5 active:scale-[0.98] transition-transform"
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${episode.gradient} opacity-90 transition-all duration-700 group-hover:scale-105`} />

            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Labels */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase bg-black/20 px-2 py-1 rounded border border-white/5">
                    EPISODE 0{episode.id}
                </span>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 w-full p-6 flex justify-between items-end">
                <div className="flex-1 pl-4">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md font-arabic">
                        {episode.title}
                    </h2>
                    <p className="text-white/70 font-medium text-sm md:text-base italic leading-relaxed">
                        {episode.subtitle}
                    </p>
                </div>

                {/* Play Button */}
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                    <PlayIcon />
                </div>
            </div>
        </motion.div>
    );
};

const TopNav: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl pt-6 pb-4 px-6 border-b border-white/5 flex items-center gap-4">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5"
        >
            <BackIcon />
            <span className="font-bold text-sm">رجوع</span>
        </button>
        <span className="text-lg font-bold text-white truncate flex-1 text-left opacity-0 md:opacity-100 transition-opacity">
            {title}
        </span>
    </div>
);

// --- MAIN PAGE ---

import { useTabReset } from '../hooks/useTabReset';

export const ProgramPage: React.FC = () => {
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

    useTabReset('/program', () => {
        setSelectedEpisode(null);
    });

    const closeModal = () => setSelectedEpisode(null);

    return (
        <div className="min-h-screen bg-[#050505] font-arabic text-white safe-area-pb" dir="rtl">

            {/* --- HOME FEED --- */}
            <motion.div
                animate={{ opacity: selectedEpisode ? 0 : 1, y: selectedEpisode ? -20 : 0 }}
                className={`pt-16 pb-32 px-5 max-w-2xl mx-auto ${selectedEpisode ? 'pointer-events-none' : ''}`}
            >
                {/* Header */}
                <BackButton />
                <div className="mb-12 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter relative z-10">
                        برنامج الرحلة
                    </h1>
                    <p className="text-white/40 text-lg font-medium relative z-10">
                        مش برنامج... دي حدوتة ماشية مع النيل.
                    </p>
                </div>

                {/* Episodes List */}
                <div className="space-y-6">
                    {EPISODES.map((ep, idx) => (
                        <EpisodeCard key={ep.id} episode={ep} index={idx} onClick={() => setSelectedEpisode(ep)} />
                    ))}
                </div>

                <div className="mt-12 text-center text-white/20 text-sm">
                    © Sobek Cinematic Experience
                </div>
            </motion.div>

            {/* --- EPISODE DETAIL (OVERLAY) --- */}
            <AnimatePresence>
                {selectedEpisode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-y-auto"
                    >
                        {/* Custom Nav for Episode */}
                        <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                            <button
                                onClick={closeModal}
                                className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white hover:bg-black/50 transition-colors"
                            >
                                <BackIcon />
                                <span className="font-bold text-sm">خروج</span>
                            </button>
                        </div>

                        {/* Cinematic Header */}
                        <motion.div
                            layoutId={`ep-bg-${selectedEpisode.id}`}
                            className={`relative min-h-[45vh] bg-gradient-to-b ${selectedEpisode.gradient} flex items-end`}
                        >
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />

                            <div className="w-full p-8 pb-12 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold text-white/80 mb-4 tracking-widest">
                                    {selectedEpisode.date}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
                                    {selectedEpisode.title}
                                </h1>
                                <p className="text-xl text-white/80 font-medium leading-relaxed max-w-lg border-r-4 border-white/20 pr-4">
                                    {selectedEpisode.subtitle}
                                </p>
                            </div>
                        </motion.div>

                        {/* Content Body */}
                        <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full bg-[#050505]">

                            {/* Intro Mood */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="mb-12"
                            >
                                <p className="text-lg md:text-xl text-white/70 leading-loose mx-auto">
                                    {selectedEpisode.intro}
                                </p>
                            </motion.div>

                            {/* Timeline Flow */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="space-y-10 relative pl-4"
                            >
                                {/* Vertical Line */}
                                <div className="absolute top-2 bottom-2 right-[7px] w-[1px] bg-gradient-to-b from-white/20 to-transparent" />

                                {selectedEpisode.details.map((detail, i) => (
                                    <div key={i} className="relative pr-8 group">
                                        {/* Dot */}
                                        <div className="absolute top-2 right-0 w-4 h-4 rounded-full bg-[#050505] border-2 border-white/20 group-hover:border-white/60 group-hover:bg-white/10 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.1)]" />

                                        <p className="text-xs font-bold text-blue-400 mb-1 tracking-widest opacity-80 uppercase">
                                            {detail.time}
                                        </p>
                                        <h3 className="text-xl text-white font-bold group-hover:text-blue-200 transition-colors">
                                            {detail.event}
                                        </h3>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Footer Space */}
                            <div className="h-32" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProgramPage;
