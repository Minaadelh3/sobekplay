import React, { useState, useEffect } from 'react';
import { useTabReset } from '../hooks/useTabReset';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';

// --- ICONS ---
const BackIcon = () => (
    <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

// --- DATA ---

const MAIN_CARDS = [
    {
        id: 'bag',
        title: '🎒 تجهيز الشنطة',
        desc: 'حاجات لو نسيتها هتتعبك',
        color: 'from-blue-600 to-indigo-900'
    },
    {
        id: 'general',
        title: '🌍 تنبيهات عامة',
        desc: 'عشان تستمتع ومتحتارش',
        color: 'from-emerald-600 to-teal-900'
    },
    {
        id: 'movement',
        title: '🚶‍♂️ تنبيهات التحرك',
        desc: 'مواعيد.. محطات.. نظام',
        color: 'from-orange-600 to-red-900'
    },
    {
        id: 'days',
        title: '📅 تنبيهات الأيام',
        desc: 'تفاصيل كل يوم',
        color: 'from-purple-600 to-fuchsia-900'
    },
];

const PREP_SECTIONS = [
    {
        title: "حاجات أساسية",
        items: ["بطاقة شخصية", "فلوس كاش", "موبايل", "شاحن", "باور بانك", "سماعة"]
    },
    {
        title: "لبس مناسب لأسوان",
        items: ["لبس قطن خفيف", "تيشيرتات مريحة", "بنطلون / شورت عملي", "جاكيت خفيف للليل", "شرابات", "ملابس داخلية", "شبشب", "كوتشي مريح للمشي"]
    },
    {
        title: "الشمس والجو",
        items: ["نضارة شمس", "كاب أو طاقية", "واقي شمس", "مناديل"]
    },
    {
        title: "حاجات شخصية",
        items: ["أدواتك الشخصية", "أدوية خاصة", "برفيوم / مزيل عرق"]
    }
];

const MOVEMENT_INFO = [
    {
        title: "قواعد عامة",
        points: [
            "الالتزام بالمواعيد مهم عشان كلنا نتحرك سوا",
            "خليك موجود قبل أي تحرك بـ 15 دقيقة",
            "موبايلك يكون مشحون دايمًا قبل النزول"
        ]
    },
    {
        title: "السفر (القاهرة - أسوان)",
        points: [
            "التجمع في محطة مصر (رمسيس)",
            "خلي معاك تذكرتك ورقم العربية",
            "شنطتك تكون قريبة منك ومقفولة"
        ]
    },
    {
        title: "الرجوع (أسوان - القاهرة)",
        points: [
            "التحرك من محطة أسوان",
            "نفس نظام القطر بس وإنت راجع",
            "هات مية وأكل خفيف للطريق"
        ]
    }
];

const DAYS = [
    { id: 1, title: 'اليوم الأول' },
    { id: 2, title: 'اليوم الثاني' },
    { id: 3, title: 'اليوم الثالث' },
    { id: 4, title: 'اليوم الرابع' },
];

const ALL_PREP_ITEMS = PREP_SECTIONS.flatMap(s => s.items);

// --- COMPONENTS ---

// 1. TOP NAV BAR (Generic for Sub-pages)
const TopNav: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <div className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md pt-6 pb-4 px-6 border-b border-white/5 flex items-center gap-4">
        <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full"
        >
            <BackIcon />
            <span className="font-bold text-sm">رجوع</span>
        </button>
        <span className="text-lg font-bold text-white truncate flex-1 text-left">{title}</span>
    </div>
);

