import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Feather } from 'lucide-react';

const InfoSection = ({ icon: Icon, title, children }: any) => (
    <div className="flex items-start justify-end gap-4 text-right group">
        <div className="flex-1">
            <h3 className="font-bold text-white text-xl mb-2 group-hover:text-amber-300 transition-colors">{title}</h3>
            <p className="text-white/70 leading-relaxed text-lg">
                {children}
            </p>
        </div>
        <div className="mt-1 p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-300 shrink-0">
            <Icon className="w-6 h-6 text-white group-hover:text-amber-300 transition-colors" />
        </div>
    </div>
);

const PatronBio = () => {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-slate-700/50 border border-slate-500/30 text-slate-300 text-sm font-bold mb-4">
                    <User className="w-4 h-4" />
                    <span>سيرة قديس</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-6 drop-shadow-2xl">
                    القديس الأنبا هدرا السائح
                </h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                    "بركة صلواته فلتكن معنا. آمين."
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl p-6 md:p-10 border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md shadow-xl"
            >
                <div className="space-y-10 dir-rtl">
                    <InfoSection title="النشأة والدعوة" icon={Calendar}>
                        من سنة 111 للشهداء (395م)، تنيَّح الأب العظيم الأنبا هدرا الأسواني. وُلِدَ هذا القديس من أبوين مسيحيين، ربياه وعلَّماه مخافة الرب منذ صغره. ولما بلغ الثامنة عشرة، أراد والداه تزويجه، لكنه امتنع. وفي صباح اليوم التالي، ذهب للكنيسة وطلب إرشاد الله، فسمع ما طمأن قلبه. وعند خروجه، رأى جنازة، فحدث نفسه قائلاً: "اسمع يا هدرا، ليس هذا هو الذي مات، بل أنت يجب أن تموت عن العالم".
                    </InfoSection>

                    <div className="h-px bg-white/10 w-full" />

                    <InfoSection title="الرهبنة والنسك" icon={MapPin}>
                        ذهب للرهبنة، وحاول أهله إرجاعه فلم يفلحوا. عاش في عبادات حارّة ونسك، ثم انفرد في مغارة بعد 8 سنوات، مجاهداً ضد حروب العدو.
                    </InfoSection>

                    <div className="h-px bg-white/10 w-full" />

                    <InfoSection title="الأسقفية والخدمة" icon={Feather}>
                        بعد نياحة أسقف أسوان، اختاره الشعب وذهبوا لمغارته، فوافق بناءً على رؤيا إلهية. رسمه البابا ثاؤفيلس (23) أسقفاً على أسوان. عكف على وعظ شعبه وصنع الله على يديه آيات كثيرة. تنيح بسلام، وما زال ديره عامراً غرب أسوان.
                    </InfoSection>
                </div>
            </motion.div>
        </div>
    );
};

export default PatronBio;
