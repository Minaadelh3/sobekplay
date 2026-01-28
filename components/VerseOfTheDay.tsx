import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { VERSES_DATA, VerseDef } from '../data/verses';

const VerseOfTheDay: React.FC = () => {
    const [verse, setVerse] = useState<VerseDef | null>(null);
    const [isReflecting, setIsReflecting] = useState(false);

    useEffect(() => {
        // Randomly select a verse on every mount (Page Refresh)
        const randomIndex = Math.floor(Math.random() * VERSES_DATA.length);
        setVerse(VERSES_DATA[randomIndex]);
    }, []);

    if (!verse) return null;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <section className="relative w-full py-24 px-6 flex flex-col items-center justify-center overflow-hidden">

            {/* 1. Cinematic Background Setup */}
            {/* A dark, moody radial gradient to focus attention center */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a101f]/50 to-transparent pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80vw] h-[40vh] bg-accent-blue/5 rounded-full blur-[120px] opacity-30 animate-pulse-slow" />
            </div>

            <div className="relative z-10 max-w-4xl w-full mx-auto text-center">

                {/* 2. Visual Hierarchy: Date & Label */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 flex flex-col items-center gap-2"
                >
                    <span className="text-accent-gold/60 text-[10px] uppercase tracking-[0.3em] font-medium font-sans">
                        {today}
                    </span>
                    <h3 className="text-white/40 text-sm font-serif italic tracking-widest">
                        Verse of the Day
                    </h3>
                </motion.div>

                {/* 3. The Verse "Moment" */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative mb-10"
                >
                    {/* Decorative Quotes */}
                    <span className="absolute -top-6 left-0 md:-left-12 text-6xl text-white/5 font-serif leading-none">“</span>

                    <h1
                        className="text-3xl md:text-5xl lg:text-6xl font-medium text-white leading-loose md:leading-relaxed font-arabic drop-shadow-2xl selection:bg-accent-gold/20"
                        dir="rtl"
                    >
                        {verse.text}
                    </h1>

                    <span className="absolute -bottom-10 right-0 md:-right-12 text-6xl text-white/5 font-serif leading-none">”</span>
                </motion.div>

                {/* 4. Reference & Interaction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <cite className="text-accent-blue font-bold tracking-widest text-sm md:text-base not-italic dir-rtl">
                        {verse.ref}
                    </cite>

                    {/* Interaction: Reflect Button */}
                    {!isReflecting ? (
                        <button
                            onClick={() => setIsReflecting(true)}
                            className="group flex flex-col items-center gap-1 mt-4 focus:outline-none"
                        >
                            <span className="text-white/30 text-xs uppercase tracking-widest group-hover:text-accent-gold transition-colors duration-300">
                                Tap to Reflect
                            </span>
                            <motion.div
                                className="w-1 h-1 bg-white/30 rounded-full group-hover:bg-accent-gold"
                                animate={{ y: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </button>
                    ) : (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 max-w-lg bg-white/5 border-l-2 border-accent-gold/30 px-6 py-4 rounded-r-xl backdrop-blur-sm text-right"
                            >
                                <p className="text-white/80 font-arabic text-lg leading-relaxed dir-rtl" dir="rtl">
                                    {verse.reflection}
                                </p>
                                <button
                                    onClick={() => setIsReflecting(false)}
                                    className="mt-4 text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition-colors w-full text-center"
                                >
                                    Close Reflection
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>

            </div>
        </section>
    );
};

export default VerseOfTheDay;
