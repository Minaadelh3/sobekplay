import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Achievement, UserAchievement, INITIAL_ACHIEVEMENTS } from '../types/achievements';
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

        for (const item of INITIAL_ACHIEVEMENTS) {
            // Check if exists by name to avoid duplicates
            const exists = achievements.find(a => a.name === item.name);
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
            isActive: !achievement.isActive
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
            achievementName: achievement.name,
            pointsSnapshot: achievement.points,
            earnedAt: serverTimestamp(),
            grantedBy: adminId || 'system'
        });

        // 2. Add Points (if points > 0)
        if (achievement.points > 0) {
            // Fetch User Name for Ledger
            const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, 'users', userId)));
            const userData = userSnap.data();
            const userName = userData?.displayName || userData?.name || 'Unknown User';

            await performTransaction({
                type: 'ACHIEVEMENT_REWARD',
                amount: achievement.points,
                from: { type: 'SYSTEM', id: 'achievements_engine', name: 'Sobek Achievements' },
                to: { type: 'USER', id: userId, name: userName },
                reason: `[ACHIEVEMENT] ${achievement.name}`,
                adminId: adminId
            });
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
        refresh: fetchAchievements
    };
}
