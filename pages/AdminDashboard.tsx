
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TEAMS } from '../types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '../lib/getAvatarUrl';

export default function AdminDashboard() {
    const { isAdmin, activeTeam, allPlayers, addPoints, addTeamPoints, user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('tout');
    const [processing, setProcessing] = useState(false);

    if (!isAdmin) {
        return (
            <div className="p-10 text-center text-red-500 font-bold bg-[#070A0F] min-h-screen">
                <div className="text-4xl mb-4">🚫</div>
                <h1>منطقة محظورة</h1>
                <p>هذه المنطقة مخصصة للعم جوي فقط</p>
            </div>
        );
    }

    const filteredPlayers = allPlayers.filter(p => p.teamId === activeTab);
    const activeTeamData = TEAMS.find(t => t.id === activeTab);

    // Calculate dynamic team total from loaded players for display
    const calculatedTeamTotal = filteredPlayers.reduce((sum, p) => sum + (p.personalPoints || 0), 0);

    const handleTeamBoost = async (amount: number) => {
        if (!confirm(`هل أنت متأكد من إضافة ${amount} نقطة لفريق ${activeTeamData?.name}؟`)) return;
        setProcessing(true);
        await addTeamPoints(activeTab, amount);
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-[#070A0F] text-white font-sans pb-24" dir="rtl">

            {/* Header */}
            <div className="bg-[#141414] border-b border-white/10 p-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-accent-gold flex items-center gap-2">
                            🕹️ لوحة تحكم العم جوي
                        </h1>
                        <p className="text-gray-400 text-xs mt-1">نظام إدارة الفرق - الإصدار 2.0</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">

                {/* TABS */}
                <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6">
                    {TEAMS.filter(t => t.id !== 'uncle_joy').map(team => (
                        <button
                            key={team.id}
                            onClick={() => setActiveTab(team.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all whitespace-nowrap border ${activeTab === team.id
                                ? `bg-gradient-to-br ${team.color} border-white/20 shadow-lg scale-105`
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            <img src={team.avatar} className="w-6 h-6 rounded-full" />
                            <span className="font-bold">{team.name}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* LEFT: Team Controls */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Team Card */}
                            <div className="bg-[#141414] rounded-2xl border border-white/10 overflow-hidden p-6 relative">
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activeTeamData?.color}`} />
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activeTeamData?.color} p-0.5`}>
                                        <img src={activeTeamData?.avatar} className="w-full h-full object-cover rounded-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{activeTeamData?.name}</h2>
                                        <div className="text-accent-gold font-mono text-xl mt-1">
                                            {/* Showing calculated sum from displayed players for consistency */}
                                            {calculatedTeamTotal} نقطة
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <label className="block text-xs text-gray-400 mb-2">إضافة نقاط لكل الفريق</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleTeamBoost(50)}
                                                disabled={processing}
                                                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg text-sm font-bold border border-green-600/20"
                                            >
                                                +50 نقطة 🚀
                                            </button>
                                            <button
                                                onClick={() => handleTeamBoost(100)}
                                                disabled={processing}
                                                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 rounded-lg text-sm font-bold border border-green-600/20"
                                            >
                                                +100 نقطة 🔥
                                            </button>
                                            <button
                                                onClick={() => handleTeamBoost(-50)}
                                                disabled={processing}
                                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-bold border border-red-600/20"
                                            >
                                                -50 خصم ⚠️
                                            </button>
                                            <button
                                                onClick={() => handleTeamBoost(-100)}
                                                disabled={processing}
                                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 rounded-lg text-sm font-bold border border-red-600/20"
                                            >
                                                -100 خصم 🚨
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Member List */}
                        <div className="lg:col-span-2 bg-[#141414] rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-lg">أعضاء الفريق ({filteredPlayers.length})</h3>
                                <div className="text-xs text-gray-500">مباشر</div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                                        <tr>
                                            <th className="px-6 py-4">اللاعب</th>
                                            <th className="px-6 py-4">نقاط شخصية</th>
                                            <th className="px-6 py-4">تحكم</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredPlayers.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                                    لا يوجد لاعبين في هذا الفريق حتى الآن
                                                </td>
                                            </tr>
                                        ) : filteredPlayers.map(player => (
                                            <tr key={player.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <img src={getAvatarUrl({ avatarUrl: player.avatarUrl, role: player.role })} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                                                    <div>
                                                        <div className="font-bold text-white">{player.name}</div>
                                                        <div className="text-xs text-gray-500">{player.email || 'No Email'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-accent-gold font-bold">
                                                    {player.personalPoints}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => addPoints('player', player.id, 10)}
                                                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-green-400 border border-white/10"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            onClick={() => addPoints('player', player.id, -10)}
                                                            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-red-400 border border-white/10"
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
}
