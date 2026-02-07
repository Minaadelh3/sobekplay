
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, List, X, BookOpen } from 'lucide-react';
import { PrayerSection } from '../../hooks/usePrayers';
import { parseAgpeyaContent, AgpeyaSection } from '../../utils/agpeyaParser';

interface PrayerDetailViewProps {
    prayer: PrayerSection;
    onBack: () => void;
}

const PrayerDetailView: React.FC<PrayerDetailViewProps> = ({ prayer, onBack }) => {
    const [sections, setSections] = useState<AgpeyaSection[]>([]);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (prayer.content) {
            setSections(parseAgpeyaContent(prayer.content));
        }
    }, [prayer.content]);

    const scrollToSection = (id: string) => {
        const el = sectionRefs.current[id];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsTocOpen(false);
        }
    };


    const handleSwipe = (event: any, info: any) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            // Swipe Right -> Back
            onBack();
        } else if (info.offset.x < -threshold) {
            // Swipe Left -> Open Menu
            setIsTocOpen(true);
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-[#050608] relative"
            onPanEnd={handleSwipe}
        >
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-40 bg-[#050608]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsTocOpen(true)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-accent-gold transition-colors"
                    >
                        <List className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white hidden md:block">{prayer.title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <span>رجوع</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.header>

            {/* TOC Drawer/Popup */}
            <AnimatePresence>
                {isTocOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTocOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-80 bg-[#0F1218] z-50 border-l border-white/10 flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <List className="w-5 h-5 text-accent-gold" />
                                    فهرس الصلاة
                                </h2>
                                <button onClick={() => setIsTocOpen(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {sections.map((section, idx) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className="w-full text-right p-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all text-sm border-r-2 border-transparent hover:border-accent-gold"
                                    >
                                        {section.title || `الجزء ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto p-4 md:p-8 pb-32" ref={scrollRef}>
                <div className="bg-[#0F1218] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <span className="text-6xl mb-4 block filter drop-shadow-xl">{prayer.icon}</span>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            {prayer.title}
                        </h1>
                        <p className="text-xl text-accent-gold/80 font-medium">
                            {prayer.subtitle}
                        </p>
                    </div>

                    <div className="p-6 md:p-10 space-y-12">
                        {sections.map((section) => (

                            <div
                                key={section.id}
                                id={section.id}
                                ref={(el: HTMLDivElement | null) => { sectionRefs.current[section.id] = el; }}
                                className="scroll-mt-24"
                            >
                                {section.title && section.title !== "المقدمة" && (
                                    <h3 className="text-2xl font-bold text-accent-gold mb-6 text-center border-b border-white/5 pb-4">
                                        {section.title}
                                    </h3>
                                )}
                                <div className="prose prose-invert prose-lg max-w-none text-right whitespace-pre-wrap leading-loose text-gray-200 font-serif">
                                    {section.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Quick TOC FAB (Floating Action Button) for Mobile - REMOVED as per user request for swipe gestures */}
        </motion.div>
    );
};

export default PrayerDetailView;
