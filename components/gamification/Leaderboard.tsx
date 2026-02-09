import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { User, TEAMS } from '../../types/auth'; // Ensure this has the new fields
import TeamRankList from '../TeamRankList';
import { TOKENS } from '../../lib/gamification';

const Leaderboard: React.FC = () => {
    // DEBUG: Verify HMR
    console.log("🚀 Leaderboard v4.1 (Team Fallback) loaded");
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'individuals' | 'teams'>('individuals');
    const [topUsers, setTopUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch Top Users
    useEffect(() => {
        if (activeTab === 'teams') return;

        setLoading(true);
        // Query: Users with points > 0, sorted by points desc, limit 50
        // We handle Admin filtering client side.
        const q = query(
            collection(db, "users"),
            orderBy("scoreTotal", "desc"), // ⚡ UNIFIED: Sort by ScoreTotal
            limit(50)
        );

        const unsub = onSnapshot(q, (snap) => {
            const users: User[] = [];
            snap.forEach((doc) => {
                const data = doc.data();
                // Filter Admins client-side (CRITICAL RULE)
                if (data.role === 'ADMIN' || data.role === 'admin') return;

                // Resolve Avatar Priorities:
                // 1. Uploaded Profile Photo (profile.photoURL)
                // 2. Auth Photo (photoURL)
                // 3. Legacy Avatar (avatar)
                // 4. Team Avatar (based on teamId)
                // 5. Default Logo
                let finalAvatar = data.profile?.photoURL || data.photoURL || data.avatar;
                if (!finalAvatar && data.teamId) {
                    const team = TEAMS.find(t => t.id === data.teamId);
                    if (team) finalAvatar = team.avatar;
                }

                // Map to User type safely
                users.push({
                    id: doc.id,
                    name: data.displayName || data.name || "Unknown",
                    avatar: finalAvatar || "",
                    points: data.scoreTotal || data.xp || data.points || 0,
                    xp: data.scoreTotal || data.xp || 0,
                    role: 'USER',
                    teamId: data.teamId
                } as User);
            });
            setTopUsers(users);
            setLoading(false);
        }, (err) => {
            console.error("Leaderboard fetch error", err);
            setLoading(false);
        });

        return () => unsub();
    }, [activeTab]);

    return (
        <div className="w-full max-w-2xl mx-auto" dir="rtl">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-0.5 flex-1 bg-white/10" />
                <h2 className="text-xl font-bold text-white uppercase tracking-widest text-center">
                    لوحة المتصدرين
                </h2>
                <div className="h-0.5 flex-1 bg-white/10" />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-6 backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('individuals')}
                    className={`
                        flex-1 py-3 text-sm font-bold transition-all rounded-lg
                        ${activeTab === 'individuals' ? `bg-[${TOKENS.colors.goldPrimary}] text-black shadow-lg` : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                    style={activeTab === 'individuals' ? { backgroundColor: TOKENS.colors.goldPrimary } : {}}
                >
                    👤 أفراد
                </button>
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`
                        flex-1 py-3 text-sm font-bold transition-all rounded-lg
                        ${activeTab === 'teams' ? `bg-[${TOKENS.colors.goldPrimary}] text-black shadow-lg` : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                    style={activeTab === 'teams' ? { backgroundColor: TOKENS.colors.goldPrimary } : {}}
                >
                    👥 فرق
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'individuals' ? (
                        <motion.div
                            key="individuals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-[#121212]/50 rounded-2xl border border-white/5 overflow-hidden"
                        >
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل الترتيب...</div>
                            ) : (
                                <div className="flex flex-col">
                                    {topUsers.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <div className="text-4xl mb-4">👀</div>
                                            <p className="font-bold mb-2">لسه مفيش ترتيب</p>
                                            <p className="text-sm">أول ما تبدأوا تجمعوا نقاط، الترتيب هيبان هنا</p>
                                        </div>
                                    ) : (
                                        topUsers.map((u, i) => {
                                            const isMe = u.id === user?.id;
                                            const rank = i + 1;

                                            // Top 3 Styles
                                            let rankStyle = "bg-white/5 text-gray-400";
                                            let borderStyle = "border-white/5";

                                            if (rank === 1) {
                                                rankStyle = `bg-[${TOKENS.colors.goldPrimary}] text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]`;
                                                borderStyle = `border-[${TOKENS.colors.goldPrimary}]/30 bg-[${TOKENS.colors.goldPrimary}]/5`;
                                            } else if (rank === 2) {
                                                rankStyle = "bg-gray-300 text-black shadow-[0_0_15px_rgba(209,213,219,0.4)]";
                                                borderStyle = "border-gray-300/30 bg-gray-300/5";
                                            } else if (rank === 3) {
                                                rankStyle = "bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.4)]";
                                                borderStyle = "border-amber-700/30 bg-amber-700/5";
                                            }

                                            return (
                                                <div
                                                    key={u.id}
                                                    className={`
                                                        flex items-center p-4 border-b last:border-0 relative
                                                        ${isMe ? `bg-[${TOKENS.colors.goldPrimary}]/10` : borderStyle}
                                                        hover:bg-white/5 transition-colors
                                                    `}
                                                    style={isMe ? { backgroundColor: `${TOKENS.colors.goldPrimary}1A` } : {}}
                                                >
                                                    {/* Rank Badge */}
                                                    <div
                                                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm ml-4 ${rankStyle}`}
                                                        style={rank === 1 ? { backgroundColor: TOKENS.colors.goldPrimary } : {}}
                                                    >
                                                        {rank}
                                                    </div>

                                                    {/* User Info */}
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <img
                                                            src={u.avatar || '/assets/brand/logo.png'}
                                                            alt={u.name}
                                                            className="w-10 h-10 rounded-full bg-gray-800 object-cover"
                                                        />
                                                        <div>
                                                            <div className={`font-bold text-right ${isMe ? `text-[${TOKENS.colors.goldPrimary}]` : 'text-white'}`}>
                                                                {u.name}
                                                                {isMe && <span className={`mr-2 text-[10px] bg-[${TOKENS.colors.goldPrimary}] text-black px-1 rounded`}>أنا</span>}
                                                            </div>
                                                            {u.teamId && (
                                                                <div className="text-xs text-gray-500 text-right">
                                                                    فريق {u.teamId}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Points */}
                                                    <div className="text-left pl-2">
                                                        <div className="text-xl font-black text-white font-mono leading-none">
                                                            {(u.points || 0).toLocaleString()}
                                                        </div>
                                                        <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                                            XP
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="teams"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <TeamRankList />

                            {/* Hint/Footer for Teams */}
                            <div className="mt-8 text-center text-gray-500 text-sm italic">
                                المنافسة لسه في أولها.. شدوا حيلكم يا أبطال 💥
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Leaderboard;
