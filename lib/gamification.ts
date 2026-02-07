import { doc, getDoc, updateDoc, arrayUnion, increment, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { performTransaction } from './ledger';
import {
    ACHIEVEMENTS_LIST,
    LEVELS,
    getLevelConfig,
    getNextLevelConfig,
    Achievement,
    UserProgress,
    INITIAL_USER_PROGRESS
} from '../types/achievements';

/**
 * SOBEK PLAY GAMIFICATION SYSTEM V2
 */

// --- Leveling Logic ---

export function calculateLevelFromXP(xp: number) {
    return getLevelConfig(xp);
}

export function getNextLevelInfo(currentLevel: number) {
    return getNextLevelConfig(currentLevel);
}

// --- Event Trigger Logic ---

/**
 * Core function to process an event and determine if any achievements should be unlocked.
 * logic:
 * 1. Find achievements triggered by this event
 * 2. Check conditions (cooldown, duplicates, progress targets)
 * 3. Return a list of NEWLY unlocked achievements + XP gain
 */
export async function processGamificationEvent(
    userId: string,
    eventName: string,
    eventData: any = {}
): Promise<{
    unlocked: Achievement[],
    xpGained: number,
    newLevel?: number
}> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    // Initialize if missing
    let userData = userSnap.data() as any;
    // Safe access with defaults
    let progress: UserProgress = {
        xp: userData.xp || 0,
        level: userData.level || 1,
        unlockedAchievements: userData.unlockedAchievements || [],
        achievementProgress: userData.achievementProgress || {},
        lastDailyAction: userData.lastDailyAction || {}
    };

    const triggeredAchievements = ACHIEVEMENTS_LIST.filter(a => a.trigger.event === eventName && a.visible);

    if (triggeredAchievements.length === 0) return { unlocked: [], xpGained: 0 };

    const newlyUnlocked: Achievement[] = [];
    let totalXPGained = 0;
    let updates: any = {};

    for (const achievement of triggeredAchievements) {
        const isUnlocked = progress.unlockedAchievements.includes(achievement.id);

        // 1. Check Repeatable / Already Unlocked
        if (isUnlocked && !achievement.repeatable) continue;

        // 2. Check Cooldown (for Daily)
        if (achievement.trigger.cooldown_hours) {
            const lastTimeStr = progress.lastDailyAction?.[achievement.id];
            if (lastTimeStr) {
                const lastTime = new Date(lastTimeStr).getTime();
                const now = new Date().getTime();
                const diffHours = (now - lastTime) / (1000 * 60 * 60);
                if (diffHours < achievement.trigger.cooldown_hours) continue; // Cooldown active
            }
        }

        // 3. Check Progressive Targets
        if (achievement.type === 'progressive' && achievement.target) {
            const currentCount = (progress.achievementProgress?.[achievement.id] || 0) + 1;

            // Update progress in DB regardless of unlock
            updates[`achievementProgress.${achievement.id}`] = currentCount;
            progress.achievementProgress[achievement.id] = currentCount;

            if (currentCount < achievement.target) continue; // Not yet
        }

        // --- GRANT ACHIEVEMENT ---
        newlyUnlocked.push(achievement);
        totalXPGained += achievement.xp;

        // Update Unlocked List (if not repeatable)
        if (!achievement.repeatable) {
            updates.unlockedAchievements = arrayUnion(achievement.id);
            progress.unlockedAchievements.push(achievement.id);
        }

        // Update Cooldown Timer
        if (achievement.trigger.cooldown_hours) {
            updates[`lastDailyAction.${achievement.id}`] = new Date().toISOString();
        }
    }

    if (totalXPGained > 0) {
        updates.xp = increment(totalXPGained);
        progress.xp += totalXPGained;

        // Check Level Up
        const newLevelConfig = calculateLevelFromXP(progress.xp);
        if (newLevelConfig.level > progress.level) {
            updates.level = newLevelConfig.level;
            // return new level info
            return { unlocked: newlyUnlocked, xpGained: totalXPGained, newLevel: newLevelConfig.level };
        }
    }

    // Commit to Firestore
    if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
    }


    return { unlocked: newlyUnlocked, xpGained: totalXPGained };
}


export function formatPoints(points: number): string {
    return points.toLocaleString();
}

/**
 * COMPATIBILITY LAYER FOR OLDER COMPONENTS (MyPoints.tsx, etc.)
 */
export const RANK_TIERS = LEVELS;
export const calculateRank = calculateLevelFromXP;
export const getNextRank = getNextLevelInfo;

export function calculateProgress(xp: number): number {
    const level = calculateLevelFromXP(xp);
    // Check if max level
    if (level.level === LEVELS[LEVELS.length - 1].level) return 100;

    const range = level.maxXP - level.minXP;
    const earnedInLevel = xp - level.minXP;
    return Math.min(100, Math.max(0, (earnedInLevel / range) * 100));
}

export const TOKENS = {
    colors: {
        bgCard: '#1e293b', // slate-800
        bgPrimary: '#0f172a', // slate-900
        goldPrimary: '#D4AF37'
    }
};
