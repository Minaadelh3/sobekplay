import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS_LIST, ACHIEVEMENT_COPY, TOKENS } from '../lib/gamification';
import AchievementCard from '../components/gamification/AchievementCard';
import UserAvatar from '../components/UserAvatar';
import { doc, getDoc } from 'firebase/firestore'; // Direct fetch to be safe
import { db } from '../lib/firebase';

const AchievementsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch fresh data for achievements to ensure sync
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                const userRef = doc(db, 'users', user.id);
                const snap = await getDoc(userRef);

                if (snap.exists()) {
                    const data = snap.data();
                    let currentUnlocked = data.unlockedAchievements || [];
                    const currentPoints = data.points || 0;

                    // Auto-Sync based on points
                    const newUnlocks = await import('../lib/gamification').then(m => m.syncPointAchievements(user.id, currentPoints));

                    if (newUnlocks && newUnlocks.length > 0) {
                        const newIds = newUnlocks.map(a => a.id);
                        currentUnlocked = [...new Set([...currentUnlocked, ...newIds])];
                    }

                    setUnlockedIds(currentUnlocked);
                }
            } catch (e) {
                console.error("Failed to fetch achievements", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user?.id]);

    const totalPoints = ACHIEVEMENTS_LIST.reduce((acc, curr) => acc + (unlockedIds.includes(curr.id) ? curr.points : 0), 0);
    const progressPercent = Math.round((unlockedIds.length / ACHIEVEMENTS_LIST.length) * 100);

    return (
        <div className="min-h-screen bg-[#0B0F14] pb-24 font-sans text-right" dir="rtl">
            {/* Header */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2e] to-[#0B0F14]" />
                <div className="absolute inset-0 bg-[url('/assets/patterns/hieroglyphs.png')] opacity-10" />

                <div className="relative z-10 p-6 flex items-end h-full pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                    >
                        🔙
                    </button>

                    <div className="flex items-center gap-4 w-full">
                        <UserAvatar src={user?.photoURL} name={user?.displayName} size="lg" className="border-4 border-[#D4AF37]" />
                        <div>
                            <h1 className="text-2xl font-black text-white">{ACHIEVEMENT_COPY.headers.main}</h1>
                            <p className="text-gray-400 text-sm">جمّع الجوائز وارفع مستواك 🚀</p>
                        </div>
                        <div className="mr-auto text-center">
                            <div className="text-3xl font-black text-[#D4AF37]">{totalPoints}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Total XP</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 -mt-6 relative z-20 mb-8">
                <div className="bg-[#121820] p-4 rounded-xl border border-white/5 shadow-xl">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">{ACHIEVEMENT_COPY.progress.current}</span>
                        <span className="text-[#D4AF37] font-bold">{progressPercent}%</span>
                    </div>
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]"
                        />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 text-center">
                        {unlockedIds.length} من {ACHIEVEMENTS_LIST.length} إنجازات مكتملة
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 grid gap-4">
                {ACHIEVEMENTS_LIST.map((achievement, index) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <AchievementCard
                            achievement={achievement}
                            isUnlocked={unlockedIds.includes(achievement.id)}
                        />
                    </motion.div>
                ))}
            </div>

            <div className="h-20" /> {/* Spacer */}
        </div>
    );
};

export default AchievementsPage;
