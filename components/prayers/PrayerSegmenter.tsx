
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle } from 'lucide-react';

interface PrayerSegment {
    title: string;
    content: string;
}

interface PrayerSegmenterProps {
    fullText: string;
    prayerTitle: string;
}

const PrayerSegmenter: React.FC<PrayerSegmenterProps> = ({ fullText, prayerTitle }) => {
    const [segments, setSegments] = useState<PrayerSegment[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    // Parsing logic
    useEffect(() => {
        if (!fullText) return;

        // Define potential headers to split by
        const headers = [
            "مقدمة كل ساعة",
            "المزمور الخمسون",
            "بدء الصلاة",
            "البولس",
            "الإنجيل",
            "القطع",
            "تسبحة الملائكة",
            "الثلاث تقديسات",
            "التحليل",
            "تحليل آخر",
            "طلبة تصلى آخر كل ساعة",
            "بدء صلاة باكر", // Specific to Prime
            "صلاة الساعة الثالثة",
            "صلاة الساعة السادسة",
            "صلاة الساعة التاسعة",
            "صلاة الغروب",
            "صلاة النوم",
            "صلاة نصف الليل",
            "الخدمة الأولى",
            "الخدمة الثانية",
            "الخدمة الثالثة",
            "المزامير", // Generic fallback
            "إنجيل", // Generic fallback
        ];

        // This is a simplified parser. A more robust one would regex match.
        // For now, let's split by double newlines and try to group.
        // Actually, let's look for lines that match headers.

        const lines = fullText.split('\n');
        const parsedSegments: PrayerSegment[] = [];
        let currentSegmentTitle = "المقدمة";
        let currentSegmentContent: string[] = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            const isHeader = headers.some(h => trimmed.includes(h) && trimmed.length < 50); // Heuristic

            if (isHeader) {
                if (currentSegmentContent.length > 0) {
                    parsedSegments.push({
                        title: currentSegmentTitle,
                        content: currentSegmentContent.join('\n')
                    });
                }
                currentSegmentTitle = trimmed;
                currentSegmentContent = [];
            } else {
                if (trimmed) currentSegmentContent.push(line);
            }
        });

        // Push last segment
        if (currentSegmentContent.length > 0) {
            parsedSegments.push({
                title: currentSegmentTitle,
                content: currentSegmentContent.join('\n')
            });
        }

        // Filter out empty segments or the title of the prayer itself if it was captured as first segment
        const filtered = parsedSegments.filter(s => s.content.length > 5 && s.title !== prayerTitle);
        setSegments(filtered);
        setCurrentStep(0);

    }, [fullText, prayerTitle]);

    const handleNext = () => {
        if (currentStep < segments.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (segments.length === 0) {
        return <div className="text-center p-8 text-gray-400">Loading prayer...</div>;
    }

    const currentSegment = segments[currentStep];
    const progress = ((currentStep + 1) / segments.length) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="w-full bg-white/5 rounded-full h-2 mb-6 rtl:flex-row-reverse">
                <div
                    className="bg-accent-gold h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content Card */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl relative overflow-hidden"
            >
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <span className="text-sm text-gray-400 font-mono">
                        {currentStep + 1} / {segments.length}
                    </span>
                    <h3 className="text-2xl font-bold text-accent-gold text-right">{currentSegment.title}</h3>
                </div>

                {/* Text Content */}
                <div className="prose prose-invert prose-lg max-w-none text-right leading-loose text-gray-200 font-serif whitespace-pre-wrap">
                    {currentSegment.content}
                </div>
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-8 gap-4 sticky bottom-4 z-20">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl backdrop-blur-md border border-white/10 transition-all ${currentStep === 0
                            ? 'opacity-50 cursor-not-allowed text-gray-500'
                            : 'bg-black/40 hover:bg-white/10 text-white'
                        }`}
                >
                    <ChevronRight className="w-5 h-5" />
                    <span>السابق</span>
                </button>

                {currentStep === segments.length - 1 ? (
                    <button
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent-gold text-black font-bold hover:brightness-110 transition-all shadow-lg shadow-accent-gold/20"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>إتمام الصلاة</span>
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent-gold/90 hover:bg-accent-gold text-black font-bold transition-all shadow-lg shadow-accent-gold/10"
                    >
                        <span>التالي</span>
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PrayerSegmenter;
