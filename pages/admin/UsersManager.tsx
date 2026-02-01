import React, { useState, useEffect, useRef } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { motion } from 'framer-motion';

export default function UsersManager() {
    const {
        users,
        teams,
        loading,
        fetchUsers,
        fetchTeams,
        toggleUserStatus,
        assignTeam,
        uploadUserAvatar
    } = useAdminData();

    const [filterTeam, setFilterTeam] = useState('all');
    const [filterRole, setFilterRole] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedUserId) {
            const file = e.target.files[0];
            const success = await uploadUserAvatar(selectedUserId, file);
            if (success) {
                // Determine if we need to force refresh or if hook state update is enough
                // Hook updates state optimistically, so it should be fine.
                console.log("Upload success");
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => {
        const matchesTeam = filterTeam === 'all' || (filterTeam === '' ? !u.teamId : u.teamId === filterTeam);
        const matchesRole = filterRole === 'all' || (filterRole === 'ADMIN' ? u.role === 'ADMIN' : u.role !== 'ADMIN');
        return matchesTeam && matchesRole;
    });

    const displayTeams = teams.filter(t => t.id !== 'uncle_joy');

    return (
        <div className="space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Filters */}
            <div className="bg-[#141414] p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                    <div className="text-gray-400 text-sm flex items-center">
                        Total Users: <span className="font-bold text-white ml-2">{users.length}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="bg-black/30 border border-white/10 px-4 py-2 rounded-lg text-white outline-none"
                    >
                        <option value="all" className="bg-gray-900 text-white">كل الفرق</option>
                        <option value="" className="bg-gray-900 text-white">بلا فريق</option>
                        {displayTeams.map(t => (
                            <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                                {t.name || t.id}
                            </option>
                        ))}
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
            <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">المستخدم</th>
                                <th className="px-6 py-4">الفريق</th>
                                <th className="px-6 py-4">الحالة</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden cursor-pointer relative group/avatar"
                                                    onClick={() => {
                                                        setSelectedUserId(user.id);
                                                        if (fileInputRef.current) fileInputRef.current.click();
                                                    }}
                                                    title="Click to upload photo"
                                                >
                                                    <img
                                                        src={user.avatar || user.photoURL || '/assets/brand/logo.png'}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/assets/brand/logo.png';
                                                        }}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover/avatar:opacity-50 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100">
                                                        <span className="text-[10px] text-white">📷</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {user.name}
                                                        {user.role === 'ADMIN' && <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-500 border border-red-500/20">ADMIN</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                    <div className="text-xs text-gray-700 font-mono">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.teamId || ''}
                                                onChange={(e) => assignTeam(user.id, e.target.value)}
                                                className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-sm text-gray-300 focus:border-accent-gold outline-none w-32"
                                            >
                                                <option value="" className="bg-gray-900 text-white">بلا فريق</option>
                                                {displayTeams.map(team => (
                                                    <option key={team.id} value={team.id} className="bg-gray-900 text-white">
                                                        {team.name || team.id}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.isDisabled ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {user.isDisabled ? 'محظور' : 'نشط'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleUserStatus(user.id, !!user.isDisabled)}
                                                className={`px-3 py-1 rounded border text-xs ${user.isDisabled
                                                    ? 'border-green-500/30 text-green-500 hover:bg-green-500/10'
                                                    : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                                                    }`}
                                            >
                                                {user.isDisabled ? 'إلغاء الحظر' : 'حظر'}
                                            </button>
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
