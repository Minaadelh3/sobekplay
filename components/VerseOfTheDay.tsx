import React, { useState, useEffect } from 'react';
import { VERSES_DATA, VerseDef } from '../data/verses';

const VerseOfTheDay: React.FC = () => {
    const [verse, setVerse] = useState<VerseDef | null>(null);
    const [isReflecting, setIsReflecting] = useState(false);

    useEffect(() => {
        // Randomly select a verse on every mount
        const randomIndex = Math.floor(Math.random() * VERSES_DATA.length);
        setVerse(VERSES_DATA[randomIndex]);
    }, []);

    if (!verse) return null;

    // Format: "Saturday, Jan 28"
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    return (
        <section className="w-full py-12 px-6 md:px-8 bg-transparent relative z-20">
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center">

                {/* 1. Header: Simple & Distinct */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <span className="text-accent-gold/80 text-xs font-bold uppercase tracking-[0.2em]">
                        {today}
                    </span>
                    <div className="h-px w-12 bg-white/20 my-1"></div>
                    <span className="text-white/60 text-sm font-serif italic tracking-wider">
                        Verse of the Day
                    </span>
                </div>

                {/* 2. The Verse: Readable & Calm */}
                {/* 
                   Mobile: text-2xl, leading-relaxed (comfortable reading)
                   Desktop: text-4xl
                */}
                <div className="relative mb-8 w-full">
                    <h1
                        className="text-2xl md:text-4xl font-normal text-white leading-[1.8] md:leading-[1.6] font-arabic dir-rtl drop-shadow-sm"
                        dir="rtl"
                    >
                        "{verse.text}"
                    </h1>
                </div>

                {/* 3. Reference */}
                <div className="mb-8">
                    <span className="text-accent-blue font-bold text-base md:text-lg tracking-wide dir-rtl block">
                        {verse.ref}
                    </span>
                </div>

                {/* 4. Reflection Interaction (No Animation) */}
                {!isReflecting ? (
                    <button
                        onClick={() => setIsReflecting(true)}
                        className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors py-2 border-b border-transparent hover:border-white/20"
                    >
                        Read Reflection
                    </button>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 w-full mt-2 animate-none">
                        <p className="text-white/90 font-arabic text-lg leading-loose text-right mb-6" dir="rtl">
                            {verse.reflection}
                        </p>
                        <button
                            onClick={() => setIsReflecting(false)}
                            className="text-xs text-accent-gold/80 hover:text-accent-gold uppercase tracking-widest transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}

            </div>
        </section>
    );
};

export default VerseOfTheDay;
