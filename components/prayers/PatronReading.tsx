import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Heart,
    Scroll,
    Sparkles,
    Quote
} from 'lucide-react';

const PatronReading: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#050505] font-arabic text-white safe-area-pb" dir="rtl">
            <div className="pt-8 pb-32 px-5 max-w-4xl mx-auto">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 text-center relative"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-sm font-bold tracking-wide"
                    >
                        سفر يشوع بن سيراخ
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight relative z-10 drop-shadow-2xl leading-tight">
                        تأملات روحية
                    </h1>
                </motion.div>

                <div className="space-y-8 relative z-10">

                    {/* Primary Quote Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#121820] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-accent-gold/30 transition-colors duration-500"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
                            <Quote size={80} />
                        </div>

                        <div className="relative z-10 text-center">
                            <h2 className="text-2xl md:text-4xl font-bold leading-relaxed text-white mb-8">
                                "أنظروا إلى الأجيال القديمة وتأملوا..
                                <br className="hidden md:block" />
                                هل اتكل أحد على الرب فخزي؟
                                <br />
                                أو هل ثبت على مخافته فخذل؟
                                <br />
                                أو هل دعاه فازدرى به؟"
                            </h2>
                            <div className="inline-flex items-center gap-2 text-accent-gold font-bold text-lg md:text-xl bg-accent-gold/5 px-6 py-2 rounded-xl border border-accent-gold/10">
                                <Scroll size={18} />
                                <span>(سي 2 : 11، 12)</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Commentary Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="grid md:grid-cols-[auto_1fr] gap-6 items-start"
                    >
                        <div className="hidden md:flex flex-col items-center gap-4 sticky top-32">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400">
                                <Sparkles size={24} />
                            </div>
                            <div className="w-px h-32 bg-gradient-to-b from-white/10 to-transparent" />
                        </div>

                        <div className="space-y-6 text-lg md:text-xl leading-loose text-white/80 font-medium">
                            <p>
                                <span className="text-white font-bold text-xl md:text-2xl ml-2">ثلاثة أسئلة</span>
                                بخصوص أمانة الله في الأجيال القديمة، ومع المتكلين عليه في الحاضر ليتمتعوا برحمته.
                            </p>
                            <p>
                                تعالوا نتأمل في معاملات الله مع المؤمنين سواء في العهد القديم أو العهد الجديد أو عبر التاريخ، كما في حياتنا.
                            </p>
                            <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-r-4 border-blue-500 p-6 rounded-r-xl my-8">
                                <p className="text-blue-200 font-bold text-xl md:text-2xl">
                                    الله الذي حفظنا في الماضي يحفظنا في الحاضر وسيحفظنا في المستقبل.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* St. Paul Quote */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden"
                    >
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold shrink-0">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-accent-gold font-bold text-lg mb-1">يقول بولس الرسول:</h3>
                            </div>
                        </div>

                        <blockquote className="text-xl md:text-3xl font-bold text-white leading-relaxed mb-6">
                            "الذي نجانا من موت مثل هذا، وهو ينجي، الذي لنا رجاء فيه أنه سينجي أيضًا فيما بعد"
                        </blockquote>

                        <div className="text-white/40 font-bold text-sm md:text-base dir-ltr text-left">
                            (2 كو 1: 10)
                        </div>
                    </motion.div>

                    {/* Final Declaration */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="text-center py-12 px-6"
                    >
                        <Heart className="w-12 h-12 text-red-500 mx-auto mb-6 opacity-80" fill="currentColor" />
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-2">
                            فإن الرب رؤوف رحيم
                        </h3>
                        <p className="text-xl md:text-2xl text-white/60">
                            يغفر الخطايا، ويُخَلِّص في يوم الضيق.
                        </p>
                    </motion.div>

                </div>

                <div className="mt-16 text-center text-white/20 text-sm">
                    © Sobek Cinematic Experience
                </div>
            </div>
        </div>
    );
};

export default PatronReading;
