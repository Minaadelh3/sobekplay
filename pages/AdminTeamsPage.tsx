import React, { useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { TEAMS } from '../types/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { getAvatarUrl } from '../lib/getAvatarUrl';

export default function AdminTeamsPage() {
    const { allPlayers, addPoints, addTeamPoints, setPoints } = useAuth();
    const navigate = useNavigate();
    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Live Teams State
    const [liveTeams, setLiveTeams] = useState<Record<string, any>>({});

    // Subscribe to Teams
    React.useEffect(() => {
        const q = query(collection(db, "teams"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Record<string, any> = {};
            snapshot.forEach(doc => {
                data[doc.id] = doc.data();
            });
            setLiveTeams(data);
        });
        return () => unsubscribe();
    }, []);

    // Filter out Uncle Joy
    const playTeams = TEAMS.filter(t => t.id !== 'uncle_joy');

    const handleTeamBoost = async (amount: number, teamId: string) => {
        const tName = TEAMS.find(t => t.id === teamId)?.name;
        if (!confirm(`هل أنت متأكد من إضافة ${amount} نقطة لفريق ${tName}؟`)) return;
        setProcessing(true);
        await addTeamPoints(teamId, amount);
        setProcessing(false);
    };

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
                        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">إدارة الفرق</h1>
                        <p className="text-gray-400 text-sm">نظرة عامة على أداء الفرق والأعضاء</p>
                        <p className="text-xs text-accent-gold mt-1">النقاط متزامنة مباشرة مع قاعدة البيانات ⚡</p>
                    </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {playTeams.map(team => {
                        // Dynamic Stats
                        const members = allPlayers.filter(p => p.teamId === team.id);
                        // FIX: Use DB Value or Fallback to 0. Do NOT sum members.
                        const points = liveTeams[team.id]?.totalPoints || 0;

                        const isExpanded = expandedTeamId === team.id;

                        return (
                            <motion.div
                                key={team.id}
                                layout
                                onClick={() => setExpandedTeamId(team.id)}
                                className={`bg-[#141414] border border-white/10 rounded-2xl overflow-hidden cursor-pointer relative group transition-all duration-300
                                    ${isExpanded ? 'ring-2 ring-accent-gold shadow-[0_0_30px_rgba(255,215,0,0.1)]' : 'hover:border-white/20'}
                                `}
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${team.color}`} />
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${team.color} p-0.5 shadow-lg`}>
                                            <img src={team.avatar} className="w-full h-full object-cover rounded-lg" />
                                        </div>
                                        <div className="text-2xl font-bold font-mono text-white/50">#{playTeams.indexOf(team) + 1}</div>
                                    </div>

                                    <h2 className="text-xl font-bold mb-1">{team.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <span>👥 {members.length} عضو</span>
                                    </div>

                                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">مجموع النقاط</div>
                                        <div className="text-xl font-bold text-accent-gold font-mono">{points.toLocaleString()}</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence mode="wait">
                    {expandedTeamId && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-[#141414] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            {(() => {
                                const team = TEAMS.find(t => t.id === expandedTeamId);
                                const members = allPlayers.filter(p => p.teamId === expandedTeamId).sort((a, b) => (b.personalPoints || 0) - (a.personalPoints || 0));

                                if (!team) return null;

                                return (
                                    <div className="grid grid-cols-1 lg:grid-cols-3">
                                        {/* Actions Column */}
                                        <div className="p-8 bg-black/20 border-l border-white/5 space-y-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">{team.name}</h3>
                                                <p className="text-gray-400 text-sm">لوحة التحكم الخاصة بالفريق</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">نقاط جماعية</div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button onClick={(e) => { e.stopPropagation(); handleTeamBoost(100, team.id); }} className="px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-bold text-sm hover:bg-green-500/20 transition">+100</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleTeamBoost(500, team.id); }} className="px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-bold text-sm hover:bg-green-500/20 transition">+500</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleTeamBoost(-100, team.id); }} className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 transition">-100</button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('هل أنت متأكد من تصفير نقاط الفريق بالكامل؟ (البدأ من الصفر)')) {
                                                                setPoints('team', team.id, 0);
                                                            }
                                                        }}
                                                        className="px-4 py-3 bg-red-500/5 text-red-600 border border-red-500/10 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-1"
                                                    >
                                                        <span>🔄</span> تصفير
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Members List */}
                                        <div className="lg:col-span-2 p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-bold">قائمة الأعضاء</h3>
                                                <span className="bg-white/10 text-xs px-2 py-1 rounded text-gray-300">{members.length}</span>
                                            </div>

                                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {members.map((member, idx) => (
                                                    <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                                        <div className="font-mono text-gray-600 text-sm w-6">{idx + 1}</div>
                                                        <img src={getAvatarUrl({ avatarUrl: member.avatarUrl, role: member.role })} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                                                        <div className="flex-1">
                                                            <div className="font-bold text-sm">{member.name}</div>
                                                            <div className="text-xs text-gray-500">{member.email}</div>
                                                        </div>
                                                        <div className="font-mono font-bold text-accent-gold">{member.personalPoints}</div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => addPoints('player', member.id, 10)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition flex items-center justify-center">+</button>
                                                            <button onClick={() => addPoints('player', member.id, -10)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition flex items-center justify-center">-</button>
                                                            {/* Reset Button */}
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('تصفير نقاط هذا المستخدم؟ (Reset Score)')) {
                                                                        setPoints('player', member.id, 0);
                                                                    }
                                                                }}
                                                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-600/30 text-gray-400 hover:text-red-500 transition flex items-center justify-center border border-transparent hover:border-red-500/30 ml-1"
                                                                title="Reset Score"
                                                            >
                                                                🔄
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {members.length === 0 && <div className="text-center py-12 text-gray-600">لا يوجد أعضاء في هذا الفريق</div>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
