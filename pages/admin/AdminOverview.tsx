import React, { useEffect, useState } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

export default function AdminOverview() {
    const { users, teams, logs, loading, fetchUsers, fetchTeams, fetchLogs } = useAdminData();
    const navigate = useNavigate();
    const [storageQuote, setStorageQuota] = useState<string>('Checking...');

    useEffect(() => {
        fetchUsers();
        fetchTeams();
        fetchLogs();

        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                if (estimate.usage && estimate.quota) {
                    const percent = Math.round((estimate.usage / estimate.quota) * 100);
                    setStorageQuota(`${percent}% Used`);
                }
            });
        }
    }, []);

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
        const diff = (new Date().getTime() - date.getTime()) / 1000;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const getLogDetails = (log: any) => {
        let actionColor = 'bg-gray-500';
        let actionText = log.action;

        if (log.action.includes('CREATE')) actionColor = 'bg-green-500';
        if (log.action.includes('DELETE') || log.action.includes('BAN') || log.action.includes('SUSPEND')) actionColor = 'bg-red-500';
        if (log.action.includes('UPDATE') || log.action.includes('EDIT')) actionColor = 'bg-blue-500';
        if (log.action.includes('BROADCAST')) actionColor = 'bg-accent-gold/50';

        // Resolve Admin Name
        const admin = users.find(u => u.id === log.adminId);
        const adminName = admin ? admin.name : (log.adminId === 'system' ? 'System' : 'Unknown');

        // Readable Action
        const actions: Record<string, string> = {
            'CREATE_TEAM': 'Created new team',
            'DELETE_TEAM': 'Deleted a team',
            'BAN_USER': 'Banned user',
            'UNBAN_USER': 'Unbanned user',
            'ASSIGN_TEAM': 'Moved user',
            'Update Global Settings': 'Updated settings',
            'TEAM_BROADCAST': 'Broadcasted message',
            'UPDATE_STATS_DIRECT': 'Directly edited stats',
            'ASSIGN_ROLE': 'Changed role'
        };
        const readableAction = actions[log.action] || log.action;

        return { adminName, readableAction, actionColor };
    };

    const suspendedCount = users.filter(u => u.isDisabled).length;
    const activeTeamsCount = teams.filter(t => t.isScorable !== false).length; // Explicit check

    const stats = [
        { label: 'Total Users', value: users.length, icon: '👥', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Active Teams', value: activeTeamsCount, icon: '⚔️', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'System Load', value: 'Healthy', icon: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Suspended Users', value: suspendedCount, icon: '🚩', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    ];

    if (loading && users.length === 0) return (
        <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 animate-pulse">Establishing Uplink...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* 1. HERO METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm transition-transform hover:-translate-y-1`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`font-bold uppercase text-xs tracking-wider opacity-70 ${stat.color}`}>{stat.label}</h3>
                            <span className="text-xl opacity-50">{stat.icon}</span>
                        </div>
                        <div className="text-4xl font-black text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. QUICK ACTIONS (2/3 Width) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ActionButton
                            icon="👤" label="Add User" desc="Create manually"
                            onClick={() => navigate('/admin/users')}
                        />
                        <ActionButton
                            icon="🏆" label="Manage Teams" desc="Edit points & details"
                            onClick={() => navigate('/admin/teams')}
                        />
                        <ActionButton
                            icon="🎮" label="Game Config" desc="Tweak difficulty"
                            onClick={() => navigate('/admin/games')}
                        />
                        <ActionButton
                            icon="📢" label="Broadcast" desc="Send push notification"
                            onClick={() => navigate('/admin/announcements')}
                        />
                        <ActionButton
                            icon="🔬" label="Feature Flags" desc="Toggle beta features"
                            onClick={() => navigate('/admin/flags')}
                        />
                        <ActionButton
                            icon="🛡️" label="Audit Logs" desc="View security events"
                            onClick={() => navigate('/admin/logs')}
                        />
                    </div>

                    {/* System Status Panel */}
                    <div className="bg-[#0F1218] border border-white/5 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-[50px] rounded-full group-hover:bg-accent-gold/10 transition-all" />
                        <h3 className="text-lg font-bold text-white mb-4 relative z-10">System Status</h3>
                        <div className="space-y-4 relative z-10">
                            <StatusRow label="Database Connection" status={loading ? "Syncing..." : "Connected"} color={loading ? "text-yellow-500" : "text-green-500"} />
                            <StatusRow label="PWA Service Worker" status={('serviceWorker' in navigator && navigator.serviceWorker.controller) ? "Active" : "Inactive"} color={('serviceWorker' in navigator && navigator.serviceWorker.controller) ? "text-green-500" : "text-gray-500"} />
                            <StatusRow label="Storage Quota" status={storageQuote} color="text-blue-500" />
                            <StatusRow label="Last Backup" status="Automatic (Firestore)" color="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* 3. ACTIVITY FEED (1/3 Width) */}
                <div className="bg-[#0F1218] border border-white/5 rounded-xl block h-full">
                    <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#14161C] rounded-t-xl">
                        <h2 className="font-bold text-white">Live Activity</h2>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <div className="p-4 space-y-1">
                        {logs.slice(0, 6).map((log, i) => {
                            const { adminName, readableAction, actionColor } = getLogDetails(log);
                            return (
                                <div key={i} className="group flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 border-dashed">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${actionColor}`} />
                                    <div>
                                        <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            <span className="font-bold text-accent-gold">{adminName}</span> {readableAction}
                                        </p>
                                        <p className="text-[10px] text-gray-600 font-mono mt-1">{getTimeAgo(log.timestamp)}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {logs.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">No recent activity</p>
                        )}
                        <button
                            onClick={() => navigate('/admin/logs')}
                            className="w-full py-3 text-xs text-center text-gray-500 hover:text-white border-t border-white/5 mt-4"
                        >
                            View Full Log →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ActionButton = ({ icon, label, desc, onClick }: { icon: string, label: string, desc: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-start p-4 bg-[#0F1218] border border-white/5 rounded-xl hover:bg-[#1A1D24] hover:border-accent-gold/30 hover:shadow-[0_0_15px_rgba(191,160,90,0.1)] transition-all group text-right"
    >
        <div className="bg-black/40 w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <div className="font-bold text-white mb-1 group-hover:text-accent-gold transition-colors">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
    </button>
);

const StatusRow = ({ label, status, color }: { label: string, status: string, color: string }) => (
    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono font-bold ${color}`}>{status}</span>
    </div>
);
