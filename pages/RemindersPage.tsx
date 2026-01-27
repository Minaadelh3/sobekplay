import React from 'react';
import { motion } from 'framer-motion';

// --- Types & Data ---

interface Item {
    text: string;
    icon?: string;
}

interface Section {
    id: string;
    title: string;
    description: string;
    gradient: string;
    items: Item[];
    subsections?: { title: string; items: Item[] }[]; // Optional for split lists
}

// --- Content Data (Egyptian Arabic / Friendly Tone) ---

const GUIDANCE_SECTIONS: Section[] = [
    {
        id: "station",
        title: "من أول المحطة 🚆",
        description: "بداية الرحلة لازم تكون صح. خليك جاهز ورايق.",
        gradient: "from-blue-900 via-slate-900 to-black",
        items: [
            { text: "نتجمع كلنا في ميعادنا، القطر مش بيستنى حد ⏰" },
            { text: "عينك على شنطتك وشنطة اللي جنبك، إحنا فريق واحد 🤝" },
            { text: "ساعد غيرك في الشيل والحط، الرحلة بتبدأ بجدعنة 💪" },
            { text: "أول صورة جماعية في المحطة.. دي الذكرى اللي بتعيش 📸" },
            { text: "مود الرحلة بيبدأ من هنا.. افصل عن أي حاجة ورا ✨" }
        ]
    },
    {
        id: "bag",
        title: "الشنطة والتحضير 🎒",
        description: "مش مجرد هدوم، دي حاجات هتخلي يومك أسهل.",
        gradient: "from-emerald-900 via-teal-900 to-black",
        items: [], // Using subsections instead
        subsections: [
            {
                title: "أساسيات في لبسك",
                items: [
                    { text: "جزمة مريحة جدًا (هنمشي كتير وهنتبسط) 👟" },
                    { text: "لبس خفيف ومريح للنهار 👕" },
                    { text: "جاكيت أو حاجة تقيلة لليل ضروري (الجو بيقلب) 🧥" },
                    { text: "قبعة / كاب ونظارة شمس (شمس أسوان قوية) 🧢" }
                ]
            },
            {
                title: "متنساش معاك",
                items: [
                    { text: "الشاحن والباور بانك (أهم من الأكل) 🔋" },
                    { text: "أدويتك الشخصية ومسكن بسيط احتياطي 💊" },
                    { text: "شنطة صغيرة (Cross/Backpack) لحاجاتك اليومية 🎒" },
                    { text: "كريم واقي من الشمس (Sunblock) 🌞" }
                ]
            }
        ]
    },
    {
        id: "nubia",
        title: "وإحنا في أسوان والنوبة 🌴",
        description: "المكان ده له روح خاصة، تعال نعيشها صح.",
        gradient: "from-orange-900 via-amber-900 to-black",
        items: [
            { text: "الميه.. الميه.. الميه! اشرب دايمًا حتى لو مش عطشان 💧" },
            { text: "الهدوء هنا مقدس. عيش اللحظة من غير دوشة 🧘" },
            { text: "أهل النوبة طيبين جدًا، ابتسامتك هي مفتاح قلوبهم 😊" },
            { text: "الجو حر شوية الصبح، بس المزاج عالي.. استمتع بالدفء 😎" },
            { text: "النيل هنا مختلف، اتأمله وخد منه طاقة 🌊" }
        ]
    },
    {
        id: "photos",
        title: "وقت التصوير 📸",
        description: "صور عشان تفتكر، بس متنساش تعيش.",
        gradient: "from-purple-900 via-indigo-900 to-black",
        items: [
            { text: "صور كتير، بس نزل موبايلك شوية وبص بعينك 👀" },
            { text: "نستأذن قبل ما نصور حد من أهل البلد، دي أصولنا 🙏" },
            { text: "الصور الجماعية أحلى مليون مرة من السيلفي لوحدك 👨‍👩‍👧‍👦" },
            { text: "لو في مكان فيه هدوء، نحترم حرمة المكان وإحنا بنصور 🤫" }
        ]
    },
    {
        id: "program",
        title: "برنامج الرحلة 🗺️",
        description: "الالتزام هو سر الانبساط.",
        gradient: "from-cyan-900 via-blue-900 to-black",
        items: [
            { text: "الالتزام بالمواعيد بيخلينا نلحق كل حاجة برواقة ⏳" },
            { text: "بلاش استعجال، البرنامج معمول عشان نتبسط مش عشان نجري 🚶" },
            { text: "خليك مرن، لو حاجة اتاخرت شوية، كله جزء من المغامرة ✨" },
            { text: "ثق في 'الليدرز'، همهم إنك تكون مبسوط ومرتاح ❤️" }
        ]
    },
    {
        id: "rules",
        title: "قواعد الرحلة 🤍",
        description: "عشان كلنا نرجع بقلب صافي وذكريات حلوة.",
        gradient: "from-rose-900 via-red-900 to-black",
        items: [
            { text: "سيب الزعل والتوتر في القاهرة، إحنا هنا عشان نفرح 😄" },
            { text: "اتعرف على ناس جديدة، الرحلة فرصة للصداقات 🤝" },
            { text: "لو حد محتاج حاجة، كلنا أهله وإخواته 🤗" },
            { text: "الهدوء والصوت الواطي شياكة ورقي 🔇" },
            { text: "اضحك من قلبك، الضحكة معدية 😂" }
        ]
    }
];

