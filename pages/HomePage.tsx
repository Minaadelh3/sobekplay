import React, { useMemo } from 'react';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import VerseOfTheDay from '../components/VerseOfTheDay';
import Leaderboard from '../components/Leaderboard';
import { PosterItem } from '../types';

interface HomeProps {
    posters: PosterItem[];
}

const HomePage: React.FC<HomeProps> = ({ posters }) => {
    const rows = useMemo(() => {
        // Mocks for a production feel
        const continueWatching = posters.slice(3, 7);
        const sobekExclusives = posters.filter(p => p.isOriginal);

        const topEgyptianContent = posters.filter(p => {
            const t = p.title.toLowerCase();
            const f = p.filename.toLowerCase();
            if (t.includes('harry potter') || t.includes('lord of rings') || t.includes('la casa')) return false;
            if (p.isOriginal || t.includes('sobek')) return false;
            const hasArabic = /[\u0600-\u06FF]/.test(p.title);
            const knownEgyptianFiles = ['grand_hotel', 'crocodile_gangster', 'project_x', 'nubanji', 'bakkar'];
            return hasArabic || knownEgyptianFiles.some(k => f.includes(k));
        }).sort((a, b) => (b.metrics?.impactScore || 0) - (a.metrics?.impactScore || 0)).slice(0, 10);

        return [
            { title: "Continue Watching", items: continueWatching },
            { title: "Sobek Exclusives", items: sobekExclusives },
            { title: "Top in Egypt", items: topEgyptianContent },
            { title: "Action & Chaos", items: posters.filter(p => p.metrics && p.metrics.edgeDensity > 0.6 && p.metrics.contrast > 0.5) },
            { title: "Epic Worlds & Magic", items: posters.filter(p => p.metrics && p.metrics.saturation > 0.7) },
            { title: "Egyptian Classics Reimagined", items: posters.filter(p => p.isClassic && !p.isOriginal && !p.title.toLowerCase().includes('harry')) },
            { title: "Coming Soon", items: posters.filter(p => p.isComingSoon) },
        ];
    }, [posters]);

    return (
        <div className="pb-24">
            <Hero posters={posters} />

            {/* Real-time Content */}
            <div className="relative z-30 -mt-16 md:-mt-20 px-4 max-w-7xl mx-auto space-y-8">
                <Leaderboard />
                <VerseOfTheDay />
            </div>

            <div className="relative z-20 mt-8 space-y-12">
                {/* Carousels */}
                {rows.map((row) => (
                    <Carousel key={row.title} title={row.title} posters={row.items} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
