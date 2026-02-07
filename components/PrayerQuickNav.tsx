
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NavItem {
    idSuffix: string;
    label: string;
    icon: string;
}

interface PrayerQuickNavProps {
    prayerId: string;
}

const NAV_ITEMS: NavItem[] = [
    { idSuffix: '-intro', label: 'المقدمة', icon: '🙏' },
    { idSuffix: '-psalm-1', label: 'المزامير', icon: '📖' },
    { idSuffix: '-gospel', label: 'الإنجيل', icon: '✝️' },
    { idSuffix: '-litanies', label: 'القطع', icon: '🕯️' },
    { idSuffix: '-absolution', label: 'التحليل', icon: '✨' },
    { idSuffix: '-request', label: 'الطلبة', icon: '🤲' },
];

const PrayerQuickNav: React.FC<PrayerQuickNavProps> = ({ prayerId }) => {
    const [activeId, setActiveId] = useState<string>('');

    const scrollToSection = (suffix: string) => {
        const elementId = `${prayerId}${suffix}`;
        const element = document.getElementById(elementId);

        if (element) {
            // Offset for fixed headers (Nav + Sticky Bar)
            const yOffset = -140;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            // Simple spy logic: find which section is closest to top
            let current = '';

            for (const item of NAV_ITEMS) {
                const element = document.getElementById(`${prayerId}${item.idSuffix}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If element is roughly in view (near top 1/3 of screen)
                    if (rect.top < 300 && rect.bottom > 0) {
                        current = item.idSuffix;
                        // distinct break? No, let's find the last one that satisfies condition if overlapping, 
                        // or just use the first visible one. 
                        // Let's stick to: closest positive top or just barely negative
                    }
                }
            }
            setActiveId(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prayerId]);

    return (
        <div className="sticky top-0 z-40 bg-nearblack/95 backdrop-blur-md border-b border-white/10 py-3 mb-6 -mx-4 px-4 md:-mx-8 md:px-8 shadow-2xl">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 dir-rtl scroll-smooth">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.idSuffix}
                        onClick={() => scrollToSection(item.idSuffix)}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300
              ${activeId === item.idSuffix
                                ? 'bg-accent-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }
            `}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PrayerQuickNav;
