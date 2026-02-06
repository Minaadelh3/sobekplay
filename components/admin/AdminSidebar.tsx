import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const sections = [
        {
            title: "Command Center",
            items: [
                { path: '/admin', end: true, label: 'Dashboard', icon: '⚡' },
                { path: '/admin/activity', label: 'Activity Feed', icon: '📡' },
            ]
        },
        {
            title: "Organization",
            items: [
                { path: '/admin/users', label: 'Users', icon: 'busts_in_silhouette' },
                { path: '/admin/teams', label: 'Teams', icon: 'trophy' },
                { path: '/admin/achievements', label: 'Achievements', icon: 'medal' },
                { path: '/admin/roles', label: 'Roles & Perms', icon: 'shield' },
            ]
        },
        {
            title: "System",
            items: [
                { path: '/admin/games', label: 'Games Config', icon: 'video_game' },
                { path: '/admin/notifications', label: 'Push Notifications', icon: 'bell' },
                { path: '/admin/flags', label: 'Feature Flags', icon: 'test_tube' },
                { path: '/admin/logs', label: 'Audit Logs', icon: 'scroll' },
                { path: '/admin/settings', label: 'Settings', icon: 'gear' },
            ]
        }
    ];

    const handleLogout = async () => {
        if (window.confirm("End God Mode session?")) {
            await logout();
            navigate('/login');
        }
    };

    return (
        <aside className={`
            ${mobile ? 'w-full h-full' : 'w-72 h-screen sticky top-0'}
            bg-[#0F1218] border-r border-white/5 flex flex-col
            transition-all duration-300
        `}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-gold flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(191,160,90,0.4)]">
                        GM
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-wide text-sm">MISSION CONTROL</h1>
                        <p className="text-[10px] text-gray-500 font-mono">GOD MODE ACTIVE</p>
                    </div>
                </div>
                {mobile && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
                {sections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="px-3 text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-2">{section.title}</h3>
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                                        ${isActive
                                            ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20 shadow-[0_0_10px_rgba(191,160,90,0.1)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <span className="opacity-70 group-hover:opacity-100 text-lg">
                                        {/* Simple Emoji Icons for now, replacing with SVG icons later if needed */}
                                        {item.icon === 'busts_in_silhouette' ? '👥' :
                                            item.icon === 'trophy' ? '🏆' :
                                                item.icon === 'medal' ? '🥇' :
                                                    item.icon === 'shield' ? '🛡️' :
                                                        item.icon === 'video_game' ? '🎮' :
                                                            item.icon === 'test_tube' ? '🧪' :
                                                                item.icon === 'scroll' ? '📜' :
                                                                    item.icon === 'gear' ? '⚙️' :
                                                                        item.icon === 'bell' ? '🔔' :
                                                                            item.icon === 'bust_in_silhouette' ? '👤' :
                                                                                item.icon}
                                    </span>
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0A0C10]">
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={user?.avatar || '/assets/brand/logo.png'}
                        className="w-9 h-9 rounded-full bg-gray-800 object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{user?.name || "Admin"}</div>
                        <div className="text-[10px] text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/app/home')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs py-2 rounded-md transition-colors border border-white/5"
                    >
                        Exit Mode
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs py-2 rounded-md transition-colors border border-red-500/20"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}
