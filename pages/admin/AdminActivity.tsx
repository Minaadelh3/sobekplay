import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminActivity() {
    // Optimization: Removed useAdminData() to prevent downloading all users/teams on this page.
    // We will display raw IDs or rely on metadata snapshots if/when implemented in logs.

    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                // Optimization: Index 'action' if we want to filter by type server-side.
                // For now, client-side filter is okay for 50 items.
                const q = query(collection(db, 'admin_logs'), orderBy('timestamp', 'desc'), limit(50));
                const snap = await getDocs(q);
                setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error("Feed Error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Time,Action,Target,Admin\n"
            + activities.map(row => `${row.timestamp?.toDate ? row.timestamp.toDate().toISOString() : ''},${row.action},${row.targetUid || row.targetTeam || 'System'},${row.adminId || 'System'}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "admin_activity_log.csv");
        document.body.appendChild(link);
        link.click();
    };

    // Helper: Translate Action Code
    const formatAction = (action?: string) => {
        if (!action) return 'Unknown Action';
        const map: Record<string, string> = {
            'UPDATE_STATS_DIRECT': 'تعديل رصيد مباشر',
            'ASSIGN_ROLE': 'تغيير صلاحية إدارية',
            'TEAM_BROADCAST': 'إذاعة رسالة للفريق',
            'DELETE_USER_PERMANENT': 'حذف مستخدم نهائياً',
            'UPDATE_USER_IDENTITY': 'تحديث بيانات هوية',
            'BAN_USER': 'حظر مستخدم',
            'UNBAN_USER': 'فك الحظر',
            'CREATE_TEAM': 'إنشاء فريق جديد',
            'ASSIGN_TEAM': 'نقل عضو لفريق',
            'ADJUST_POINTS': 'تعديل نقاط',
            'ACTIVATE_USER': 'تفعيل حساب',
            'SUSPEND_USER': 'إيقاف حساب'
        };
        return map[action] || action.replace(/_/g, ' ');
    };

    // Helper: Resolve Name (Optimized)
    const resolveName = (id: string, type: 'USER' | 'TEAM' | 'ADMIN', docData?: any) => {
        if (!id) return type === 'ADMIN' ? 'System' : 'Unknown';

        // If the log itself has cached names, use them (Proposed future improvement)
        if (docData?.targetName) return docData.targetName;
        if (docData?.adminName && type === 'ADMIN') return docData.adminName;

        return id.slice(0, 8) + '...'; // Truncate ID to avoid clutter
    };

    // Helper: Format Details
    const formatDetails = (act: any) => {
        if (act.action === 'UPDATE_STATS_DIRECT' && act.updates) {
            const parts = [];
            if (act.updates.scoreTotal !== undefined) parts.push(`Score: ${act.updates.scoreTotal}`);
            if (act.updates.points !== undefined) parts.push(`Pts: ${act.updates.points}`);
            if (act.updates.xp !== undefined) parts.push(`XP: ${act.updates.xp}`);
            return parts.join(' | ');
        }
        if (act.action === 'ASSIGN_ROLE') return `New Role: ${act.newRole}`;
        if (act.action === 'TEAM_BROADCAST') return `Msg: "${act.message.slice(0, 20)}..."`;
        if (act.action === 'ASSIGN_TEAM') return `To: ${resolveName(act.newTeam, 'TEAM', act)}`;
        // Fallback
        if (typeof act.updates === 'object') return JSON.stringify(act.updates).slice(0, 30);
        return '';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>📡</span> Activity Command
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Live timeline of system operations and interventions.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm border border-white/5"
                    >
                        ⬇ Export CSV
                    </button>
                    {/* Placeholder for rollback or other "real actions" */}
                    <button className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg font-bold text-sm border border-red-500/20">
                        🛡️ Purge Old Logs
                    </button>
                </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['ALL', 'USERS', 'TEAMS', 'SYSTEM'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${filter === f ? 'bg-white text-black' : 'bg-black/30 text-gray-400 border border-white/5'}`}
                        >
                            {f} Operations
                        </button>
                    ))}
                </div>

                <div className="relative border-l border-white/10 ml-3 space-y-8">
                    {loading ? <div className="pl-6 text-gray-500">Scanning frequency...</div> :
                        activities.length === 0 ? <div className="pl-6 text-gray-500">No recent signals. System quiet.</div> :
                            activities.map((act, idx) => {
                                // Mocking visuals based on action type
                                const isDestructive = act.action?.includes('DELETE') || act.action?.includes('BAN');
                                const isCreation = act.action?.includes('CREATE') || act.action?.includes('ASSIGN');

                                return (
                                    <div key={act.id} className="relative pl-6 group">
                                        <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#141414] ${isDestructive ? 'bg-red-500' : isCreation ? 'bg-green-500' : 'bg-gray-500'}`} />
                                        <div className="flex justify-between items-start bg-white/[0.02] p-4 rounded-lg hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-bold text-sm">{formatAction(act.action)}</span>
                                                    {formatDetails(act) && (
                                                        <span className="text-[10px] text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded font-bold">
                                                            {formatDetails(act)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-xs flex items-center gap-1">
                                                    Target:
                                                    <span className="text-white font-medium">
                                                        {act.targetTeam ? resolveName(act.targetTeam, 'TEAM', act) : resolveName(act.targetUid, 'USER', act)}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600 text-[10px] mt-1 font-mono flex items-center gap-1">
                                                    By: <span className="text-purple-400">{resolveName(act.adminId, 'ADMIN', act)}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-500 text-xs font-mono">
                                                    {act.timestamp?.toDate ? act.timestamp.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                                                </div>
                                                <div className="text-[10px] text-gray-700">
                                                    {act.timestamp?.toDate ? act.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : ''}
                                                </div>
                                                <button className="mt-2 text-[10px] text-accent-gold opacity-0 group-hover:opacity-100 uppercase font-bold tracking-wider hover:underline">
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                </div>
            </div>
        </div>
    );
}