// 2. CHECKLIST COMPONENT
const BagChecklist: React.FC = () => {
    const [checked, setChecked] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('sobek_bag_v1');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const toggle = (item: string) => {
        const next = new Set(checked);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        setChecked(next);
        localStorage.setItem('sobek_bag_v1', JSON.stringify(Array.from(next)));
    };

    const progress = Math.round((checked.size / ALL_PREP_ITEMS.length) * 100);

    return (
        <div className="p-6 pb-20 space-y-8">
            {/* Progress */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl text-center">
                <div className="text-3xl font-black text-blue-400 mb-2">{progress}%</div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden w-full max-w-[200px] mx-auto">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-blue-200/60 text-sm mt-2">شنطتك قربت تجهز</p>
            </div>

            {/* Sections */}
            {PREP_SECTIONS.map((section, idx) => (
                <div key={idx}>
                    <h3 className="text-xl font-bold text-white mb-4 px-2">{section.title}</h3>
                    <div className="space-y-3">
                        {section.items.map((item, i) => {
                            const isDone = checked.has(item);
                            return (
                                <div
                                    key={i}
                                    onClick={() => toggle(item)}
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all
                                        ${isDone ? 'bg-blue-500/20 border-blue-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                    `}
                                >
                                    <span className={`font-medium ${isDone ? 'text-white/40 line-through' : 'text-white'}`}>{item}</span>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isDone ? 'bg-blue-500 border-blue-500' : 'border-white/30'}`}>
                                        {isDone && <CheckIcon />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// 3. MOVEMENT COMPONENT
const MovementView: React.FC = () => (
    <div className="p-6 pb-20 space-y-8">
        {MOVEMENT_INFO.map((section, idx) => (
            <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-orange-400 mb-4">{section.title}</h3>
                <ul className="space-y-4">
                    {section.points.map((pt, i) => (
                        <li key={i} className="flex gap-3 text-white/80 leading-relaxed">
                            <span className="text-orange-500/50 mt-1">•</span>
                            {pt}
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
);

// 4. GENERAL INFO COMPONENT
const GeneralView: React.FC = () => (
    <div className="p-6 pb-20 space-y-4">
        {[
            "الجو حر أغلب اليوم، اشرب مية حتى لو مش عطشان",
            "الناس هناك محترمة وبسيطة، خليك ذوق",
            "التصوير عادي، بس استأذن قبل ما تصور حد",
            "الكاش مهم هناك، متعتمدش على الكارت",
            "الهدوء بالليل طبيعي، استمتع بيه"
        ].map((tip, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-2xl text-lg text-white/90 leading-relaxed">
                {tip}
            </div>
        ))}
    </div>
);

// --- MAIN PAGE ORCHESTRATOR ---

export const RemindersPage: React.FC = () => {
    // Navigation State
    const [level2, setLevel2] = useState<string | null>(null); // 'bag' | 'general' | 'movement' | 'days'
    const [level3, setLevel3] = useState<number | null>(null); // Day ID (1-4)

    // Reset Logic
    const handleTabReset = React.useCallback(() => {
        setLevel2(null);
        setLevel3(null);
    }, []);

    useTabReset('/reminders', handleTabReset);

    // Handlers
    const goBack = () => {
        if (level3) setLevel3(null); // Back from Day Detail to Days Menu
        else if (level2) setLevel2(null); // Back from Category to Main Menu
    };

    // Current Active Data
    const activeCard = MAIN_CARDS.find(c => c.id === level2);

    return (
        <div className="min-h-screen bg-[#020202] text-white font-arabic safe-area-pb" dir="rtl">

            <AnimatePresence mode="wait">

                {/* --- LEVEL 1: MAIN MENU --- */}
                {!level2 && (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="pt-16 pb-20 px-6 max-w-lg mx-auto"
                    >
                        <BackButton />
                        <div className="mb-8">
                            <h1 className="text-4xl font-black mb-2">التنبيهات</h1>
                            <p className="text-white/50">كل اللي محتاج تعرفه، في مكان واحد.</p>
                        </div>

                        <div className="space-y-4">
                            {MAIN_CARDS.map((card, idx) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setLevel2(card.id)}
                                    className={`
                                        bg-gradient-to-r ${card.color}
                                        p-6 rounded-2xl cursor-pointer shadow-lg
                                        flex items-center justify-between group
                                        active:scale-[0.98] transition-all
                                    `}
                                >
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{card.title}</h2>
                                        <p className="text-white/80 font-medium text-sm mt-1">{card.desc}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30">
                                        <BackIcon />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- LEVEL 2: SUB-PAGES --- */}
                {level2 && !level3 && (
                    <motion.div
                        key="level2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="min-h-screen bg-[#050505]"
                    >
                        <TopNav title={activeCard?.title || ''} onBack={goBack} />

                        {/* CONTENT SWITCHER */}
                        <div className="max-w-lg mx-auto">
                            {level2 === 'bag' && <BagChecklist />}
                            {level2 === 'general' && <GeneralView />}
                            {level2 === 'movement' && <MovementView />}

                            {/* DAYS MENU (Level 2 special case) */}
                            {level2 === 'days' && (
                                <div className="p-6 space-y-4">
                                    {DAYS.map((day, idx) => (
                                        <div
                                            key={day.id}
                                            onClick={() => setLevel3(day.id)}
                                            className="bg-white/5 p-6 rounded-2xl border border-white/10 cursor-pointer flex items-center justify-between hover:bg-white/10 active:scale-[0.98] transition-all"
                                        >
                                            <span className="text-xl font-bold text-white">{day.title}</span>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                                                <BackIcon />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* --- LEVEL 3: DAY DETAIL --- */}
                {level3 && (
                    <motion.div
                        key="level3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="min-h-screen bg-[#050505]"
                    >
                        <TopNav title={DAYS.find(d => d.id === level3)?.title || ''} onBack={goBack} />

                        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <span className="text-3xl">⏳</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">تفاصيل اليوم</h2>
                            <p className="text-white/50">قريبًا هتنزل كل التفاصيل هنا.</p>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default RemindersPage;
