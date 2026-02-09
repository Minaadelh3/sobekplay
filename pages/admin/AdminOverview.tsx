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

    const suspendedCount = users.filter(u => u.isDisabled).length;
    const activeTeamsCount = teams.filter(t => t.isScorable !== false).length;

    const stats = [
        { label: 'Total Users', value: users.length, icon: '👥', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Active Teams', value: activeTeamsCount, icon: '⚔️', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
        { label: 'System Load', value: 'Healthy', icon: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Suspended Users', value: suspendedCount, icon: '🚩', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    ];

    const sections = [
        {
            title: "Command Center",
            items: [
                { path: '/admin/activity', label: 'Activity Feed', icon: '📡', desc: 'Monitor system events live', color: 'text-purple-400' },
            ]
        },
        {
            title: "Organization",
            items: [
                { path: '/admin/users', label: 'Users', icon: '👥', desc: 'Manage accounts & profiles', color: 'text-blue-400' },
                { path: '/admin/teams', label: 'Teams', icon: '🏆', desc: 'Points & team management', color: 'text-yellow-400' },
                { path: '/admin/achievements', label: 'Achievements', icon: '🥇', desc: 'Badges & awards config', color: 'text-orange-400' },
                { path: '/admin/roles', label: 'Roles & Perms', icon: 'shield', desc: 'Access control & security', color: 'text-red-400' },
            ]
        },
        {
            title: "System Management",
            items: [
                { path: '/admin/games', label: 'Games Config', icon: '🎮', desc: 'Difficulty & game settings', color: 'text-pink-400' },
                { path: '/admin/news', label: 'News Feed', icon: 'newspaper', desc: 'Announcements & updates', color: 'text-teal-400' },
                { path: '/admin/prayers', label: 'Prayers', icon: '🙏', desc: 'Manage religious content', color: 'text-cyan-400' },
                { path: '/admin/media', label: 'Media Library', icon: '🎬', desc: 'Movies, Series & Banners', color: 'text-indigo-400' },
                { path: '/admin/notifications', label: 'Push Notifications', icon: 'bell', desc: 'Send global alerts', color: 'text-amber-400' },
                { path: '/admin/flags', label: 'Feature Flags', icon: 'test_tube', desc: 'Beta features toggles', color: 'text-lime-400' },
                { path: '/admin/logs', label: 'Audit Logs', icon: 'scroll', desc: 'Security & action logs', color: 'text-gray-400' },
                { path: '/admin/settings', label: 'Global Settings', icon: '⚙️', desc: 'System-wide configuration', color: 'text-white' },
            ]
        }
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
        <div className="space-y-6 lg:space-y-10 animate-fade-in max-w-7xl mx-auto pb-20 px-4 sm:px-0">
            {/* 1. HERO METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-4 lg:p-6 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm transition-transform active:scale-95 group`}>
                        <div className="flex justify-between items-start mb-2 lg:mb-4">
                            <h3 className={`font-bold uppercase text-[8px] lg:text-xs tracking-wider opacity-70 ${stat.color}`}>{stat.label}</h3>
                            <span className="text-sm lg:text-xl opacity-50 group-hover:scale-110 transition-transform">{stat.icon}</span>
                        </div>
                        <div className="text-2xl lg:text-4xl font-black text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* 2. NAVIGATION CARDS BY SECTION */}
            <div className="space-y-10 lg:space-y-12">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3 lg:space-y-4">
                        <h2 className="text-lg lg:text-xl font-bold text-white/80 border-b border-white/10 pb-2 flex items-center gap-2">
                            {section.title}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                            {section.items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => navigate(item.path)}
                                    className="group relative flex flex-col p-4 lg:p-5 bg-[#0F1218] border border-white/5 rounded-xl hover:bg-[#1A1D24] hover:border-accent-gold/30 transition-all text-left overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4 lg:block">
                                        <div className={`text-2xl lg:text-4xl lg:mb-4 transform group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                                            {item.icon === 'busts_in_silhouette' ? '👥' :
                                                item.icon === 'trophy' ? '🏆' :
                                                    item.icon === 'medal' ? '🥇' :
                                                        item.icon === 'shield' ? '🛡️' :
                                                            item.icon === 'video_game' ? '🎮' :
                                                                item.icon === 'test_tube' ? '🧪' :
                                                                    item.icon === 'scroll' ? '📜' :
                                                                        item.icon === 'gear' ? '⚙️' :
                                                                            item.icon === 'bell' ? '🔔' :
                                                                                item.icon === 'newspaper' ? '📰' :
                                                                                    item.icon === 'praying_hands' ? '🙏' :
                                                                                        item.icon === 'film_frames' ? '🎬' :
                                                                                            item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base lg:text-lg text-white group-hover:text-accent-gold transition-colors truncate">
                                                {item.label}
                                            </h3>
                                            <p className="text-[10px] lg:text-sm text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-1">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hover Effect Light */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full blur-2xl -mr-12 -mt-12 transition-opacity opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* System Status Footer */}
            <div className="mt-8 lg:mt-12 p-4 lg:p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between text-[10px] text-gray-500 font-mono">
                <div className='flex flex-wrap justify-center sm:justify-start gap-4'>
                    <span>STATUS: <span className="text-green-500">OPERATIONAL</span></span>
                    <span>DB: <span className={loading ? "text-yellow-500" : "text-green-500"}>{loading ? "SYNCING" : "CONNECTED"}</span></span>
                    <span>STORAGE: {storageQuote}</span>
                </div>
                <div className="opacity-50">
                    SOBEKPLAY ADMIN v2.5
                </div>
            </div>
        </div>
    );
}
