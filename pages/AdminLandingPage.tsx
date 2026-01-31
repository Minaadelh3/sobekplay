
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UNCLE_JOY_AVATAR } from '../lib/avatars';
import { useAuth } from '../context/AuthContext';
import { TEAMS } from '../types/auth';

export default function AdminLandingPage() {
    const navigate = useNavigate();
    const { allPlayers, TEAMS: teamsContext } = useAuth(); // Assuming Context provides TEAMS or we import constant

    // Stats Calculation
    const stats = useMemo(() => {
        const totalPoints = TEAMS.reduce((sum, t) => sum + (t.totalPoints || 0), 0); // Need to sync live points
        // Helper: in a real app, TEAMS constant might not have live points if not updated. 
        // We might need to look at 'activeTeam' or fetch teams from DB. 
        // For now, let's use allPlayers to sum up personal points for a rough total if Team Total isn't available globally
        // OR rely on the fact that AuthContext pulls 'activeTeam'.
        // Let's rely on 'allPlayers' for User Count and sum.

        const calculatedTotalPoints = allPlayers.reduce((sum, p) => sum + (p.personalPoints || 0), 0);

        return {
            users: allPlayers.length,
            points: calculatedTotalPoints,
            teams: TEAMS.filter(t => t.id !== 'uncle_joy').length
        };
    }, [allPlayers]);

    const CARDS = [
        {
            id: 'teams',
            title: 'إدارة الفرق',
            desc: 'توت، عنخ، آمون، رع',
            icon: '🛡️',
            color: 'from-blue-600 to-blue-400',
            path: '/admin/teams'
        },
        {
            id: 'users',
            title: 'المستخدمين',
            desc: 'كل الأعضاء والتحكم بالنقاط',
            icon: '👥',
            color: 'from-green-600 to-green-400',
            path: '/admin/users'
        },
        {
            id: 'points',
            title: 'توزيع النقاط',
            desc: 'إضافة جماعية أو فردية',
            icon: '💎',
            color: 'from-purple-600 to-purple-400',
            path: '/admin/points'
        },
        {
            id: 'logs',
            title: 'Sijil (Logs)',
            desc: 'سجل الحركات',
            icon: '📜',
            color: 'from-orange-600 to-yellow-400',
            path: '/admin/logs'
        }
    ];

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">

            {/* Header / Identity */}
            <div className="max-w-4xl mx-auto mb-12 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 bg-accent-gold rounded-full blur-md opacity-20 animate-pulse"></div>
                    <img src={UNCLE_JOY_AVATAR} alt="Uncle Joy" className="w-full h-full object-cover rounded-full border-2 border-accent-gold relative z-10" />
                    <div className="absolute -bottom-2 -right-2 bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded-full border border-white z-20">
                        SUPER ADMIN
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">لوحة تحكم العم جوي</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    أهلاً بك يا قائد. لديك الصلاحية الكاملة لإدارة النقاط، الفرق، والمستخدمين.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-12">
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-accent-gold mb-1">{stats.points.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">نقاط المنصة</div>
                </div>
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">{stats.users}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">مستخدم</div>
                </div>
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{stats.teams}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">فرق</div>
                </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-12">
                {CARDS.map((item) => (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className="relative overflow-hidden rounded-2xl p-6 text-right border border-white/10 group h-32 flex items-center bg-[#141414] hover:border-white/20 transition-all"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="flex items-center gap-5">
                                <div className="text-4xl bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                    {item.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-1 group-hover:text-accent-gold transition-colors">{item.title}</h2>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-white rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Back Home */}
            <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-50">
                <button
                    onClick={() => navigate('/app/home')}
                    className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white hover:border-white/30 transition-all shadow-2xl"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span>العودة للرئيسية</span>
                </button>
            </div>
        </div>
    );
}
