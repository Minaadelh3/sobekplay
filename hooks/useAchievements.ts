import { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Achievement, ACHIEVEMENTS_LIST } from '../types/achievements';
import { performTransaction } from '../lib/ledger';
import { useAuth } from '../context/AuthContext';

export function useAchievements() {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'achievements'));
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement));
            setAchievements(data);
        } catch (e) {
            console.error("Error fetching achievements", e);
        } finally {
            setLoading(false);
        }
    };

    const seedAchievements = async () => {
        if (!confirm("⚠️ This will add default achievements if they don't exist. Continue?")) return;

        for (const item of ACHIEVEMENTS_LIST) {
            // Check if exists by title to avoid duplicates
            const exists = achievements.find(a => a.title === item.title);
            if (!exists) {
                await addDoc(collection(db, 'achievements'), {
                    ...item,
                    createdAt: serverTimestamp()
                });
            }
        }
        await fetchAchievements();
        alert("Done seeding!");
    };

    const createAchievement = async (data: Omit<Achievement, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, 'achievements'), {
            ...data,
            createdAt: serverTimestamp()
        });
        fetchAchievements();
    };

    const updateAchievement = async (id: string, data: Partial<Achievement>) => {
        await updateDoc(doc(db, 'achievements', id), data);
        fetchAchievements();
    };

    const toggleAchievementStatus = async (achievement: Achievement) => {
        await updateDoc(doc(db, 'achievements', achievement.id), {
            visible: !achievement.visible
        });
        fetchAchievements();
    };

    const deleteAchievement = async (id: string) => {
        if (!confirm("Are you sure? This won't remove it from users who already earned it, but will disappear from future.")) return;
        await deleteDoc(doc(db, 'achievements', id));
        fetchAchievements();
    };

    const grantAchievement = async (userId: string, achievementId: string, adminId?: string) => {
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) throw new Error("Achievement not found");

        if (!achievement.repeatable) {
            const q = query(collection(db, 'user_achievements'),
                where('userId', '==', userId),
                where('achievementId', '==', achievementId));
            const snap = await getDocs(q);
            if (!snap.empty) throw new Error("User already has this achievement and it is not repeatable.");
        }

        // 1. Log in user_achievements
        await addDoc(collection(db, 'user_achievements'), {
            userId,
            achievementId,
            achievementName: achievement.title,
            pointsSnapshot: achievement.xp,
            earnedAt: serverTimestamp(),
            grantedBy: adminId || 'system'
        });

        // 2. Add Points (if xp > 0)
        if (achievement.xp > 0) {
            // Fetch User Name for Ledger
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const userName = userData?.displayName || userData?.name || 'Unknown User';
            const currentXP = userData?.xp || 0;
            const currentLevel = userData?.level || 1;

            await performTransaction({
                type: 'ACHIEVEMENT_REWARD',
                amount: achievement.xp,
                from: { type: 'SYSTEM', id: 'achievements_engine', name: 'Sobek Achievements' },
                to: { type: 'USER', id: userId, name: userName },
                reason: `[ACHIEVEMENT] ${achievement.title}`,
                adminId: adminId
            });

            // 3. Update User Level & Unlocked Array
            const newTotalXP = currentXP + achievement.xp;
            const newLevelConfig = await import('../types/achievements').then(m => m.getLevelConfig(newTotalXP));

            await updateDoc(userRef, {
                unlockedAchievements: await import('firebase/firestore').then(m => m.arrayUnion(achievementId)),
                level: newLevelConfig.level
            });
        } else {
            // Just update unlocked array if no XP
            await updateDoc(doc(db, 'users', userId), {
                unlockedAchievements: await import('firebase/firestore').then(m => m.arrayUnion(achievementId))
            });
        }
    };

    const resetAllAchievements = async () => {
        // 🛑 EXTREME DANGER: Full Wipe Protocol
        if (!confirm("☢️ DANGER: ZERO POINT PROTOCOL \n\nThis will:\n1. RELOCK all achievements for ALL users.\n2. RESET all XP and Level to 1.\n3. RESET all Points to 0.\n\nThis cannot be undone. Are you absolutely sure?")) return;

        setLoading(true);
        try {
            // 1. Delete all 'user_achievements' logs
            const q = query(collection(db, 'user_achievements'));
            const snap = await getDocs(q);
            const logDeletes = snap.docs.map(d => deleteDoc(d.ref));

            // 2. Reset User Fields (XP, Points, Level, Progress)
            const usersSnap = await getDocs(collection(db, 'users'));
            const userUpdates = usersSnap.docs.map(d => updateDoc(d.ref, {
                unlockedAchievements: [],
                achievementProgress: {},
                lastDailyAction: {},
                xp: 0,
                points: 0,
                level: 1
            }));

            await Promise.all([...userUpdates, ...logDeletes]);

            alert("✅ GAME ECONOMY RESET COMPLETE.\nAll users are now Level 1 with 0 XP.");
            fetchAchievements();
        } catch (e) {
            console.error("Reset Failed", e);
            alert("Errors occurred during reset.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAchievements();
    }, []);

    return {
        achievements,
        loading,
        seedAchievements,
        createAchievement,
        updateAchievement,
        toggleAchievementStatus,
        deleteAchievement,
        grantAchievement,
        resetAllAchievements,
        refresh: fetchAchievements
    };
}
