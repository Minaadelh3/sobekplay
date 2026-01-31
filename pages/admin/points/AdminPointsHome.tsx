
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AdminPointsHome() {
    const navigate = useNavigate();

    const MENU_ITEMS = [
        {
            id: 'person',
            title: 'إضافة لشخص',
            desc: 'تعديل نقاط طالب محدد',
            icon: '👤',
            color: 'from-blue-600 to-blue-400',
            path: '/admin/points/person'
        },
        {
            id: 'team',
            title: 'إضافة لفريق',
            desc: 'تعديل مجموع الفريق بالكامل',
            icon: '🛡️',
            color: 'from-purple-600 to-purple-400',
            path: '/admin/points/team'
        },
        {
            id: 'account',
            title: 'إضافة للحساب',
            desc: 'تعديل رصيد الأسرة/الحساب',
            icon: '🏠',
            color: 'from-orange-600 to-yellow-400',
            path: '/admin/points/account'
        }
    ];

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24" dir="rtl">
            <h1 className="text-2xl font-bold mb-8 text-center text-accent-gold">💎 إدارة النقاط</h1>

            <div className="grid gap-4 max-w-md mx-auto">
                {MENU_ITEMS.map((item) => (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className="relative overflow-hidden rounded-2xl p-6 text-right border border-white/10 group"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <h2 className="text-xl font-bold mb-1">{item.title}</h2>
                                <p className="text-sm text-gray-400">{item.desc}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <svg className="w-5 h-5 opacity-50 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
