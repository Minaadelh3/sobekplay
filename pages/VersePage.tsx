import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyVerse, Verse } from '../data/mockVerses';

const VersePage: React.FC = () => {
    const [verse, setVerse] = useState<Verse | null>(null);
    const [showReflection, setShowReflection] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Simulate "Finding" the verse (Artificial delay for pacing)
        setTimeout(() => {
            setVerse(getDailyVerse());
            setLoaded(true);
        }, 800);
    }, []);

    // Time-based background (Morning vs Evening)
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const isEvening = hour > 17;

    const getBgColor = () => {
        if (isMorning) return 'bg-[#f4f1ea] text-[#2c3e50]'; // Morning Paper / Slate
        if (isEvening) return 'bg-[#1a1a1a] text-[#e0e0e0]'; // Dark / Off-white
        return 'bg-[#ebe9e4] text-[#333]'; // Stone / Charcoal
    };

    return (
        <div className={`min-h-screen w-full flex flex-col items-center relative transition-colors duration-[2000ms] overflow-hidden justify-center ${getBgColor()}`}>

            {/* Ambient Noise / Texture (Optional subtle grain) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.6%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.5%22/%3E%3C/svg%3E")' }} />

            <AnimatePresence>
                {verse && (
                    <div className="max-w-2xl px-8 md:px-12 relative z-10 flex flex-col items-center">

                        {/* THE VERSE */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            className="text-center"
                        >
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-relaxed md:leading-relaxed mb-8 tracking-wide">
                                {verse.text}
                            </h1>
                        </motion.div>

                        {/* THE REFERENCE */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 1, delay: 1.5 }}
                            className="text-sm font-sans uppercase tracking-[0.2em] mb-16"
                        >
                            {verse.reference}
                        </motion.div>

                        {/* THE REFLECTION TRIGGER */}
                        {!showReflection && verse.reflection && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                whileHover={{ opacity: 0.8, scale: 1.1 }}
                                transition={{ duration: 1, delay: 2.5 }}
                                onClick={() => setShowReflection(true)}
                                className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs opacity-50 cursor-pointer"
                                aria-label="Show Reflection"
                            >
                                ↓
                            </motion.button>
                        )}

                        {/* THE REFLECTION (Revealed) */}
                        {showReflection && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.8 }}
                                className="overflow-hidden max-w-lg border-t border-current/10 pt-8 mt-4 text-center"
                            >
                                <p className="font-serif italic text-lg opacity-80 leading-loose">
                                    "{verse.reflection}"
                                </p>
                            </motion.div>
                        )}

                    </div>
                )}
            </AnimatePresence>

            {/* Footer Date (Barely Visible) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 3 }}
                className="absolute bottom-6 text-[10px] font-sans uppercase tracking-[0.1em]"
            >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </motion.div>

        </div>
    );
};

export default VersePage;
