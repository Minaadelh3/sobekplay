import React, { useState, useEffect } from 'react';
import { useAchievements } from '../../hooks/useAchievements';
import { useAdminData } from '../../hooks/useAdminData';
import AchievementDialog from '../../components/admin/AchievementDialog';
import GrantAchievementDialog from '../../components/admin/GrantAchievementDialog';
import { Achievement } from '../../types/achievements';
import { motion, AnimatePresence } from 'framer-motion';
import AdminJourney from './AdminJourney';

export default function AdminAchievements() {
    const {
        achievements,
        loading,
        seedAchievements,
        createAchievement,
        updateAchievement,
        toggleAchievementStatus,
        deleteAchievement
    } = useAchievements();

    // Users needed for Grant Dialog
    const { users, fetchUsers } = useAdminData();

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const [activeTab, setActiveTab] = useState<'MAIN' | 'JOURNEY'>('MAIN');
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null | undefined>(undefined); // undefined = closed, null = new
    const [grantingAchievement, setGrantingAchievement] = useState<Achievement | null>(null);

    const handleSave = async (data: any) => {
        if (editingAchievement && 'id' in editingAchievement) {
            await updateAchievement(editingAchievement.id, data);
        } else {
            await createAchievement(data);
        }
    };

    return (

        <div className="p-6 space-y-8">
            {/* 🟢 GLOBAL HEADER & TABS 🟢 */}
            <div className="bg-[#141414] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <span>🏛️</span> Game Economy
                        </h1>
                        <p className="text-gray-400 font-medium">مركز التحكم في الإنجازات، النقاط، ورحلة الخمس أيام.</p>
                    </div>

                    {/* Big Logical Tabs */}
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('MAIN')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'MAIN'
                                ? 'bg-accent-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>🏆</span> الإنجازات العامة
                        </button>
                        <div className="w-px bg-white/10 my-2 mx-1" />
                        <button
                            onClick={() => setActiveTab('JOURNEY')}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'JOURNEY'
                                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>🐫</span> رحلة الـ 5 أيام
                        </button>
                    </div>
                </div>
            </div>

            {/* 🟡 CONTENT AREA 🟡 */}
            <div className="min-h-[500px]">
                {activeTab === 'JOURNEY' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <AdminJourney />
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

                        {/* Toolbar for General Achievements */}
                        <div className="flex justify-between items-center bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                {achievements.filter(a => a.category !== 'JOURNEY').length} Active Achievements
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={seedAchievements}
                                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors text-xs font-mono border border-white/5 flex items-center gap-2"
                                >
                                    <span>⚡</span> Seed Defaults
                                </button>
                                <button
                                    onClick={() => setEditingAchievement(null)}
                                    className="px-6 py-2 rounded-xl bg-accent-gold/10 text-accent-gold border border-accent-gold/20 font-bold hover:bg-accent-gold hover:text-black transition-all flex items-center gap-2"
                                >
                                    <span>+</span> New Achievement
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="text-center py-20 text-gray-500 animate-pulse">Loading Achievements...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {achievements.filter(a => a.category !== 'JOURNEY').map(achievement => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`group relative bg-[#1A1A1A] rounded-2xl border ${achievement.isActive ? 'border-white/10' : 'border-red-500/20 opacity-70'} overflow-hidden hover:shadow-2xl transition-all hover:border-accent-gold/30`}
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                                    {achievement.icon}
                                                </div>
                                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${achievement.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {achievement.isActive ? 'Active' : 'Disabled'}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2">{achievement.name}</h3>
                                            <p className="text-sm text-gray-400 h-10 mb-4 line-clamp-2">{achievement.description}</p>

                                            <div className="bg-black/30 p-3 rounded-xl mb-4 border border-white/5">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                    <span>⚙️</span> Backend Health
                                                </div>
                                                <div className="space-y-1 text-xs font-mono">
                                                    <div className="flex justify-between items-center text-green-400">
                                                        <span>Collection</span>
                                                        <span>✅ Online</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>Trigger</span>
                                                        {['LOGIN_STREAK', 'FIRST_LOGIN', 'TEAM_WIN', 'POINTS_THRESHOLD', 'MANUAL'].includes(achievement.conditionType)
                                                            ? <span className="text-green-400">✅ {achievement.conditionType}</span>
                                                            : <span className="text-yellow-400">⚠️ {achievement.conditionType} (Review)</span>
                                                        }
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>Points Flow</span>
                                                        {achievement.points > 0
                                                            ? <span className="text-green-400">✅ {achievement.points} SP</span>
                                                            : <span className="text-gray-500">⚪ No Points</span>
                                                        }
                                                    </div>
                                                    {achievement.isHidden && (
                                                        <div className="flex justify-between items-center text-blue-400">
                                                            <span>Visibility</span>
                                                            <span>👀 Hidden</span>
                                                        </div>
                                                    )}
                                                    {achievement.isSeasonal && (
                                                        <div className="flex justify-between items-center text-purple-400">
                                                            <span>Seasonal</span>
                                                            <span>⏳ {achievement.seasonName || 'Active'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                                <button
                                                    onClick={() => setGrantingAchievement(achievement)}
                                                    className="py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    🎁 Grant
                                                </button>
                                                <button
                                                    onClick={() => setEditingAchievement(achievement)}
                                                    className="py-2 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => toggleAchievementStatus(achievement)}
                                                    className="col-span-1 py-2 bg-transparent hover:bg-white/5 text-gray-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-dashed border-white/10"
                                                >
                                                    {achievement.isActive ? '🔒 Disable' : '🔓 Enable'}
                                                </button>
                                                <button
                                                    onClick={() => deleteAchievement(achievement.id)}
                                                    className="col-span-1 py-2 bg-transparent hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-lg text-xs font-bold transition-colors border border-dashed border-white/10"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Dialogs */}
                        <AnimatePresence>
                            {editingAchievement !== undefined && (
                                <AchievementDialog
                                    achievement={editingAchievement}
                                    onClose={() => setEditingAchievement(undefined)}
                                    onSave={handleSave}
                                />
                            )}
                            {grantingAchievement && (
                                <GrantAchievementDialog
                                    achievement={grantingAchievement}
                                    users={users}
                                    onClose={() => setGrantingAchievement(null)}
                                    onSuccess={() => { }}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
