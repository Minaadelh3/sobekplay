import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { TEAMS } from '../../types/auth'; // Fallback
import { motion, AnimatePresence } from 'framer-motion';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';


export default function TeamsManager() {
    const {
        teams,
        users,
        loading,
        fetchTeams,
        fetchUsers, // Needed for member count
        createTeam,
        deleteTeam,
        updateTeamPoints
    } = useAdminData();

    const [showCreate, setShowCreate] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamId, setNewTeamId] = useState('');
    const [newTeamColor, setNewTeamColor] = useState('from-gray-700 to-gray-900');

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
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-[#141414] p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-sm">إجمالي الفرق: {displayTeams.length}</div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSyncImages}
                        className="bg-blue-900/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-900/40"
                        title="Fix Broken Images"
                    >
                        🔧 إصلاح الصور
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-accent-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                    >
                        + فريق جديد
                    </button>
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
                        className="bg-[#141414] p-6 rounded-xl border border-white/10 overflow-hidden"
                    >
                        <h3 className="font-bold mb-4 text-white">بيانات الفريق الجديد</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                placeholder="Team ID (English, unique)"
                                value={newTeamId}
                                onChange={e => setNewTeamId(e.target.value)}
                                className="bg-black/30 border border-white/10 p-3 rounded-lg text-white"
                                required
                            />
                            <input
                                placeholder="Team Name (Arabic)"
                                value={newTeamName}
                                onChange={e => setNewTeamName(e.target.value)}
                                className="bg-black/30 border border-white/10 p-3 rounded-lg text-white"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-400 hover:text-white">إلغاء</button>
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500">حفظ</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayTeams.map(team => {
                    const isUncleJoy = team.id === 'uncle_joy' || team.isScorable === false;
                    const membersCount = users.filter(u => u.teamId === team.id).length;

                    return (
                        <div key={team.id} className="bg-[#141414] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-gold/50 transition-all">
                            {/* Color Strip */}
                            <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${team.color}`} />

                            {/* Delete Action (Hidden by default, visible on hover) */}
                            {team.id !== 'uncle_joy' && (
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`هل أنت متأكد من حذف فريق ${team.name}؟`)) {
                                                deleteTeam(team.id);
                                            }
                                        }}
                                        className="text-red-500 hover:bg-red-900/20 p-2 rounded-lg"
                                        title="حذف الفريق"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-xl shadow-lg bg-gray-800 overflow-hidden relative ${isUncleJoy ? 'ring-2 ring-blue-500/50' : ''}`}>
                                    <img
                                        src={team.avatar?.startsWith('/') ? team.avatar : `/${team.avatar}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/assets/brand/logo.png'; // Verified Fallback
                                        }}
                                        alt={team.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {isUncleJoy && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span title="Admin Team">🛡️</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {team.name}
                                        {isUncleJoy && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">ADMIN</span>}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-mono">ID: {team.id}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-black/30 rounded-xl p-4 flex justify-between items-center mb-6">
                                <span className="text-gray-400 text-sm">الأعضاء</span>
                                <span className="text-2xl font-mono font-bold text-white">{membersCount}</span>
                            </div>

                            {/* Points Control */}
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase text-gray-500">النقاط</span>
                                    {isUncleJoy && <span className="text-xs text-red-400">🚫 غير متاح للتصويت</span>}
                                </div>

                                {!isUncleJoy ? (
                                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <button
                                            onClick={() => updateTeamPoints(team.id, Math.max(0, (team.points || 0) - 10))}
                                            className="w-10 h-10 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center font-bold text-lg transition-colors"
                                        >-</button>
                                        <input
                                            type="number"
                                            value={team.points ?? 0}
                                            onChange={(e) => updateTeamPoints(team.id, parseInt(e.target.value) || 0)}
                                            className="flex-1 bg-transparent text-center font-mono font-bold text-2xl text-accent-gold outline-none"
                                        />
                                        <button
                                            onClick={() => updateTeamPoints(team.id, (team.points || 0) + 10)}
                                            className="w-10 h-10 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center justify-center font-bold text-lg transition-colors"
                                        >+</button>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 p-3 rounded-lg text-center text-sm text-gray-500 cursor-not-allowed border border-white/5 border-dashed">
                                        لا يمكن إضافة نقاط لهذا الفريق
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
