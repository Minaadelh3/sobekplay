import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminData } from '../../hooks/useAdminData';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function AdminTeamDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { users } = useAdminData();
    const [team, setTeam] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchTeamData();
    }, [id]);

    const fetchTeamData = async () => {
        setLoading(true);
        try {
            // Fetch Team
            const teamSnap = await getDoc(doc(db, 'teams', id!));
            if (teamSnap.exists()) {
                setTeam({ id: teamSnap.id, ...teamSnap.data() });
            }

            // Fetch Logs for this team
            // Looking for logs where targetId == teamId OR targetUid IN members (too complex for now, stick to team)
            const logQ = query(
                collection(db, 'admin_logs'),
                where('targetId', '==', id),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const logSnap = await getDocs(logQ);
            setLogs(logSnap.docs.map(d => d.data()));

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">جاري تحميل بيانات الفريق...</div>;
    if (!team) return <div className="p-10 text-center text-red-500">الفريق غير موجود.</div>;

    const teamMembers = users.filter(u => u.teamId === id);

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 lg:gap-6 bg-[#141414] p-5 lg:p-6 rounded-2xl border border-white/5 shadow-2xl pt-[calc(1.25rem+env(safe-area-inset-top))] lg:pt-6">
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={() => navigate('/admin/teams')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 active:scale-95 transition-all text-xl"
                    >
                        ⬅
                    </button>
                    <img
                        src={team.avatar || '/logo.png'}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border border-white/10 bg-black shadow-inner object-cover"
                    />
                    <div className="min-w-0">
                        <h1 className="text-2xl lg:text-3xl font-black text-white truncate">{team.name}</h1>
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2 mt-1">
                            <span className="truncate">ID: {team.id}</span>
                            {team.isPointsLocked && <span className="text-red-500 font-black animate-pulse bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">🔒 LCK</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto sm:ml-auto gap-2 sm:gap-0 bg-black/30 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-white/5">
                    <div className="flex items-center gap-2 text-2xl lg:text-4xl font-mono font-black text-accent-gold">
                        {(team.scoreTotal ?? team.points ?? 0).toLocaleString()} <span className="text-sm font-bold">SP</span>
                    </div>
                    <div className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest">Team Total Points</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Members Column */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6 h-fit shadow-xl">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                        <span>👥 أعضاء الفريق</span>
                        <span className="text-xs bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full">{teamMembers.length}</span>
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                        {teamMembers.length === 0 ? (
                            <div className="text-center py-6 text-gray-600 text-xs italic">لا يوجد أعضاء مضافين بعد</div>
                        ) : (
                            teamMembers.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2.5 bg-black/20 lg:bg-transparent lg:hover:bg-white/5 rounded-xl transition-all cursor-pointer group active:scale-[0.98]">
                                    <img src={member.avatar || '/logo.png'} className="w-10 h-10 rounded-full border border-white/10 bg-gray-800 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-200 font-black truncate">{member.name}</div>
                                        <div className="text-[10px] text-gray-500 truncate font-mono">{member.email || 'no-email@id'}</div>
                                    </div>
                                    <button className="lg:opacity-0 lg:group-hover:opacity-100 text-[10px] bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 font-bold text-white transition-all shrink-0">
                                        تعديل
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Logs / History Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Actions */}
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6 shadow-xl overflow-hidden">
                        <h3 className="text-base lg:text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span>📜</span> سجل العمليات <span className="text-[10px] font-mono text-gray-500 font-normal">AUDIT TRAIL</span>
                        </h3>
                        <div className="space-y-4 relative">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[11px] top-2 bottom-4 w-px bg-white/10" />

                            {logs.length === 0 ? (
                                <div className="text-center text-gray-600 py-12 border-2 border-dashed border-white/5 rounded-2xl italic text-sm">مفيش حركات مسجلة للفريق ده.</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start relative z-10">
                                        <div className="pt-2 shrink-0">
                                            <div className={`w-6 h-6 rounded-full border-4 border-[#141414] shadow-sm flex items-center justify-center text-[8px] ${log.action.includes('LOCK') ? 'bg-red-500' : 'bg-green-500'}`}>
                                                {log.action.includes('LOCK') ? '🔒' : '🏷️'}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex-1 min-w-0 animate-in fade-in slide-in-from-right-4">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                                                <div className="text-sm font-black text-white uppercase tracking-tight truncate">{log.action}</div>
                                                <div className="text-[10px] text-gray-500 font-bold font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 shrink-0">
                                                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('ar-EG', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1.5 leading-relaxed bg-black/20 p-2 rounded-lg italic">"{log.reason || 'No specific reason provided'}"</div>
                                            <div className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-2">
                                                <span className="text-gray-700">BY ADMIN:</span>
                                                <span className="font-mono text-gray-500 bg-white/5 px-1.5 rounded">{log.adminId || 'System'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Tools Stub */}
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6 opacity-30 select-none border-dashed">
                        <h3 className="text-base lg:text-lg font-bold text-white mb-4">🛠️ أدوات إدارية (قريباً)</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all">تصدير بيانات الأعضاء</button>
                            <button className="flex-1 bg-white/5 px-4 py-3 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all">إرسال رسالة للفريق</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
