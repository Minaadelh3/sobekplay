
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEAMS } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../lib/getAvatarUrl';

export default function AdminUsersPage() {
    const { allPlayers, addPoints, setPoints } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filteredUsers = useMemo(() => {
        return allPlayers.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
        ).sort((a, b) => (b.personalPoints || 0) - (a.personalPoints || 0));
    }, [allPlayers, search]);

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
                            <p className="text-gray-400 text-sm">{allPlayers.length} مستخدم مسجل</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو الإيميل..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pl-10 text-white focus:border-accent-gold focus:outline-none transition"
                        />
                        <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Users Table / List */}
                <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">المستخدم</th>
                                    <th className="px-6 py-4">الفريق</th>
                                    <th className="px-6 py-4">النقاط</th>
                                    <th className="px-6 py-4">إجراء سريع</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(user => {
                                    const userTeam = TEAMS.find(t => t.id === user.teamId);

                                    return (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={getAvatarUrl({ avatarUrl: user.avatarUrl, role: user.role })} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-accent-gold transition-colors">{user.name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {userTeam ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${userTeam.color}`} />
                                                        <span className="text-sm font-medium">{userTeam.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-sm italic">بدون فريق</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-lg">
                                                {user.personalPoints?.toLocaleString() || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => addPoints('player', user.id, 50)}
                                                        className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 text-sm font-bold transition"
                                                    >
                                                        +50
                                                    </button>
                                                    <button
                                                        onClick={() => addPoints('player', user.id, -50)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-bold transition"
                                                    >
                                                        -50
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('تصفير نقاط هذا المستخدم؟ (Reset Score)')) {
                                                                setPoints('player', user.id, 0);
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-600/30 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/30 text-sm font-bold transition ml-2"
                                                        title="Reset to 0"
                                                    >
                                                        🔄 تصفير
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            لا توجد نتائج مطابقة للبحث
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
