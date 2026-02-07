import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import { useProgramOverrides, EpisodeOverride } from '../hooks/useProgramOverrides';
import { useAuth } from '../context/AuthContext';
import { ProgramEpisodeEditor } from '../components/admin/ProgramEpisodeEditor';

// --- ICONS ---
const PlayIcon = () => (
    <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

export interface Episode {
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
        subtitle: "Night of Awakening – ليلة البعث", // Subtitle (small) – mapped to subtitle
        date: "محطة مصر → قطار أبو الهول → أسوان", // Location Line – mapped to date badge at top
        gradient: "from-slate-900 to-blue-900", // Keep existing gradient
        intro: "في اللحظة اللي القطار بيتحرك فيها… العالم القديم بيقفل، والجديد بيبدأ.", // Tagline – mapped to intro
        details: [
            { time: "7:30 م", event: "التجمع في محطة مصر وترتيب العبور" },
            { time: "9:00 م", event: "تحرك القطار وصلاة الشكر" },
            { time: "10:00 م", event: "تسبحة داخل القطار" },
        ]
    },
    {
        id: 2,
        title: "عروس النيل",
        subtitle: "The Nile Bride Season",
        date: "الثلاثاء 10 فبراير",
        gradient: "from-teal-800 to-cyan-900",
        intro: "النيل مش مية… النيل روح.",
        details: [
            { time: "9:00 ص", event: "وصول أسوان – التحرك إلى الفندق واستلام الغرف" },
            { time: "11:00 ص", event: "التحرك إلى معبد فيلة – جزيرة هيسا وتنجار – بوابة إيزيس وأوزوريس" },
            { time: "4:30 ظ", event: "غذاء في البيت النوبي – نحضر الغروب على جزيرة الأحلام" },
            { time: "7:00 م", event: "عرض الصوت والضوء – معبد فيلة" },
            { time: "9:30 م", event: "جولة حرة + عشاء" },
            { time: "11:30 م", event: "ألعاب ومسابقات" }
        ]
    },
    {
        id: 3,
        title: "أطياب الجنوب",
        subtitle: "White Sensation Adventure",
        date: "الأربعاء 11 فبراير",
        gradient: "from-orange-700 to-amber-900",
        intro: "الأبيض هنا مش لون… الأبيض حالة.",
        details: [
            { time: "7:00 ص", event: "نوبة صحيان" },
            { time: "8:00 ص", event: "الفطار في الفندق" },
            { time: "10:00 ص", event: "التحرك للقرية النوبية وقضاء اليوم في النيل – جزيرة النباتات – ضريح أغاخان – قهوة في بيت فيلم مافيا – زيارة البيت النوبي" },
            { time: "3:00 ظ", event: "الغذاء في القرية النوبية غرب سهيل" },
            { time: "5:00 م", event: "عودة للفندق" },
            { time: "7:30 م", event: "زيارة المطرانية + فترة روحية" },
            { time: "9:00 م", event: "جولة حرة" },
            { time: "11:00 م", event: "استعداد للتحرك إلى أبو سمبل" }
        ]
    },
    {
        id: 4,
        title: "مملكة التماسيح",
        subtitle: "Curse of Sobek",
        date: "الخميس 12 فبراير",
        gradient: "from-emerald-800 to-green-950",
        intro: "اللي هيعدي من هنا… مش زي اللي دخل.",
        details: [
            { time: "1:00 ص", event: "التحرك إلى أبو سمبل" },
            { time: "5:00 ص", event: "وصول أبو سمبل وزيارة المعبد" },
            { time: "8:00 ص", event: "التحرك للعودة – زيارة معبد كلابشة + السد العالي" },
            { time: "3:00 ظ", event: "غذاء في مطعم عموري" },
            { time: "5:00 م", event: "عودة للفندق" },
            { time: "7:30 م", event: "جولة حرة" },
            { time: "11:30 م", event: "حفلة السمر" }
        ]
    },
    {
        id: 5,
        title: "المشهد الأخير",
        subtitle: "The Final Judgment – محكمة الآلهة",
        date: "الجمعة 13 فبراير",
        gradient: "from-indigo-900 to-slate-900",
        intro: "هنا… كل حاجة بتقف وتبص وراها.",
        details: [
            { time: "7:00 ص", event: "نوبة صحيان" },
            { time: "8:00 ص", event: "الفطار في الفندق" },
            { time: "10:00 ص", event: "زيارة متحف النوبة + جولة بالحنطور" },
            { time: "12:00 ظ", event: "فسحة مراكب شراعية في النيل" },
            { time: "1:30 ظ", event: "الغذاء في مطعم الدوكا" },
            { time: "3:00 ظ", event: "التحرك للقطار" },
            { time: "4:00 ع", event: "تحرك القطار الي القاهرة" }
        ]
    },
];

// --- COMPONENTS ---

