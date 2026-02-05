import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TOKENS } from '../lib/gamification';
import UserAvatar from '../components/UserAvatar';
import { doc, getDoc } from 'firebase/firestore'; // Direct fetch to be safe
import { db } from '../lib/firebase';

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Achievement } from '../types/achievements';

const AchievementsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                // 1. Fetch Catalog
                const catSnap = await getDocs(query(collection(db, 'achievements'), orderBy('points', 'asc')));
                const catalog = catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement));
                setAchievements(catalog);

                // 2. Fetch User Unlocks
                const userUnlockSnap = await getDocs(query(
                    collection(db, 'user_achievements'),
                    where('userId', '==', user.id)
                ));
                const unlocked = userUnlockSnap.docs.map(d => d.data().achievementId);
                setUnlockedIds(unlocked);
            } catch (e) {
                console.error("Error loading achievements", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user?.id]);

    const totalPoints = achievements
        .filter(a => unlockedIds.includes(a.id))
        .reduce((acc, curr) => acc + curr.points, 0);

    const progressPercent = achievements.length > 0
        ? Math.round((unlockedIds.length / achievements.length) * 100)
        : 0;

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
                            <h1 className="text-2xl font-black text-white">إنجازات سوبك 🏆</h1>
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
                        <span className="text-gray-400">مستوى الإنجاز</span>
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
                        {unlockedIds.length} من {achievements.length} إنجازات مكتملة
                    </div>
                </div>
            </div>

            {/* Journey Section */}
            {achievements.some(a => a.category === 'JOURNEY') && (
                <div className="px-4 mb-8">
                    <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <span>🐪</span> رحلة الـ 5 أيام
                    </h2>
                    <div className="grid grid-cols-5 gap-2">
                        {achievements
                            .filter(a => a.category === 'JOURNEY')
                            .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))
                            .map((dayAch) => {
                                const isUnlocked = unlockedIds.includes(dayAch.id);
                                return (
                                    <div key={dayAch.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center border relative overflow-hidden ${isUnlocked
                                            ? 'bg-accent-gold/20 border-accent-gold text-white'
                                            : 'bg-[#121820] border-white/5 text-gray-600'
                                        }`}>
                                        <div className="text-xl mb-1">{dayAch.icon}</div>
                                        <div className="text-[10px] font-bold">يوم {dayAch.dayNumber}</div>
                                        {isUnlocked && (
                                            <div className="absolute inset-0 bg-accent-gold/10 flex items-center justify-center">
                                                <span className="text-xl">✅</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )}

            {/* List */}
            <div className="px-4 grid gap-4 max-w-2xl mx-auto">
                {achievements
                    .filter(a => a.isActive && a.category !== 'JOURNEY')
                    .map((achievement, index) => {
                        const isUnlocked = unlockedIds.includes(achievement.id);
                        const userProgress = 0; // TODO: Connect to real stats (e.g. login streak)
                        const target = achievement.targetValue || 1;
                        const percent = isUnlocked ? 100 : Math.min(100, Math.round((userProgress / target) * 100));

                        // Hidden Logic
                        if (achievement.isHidden && !isUnlocked) {
                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-[#121820] p-6 rounded-2xl border border-white/5 border-dashed relative overflow-hidden group"
                                >
                                    <div className="flex items-center gap-4 filter blur-sm select-none opacity-50">
                                        <div className="text-4xl">❓</div>
                                        <div>
                                            <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                                            <div className="h-3 w-48 bg-gray-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-gray-400 flex items-center gap-2">
                                            <span>🔒</span> إنجاز سري
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-[#121820] p-5 rounded-2xl border relative overflow-hidden group transition-all
                                ${isUnlocked
                                        ? 'border-accent-gold/30 shadow-[0_0_15px_rgba(191,160,90,0.05)] bg-gradient-to-br from-[#121820] to-[#1a1a10]'
                                        : 'border-white/5 hover:border-white/10'
                                    }
                            `}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5
                                        ${isUnlocked ? 'bg-gradient-to-br from-accent-gold/20 to-black text-white' : 'bg-black/40 grayscale opacity-50'}
                                    `}>
                                            {achievement.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                                {achievement.name}
                                            </h3>
                                            {isUnlocked ? (
                                                <span className="text-[10px] font-bold text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                    ✅ اتحقق
                                                </span>
                                            ) : achievement.isSeasonal ? (
                                                <span className="text-[10px] font-bold text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                    ⏳ {achievement.seasonName || 'موسمي'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                                                    🔒 مقفول
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className={`text-xl font-black font-numeric ${isUnlocked ? 'text-accent-gold' : 'text-gray-600'}`}>
                                            +{achievement.points}
                                        </div>
                                        <div className="text-[9px] uppercase font-bold text-gray-600">SP</div>
                                    </div>
                                </div>

                                {/* Description & How-To */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">{achievement.description}</p>

                                    {!isUnlocked && (
                                        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                            <div className="text-[10px] text-accent-gold font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                                                <span>💡</span> بتتجاب إزاي؟
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {achievement.conditionType === 'LOGIN_STREAK' ? `افتح الابليكيشن ${achievement.targetValue} أيام ورا بعض.` :
                                                    achievement.conditionType === 'FIRST_LOGIN' ? 'سجل دخول لأول مرة.' :
                                                        achievement.conditionType === 'TEAM_WIN' ? 'فريقك يكسب المركز الأول.' :
                                                            achievement.conditionType === 'MANUAL' ? 'تقدير خاص من الإدارة (Admin Grant).' :
                                                                'نفذ المهمة المطلوبة.'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar (Only if Locked & Target > 1) */}
                                {!isUnlocked && achievement.targetValue && achievement.targetValue > 1 && (
                                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden mb-1">
                                        <div
                                            className="h-full bg-accent-gold/50"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
            </div>

            <div className="h-20" /> {/* Spacer */}
        </div>
    );
};

export default AchievementsPage;
