import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TeamProfile, User } from '../../types/auth'; // Ensure User is imported
import { LedgerEntry } from '../../lib/ledger';
import { can } from '../../lib/permissions';
import { useAuth } from '../../context/AuthContext';
import { formatPoints } from '../../lib/gamification';

import { exportUsersToCSV, exportTeamsToCSV, exportLedgerToCSV } from '../../lib/export';

interface AnalyticsStat {
    label: string;
    value: string | number;
    color: string;
}

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AnalyticsStat[]>([]);
    const [topTeams, setTopTeams] = useState<TeamProfile[]>([]);
    const [recentActivity, setRecentActivity] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Handlers
    const handleExport = (type: 'users' | 'teams' | 'ledger') => {
        if (!confirm("تحميل الملف؟")) return;
        if (type === 'users') exportUsersToCSV();
        if (type === 'teams') exportTeamsToCSV();
        if (type === 'ledger') exportLedgerToCSV();
    };

    useEffect(() => {
        if (can(user, 'view_dashboard')) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats (Total Users, Total Points, Active Teams)
            // Optimized: Use Aggregation Queries avoid downloading thousands of docs

            // Count Users
            const usersColl = collection(db, 'users');
            const usersSnapshot = await getCountFromServer(usersColl);
            const totalUsers = usersSnapshot.data().count;

            // Count Teams
            const teamsColl = collection(db, 'teams');
            const teamsSnapshot = await getCountFromServer(teamsColl);
            const totalTeams = teamsSnapshot.data().count;

            // Calculate Total System Points
            // We use the teams collection as the source of truth for total points in the system
            const sumSnapshot = await getAggregateFromServer(teamsColl, {
                totalScore: sum('scoreTotal')
            });
            const totalPoints = sumSnapshot.data().totalScore;

            // Fetch Top 5 Teams for the chart (Lightweight query)
            const teamsQ = query(teamsColl, orderBy('scoreTotal', 'desc'), limit(5));
            const topTeamsSnap = await getDocs(teamsQ);
            const teamsData: TeamProfile[] = topTeamsSnap.docs.map(d => d.data() as TeamProfile);

            // 2. Fetch Recent Ledger
            const ledgerQ = query(collection(db, 'ledger'), orderBy('timestamp', 'desc'), limit(10));
            // Ledger might be empty if migration hasn't happened, handle gracefully
            const ledgerSnap = await getDocs(ledgerQ);
            const ledgerData = ledgerSnap.docs.map(d => d.data() as LedgerEntry);

            setStats([
                { label: 'إجمالي النقاط', value: formatPoints(totalPoints), color: 'text-accent-gold' },
                { label: 'عدد الفرق', value: totalTeams, color: 'text-blue-400' },
                { label: 'عدد اللاعبين', value: totalUsers, color: 'text-green-400' },
            ]);

            setTopTeams(teamsData);
            setRecentActivity(ledgerData);

        } catch (err) {
            console.error("Error loading analytics", err);
        } finally {
            setLoading(false);
        }
    };

    if (!can(user, 'view_dashboard')) return <div className="p-10 text-center text-red-500">غير مصرح لك بدخول هذه الصفحة</div>;

    if (loading) return <div className="p-10 text-white">جاري تحميل البيانات...</div>;

    return (
        <div className="p-6 space-y-8 animate-fade-in">
            <h1 className="text-3xl font-black text-white mb-6">📊 تقارير النظام</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="text-gray-400 mb-2">{stat.label}</div>
                        <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Actions Toolbar */}
            {can(user, 'export_data') && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button onClick={() => handleExport('users')} className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm font-bold whitespace-nowrap">
                        ⬇️ تحميل اللاعبين
                    </button>
                    <button onClick={() => handleExport('teams')} className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg hover:bg-green-600 hover:text-white transition-all text-sm font-bold whitespace-nowrap">
                        ⬇️ تحميل الفرق
                    </button>
                    <button onClick={() => handleExport('ledger')} className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded-lg hover:bg-purple-600 hover:text-white transition-all text-sm font-bold whitespace-nowrap">
                        ⬇️ تحميل السجل (Ledger)
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Teams Chart (Visual) */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">🏆 أقوى الفرق</h2>
                    <div className="space-y-4">
                        {topTeams.map((team, idx) => (
                            <div key={team.id} className="flex items-center gap-4">
                                <div className="w-8 text-center text-gray-500 font-bold">#{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-white font-bold">{team.name}</span>
                                        <span className="text-accent-gold">{formatPoints(team.points)}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-gold opacity-80"
                                            style={{ width: `${Math.min(100, (team.points / (topTeams[0].points || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">⚡ آخر الحركات</h2>
                    <div className="space-y-3 overflow-y-auto max-h-[300px]">
                        {recentActivity.map((entry, idx) => (
                            <div key={idx} className="text-sm p-3 bg-white/5 rounded-lg flex justify-between items-center">
                                <div>
                                    <span className={`font-bold ${entry.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                                    </span>
                                    <span className="text-gray-400 mx-2">
                                        {entry.fromName} ➝ {entry.toName}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {entry.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