const EpisodeCard: React.FC<{ episode: Episode; onClick: () => void; onEdit?: () => void; index: number; isAdmin?: boolean }> = ({ episode, onClick, onEdit, index, isAdmin }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="group relative h-52 w-full rounded-2xl overflow-hidden shadow-xl mb-6 border border-white/5 bg-[#121820]"
        >
            {/* Clickable Area for Detail View */}
            <div onClick={onClick} className="absolute inset-0 cursor-pointer z-10">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${episode.gradient} opacity-90 transition-all duration-700 group-hover:scale-105`} />

                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>

            {/* Admin Edit Button - Above Clickable Area */}
            {isAdmin && onEdit && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="absolute top-4 left-4 z-30 p-2 bg-black/60 hover:bg-black/90 text-white/70 hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95"
                    title="Edit Episode"
                >
                    <EditIcon />
                </button>
            )}

            {/* Labels */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase bg-black/20 px-2 py-1 rounded border border-white/5">
                    EPISODE 0{episode.id}
                </span>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 w-full p-6 flex justify-between items-end z-20 pointer-events-none">
                <div className="flex-1 pl-4 rtl:pl-0 rtl:pr-4">
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-md font-arabic">
                        {episode.title}
                    </h2>
                    <p className="text-white/70 font-medium text-sm md:text-base italic leading-relaxed line-clamp-2">
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
    const { user, isAdmin } = useAuth();
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
    const [editingEpisodeId, setEditingEpisodeId] = useState<number | null>(null);

    const { overrides, loading, saveOverride, resetOverride } = useProgramOverrides();

    const mergedEpisodes = useMemo(() => {
        if (loading) return EPISODES;
        return EPISODES.map(ep => {
            const override = overrides[ep.id];
            if (override && override.enabled) {
                return {
                    ...ep,
                    title: override.title || ep.title,
                    subtitle: override.subtitle || ep.subtitle,
                    intro: override.intro || ep.intro,
                    date: override.date || ep.date,
                    details: override.details && override.details.length > 0 ? override.details : ep.details
                };
            }
            return ep;
        });
    }, [overrides, loading]);

    const selectedEpisode = useMemo(() =>
        selectedEpisodeId ? mergedEpisodes.find(e => e.id === selectedEpisodeId) || null : null,
        [selectedEpisodeId, mergedEpisodes]);

    const editingEpisode = useMemo(() =>
        editingEpisodeId ? EPISODES.find(e => e.id === editingEpisodeId) || null : null,
        [editingEpisodeId]);

    const handleTabReset = React.useCallback(() => {
        setSelectedEpisodeId(null);
        setEditingEpisodeId(null);
    }, []);

    useTabReset('/program', handleTabReset);

    const closeModal = () => setSelectedEpisodeId(null);
    const closeEditor = () => setEditingEpisodeId(null);

    const handleSaveOverride = async (episodeId: number, data: EpisodeOverride) => {
        const success = await saveOverride(episodeId, data);
        if (success) {
            closeEditor();
            // Optional: Show toast
        } else {
            alert("Failed to save override");
        }
    };

    const handleResetOverride = async (episodeId: number) => {
        if (window.confirm("Are you sure you want to reset to default content?")) {
            const success = await resetOverride(episodeId);
            if (success) {
                closeEditor();
            }
        }
    };

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

                    {isAdmin && (
                        <div className="mt-4 inline-block bg-accent-gold/10 text-accent-gold border border-accent-gold/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                            🛡️ ADMIN MODE ACTIVE
                        </div>
                    )}
                </div>

                {/* Episodes List */}
                <div className="space-y-6">
                    {mergedEpisodes.map((ep, idx) => (
                        <EpisodeCard
                            key={ep.id}
                            episode={ep}
                            index={idx}
                            onClick={() => setSelectedEpisodeId(ep.id)}
                            onEdit={() => setEditingEpisodeId(ep.id)}
                            isAdmin={isAdmin}
                        />
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
                        className="fixed inset-0 z-50 bg-[#050505] flex flex-col"
                    >
                        {/* Custom Nav for Episode - Fixed at top */}
                        <div className="absolute top-0 left-0 right-0 z-[60] p-6 flex justify-between items-start pointer-events-none">
                            <div className="pointer-events-auto">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white hover:bg-black/60 transition-colors shadow-lg"
                                >
                                    <BackIcon />
                                    <span className="font-bold text-sm">رجوع</span>
                                </button>
                            </div>

                            {isAdmin && (
                                <div className="pointer-events-auto">
                                    <button
                                        onClick={() => {
                                            closeModal();
                                            setEditingEpisodeId(selectedEpisode.id);
                                        }}
                                        className="flex items-center gap-2 bg-accent-gold/20 backdrop-blur-md px-4 py-2 rounded-full border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/30 transition-colors shadow-lg"
                                    >
                                        <EditIcon />
                                        <span className="font-bold text-sm">تعديل</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                            {/* Cinematic Header */}
                            <motion.div
                                layoutId={`ep-bg-${selectedEpisode.id}`}
                                className={`relative min-h-[45vh] bg-gradient-to-b ${selectedEpisode.gradient} flex items-end`}
                            >
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />

                                <div className="w-full p-8 pb-12 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10 pt-32">
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

                                {/* Bottom Back Button */}
                                <div className="mt-16 mb-8 flex justify-center">
                                    <button
                                        onClick={closeModal}
                                        className="w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white transition-all active:scale-95"
                                    >
                                        <BackIcon />
                                        <span className="font-bold text-lg">العودة للبرنامج</span>
                                    </button>
                                </div>

                                {/* Footer Space */}
                                <div className="h-32" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- ADMIN EDITOR MODAL --- */}
            <AnimatePresence>
                {editingEpisode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="w-full max-w-3xl bg-[#0F1218] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#141A23]">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <EditIcon />
                                    تعديل الحلقة: {editingEpisode.title}
                                </h2>
                                <button onClick={closeEditor} className="text-gray-400 hover:text-white transition-colors">
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <ProgramEpisodeEditor
                                    episode={editingEpisode}
                                    overrides={overrides[editingEpisode.id]}
                                    onSave={handleSaveOverride}
                                    onReset={handleResetOverride}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default ProgramPage;
