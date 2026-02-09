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
        deleteAchievement,
        resetAllAchievements
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

        <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
            {/* 🟢 GLOBAL HEADER & TABS 🟢 */}
            <div className="bg-[#141414] p-5 lg:p-8 rounded-2xl lg:rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden pt-[calc(1.25rem+env(safe-area-inset-top))] lg:pt-8">
                <div className="absolute top-0 right-0 p-32 bg-accent-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                    <div>
                        <h1 className="text-2xl lg:text-4xl font-black text-white mb-2 flex items-center gap-2 lg:gap-3">
                            <span>🏛️</span> Game Economy
                        </h1>
                        <p className="text-gray-400 text-xs lg:text-sm font-medium">مركز التحكم في الإنجازات، النقاط، ورحلة الخمس أيام.</p>
                    </div>

                    {/* Big Logical Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-xl lg:rounded-2xl border border-white/5 backdrop-blur-md w-full lg:w-auto">
                        <button
                            onClick={() => setActiveTab('MAIN')}
                            className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${activeTab === 'MAIN'
                                ? 'bg-accent-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                : 'text-gray-400'
                                }`}
                        >
                            <span>🏆</span> الإنجازات
                        </button>
                        <div className="w-px bg-white/10 my-2 mx-1 shrink-0" />
                        <button
                            onClick={() => setActiveTab('JOURNEY')}
                            className={`flex-1 lg:flex-none px-4 lg:px-8 py-2.5 lg:py-3 rounded-lg lg:rounded-xl font-bold text-xs lg:text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${activeTab === 'JOURNEY'
                                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400'
                                }`}
                        >
                            <span>🐫</span> الرحلة
                        </button>
                    </div>
                </div>
            </div>

            {/* 🟡 CONTENT AREA 🟡 */}
            <div className="min-h-[400px]">
                {activeTab === 'JOURNEY' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <AdminJourney />
                    </div>
                ) : (
                    <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-bottom-8 duration-500">

                        {/* Toolbar for General Achievements */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-[#1A1A1A] p-4 rounded-xl lg:rounded-2xl border border-white/5 gap-4">
                            <div className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-wider">
                                {achievements.filter(a => a.category !== 'JOURNEY').length} Active Achievements
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 lg:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={resetAllAchievements}
                                    className="flex-1 sm:flex-none px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl bg-red-900/20 text-red-500 text-[10px] lg:text-xs font-bold border border-red-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <span>☢️</span> Reset
                                </button>
                                <button
                                    onClick={seedAchievements}
                                    className="flex-1 sm:flex-none px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl bg-white/5 text-gray-400 text-[10px] lg:text-xs font-bold border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <span>⚡</span> Seed
                                </button>
                                <button
                                    onClick={() => setEditingAchievement(null)}
                                    className="w-full sm:w-auto px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl bg-accent-gold/10 text-accent-gold border border-accent-gold/20 font-bold text-xs lg:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <span>+</span> New
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="text-center py-20 text-gray-500 animate-pulse text-xs lg:text-sm">Loading Achievements...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                                {achievements.filter(a => a.category !== 'JOURNEY').map(achievement => (
                                    <motion.div
                                        key={achievement.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`group relative bg-[#1A1A1A] rounded-2xl border ${achievement.visible ? 'border-white/10' : 'border-red-500/20 opacity-70'} overflow-hidden shadow-sm hover:shadow-2xl transition-all hover:border-accent-gold/30`}
                                    >
                                        <div className="p-4 lg:p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/5 flex items-center justify-center text-3xl lg:text-4xl shadow-inner border border-white/5">
                                                    {achievement.emoji}
                                                </div>
                                                <div className={`px-2 py-0.5 lg:py-1 rounded text-[10px] font-bold uppercase tracking-wider ${achievement.visible ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {achievement.visible ? 'Active' : 'Disabled'}
                                                </div>
                                            </div>

                                            <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{achievement.title}</h3>
                                            <p className="text-xs lg:text-sm text-gray-400 h-10 mb-4 line-clamp-2">{achievement.description}</p>

                                            <div className="bg-black/30 p-3 rounded-xl mb-4 border border-white/5">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                    <span>⚙️</span> Backend Config
                                                </div>
                                                <div className="space-y-1 text-[10px] lg:text-xs font-mono">
                                                    <div className="flex justify-between items-center text-green-400">
                                                        <span>Category</span>
                                                        <span className="truncate ml-4">✅ {achievement.category}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>Trigger</span>
                                                        <span className="text-green-400 truncate ml-4">✅ {achievement.trigger?.event || 'Manual'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span>Points Flow</span>
                                                        {achievement.xp > 0
                                                            ? <span className="text-green-400">✅ {achievement.xp} SP</span>
                                                            : <span className="text-gray-500">⚪ No Points</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0 transition-all">
                                                <button
                                                    onClick={() => setGrantingAchievement(achievement)}
                                                    className="py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-colors active:scale-95"
                                                >
                                                    🎁 Grant
                                                </button>
                                                <button
                                                    onClick={() => setEditingAchievement(achievement)}
                                                    className="py-2.5 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold rounded-lg text-xs font-bold transition-colors active:scale-95"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => toggleAchievementStatus(achievement)}
                                                    className="col-span-1 py-2.5 bg-transparent hover:bg-white/5 text-gray-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-dashed border-white/10 active:scale-95"
                                                >
                                                    {achievement.visible ? '🔒 Disable' : '🔓 Enable'}
                                                </button>
                                                <button
                                                    onClick={() => deleteAchievement(achievement.id)}
                                                    className="col-span-1 py-2.5 bg-transparent hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-lg text-xs font-bold transition-colors border border-dashed border-white/10 active:scale-95"
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
