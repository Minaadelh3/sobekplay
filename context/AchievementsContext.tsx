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

    const trackEvent = async (eventName: string, metadata: any = {}) => {
        if (!user) return;

        try {
            console.log(`🎮 [XP] Tracking Event: ${eventName}`);
            const result = await processGamificationEvent(user.id, eventName, metadata);

            if (result.unlocked.length > 0) {
                // Show most valuable unlocked achievement (or queue them if we improve toast)
                // For now, show the first one
                const mainUnlock = result.unlocked[0];
                setCurrentAchievement(mainUnlock);

                // Play Sound Effect Here if needed
            }

            if (result.newLevel) {
                // TODO: Show Level Up Modal
                console.log(`🚀 [XP] Level Up! Now Level ${result.newLevel}`);
            }

        } catch (e) {
            console.error("XP Tack Error", e);
        }
    };

    return (
        <AchievementsContext.Provider value={{ trackEvent }}>
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
