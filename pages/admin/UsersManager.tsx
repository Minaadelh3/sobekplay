import React, { useState, useEffect } from 'react';
import { useAdminData, AdminUser } from '../../hooks/useAdminData';
import UserAvatar from '../../components/UserAvatar';
import { TEAMS } from '../../types/auth';
import PointsControlPanel from '../../components/admin/PointsControlPanel';
import UserDetailDrawer from '../../components/admin/UserDetailDrawer';
import CreateUserDialog from '../../components/admin/CreateUserDialog';
import BulkPointsDialog from '../../components/admin/BulkPointsDialog';
import TableHeadFilter from '../../components/admin/TableHeadFilter';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersManager() {
    const {
        users,
        teams,
        loading,
        fetchUsers,
        fetchTeams,
        deleteUser // Ensure this is destructured
    } = useAdminData();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null); // For Drawer
    const [pointsUser, setPointsUser] = useState<AdminUser | null>(null); // For Points Modal
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showBulkPoints, setShowBulkPoints] = useState(false);

    // Advanced State
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, []);

    const processedUsers = users.filter(u => {
        // 1. Search Query
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (u.name || '').toLowerCase().includes(searchLower) ||
            (u.displayName || '').toLowerCase().includes(searchLower) ||
            (u.nickname || '').toLowerCase().includes(searchLower) ||
            (u.email || '').toLowerCase().includes(searchLower);

        // 2. Column Filters
        let matchesFilters = true;
        Object.keys(columnFilters).forEach(key => {
            if (columnFilters[key] && columnFilters[key].length > 0) {
                let val = (u as any)[key];
                // Boolean handling for isDisabled
                if (key === 'isDisabled') val = val ? 'suspended' : 'active';
                // Team handling (if null/undefined -> 'unassigned')
                if (key === 'teamId') val = val || 'unassigned';

                if (!columnFilters[key].includes(String(val))) matchesFilters = false;
            }
        });

        return matchesSearch && matchesFilters;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = (a as any)[key] || '';
        let bValue: any = (b as any)[key] || '';

        // Specific Handling
        if (key === 'teamId') {
            aValue = TEAMS.find(t => t.id === a.teamId)?.name || a.teamId || '';
            bValue = TEAMS.find(t => t.id === b.teamId)?.name || b.teamId || '';
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === processedUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(processedUsers.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev => prev.includes(id)
            ? prev.filter(u => u !== id)
            : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users PERMANENTLY?`)) return;

        // Sequential delete to avoid overwhelming Firestore (or batch if implemented)
        for (const uid of selectedUsers) {
            await deleteUser(uid);
        }
        setSelectedUsers([]);
        alert("Bulk delete complete.");
    };

    return (
        <div className="space-y-6">

            {/* Drawers & Modals */}
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailDrawer
                        user={selectedUser}
                        teams={teams}
                        onClose={() => setSelectedUser(null)}
                        onUpdate={() => {
                            fetchUsers();
                            setSelectedUser(null);
                        }}
                    />
                )}
                {pointsUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md">
                            <PointsControlPanel
                                targetId={pointsUser.id}
                                targetName={pointsUser.displayName || pointsUser.name || 'Unknown User'}
                                targetType="USER"
                                currentPoints={pointsUser.points || 0}
                                onSuccess={() => { fetchUsers(); setPointsUser(null); }}
                                onClose={() => setPointsUser(null)}
                            />
                        </motion.div>
                    </div>
                )}
                {showBulkPoints && (
                    <BulkPointsDialog
                        data={users} // Pass all users so we can find names
                        selectedIds={selectedUsers}
                        onClose={() => setShowBulkPoints(false)}
                        onSuccess={() => { setShowBulkPoints(false); fetchUsers(); setSelectedUsers([]); }}
                    />
                )}
            </AnimatePresence>

            <CreateUserDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={() => { fetchUsers(); }}
            />

            {/* Bulk Action Bar - Shows only when items selected */}
            <AnimatePresence>
                {selectedUsers.length > 0 && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-[#1A1D24] border border-white/10 px-6 py-3 rounded-full shadow-2xl"
                    >
                        <span className="font-bold text-white text-sm">{selectedUsers.length} Selected</span>
                        <div className="h-4 w-px bg-white/10" />
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 font-bold text-sm"
                        >
                            <span>🗑️</span> Delete All
                        </button>
                        <button
                            onClick={() => setSelectedUsers([])}
                            className="text-gray-500 hover:text-white text-xs"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#141414] p-4 rounded-xl border border-white/5 shadow-lg">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-accent-gold outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">
                        Showing {processedUsers.length} / {users.length}
                    </span>
                    <button onClick={() => fetchUsers()} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        🔄
                    </button>
                    <button onClick={() => setShowCreateDialog(true)} className="bg-accent-gold text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-accent-gold/20">
                        + New User
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-[#0A0C10] border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={processedUsers.length > 0 && selectedUsers.length === processedUsers.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                <TableHeadFilter
                                    label="User"
                                    options={[]}
                                    selectedValues={[]}
                                    onChange={() => { }}
                                    onSort={() => handleSort('name')}
                                    sortDirection={sortConfig?.key === 'name' ? sortConfig.direction : null}
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                <TableHeadFilter
                                    label="Role"
                                    options={['SUPER_ADMIN', 'ADMIN', 'USER', 'POINTS_MANAGER', 'GAMES_MODERATOR'].map(r => ({ label: r, value: r }))}
                                    selectedValues={columnFilters['role'] || []}
                                    onChange={(vals) => setColumnFilters(prev => ({ ...prev, role: vals }))}
                                    onSort={() => handleSort('role')}
                                    sortDirection={sortConfig?.key === 'role' ? sortConfig.direction : null}
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                <TableHeadFilter
                                    label="Team"
                                    options={[...teams.map(t => ({ label: TEAMS.find(st => st.id === t.id)?.name || t.name, value: t.id })), { label: 'Unassigned', value: 'unassigned' }]}
                                    selectedValues={columnFilters['teamId'] || []}
                                    onChange={(vals) => setColumnFilters(prev => ({ ...prev, teamId: vals }))}
                                    onSort={() => handleSort('teamId')}
                                    sortDirection={sortConfig?.key === 'teamId' ? sortConfig.direction : null}
                                />
                            </th>
                            <th
                                className="px-6 py-4 text-[10px] uppercase font-bold text-gray-500 tracking-wider text-right cursor-pointer hover:text-white transition-colors group select-none"
                                onClick={() => handleSort('points')}
                            >
                                Points {sortConfig?.key === 'points' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-4 text-[10px] uppercase font-bold text-gray-500 tracking-wider text-right">
                                <div className="flex justify-end">
                                    <TableHeadFilter
                                        label="Status"
                                        options={[{ label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }]}
                                        selectedValues={columnFilters['isDisabled'] || []}
                                        onChange={(vals) => setColumnFilters(prev => ({ ...prev, isDisabled: vals }))}
                                    />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={7} className="p-12 text-center text-gray-500 font-mono animate-pulse">Loading Grid Data...</td></tr>
                        ) : processedUsers.length === 0 ? (
                            <tr><td colSpan={7} className="p-12 text-center text-gray-500">No users found matching filters.</td></tr>
                        ) : (
                            processedUsers.map(user => (
                                <tr key={user.id} className={`hover:bg-white/[0.02] transition-colors group ${selectedUsers.includes(user.id) ? 'bg-white/[0.03]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleSelectUser(user.id)}
                                            className="rounded border-white/10 bg-black/40 checked:bg-accent-gold"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar src={user.avatar || user.photoURL} name={user.displayName || user.name} size="sm" className="bg-gray-800" />
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.displayName || user.name}</div>
                                                <div className="text-xs text-gray-500 font-mono flex gap-2">
                                                    <span>{user.email || "No Email"}</span>
                                                    {user.nickname && <span className="text-gray-600">({user.nickname})</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                            className={`text-[10px] px-2 py-1 rounded font-bold border transition-all hover:scale-105 hover:shadow-lg ${user.role?.includes('ADMIN') ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-gray-800 text-gray-400 border-white/5 hover:bg-gray-700 hover:text-white'}`}
                                            title="Click to change Role"
                                        >
                                            {user.role || 'USER'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.teamId ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                                className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 hover:border-accent-gold/30 hover:text-white transition-all w-fit cursor-pointer"
                                                title="Click to change Team"
                                            >
                                                <span>🛡️</span>
                                                {TEAMS.find(t => t.id === user.teamId)?.name || user.teamId}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                                className="text-xs text-gray-600 italic hover:text-accent-gold transition-colors cursor-pointer"
                                                title="Assign to a Team"
                                            >
                                                Unassigned
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-mono font-bold text-accent-gold">{user.points?.toLocaleString() || 0}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isDisabled ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isDisabled ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                                            {user.isDisabled ? 'SUSPENDED' : 'ACTIVE'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setPointsUser(user)}
                                                className="p-1.5 text-gray-400 hover:text-accent-gold hover:bg-accent-gold/10 rounded transition-colors"
                                                title="Manage Points"
                                            >
                                                💰
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded border border-white/10 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-500 rounded border border-red-500/20 transition-colors"
                                                title="Delete Completely"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div >
    );
}
