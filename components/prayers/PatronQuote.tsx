import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Feather } from 'lucide-react';

const PatronQuote = () => {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold mb-4">
                    <Quote className="w-4 h-4" />
                    <span>أقوال الآباء</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
                    القديس أغسطينوس
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl p-6 md:p-10 border border-white/10 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-md shadow-xl"
            >
                <div className="text-right dir-rtl">
                    <p className="text-xl md:text-2xl leading-loose text-white/90 font-medium">
                        "لنا والدان ولدانا على الأرض للشقاء ثم نموت. ولكننا وجدنا والدين آخرين. فالله أبونا والكنيسة أمنا، ولدانا للحياة الأبديّة. لنتأمل أيها الأحباء أبناء من قد صرنا؟ لنسلك بما يليق بأبٍ كهذا... وجدنا لنا أبًا في السماوات، لذلك وجب علينا الاهتمام بسلوكنا ونحن على الأرض. لأن من ينتسب لأبٍ كهذا عليه السلوك بطريقة يستحق بها أن ينال ميراثه"
                    </p>

                    <div className="mt-8 flex items-center justify-end gap-3 text-amber-300 font-bold text-lg border-t border-white/10 pt-6">
                        <span>القديس أغسطينوس</span>
                        <div className="p-2 bg-white/10 rounded-full">
                            <Feather className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PatronQuote;
