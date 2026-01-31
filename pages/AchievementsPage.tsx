
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { motion } from 'framer-motion';

// Achievement Definitions (Static for now, could be passed from DB)
export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    threshold: number;
    icon: string;
    color: string;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
    { id: 'first_100', title: 'بداية المشوار', description: 'أول 100 نقطة للفريق', threshold: 100, icon: '🌱', color: 'from-green-500 to-emerald-700' },
    { id: 'points_500', title: 'نص الألف', description: 'جمعنا 500 نقطة', threshold: 500, icon: '🔥', color: 'from-orange-500 to-red-600' },
    { id: 'points_1000', title: 'أسياد اللعبة', description: 'كسرنا حاجز الـ 1000 نقطة', threshold: 1000, icon: '💎', color: 'from-blue-500 to-indigo-600' },
    { id: 'points_2000', title: 'أسطورة سوبِك', description: '2000 نقطة.. انتوا مين يقدر عليكم؟', threshold: 2000, icon: '👑', color: 'from-yellow-400 to-amber-600' },
];

export default function AchievementsPage() {
    const { activeTeam } = useAuth();
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!activeTeam) return;

        // Listen to Unlocks
        const sub = onSnapshot(collection(db, `teams/${activeTeam.id}/achievements`), (snap) => {
            setUnlockedIds(snap.docs.map(d => d.id));
        });

        return () => sub();
    }, [activeTeam]);

    if (!activeTeam) return null;

    return (
        <div className="min-h-screen bg-[#070A0F] text-white pt-24 px-6 pb-24 font-sans" dir="rtl">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">
                    🏆 إنجازات فريق {activeTeam.name}
                </h1>
                <p className="text-gray-400 text-lg">
                    نقاطكم الحالية: <span className="text-accent-gold font-bold">{activeTeam.totalPoints || 0}</span>
                </p>
                <div className="w-full bg-white/10 h-2 rounded-full mt-4 max-w-md mx-auto overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${activeTeam.color}`}
                        style={{ width: `${Math.min(100, (activeTeam.totalPoints || 0) / 20)}%` }} // Normalized 2000 pts
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {ACHIEVEMENTS_LIST.map((ach) => {
                    const isUnlocked = unlockedIds.includes(ach.id) || (activeTeam.totalPoints || 0) >= ach.threshold;
                    // Note: We visually trust purely score OR db record. 
                    // Best to trust DB record for animation state, but score for instant visual satisfaction.
                    // Let's rely on `unlockedIds` primarily if logic works, but fallback to score for 'Pending/Next' indication.

                    return (
                        <div
                            key={ach.id}
                            className={`
                                relative p-6 rounded-2xl border flex items-center gap-6 overflow-hidden
                                ${isUnlocked
                                    ? 'bg-[#141414] border-accent-gold/30 shadow-[0_0_30px_rgba(255,215,0,0.1)]'
                                    : 'bg-black/40 border-white/5 opacity-60 grayscale'
                                }
                            `}
                        >
                            {isUnlocked && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${ach.color} opacity-10`} />
                            )}

                            <div className={`
                                w-20 h-20 rounded-full flex items-center justify-center text-4xl
                                ${isUnlocked ? `bg-gradient-to-br ${ach.color} shadow-lg` : 'bg-white/5'}
                            `}>
                                {ach.icon}
                            </div>

                            <div>
                                <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                    {ach.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                                    {ach.description}
                                </p>
                                {!isUnlocked && (
                                    <div className="mt-3 text-xs font-mono text-accent-gold">
                                        🔒 مطلوب {ach.threshold} نقطة
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
