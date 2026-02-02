import React, { useState, useEffect, useRef } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import UserAvatar from '../../components/UserAvatar';
import { TEAMS } from '../../types/auth'; // Ensure this path is correct
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/permissions';
import PointsControlPanel from '../../components/admin/PointsControlPanel';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersManager() {
    const {
        users,
        teams,
        loading,
        fetchUsers,
        fetchTeams,
        toggleUserStatus,
        assignTeam,
        uploadUserAvatar,
        updateUserName
    } = useAdminData();
    const { user: currentUser } = useAuth();

    const [filterTeam, setFilterTeam] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // God Mode States
    const [selectedUserForPoints, setSelectedUserForPoints] = useState<any | null>(null);
    const [bulkSelection, setBulkSelection] = useState<Set<string>>(new Set());

    // Inline Edit States
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedUserIdForUpload, setSelectedUserIdForUpload] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedUserIdForUpload) {
            const file = e.target.files[0];
            const success = await uploadUserAvatar(selectedUserIdForUpload, file);
            if (success) {
                console.log("Upload success");
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveName = async (uid: string) => {
        if (!editedName.trim()) return;
        const success = await updateUserName(uid, editedName);
        if (success) setEditingUserId(null);
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesTeam = filterTeam === 'all' || (filterTeam === '' ? !u.teamId : u.teamId === filterTeam);
        const matchesRole = filterRole === 'all' || (filterRole === 'ADMIN' ? u.role === 'ADMIN' : u.role !== 'ADMIN');
        const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTeam && matchesRole && matchesSearch;
    });

    // We no longer filter out 'uncle_joy' so it can be selected/viewed
    const displayTeams = teams;

    const toggleBulkSelect = (id: string) => {
        const newSet = new Set(bulkSelection);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setBulkSelection(newSet);
    };

    return (
        <div className="space-y-6 relative">
            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Modal Layer */}
            <AnimatePresence>
                {selectedUserForPoints && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md"
                        >
                            <PointsControlPanel
                                targetId={selectedUserForPoints.id}
                                targetName={selectedUserForPoints.name}
                                targetType="USER"
                                currentPoints={selectedUserForPoints.points || 0}
                                onSuccess={() => {
                                    fetchUsers();
                                }}
                                onClose={() => setSelectedUserForPoints(null)}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Filters & Actions Bar */}
            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 shadow-xl">
                <div className="flex gap-4 items-center flex-1">
                    <div className="relative">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الايميل..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-white outline-none focus:border-accent-gold w-64"
                        />
                    </div>

                    <div className="text-gray-400 text-sm flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                        <span>العدد:</span>
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{filteredUsers.length}</span>
                    </div>

                    {bulkSelection.size > 0 && (
                        <div className="flex items-center gap-2 animate-pulse">
                            <span className="text-accent-gold font-bold">{bulkSelection.size} محدد</span>
                            <button className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-lg text-xs font-bold hover:bg-accent-gold/30">
                                ⚡ إجراء جماعي
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg text-white outline-none"
                    >
                        <option value="all" className="bg-gray-900 text-white">كل الفرق</option>
                        <option value="" className="bg-gray-900 text-white">-- غير محدد --</option>
                        {displayTeams.map(t => {
                            const staticProfile = TEAMS.find(p => p.id === t.id);
                            const displayName = staticProfile ? staticProfile.name : (t.name || t.id);
                            return (
                                <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                                    {displayName}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg text-white outline-none"
                    >
                        <option value="all" className="bg-gray-900 text-white">كل الصلاحيات</option>
                        <option value="ADMIN" className="bg-gray-900 text-white">مشرف (Admin)</option>
                        <option value="USER" className="bg-gray-900 text-white">عضو (User)</option>
                    </select>

                    <button onClick={() => fetchUsers()} disabled={loading} className="bg-white/5 hover:bg-white/10 p-2 rounded-lg" title="تحديث">🔄</button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0A0A0A] text-gray-400 text-xs uppercase font-bold tracking-wider sticky top-0">
                            <tr>
                                <th className="px-6 py-4 border-b border-white/5 w-10">
                                    <input type="checkbox" className="accent-accent-gold cursor-pointer" />
                                </th>
                                <th className="px-6 py-4 border-b border-white/5">المستخدم</th>
                                <th className="px-6 py-4 border-b border-white/5 text-center">النقاط (SP)</th>
                                <th className="px-6 py-4 border-b border-white/5">الفريق</th>
                                <th className="px-6 py-4 border-b border-white/5">الحالة</th>
                                <th className="px-6 py-4 border-b border-white/5 text-right">تحكم God Mode</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse">جاري سحب البيانات من السيرفر...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500">لا يوجد مستخدمين مطابقين</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={bulkSelection.has(user.id)}
                                                onChange={() => toggleBulkSelect(user.id)}
                                                className="accent-accent-gold cursor-pointer w-4 h-4"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="cursor-pointer relative group/avatar shrink-0"
                                                    onClick={() => {
                                                        setSelectedUserIdForUpload(user.id);
                                                        if (fileInputRef.current) fileInputRef.current.click();
                                                    }}
                                                    title="تغيير الصورة"
                                                >
                                                    <UserAvatar
                                                        src={user.avatar || user.photoURL}
                                                        name={user.name}
                                                        size="md"
                                                        className="bg-gray-800 group-hover/avatar:opacity-50 transition-opacity ring-2 ring-white/5"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 pointer-events-none">
                                                        <span className="text-[10px]">📷</span>
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    {editingUserId === user.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                autoFocus
                                                                value={editedName}
                                                                onChange={e => setEditedName(e.target.value)}
                                                                className="bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-white w-32 focus:border-accent-gold outline-none"
                                                            />
                                                            <button onClick={() => handleSaveName(user.id)} className="text-green-500 hover:text-green-400 text-xs">حفظ</button>
                                                            <button onClick={() => setEditingUserId(null)} className="text-gray-500 hover:text-gray-400 text-xs">إلغاء</button>
                                                        </div>
                                                    ) : (
                                                        <div className="font-bold text-white flex items-center gap-2 truncate group/name">
                                                            {(() => {
                                                                const hasValidName = user.name && !user.name.includes('@');
                                                                const displayName = hasValidName ? user.name : (user.displayName || user.name?.split('@')[0] || 'مستخدم جديد');
                                                                return displayName;
                                                            })()}
                                                            <button
                                                                onClick={() => { setEditingUserId(user.id); setEditedName(user.name || ''); }}
                                                                className="opacity-0 group-hover/name:opacity-100 text-gray-500 hover:text-accent-gold transition-opacity px-1"
                                                                title="تعديل الاسم"
                                                            >
                                                                ✏️
                                                            </button>
                                                            {user.role === 'ADMIN' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 border border-red-500/20 font-bold">ADMIN</span>}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-400 truncate max-w-[150px]" title={user.email}>{user.email}</div>
                                                    <div className="text-[10px] text-gray-600 font-mono mt-0.5">{user.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-mono font-bold text-accent-gold text-lg">
                                                {(user.points || 0).toLocaleString()}
                                            </div>
                                            {user.xp && user.xp !== user.points && (
                                                <div className="text-[10px] text-gray-500" title="Experience Points">XP: {user.xp}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.teamId || ''}
                                                onChange={(e) => assignTeam(user.id, e.target.value)}
                                                className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-accent-gold outline-none w-36 hover:bg-black/40 transition-colors"
                                            >
                                                <option value="" className="bg-gray-900 text-white">-- غير محدد --</option>
                                                {displayTeams.map(team => {
                                                    // Helper to find Arabic name
                                                    const staticProfile = TEAMS.find(t => t.id === team.id);
                                                    const displayName = staticProfile ? staticProfile.name : (team.name || team.id);
                                                    return (
                                                        <option key={team.id} value={team.id} className="bg-gray-900 text-white">
                                                            🛡️ {displayName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                onClick={() => toggleUserStatus(user.id, !!user.isDisabled)}
                                                className={`
                                                    px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer select-none transition-all
                                                    ${user.isDisabled
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}
                                                `}
                                                title={user.isDisabled ? 'انقر لإلغاء الحظر' : 'انقر للحظر'}
                                            >
                                                {user.isDisabled ? '⛔ محظور' : '✅ نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedUserForPoints(user)}
                                                    className="p-2 rounded-lg bg-accent-gold/10 text-accent-gold hover:bg-accent-gold hover:text-black transition-all"
                                                    title="تعديل النقاط"
                                                >
                                                    💰
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                                                    title="سجل العمليات"
                                                >
                                                    📜
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
