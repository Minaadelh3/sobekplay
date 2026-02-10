import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Smartphone, Monitor, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SubscribedUser {
    id: string;
    username: string;
    teamName?: string;
    oneSignalId: string;
    pushEnabled: boolean;
    pushPermission?: string;
    lastSeenAt?: any;
    device?: {
        params?: {
            userAgent?: string;
            platform?: string;
        }
    };
}

export default function SubscribedUsersList() {
    const [users, setUsers] = useState<SubscribedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, denied: 0 });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch users who have interacted with OneSignal (have a oneSignalId)
            // Note: Indexing might be required for complex queries, keeping it simple for now.
            // fetching all relevant users
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('oneSignalId', '!=', null),
                limit(100) // Safety limit
            );

            const snapshot = await getDocs(q);
            const fetchedUsers: SubscribedUser[] = [];
            let activeCount = 0;
            let deniedCount = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                const user = { id: doc.id, ...data } as SubscribedUser;
                fetchedUsers.push(user);

                if (user.pushEnabled) activeCount++;
                if (user.pushPermission === 'denied') deniedCount++;
            });

            // Client side sort by lastSeenAt if possible, or just default
            fetchedUsers.sort((a, b) => {
                const tA = a.lastSeenAt?.toMillis?.() || 0;
                const tB = b.lastSeenAt?.toMillis?.() || 0;
                return tB - tA;
            });

            setUsers(fetchedUsers);
            setStats({
                total: fetchedUsers.length,
                active: activeCount,
                denied: deniedCount
            });

        } catch (error) {
            console.error("Error fetching subscribed users:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (platform?: string) => {
        if (!platform) return <Monitor size={16} />;
        if (platform.toLowerCase().includes('win') || platform.toLowerCase().includes('mac') || platform.toLowerCase().includes('linux')) {
            return <Monitor size={16} />;
        }
        return <Smartphone size={16} />;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading subscribers...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Installs</div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="text-green-400 text-sm mb-1">Active Subscribers</div>
                    <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-red-400 text-sm mb-1">Permission Denied</div>
                    <div className="text-2xl font-bold text-red-400">{stats.denied}</div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-black/20 text-gray-400 border-b border-white/10">
                            <th className="p-4 font-medium">User</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Platform</th>
                            <th className="p-4 font-medium">Last Sync</th>
                            <th className="p-4 font-medium">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-white">{user.username || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{user.teamName}</div>
                                </td>
                                <td className="p-4">
                                    {user.pushEnabled ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">
                                            <CheckCircle2 size={12} /> Active
                                        </span>
                                    ) : user.pushPermission === 'denied' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20">
                                            <AlertTriangle size={12} /> Denied
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold border border-gray-500/20">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-300">
                                    <div className="flex items-center gap-2" title={user.device?.params?.userAgent}>
                                        {getDeviceIcon(user.device?.params?.platform)}
                                        <span>{user.device?.params?.platform || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400 font-mono text-xs">
                                    {user.lastSeenAt?.toMillis ? new Date(user.lastSeenAt.toMillis()).toLocaleString() : 'N/A'}
                                </td>
                                <td className="p-4 text-gray-600 font-mono text-[10px] truncate max-w-[100px]" title={user.oneSignalId}>
                                    {user.oneSignalId}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No subscribers found yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
