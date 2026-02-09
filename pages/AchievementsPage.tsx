import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS_LIST, AchievementCategory, UserProgress } from '../types/achievements';
import AchievementCard from '../components/gamification/AchievementCard';
import LevelProgress from '../components/gamification/LevelProgress';

const CATEGORIES: { id: AchievementCategory | 'All', label: string }[] = [
    { id: 'All', label: 'الكل' },
    { id: 'Onboarding', label: 'البداية' },
    { id: 'Daily', label: 'يومي' },
    { id: 'Discovery', label: 'استكشاف' },
    { id: 'Games', label: 'ألعاب' },
    { id: 'Community', label: 'تفاعل' },
    { id: 'Profile', label: 'بروفايل' },
    { id: 'Special', label: 'خاص' },
];

const AchievementsPage: React.FC = () => {
    const { user } = useAuth();
    // Use static list to ensure IDs match the Engine's rules (e.g. 'first_login')
    // instead of random Firestore IDs.
    const achievements = ACHIEVEMENTS_LIST;
    const loading = false;

    const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'All'>('All');

    // Safe Fallback for User Progress
    const userProgress: UserProgress = {
        xp: user?.xp || 0,
        level: user?.level || 1,
        unlockedAchievements: user?.unlockedAchievements || [],
        achievementProgress: user?.achievementProgress || {},
        lastDailyAction: user?.lastDailyAction || {}
    };

    const progressMap = userProgress.achievementProgress;

    // Sort logic
    const displayedAchievements = achievements.filter(a => {
        if (activeCategory !== 'All' && a.category !== activeCategory) return false;
        return a.visible;
    });

    const sortedAchievements = [...displayedAchievements].sort((a, b) => {
        // Sort by Order defined in list
        return (a.order || 99) - (b.order || 99);
    });

    return (
        <div className="min-h-screen bg-[#070A0F] text-white pb-24 font-sans" dir="rtl">

            {/* Header / Level Progress */}
            <div className="p-4 pt-8 max-w-md mx-auto">
                <LevelProgress progress={userProgress} />
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 px-4 mb-6 max-w-md mx-auto">
                <div className="bg-[#121820] rounded-xl p-3 text-center border border-white/5">
                    <div className="text-2xl font-bold text-white">{userProgress.unlockedAchievements.length}</div>
                    <div className="text-[10px] text-gray-500 uppercase">إنجاز</div>
                </div>
                <div className="bg-[#121820] rounded-xl p-3 text-center border border-white/5">
                    <div className="text-2xl font-bold text-[#D4AF37]">{userProgress.xp}</div>
                    <div className="text-[10px] text-gray-500 uppercase">XP مجمل</div>
                </div>
                <div className="bg-[#121820] rounded-xl p-3 text-center border border-white/5">
                    <div className="text-2xl font-bold text-gray-300">
                        {Math.round((userProgress.unlockedAchievements.length / (achievements.length || 1)) * 100)}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">إتمام</div>
                </div>
            </div>

            {/* Categories Tabs */}
            <div className="px-4 mb-6 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all
                                ${activeCategory === cat.id
                                    ? 'bg-[#D4AF37] text-black shadow-lg scale-105'
                                    : 'bg-[#121820] text-gray-400 border border-white/5'}
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Achievements List */}
            <div className="px-4 space-y-3 max-w-md mx-auto pb-20">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        جاري التحميل...
                    </div>
                ) : (
                    <>
                        {sortedAchievements.map(achievement => {
                            const isUnlocked = userProgress.unlockedAchievements.includes(achievement.id);

                            // Determine Status
                            let status: 'locked' | 'unlocked' | 'progress' = isUnlocked ? 'unlocked' : 'locked';

                            const currentVal = progressMap[achievement.id] || 0;

                            if (!isUnlocked && achievement.type === 'progressive' && currentVal > 0) {
                                status = 'progress';
                            }

                            return (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    status={status}
                                    progress={achievement.target ? currentVal / achievement.target : 0}
                                    currentValue={currentVal}
                                    targetValue={achievement.target}
                                />
                            );
                        })}

                        {sortedAchievements.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                مفيش إنجازات في القسم ده لسه 👀
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default AchievementsPage;
