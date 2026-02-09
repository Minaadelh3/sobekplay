import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { processGamificationEvent } from '../lib/gamification';
import { Achievement } from '../types/achievements';
import AchievementToast from '../components/gamification/AchievementToast';

interface AchievementsContextType {
    trackEvent: (eventName: string, metadata?: any) => Promise<void>;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    // 🛡️ Track Event (Fire and Forget)
    const trackEvent = React.useCallback(async (eventName: string, metadata: any = {}) => {
        if (!user) return;
        // Import dynamic to avoid cycles
        import('../lib/events').then(m => m.trackEvent(user.id, eventName, metadata));
    }, [user]);

    // 👂 Listen for New Achievements via User Object Updates
    // The AuthContext maintains the 'user' object from Firestore snapshots.
    // When 'user.unlockedAchievements' changes, we detect it here.
    const prevUnlockedRef = React.useRef<string[]>([]);
    const isFirstRun = React.useRef(true);

    React.useEffect(() => {
        if (!user) return;
        const current = user.unlockedAchievements || [];

        if (isFirstRun.current) {
            prevUnlockedRef.current = current;
            isFirstRun.current = false;
            return;
        }

        if (current.length > prevUnlockedRef.current.length) {
            // Find difference
            const newIds = current.filter(id => !prevUnlockedRef.current.includes(id));
            if (newIds.length > 0) {
                // Find config
                import('../types/achievements').then(({ ACHIEVEMENTS_LIST }) => {
                    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === newIds[0]);
                    if (achievement) {
                        setCurrentAchievement(achievement);
                        // Sound effect could go here
                    }
                });
            }
        }
        prevUnlockedRef.current = current;
    }, [user?.unlockedAchievements]);

    const value = React.useMemo(() => ({ trackEvent }), [trackEvent]);

    return (
        <AchievementsContext.Provider value={value}>
            {children}
            {/* Global Toast Layer */}
            <AchievementToast
                achievement={currentAchievement}
                onClose={() => setCurrentAchievement(null)}
            />
        </AchievementsContext.Provider>
    );
};

export const useAchievements = () => {
    const context = useContext(AchievementsContext);
    if (!context) throw new Error("useAchievements must be used within AchievementsProvider");
    return context;
};
