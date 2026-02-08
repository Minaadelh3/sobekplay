import React from 'react';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import {
    MapPin,
    Waves,
    Sun,
    Anchor,
    Construction,
    Zap,
    History
} from 'lucide-react';

const InfoCard = ({ title, children, icon: Icon, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="bg-[#121820] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-accent-gold/30 transition-colors duration-500"
    >
        <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-gold shrink-0 group-hover:bg-accent-gold/10 transition-colors">
                <Icon size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white pt-2">{title}</h2>
        </div>
        <div className="text-white/70 leading-relaxed text-lg space-y-4">
            {children}
        </div>
    </motion.div>
);

const InformationsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] font-arabic text-white safe-area-pb" dir="rtl">
            <div className="pt-24 pb-32 px-5 max-w-4xl mx-auto">
                <BackButton />

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 text-center relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wide"
                    >
                        رحلة إلى أرض الذهب
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight relative z-10 drop-shadow-2xl leading-tight">
                        معلومات عن الرحلة
                    </h1>
                </motion.div>

                <div className="space-y-8 relative z-10">

                    {/* Aswan Section */}
                    <InfoCard title="أسوان - بلاد الذهب" icon={Sun} delay={0.1}>
                        <p>
                            أسوان هي البوابة الجنوبية لمصر، وعاصمة الجمال والهدوء. عُرفت قديماً باسم "سونو" أي السوق، لأنها كانت مركزاً تجارياً للقوافل القادمة من وإلى النوبة.
                        </p>
                        <p>
                            تتميز أسوان بطبيعتها الساحرة حيث يتعانق النيل مع صخور الجرانيت والكثبان الرملية الذهبية، وتضم العديد من المعالم الأثرية الهامة مثل معبد فيلة، والمسلة الناقصة، وجزيرة النباتات.
                        </p>
                    </InfoCard>

                    {/* High Dam Section */}
                    <InfoCard title="السد العالي" icon={Construction} delay={0.2}>
                        <p>
                            السد العالي هو أعظم مشروع هندسي في القرن العشرين. تم بناؤه لحماية مصر من فيضانات النيل العالية ولتوفير المياه وتوليد الكهرباء.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-white/60 marker:text-accent-gold">
                            <li>بدأ البناء في 9 يناير 1960.</li>
                            <li>تم الافتتاح الرسمي في 15 يناير 1971.</li>
                            <li>يبلغ طول السد 3600 متر، وعرض القاعدة 980 متر.</li>
                            <li>كون خلفه بحيرة ناصر، وهي أكبر بحيرة صناعية في العالم.</li>
                        </ul>
                    </InfoCard>

                    {/* Trip Details Section */}
                    <InfoCard title="تفاصيل الرحلة" icon={MapPin} delay={0.3}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-accent-gold font-bold mb-2 flex items-center gap-2">
                                    <History size={18} />
                                    الموعد
                                </h3>
                                <p>من الإثنين 9 فبراير إلى السبت 14 فبراير</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-accent-gold font-bold mb-2 flex items-center gap-2">
                                    <Anchor size={18} />
                                    الإقامة
                                </h3>
                                <p>فندق بسمة أسوان (4 نجوم ديلوكس)</p>
                            </div>
                        </div>
                    </InfoCard>
                </div>

                <div className="mt-16 text-center text-white/20 text-sm">
                    © Sobek Cinematic Experience
                </div>
            </div>
        </div>
    );
};

export default InformationsPage;
