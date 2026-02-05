import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, increment } from 'firebase/firestore';
import { Achievement } from '../types/achievements';

export const JOURNEY_CONFIG_ID = 'journey_v1';

export const JOURNEY_ACHIEVEMENTS_DATA = [
    {
        day: 1,
        name: "خطوة أولى",
        description: "دخلت الرحلة وبدأت صح",
        points: 5,
        icon: "🟢",
        guid: "journey_day_1"
    },
    {
        day: 2,
        name: "مكمل معانا",
        description: "رجعت تاني وكملت",
        points: 10,
        icon: "👟",
        guid: "journey_day_2"
    },
    {
        day: 3,
        name: "في النص ومكمل",
        description: "عدّيت نص الرحلة",
        points: 15,
        icon: "🔥",
        guid: "journey_day_3"
    },
    {
        day: 4,
        name: "راجل تقيل",
        description: "ثابت ومش ناوي تفوّت",
        points: 20,
        icon: "⚓",
        guid: "journey_day_4"
    },
    {
        day: 5,
        name: "تمت على خير",
        description: "كملت الرحلة للآخر",
        points: 30,
        icon: "🏅",
        guid: "journey_day_5"
    }
];

export interface JourneyConfig {
    startDate: string; // ISO String YYYY-MM-DD
    isActive: boolean;
}

// Check and Grant Daily Achievement
export const checkJourneyProgress = async (userId: string) => {
    try {
        console.log("🔄 Checking Journey Progress...");

        // 1. Get Config
        const configSnap = await getDoc(doc(db, 'system_config', JOURNEY_CONFIG_ID));
        if (!configSnap.exists()) {
            console.log("⚠️ No Journey Config Found");
            return;
        }
        const config = configSnap.data() as JourneyConfig;
        if (!config.isActive || !config.startDate) {
            console.log("⚠️ Journey Inactive");
            return;
        }

        // 2. Calculate Day Number
        const start = new Date(config.startDate);
        const now = new Date();
        // Normalize to midnight to avoid hour differences issues? 
        // Or just diff in days.
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const currentDayNum = diffDays + 1;

        console.log(`📅 Day Info: Start=${config.startDate}, Now=${now.toISOString()}, DayNum=${currentDayNum}`);

        if (currentDayNum < 1 || currentDayNum > 5) {
            console.log("ℹ️ Outside Journey Period");
            return;
        }

        // 3. Find target achievement for this day
        // We assume they are seeded with specific IDs or we query by dayNumber
        // Let's query by dayNumber to be robust
        const achsSnap = await getDocs(query(collection(db, 'achievements'), where('dayNumber', '==', currentDayNum)));
        if (achsSnap.empty) {
            console.log(`⚠️ No achievement found for Day ${currentDayNum}`);
            return;
        }
        const targetAchDoc = achsSnap.docs[0];
        const targetAch = { id: targetAchDoc.id, ...targetAchDoc.data() } as Achievement;

        // 4. Check if already earned
        const userAchSnap = await getDocs(query(
            collection(db, 'user_achievements'),
            where('userId', '==', userId),
            where('achievementId', '==', targetAch.id)
        ));

        if (!userAchSnap.empty) {
            console.log("✅ Already earned today's achievement");
            return;
        }

        // 5. Check Prerequisite (Day - 1)
        if (currentDayNum > 1) {
            const prevDayNum = currentDayNum - 1;
            // Find prev achievement ID
            const prevAchSnap = await getDocs(query(collection(db, 'achievements'), where('dayNumber', '==', prevDayNum)));
            if (!prevAchSnap.empty) {
                const prevAchId = prevAchSnap.docs[0].id;
                const prevUserSnap = await getDocs(query(
                    collection(db, 'user_achievements'),
                    where('userId', '==', userId),
                    where('achievementId', '==', prevAchId)
                ));
                if (prevUserSnap.empty) {
                    console.log("⛔ Prerequisite missing (Previous Day)");
                    return; // Chain broken
                }
            }
        }

        // 6. GRANT REWARD
        console.log(`🎁 Granting Day ${currentDayNum}: ${targetAch.name}`);

        // Log in user_achievements
        await addDoc(collection(db, 'user_achievements'), {
            userId,
            achievementId: targetAch.id,
            achievementName: targetAch.name,
            earnedAt: serverTimestamp(),
            dayNumber: currentDayNum,
            grantedBy: 'system_journey'
        });

        // Add Points
        if (targetAch.points > 0) {
            // Ledger Log
            await addDoc(collection(db, 'points_logs'), {
                userId,
                amount: targetAch.points,
                reason: `Journey Day ${currentDayNum}: ${targetAch.name}`,
                type: 'ACHIEVEMENT',
                timestamp: serverTimestamp(),
                achievementId: targetAch.id
            });
            // Update User
            await updateDoc(doc(db, 'users', userId), {
                points: increment(targetAch.points)
            });
        }

        // Notification
        await addDoc(collection(db, 'system_messages'), {
            targetId: userId,
            sender: 'SOBEK',
            type: 'achievement_unlocked',
            title: `إنجاز يوم ${currentDayNum} وصل!`,
            message: `مبروك! حققت إنجاز "${targetAch.name}" وكسبت ${targetAch.points} نقطة.`,
            meta: { points: targetAch.points, achievementId: targetAch.id },
            createdAt: serverTimestamp(),
            readBy: []
        });

    } catch (e) {
        console.error("❌ Journey Check Error", e);
    }
};

export const seedJourneyAchievements = async () => {
    console.log("🌱 Seeding Journey Achievements...");
    for (const data of JOURNEY_ACHIEVEMENTS_DATA) {
        // Check if exists by name (simple check)
        const q = await getDocs(query(collection(db, 'achievements'), where('name', '==', data.name)));
        if (q.empty) {
            await addDoc(collection(db, 'achievements'), {
                name: data.name,
                description: data.description,
                points: data.points,
                icon: data.icon,
                category: 'JOURNEY',
                conditionType: 'JOURNEY_DAY',
                dayNumber: data.day,
                repeatable: false,
                isActive: true,
                createdAt: serverTimestamp()
            });
            console.log(`+ Created: ${data.name}`);
        } else {
            console.log(`= Exists: ${data.name}`);
        }
    }
};