// --- Special Sobek Section ---

const SOBEK_ADVICE = [
    { text: "أسوان مش مكان.. أسوان حالة. سيب روحك تحس بيها." },
    { text: "النيل صبور، اتعلم منه إن كل حاجة بتيجي في وقتها." },
    { text: "البساطة هي قمة الجمال. متدورش على التعقيد هنا." },
    { text: "اللي بيفضل من الرحلة مش الصور، اللي بيفضل هو شعورك وسط الناس." },
    { text: "الناس هي الكنز.. والقلوب الصافية هي الآثار الحقيقية." },
];

// --- Components ---

const SectionCard: React.FC<{ section: Section; index: number }> = ({ section, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden group border border-white/5 bg-gradient-to-br ${section.gradient}`}
        >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />

            <div className="relative z-10" dir="rtl">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-2">{section.title}</h2>
                    <p className="text-white/60 text-sm md:text-base font-medium">{section.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Render Regular Items */}
                    {section.items.length > 0 && section.items.map((item, idx) => (
                        <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/5 flex items-start gap-3 backdrop-blur-sm">
                            <span className="text-accent-gold mt-1">✦</span>
                            <span className="text-white/90 font-medium leading-relaxed">{item.text}</span>
                        </div>
                    ))}

                    {/* Render Subsections (Nested Grouping) */}
                    {section.subsections && section.subsections.map((sub, sIdx) => (
                        <div key={`sub-${sIdx}`} className="col-span-1 md:col-span-2 mt-4 first:mt-0">
                            <h3 className="text-accent-gold font-bold mb-3 text-lg border-b border-white/10 pb-2 inline-block">
                                {sub.title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sub.items.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/5 flex items-start gap-3 backdrop-blur-sm">
                                        <span className="text-accent-green mt-1">✔</span>
                                        <span className="text-white/90 font-medium leading-relaxed">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const MrSobekCard: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden text-center border-t border-b border-accent-gold/30 bg-black/60 backdrop-blur-md"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-accent-gold rounded-full flex items-center justify-center text-4xl mb-6 shadow-glow">
                    🐊
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-accent-gold mb-8 tracking-wide uppercase">
                    نصايح Mr. Sobek
                </h2>

                <div className="space-y-6 max-w-2xl">
                    {SOBEK_ADVICE.map((advice, idx) => (
                        <p key={idx} className="text-xl md:text-2xl text-white/90 font-serif italic leading-relaxed" dir="rtl">
                            "{advice.text}"
                        </p>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
                    <p className="text-white/40 text-sm">رحلة سعيدة يا أبطال النيل</p>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page ---

const RemindersPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-nearblack pt-24 pb-28 px-4 md:px-12">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6">تنبيهات الرحلة 🧳✨</h1>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto" dir="rtl">
                        دليلك الكامل عشان رحلتنا في أسوان والنوبة تكون أجمل ذكرى.
                        اقرأها برواقة وخليك جاهز للمغامرة.
                    </p>
                </motion.div>

                {/* Main Sections */}
                <div className="space-y-4">
                    {GUIDANCE_SECTIONS.map((section, idx) => (
                        <SectionCard key={section.id} section={section} index={idx} />
                    ))}
                </div>

                {/* Sobek Final Wisdom */}
                <div className="mt-20">
                    <MrSobekCard />
                </div>
            </div>
        </div>
    );
};

export default RemindersPage;
