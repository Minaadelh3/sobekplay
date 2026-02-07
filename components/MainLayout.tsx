import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import SearchModal from './SearchModal';
import SobekChatbot from './SobekChatbot';
import PullToRefresh from './PullToRefresh';
import MobileBackHeader from './MobileBackHeader';
import { motion } from 'framer-motion';
import { PosterItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAchievements } from '../context/AchievementsContext';

// Footer Component (Internal)
const Footer: React.FC = () => (
    <footer className="py-12 bg-nearblack border-t border-white/5 w-full relative z-10 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-muted text-sm font-medium">
                © 2025 Sobek Play. Built for the modern Nile explorer.
            </div>
            <div className="flex justify-center items-center gap-8">
                <a href="https://www.facebook.com/profile.php?id=61553908212285" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transform hover:scale-110"><svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
                <a href="https://www.instagram.com/spark_graduates?igsh=cXZscTRrNXVlODFx" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-white transform hover:scale-110"><svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259 0 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a>
            </div>
        </div>
    </footer>
);

interface MainLayoutProps {
    analyzedPosters: PosterItem[];
    isAnalyzing: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ analyzedPosters, isAnalyzing }) => {
    const { user, selectedTeam } = useAuth();
    const { unlockAchievement } = useAchievements();

    // Check for Achievements
    useEffect(() => {
        if (user) {
            unlockAchievement('first_login');

            if (user.teamId) {
                unlockAchievement('team_player');
            }
        }
    }, [user, unlockAchievement]);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Used implicitly by MobileNav?
    const location = useLocation();

    // Close search on route change
    useEffect(() => {
        setIsSearchOpen(false);
    }, [location.pathname]);

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-nearblack flex items-center justify-center">
                <div className="text-accent-green animate-pulse flex flex-col items-center">
                    <div className="text-xl font-black mb-4 tracking-widest">SOBEK PLAY</div>
                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-full h-full bg-accent-green"
                        />
                    </div>
                </div>
            </div>
        );
    }

    const isWatchPage = location.pathname.startsWith('/app/watch/');

    // Define top-level paths where the main Navbar should be shown on mobile
    const topLevelPaths = [
        '/app/home',
        '/app/rankings',
        '/app/games',
        '/app/program',
        '/app/reminders',
        '/app/prayers',
        '/app/she3ar-al-re7la',
        '/app/kids',
        '/app/rooms',
        '/app/community',
        '/app/team-chat',
        '/app/achievements',
        '/app/notifications', // Also top level typically
        '/app/settings'       // Settings is usually a destination
    ];

    // Check if current path is top level (exact match)
    const isTopLevel = topLevelPaths.includes(location.pathname);

    return (
        <div className="min-h-screen selection:bg-accent-green selection:text-white">

            {!isTopLevel && !isWatchPage && <MobileBackHeader />}

            {/* Navbar: Always show on desktop (hidden md:flex handles internal). 
                On Mobile: Hide if NOT top level (because we show BackHeader instead).
             */}
            {!isWatchPage && (
                <div className={`${!isTopLevel ? 'hidden md:block' : ''}`}>
                    <Navbar onSearchOpen={() => setIsSearchOpen(true)} />
                </div>
            )}

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                posters={analyzedPosters}
            />

            <PullToRefresh>
                {/* Adjust padding based on header visibility 
                    - Mobile Top Level: pt-[calc(4rem+env(safe-area-inset-top))] (Dynamic for Notch)
                    - Mobile Deep Level: pt-0 (for sticky BackHeader which handles its own padding)
                    - Desktop: md:pt-24 (Fixed 6rem/5rem safe)
                */}
                <main className={`${!isWatchPage ? (isTopLevel ? "pt-[calc(4rem+env(safe-area-inset-top))]" : "md:pt-24") : ""} pb-24 md:pb-0`}>
                    <Outlet />
                </main>
            </PullToRefresh>

            {location.pathname === '/app/home' && <SobekChatbot />}
            <MobileBottomNav />
            {/* Show footer only on top level pages or desktop, to avoid clutter on deep pages? 
                Actually default behavior was show everywhere except watch. showing footer on deep pages usually fine if content pushes it down. */}
            {!isWatchPage && <Footer />}
        </div>
    );
};

export default MainLayout;
