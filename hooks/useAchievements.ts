import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
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
            const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, 'users', userId)));
            const userData = userSnap.data();
            const userName = userData?.displayName || userData?.name || 'Unknown User';

            await performTransaction({
                type: 'ACHIEVEMENT_REWARD',
                amount: achievement.xp,
                from: { type: 'SYSTEM', id: 'achievements_engine', name: 'Sobek Achievements' },
                to: { type: 'USER', id: userId, name: userName },
                reason: `[ACHIEVEMENT] ${achievement.title}`,
                adminId: adminId
            });
        }
    };

    const resetAllAchievements = async () => {
        if (!confirm("☢️ DANGER: This will LOCK all achievements for ALL users. They will have to earn them again. Points they already earned will NOT be deducted. Are you sure?")) return;

        setLoading(true);
        try {
            // 1. Delete all 'user_achievements' logs
            // Ideally we'd use a cloud function for this, but client-side batching works for small-scale
            const q = query(collection(db, 'user_achievements'));
            const snap = await getDocs(q);

            // Delete in batches of 500
            const chunks = [];
            let batch = import('firebase/firestore').then(mod => mod.writeBatch(db));
            let counter = 0;

            // Actually, for simplicity in client-side without batch complexity import mess:
            // sequential delete is safer to write here, or map.
            // Let's just use simple parallel delete for now or batch if possible.
            // We'll update the 'users' collection 'unlockedAchievements' field as well.

            const usersSnap = await getDocs(collection(db, 'users'));
            const userUpdates = usersSnap.docs.map(d => updateDoc(d.ref, { unlockedAchievements: [] }));

            const logDeletes = snap.docs.map(d => deleteDoc(d.ref));

            await Promise.all([...userUpdates, ...logDeletes]);

            alert("All achievements have been reset!");
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
