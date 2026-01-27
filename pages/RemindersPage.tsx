import React from 'react';
import { motion } from 'framer-motion';

interface ReminderCategory {
    title: string;
    items: { text: string; bg: string }[];
}

const CATEGORIES: ReminderCategory[] = [
    {
        title: "الشنطة 🎒",
        items: [
            { text: "متنساش القبعة 🧢", bg: "from-blue-900/40 to-blue-800/40" },
            { text: "كريم الشمس هيفرق قوي 🌞", bg: "from-orange-500/20 to-yellow-500/20" },
            { text: "جزمة مريحة = يوم أحسن 👟", bg: "from-green-500/20 to-emerald-500/20" },
            { text: "شاحن الموبايل (وباور بانك) 🔋", bg: "from-gray-700/40 to-gray-600/40" },
        ]
    },
    {
        title: "الجو والمكان 🌊",
        items: [
            { text: "الهوا بالليل على النيل تحفة 🌙", bg: "from-blue-600/20 to-cyan-500/20" },
            { text: "الجو حر شوية بس المزاج عالي 😎", bg: "from-yellow-600/20 to-orange-500/20" },
            { text: "خلي بالك من الشمس الصبح ☀️", bg: "from-red-500/20 to-orange-400/20" },
        ]
    },
    {
        title: "روح الرحلة ✨",
        items: [
            { text: "نضحك أكتر ونسيب أي توتر ورا 😄", bg: "from-purple-500/20 to-pink-500/20" },
            { text: "الرحلة أحلى وإحنا مع بعض 🤍", bg: "from-rose-500/20 to-red-500/20" },
            { text: "خدها بهدوووء… إحنا في فسحة 🧘", bg: "from-indigo-500/20 to-violet-500/20" },
        ]
    },
    {
        title: "نصايح بسيطة 💡",
        items: [
            { text: "صور كتير… بس عيش اللحظة كمان 📸", bg: "from-teal-500/20 to-cyan-500/20" },
            { text: "اسأل، شارك، متتكسفش 😉", bg: "from-fuchsia-500/20 to-purple-500/20" },
            { text: "اشرب مياه كتير 💧", bg: "from-blue-400/20 to-blue-300/20" },
        ]
    }
];

const RemindersPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-nearblack pt-24 pb-28 px-4 md:px-12">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4">تنبيهات 🧳✨</h1>
                    <p className="text-white/60 text-lg">كل حاجة محتاج تعرفها عشان الرحلة تبقى أحلى.</p>
                </motion.div>

                <div className="space-y-12">
                    {CATEGORIES.map((category, catIdx) => (
                        <div key={catIdx}>
                            <motion.h2
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (catIdx * 0.1) }}
                                className="text-xl md:text-2xl font-bold text-accent-gold mb-6 text-right px-2"
                            >
                                {category.title}
                            </motion.h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
                                {category.items.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + (catIdx * 0.1) + (idx * 0.05) }}
                                        whileHover={{ scale: 1.02 }}
                                        className={`rounded-2xl bg-gradient-to-br ${item.bg} border border-white/5 p-6 flex items-center justify-center text-center h-32 backdrop-blur-sm group cursor-default shadow-lg`}
                                    >
                                        <p className="text-lg font-medium text-white/90 leading-relaxed font-arabic">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RemindersPage;
