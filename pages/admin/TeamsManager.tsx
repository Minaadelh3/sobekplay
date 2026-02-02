import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { TEAMS } from '../../types/auth'; // Fallback
import { motion, AnimatePresence } from 'framer-motion';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/permissions';
import PointsControlPanel from '../../components/admin/PointsControlPanel';

export default function TeamsManager() {
    const {
        teams,
        users,
        loading,
        fetchTeams,
        fetchUsers, // Needed for member count
        createTeam,
        deleteTeam,
        updateTeamProfile
    } = useAdminData();

    const { user } = useAuth();
    const [showCreate, setShowCreate] = useState(false);

    // Create Form State
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamId, setNewTeamId] = useState('');
    const [newTeamColor, setNewTeamColor] = useState('from-gray-700 to-gray-900');

    // Edit Form State
    const [editingTeam, setEditingTeam] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editAvatar, setEditAvatar] = useState('');

    // God Mode State
    const [selectedTeamForPoints, setSelectedTeamForPoints] = useState<any | null>(null);

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamId || !newTeamName) return;

        await createTeam({
            id: newTeamId.toLowerCase().replace(/\s+/g, '_'),
            name: newTeamName,
            color: newTeamColor,
            avatar: `https://ui-avatars.com/api/?name=${newTeamName}&background=random`
        });
        setShowCreate(false);
        setNewTeamName('');
        setNewTeamId('');
    };

    const handleEditTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeam || !editName) return;

        await updateTeamProfile(editingTeam.id, {
            name: editName,
            color: editColor,
            avatar: editAvatar
        });
        setEditingTeam(null);
        fetchTeams();
    };

    const openEditModal = (team: any) => {
        setEditingTeam(team);
        setEditName(team.name);
        setEditColor(team.color || 'from-gray-700 to-black');
        setEditAvatar(team.avatar || '');
    };

    const handleSyncImages = async () => {
        if (!confirm("Start auto-repair of team images?")) return;

        const updates = TEAMS.map(template => {
            // Only update if ID matches known teams
            return updateDoc(doc(db, "teams", template.id), {
                avatar: template.avatar
            }).catch(e => console.warn(`Skipped ${template.id}`, e));
        });

        await Promise.all(updates);
        alert("Images Synced! Refreshing...");
        fetchTeams();
    };

    const displayTeams = teams.length > 0 ? teams : TEAMS;

    return (
        <div className="space-y-6 relative">
            {/* Modal Layer */}
            <AnimatePresence>
                {selectedTeamForPoints && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md"
                        >
                            <PointsControlPanel
                                targetId={selectedTeamForPoints.id}
                                targetName={selectedTeamForPoints.name}
                                targetType="TEAM"
                                currentPoints={selectedTeamForPoints.points || 0}
                                onSuccess={() => {
                                    fetchTeams();
                                }}
                                onClose={() => setSelectedTeamForPoints(null)}
                            />
                        </motion.div>
                    </div>
                )}

                {/* Edit Modal */}
                {editingTeam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.form
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onSubmit={handleEditTeam}
                            className="w-full max-w-md bg-[#141414] p-6 rounded-xl border border-white/10 shadow-2xl"
                        >
                            <h3 className="font-bold mb-4 text-white text-lg">تعديل الفريق: {editingTeam.id}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">اسم الفريق</label>
                                    <input
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">رابط الشعار (Avatar URL)</label>
                                    <input
                                        value={editAvatar}
                                        onChange={e => setEditAvatar(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">لون التدرج (Tailwind CSS)</label>
                                    <input
                                        value={editColor}
                                        onChange={e => setEditColor(e.target.value)}
                                        placeholder="from-red-500 to-black"
                                        className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setEditingTeam(null)} className="px-4 py-2 text-gray-400 hover:text-white">إلغاء</button>
                                <button type="submit" className="bg-accent-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400">حفظ التعديلات</button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

            {/* Header Actions */}
            <div className="flex justify-between items-center bg-[#141414] p-4 rounded-xl border border-white/5 shadow-lg">
                <div className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <span>إدارة الفرق: <strong className="text-white">{displayTeams.length}</strong></span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSyncImages}
                        className="bg-blue-900/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-900/30 transition-all"
                        title="Fix Broken Images"
                    >
                        🔧 إصلاح الصور
                    </button>
                    {can(user, 'manage_teams') && (
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="bg-accent-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-accent-gold/10"
                        >
                            + فريق جديد
                        </button>
                    )}
                </div>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateTeam}
                        className="bg-[#141414] p-6 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                    >
                        {/* ... existing create form content ... */}
                        <h3 className="font-bold mb-4 text-white text-lg">✨ إنشاء فريق جديد</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">المعرف (ID)</label>
                                <input
                                    placeholder="ex: kings_unit"
                                    value={newTeamId}
                                    onChange={e => setNewTeamId(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">اسم الفريق</label>
                                <input
                                    placeholder="ex: الملوك"
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:border-accent-gold outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 hover:text-white">إلغاء</button>
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500 shadow-lg shadow-green-900/20">حفظ الفريق</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayTeams.map(team => {
                    const isUncleJoy = team.id === 'uncle_joy' || team.isScorable === false;
                    const membersCount = users.filter(u => u.teamId === team.id).length;

                    // Display Name Logic: Use DB name, fallback to Static TEAMS name, fallback to ID
                    const staticData = TEAMS.find(t => t.id === team.id);
                    const displayName = team.name || staticData?.name || team.id;

                    return (
                        <div key={team.id} className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-gold/50 transition-all hover:shadow-2xl hover:shadow-black/50">
                            {/* Color Strip */}
                            <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${team.color || 'from-gray-700 to-black'}`} />

                            {/* Actions (Delete & Edit) */}
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                                <button
                                    onClick={() => openEditModal(team)}
                                    className="text-gray-400 hover:text-accent-gold hover:bg-white/5 p-2 rounded-lg transition-colors"
                                    title="تعديل الفريق"
                                >
                                    ✏️
                                </button>
                                {team.id !== 'uncle_joy' && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`هل أنت متأكد من حذف فريق ${team.name}؟`)) {
                                                deleteTeam(team.id);
                                            }
                                        }}
                                        className="text-red-500 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                        title="حذف الفريق"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className={`w-16 h-16 rounded-2xl shadow-lg bg-gray-800 overflow-hidden relative ${isUncleJoy ? 'ring-2 ring-blue-500/50' : ''}`}>
                                    <img
                                        src={team.avatar?.startsWith('/') ? team.avatar : `/${team.avatar}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Try static avatar or default
                                            target.src = staticData?.avatar || '/assets/brand/logo.png';
                                        }}
                                        alt={team.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {isUncleJoy && (
                                        <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center backdrop-blur-[2px]">
                                            <span title="Admin Team" className="text-2xl">🛡️</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                                        {displayName}
                                        {isUncleJoy && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold tracking-widest">ADMIN</span>}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider opacity-60">ID: {team.id}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                                    <span className="block text-gray-500 text-xs font-bold uppercase mb-1">الأعضاء</span>
                                    <span className="text-xl font-mono font-bold text-white">{membersCount}</span>
                                </div>
                                <div className="bg-black/30 rounded-xl p-3 text-center border border-white/5">
                                    <span className="block text-gray-500 text-xs font-bold uppercase mb-1">الترتيب</span>
                                    <span className="text-xl font-mono font-bold text-accent-gold">#{team.rank || '-'}</span>
                                </div>
                            </div>

                            {/* Current Points Display */}
                            <div className="text-center mb-6">
                                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">نقاط الفريق</div>
                                <div className="text-4xl font-black text-white drop-shadow-xl font-mono">
                                    {(team.points || 0).toLocaleString()} <span className="text-accent-gold text-lg">SP</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 border-t border-white/5">
                                {can(user, 'adjust_points') ? (
                                    <button
                                        onClick={() => setSelectedTeamForPoints(team)}
                                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-accent-gold hover:text-black border border-white/10 hover:border-accent-gold font-bold transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>⚡</span>
                                        <span>التحكم في النقاط</span>
                                        <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity">→</span>
                                    </button>
                                ) : (
                                    <div className="bg-blue-500/5 p-3 rounded-lg text-center text-xs text-blue-300 border border-blue-500/10">
                                        🔒 نقاط هذا الفريق محمية
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
