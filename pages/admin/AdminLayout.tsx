import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/admin', end: true, label: 'الرئيسية', icon: '⚡' },
        { path: '/admin/games', label: 'إدارة الألعاب', icon: '🎮' },
        { path: '/admin/teams', label: 'إدارة الفرق', icon: '🏆' },
        { path: '/admin/users', label: 'الأعضاء', icon: '👥' },
        { path: '/admin/logs', label: 'سجل العمليات', icon: '📜' },
        { path: '/admin/balancing', label: 'الميزان (God Mode)', icon: '⚖️' },
    ];

    const getPageTitle = () => {
        if (location.pathname === '/admin') return 'لوحة التحكم';
        if (location.pathname.includes('teams')) return 'إدارة الفرق والنقاط';
        if (location.pathname.includes('users')) return 'إدارة المستخدمين';
        if (location.pathname.includes('logs')) return 'سجل النظام';
        return 'Admin';
    };

    return (
        <div className="min-h-screen bg-[#070A0F] text-white flex font-sans" dir="rtl">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-[#141414] border-l border-white/5 sticky top-0 h-screen">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-black text-accent-gold flex items-center gap-2">
                        <span>🛡️</span> Sobek Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-accent-gold text-black font-bold shadow-lg shadow-accent-gold/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img
                            src={user?.avatar || '/assets/brand/logo.png'}
                            onError={(e) => { const target = e.target as HTMLImageElement; target.src = '/assets/brand/logo.png'; }}
                            className="w-8 h-8 rounded-full bg-gray-800 object-cover"
                        />
                        <div className="text-sm">
                            <div className="font-bold text-white">{user?.name}</div>
                            <div className="text-xs text-gray-500">Super Admin</div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/app/home')}
                        className="w-full text-center py-2 text-sm text-gray-500 hover:text-white transition-colors border border-white/10 rounded-lg mb-2"
                    >
                        عودة للتطبيق 📱
                    </button>
                    <button
                        onClick={logout}
                        className="w-full text-center py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-lg"
                    >
                        تسجيل خروج
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden bg-[#141414] border-b border-white/5 p-4 sticky top-0 z-40 flex justify-between items-center">
                    <h1 className="font-black text-accent-gold">Sobek Admin</h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
                        {isMobileMenuOpen ? '✖️' : '🍔'}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden absolute top-16 left-0 right-0 bg-[#141414] border-b border-white/10 z-30 p-4 shadow-2xl"
                        >
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl
                                            ${isActive ? 'bg-accent-gold text-black font-bold' : 'text-gray-400'}
                                        `}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                                <button
                                    onClick={() => navigate('/app/home')}
                                    className="w-full text-right px-4 py-3 text-gray-400 border-t border-white/5 mt-2 pt-4"
                                >
                                    📱 العودة للتطبيق
                                </button>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {/* Breadcrumbs / Page Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{getPageTitle()}</h2>
                        <div className="h-1 w-12 bg-accent-gold rounded-full" />
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    );
}
