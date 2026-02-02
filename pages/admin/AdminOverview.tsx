import React from 'react';
import { useAdminData } from '../../hooks/useAdminData';

export default function AdminOverview() {
    const { users, teams, loading } = useAdminData();

    if (loading) return <div className="text-gray-500">جاري تحميل البيانات...</div>;

    const totalPoints = teams
        .filter(t => t.id !== 'uncle_joy')
        .reduce((acc, t) => acc + (t.points || 0), 0);
    const scorableTeams = teams.filter(t => t.isScorable && t.id !== 'uncle_joy').length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;

    const stats = [
        { label: 'إجمالي المستخدمين', value: users.length, icon: '👥', color: 'bg-blue-500/10 text-blue-400' },
        { label: 'الفرق المتنافسة', value: scorableTeams, icon: '⚔️', color: 'bg-green-500/10 text-green-400' },
        { label: 'إجمالي النقاط', value: totalPoints, icon: '🏆', color: 'bg-yellow-500/10 text-yellow-400' },
        { label: 'المسؤولين', value: adminUsers, icon: '🛡️', color: 'bg-purple-500/10 text-purple-400' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border border-white/5 ${stat.color} bg-[#141414]`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm opacity-80">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-[#141414] p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-4">📢 تنبيهات النظام</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-200">
                        <span>⚠️</span>
                        <span>فريق <strong>Uncle Joy</strong> غير مخصص للمنافسة (نقاط مغلقة).</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
