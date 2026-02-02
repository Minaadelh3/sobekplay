import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { performTransaction } from './ledger';

/**
 * SOBEK PLAY GAMIFICATION SYSTEM
 * 
 * Core logic for points, ranks, and design tokens.
 */

// --- Design Tokens ---
export const TOKENS = {
    colors: {
        goldPrimary: '#D4AF37',
        goldSoft: '#E6C86E',
        bgPrimary: '#0B0F14',
        bgCard: '#121820',
        bgHover: '#1A2230',
        textPrimary: '#FFFFFF',
        textSecondary: '#B5C0D0',
        textMuted: '#7A8599',
        success: '#2ECC71',
    },
    // Safe Tailwind classes mapping for dynamic usage where needed
    textColors: {
        gold: 'text-[#D4AF37]',
        white: 'text-white',
        muted: 'text-[#7A8599]',
    }
};

// --- Rank Definitions ---
export interface RankTier {
    id: 'novice' | 'apprentice' | 'pro' | 'pharaoh';
    name: string;      // Arabic Name
    minPoints: number; // Threshold
    icon: string;      // Emoji or Icon name 
    color: string;     // Hex or Tailwind class
    nextMsg: string;   // Motivational copy for next stage
}

export const RANK_TIERS: RankTier[] = [
    {
        id: 'novice',
        name: "مبتدئ",
        minPoints: 0,
        icon: "🟤",
        color: "text-[#B5C0D0]", // Silver/Grayish
        nextMsg: "أول خطوة.. كمل! 🚀"
    },
    {
        id: 'apprentice',
        name: "متدرّب",
        minPoints: 100,
        icon: "⚪",
        color: "text-[#E6C86E]", // Soft Gold / Pale
        nextMsg: "بدأت تسخن.. عاش! 💪"
    },
    {
        id: 'pro',
        name: "محترف",
        minPoints: 350,
        icon: "🟡",
        color: "text-[#D4AF37]", // Primary Gold
        nextMsg: "أداء عالي.. فاضل تكّة! 🔥"
    },
    {
        id: 'pharaoh',
        name: "فرعون",
        minPoints: 800,
        icon: "👑",
        color: "text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]", // Glowing Gold
        nextMsg: "أنت من الكبار يا بطل! 👑"
    }
];

// --- Helper Functions ---

/**
 * Calculates the current rank based on points.
 */
export function calculateRank(points: number): RankTier {
    let current = RANK_TIERS[0];
    for (const tier of RANK_TIERS) {
        if (points >= tier.minPoints) {
            current = tier;
        } else {
            break;
        }
    }
    return current;
}

/**
 * Returns the next rank tier, or null if max rank.
 */
export function getNextRank(currentRankId: string): RankTier | null {
    const idx = RANK_TIERS.findIndex(r => r.id === currentRankId);
    if (idx === -1 || idx === RANK_TIERS.length - 1) return null;
    return RANK_TIERS[idx + 1];
}

/**
 * Calculates progress percentage towards next rank.
 */
export function calculateProgress(points: number): number {
    const currentRank = calculateRank(points);
    const nextRank = getNextRank(currentRank.id);

    if (!nextRank) return 100; // Max level

    const totalRange = nextRank.minPoints - currentRank.minPoints;
    const currentProgress = points - currentRank.minPoints;

    // Prevent division by zero if range is 0 (shouldn't happen with correct config)
    if (totalRange <= 0) return 100;

    return Math.min(100, Math.max(0, (currentProgress / totalRange) * 100));
}

/**
 * Formats points with commas (e.g. 1,200)
 */
export function formatPoints(points: number): string {
    return (points || 0).toLocaleString('en-US'); // Ensure standardized number format
}

// --- Achievements System ---

