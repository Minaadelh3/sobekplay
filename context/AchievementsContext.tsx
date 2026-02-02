import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { checkAndUnlockAchievement, Achievement } from '../lib/gamification';
import AchievementToast from '../components/gamification/AchievementToast';

interface AchievementsContextType {
    unlockAchievement: (id: string) => Promise<void>;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export const AchievementsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

    const unlockAchievement = async (achievementId: string) => {
        if (!user) return;

        // Optimistic check (prevent calling DB if we know locally it's unlocked?)
        // Ideally we trust the server response from checkAndUnlockAchievement which handles duplication checks.

        try {
            const unlocked = await checkAndUnlockAchievement(user.id, achievementId);
            if (unlocked) {
                // Show Toast
                setCurrentAchievement(unlocked);
                // Play Sound?
            }
        } catch (e) {
            console.error("Unlock Error", e);
        }
    };

    return (
        <AchievementsContext.Provider value={{ unlockAchievement }}>
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