export const ACHIEVEMENT_COPY = {
    headers: {
        main: "إنجازاتك",
        journey: "رحلة التقدّم",
        team: "إنجازات الفريق",
    },
    status: {
        unlocked: "اتفتح!",
        locked: "لسه شوية",
        complete: "إنجاز اتحقق",
    },
    toasts: {
        unlocked: "مبروك! فتحت شارة جديدة 🎉",
        awesome: "جامد! إنجاز جديد اتحقق",
        points: (pts: number) => `+${pts} نقطة 🔥`,
    },
    progress: {
        current: "تقدّمك لحد دلوقتي",
        next: "خطوة كمان وتطلع مستوى أعلى",
        empty: "لسه مفيش إنجازات مفتوحة... ابدأ بمهمّة بسيطة وهيظهروا 👀"
    }
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    points: number;
    icon: string;
}

// Temporary Mock List based on common actions
export const ACHIEVEMENTS_LIST: Achievement[] = [
    {
        id: 'first_login',
        title: "بداية الرحلة",
        description: "سجلت دخول لأول مرة",
        points: 5,
        icon: "👋"
    },
    {
        id: 'team_player',
        title: "لاعب جماعي",
        description: "انضميت لفريق",
        points: 15,
        icon: "🤝"
    },
    {
        id: 'first_points',
        title: "أول الغيث",
        description: "جمعت أول 100 نقطة",
        points: 50,
        icon: "🌱"
    },
    {
        id: 'pro_climber',
        title: "صاعد بسرعة",
        description: "وصلت لمستوى متدرّب",
        points: 100,
        icon: "🚀"
    },
    {
        id: 'social_fly',
        title: "اجتماعي",
        description: "شاركت في الشات 5 مرات",
        points: 20,
        icon: "💬"
    }
];
/**
 * Checks if an achievement can be unlocked for a user.
 * If eligible and not already unlocked, rewards points and updates DB.
 * Returns the Achievement object if newly unlocked, null otherwise.
 */
/**
 * Checks if an achievement can be unlocked for a user.
 * If eligible and not already unlocked, rewards points and updates DB.
 * Returns the Achievement object if newly unlocked, null otherwise.
 */
export async function checkAndUnlockAchievement(userId: string, achievementId: string): Promise<Achievement | null> {
    const achievement = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
    if (!achievement) return null;

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return null;

        const userData = userSnap.data();
        const unlocked = userData.unlockedAchievements || [];

        if (unlocked.includes(achievementId)) {
            return null; // Already unlocked
        }

        // --- Unlock Logic ---

        // 1. Grant Points via Ledger
        await performTransaction({
            type: 'GAME_REWARD',
            amount: achievement.points,
            from: { type: 'SYSTEM', id: 'achievements', name: 'Achievement System' },
            to: { type: 'USER', id: userId, name: userData.displayName || 'User' },
            reason: `Unlock Achievement: ${achievement.title}`
        });

        // 2. Mark as Unlocked
        await updateDoc(userRef, {
            unlockedAchievements: arrayUnion(achievementId)
        });

        return achievement;

    } catch (e) {
        console.error("Unlock Achievement Failed", e);
        return null;
    }
}

/**
 * Sweeps through point-based achievements and unlocks them if criteria are met.
 * Call this on dashboard load or profile view to ensure consistency.
 */
export async function syncPointAchievements(userId: string, currentPoints: number): Promise<Achievement[]> {
    const unlocks: Achievement[] = [];

    // 1. First 100 Points
    if (currentPoints >= 100) {
        const res = await checkAndUnlockAchievement(userId, 'first_points');
        if (res) unlocks.push(res);
    }

    // 2. Apprentice Rank (100+)
    if (currentPoints >= 100) { // Should match RANK_TIERS.apprentice.minPoints
        const res = await checkAndUnlockAchievement(userId, 'pro_climber');
        if (res) unlocks.push(res);
    }

    // Future: Add checks for pro, pharaoh, etc. if added to ACHIEVEMENTS_LIST

    return unlocks;
}
