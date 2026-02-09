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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 bg-[#141414] p-6 rounded-2xl border border-white/5">
                <button onClick={() => navigate('/admin/teams')} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                    ⬅
                </button>
                <img
                    src={team.avatar || '/logo.png'}
                    className="w-16 h-16 rounded-xl border border-white/10 bg-black"
                />
                <div>
                    <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                    <div className="text-xs text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
                        <span>ID: {team.id}</span>
                        {team.isPointsLocked && <span className="text-red-500 font-bold">🔒 مقفول</span>}
                    </div>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-3xl font-mono font-bold text-accent-gold">{(team.scoreTotal ?? team.points ?? 0).toLocaleString()} <span className="text-sm">SP</span></div>
                    <div className="text-xs text-gray-500">النقاط الكلية</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Members Column */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-6 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">الأعضاء ({teamMembers.length})</h3>
                    <div className="space-y-2">
                        {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
                                <img src={member.avatar || '/logo.png'} className="w-8 h-8 rounded-full bg-gray-800" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-200 font-bold truncate">{member.name}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{member.email}</div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">
                                    تعديل
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logs / History Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Actions */}
                    <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">سجل العمليات (Audit Trail)</h3>
                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">مفيش حركات مسجلة للفريق ده.</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                        <div className="pt-1">
                                            <div className={`w-2 h-2 rounded-full ${log.action.includes('LOCK') ? 'bg-red-500' : 'bg-green-500'}`} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-300">{log.action}</div>
                                            <div className="text-xs text-gray-500 mt-1">"{log.reason}"</div>
                                            <div className="text-[10px] text-gray-600 font-mono mt-1">
                                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('ar-EG') : 'N/A'} • Admin: {log.adminId}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Tools Stub */}
                    <div className="bg-[#141414] border border-white/5 rounded-xl p-6 opacity-50 pointer-events-none">
                        <h3 className="text-lg font-bold text-white mb-4">أدوات إدارية (قريباً)</h3>
                        <div className="flex gap-2">
                            <button className="bg-white/5 px-4 py-2 rounded text-sm">تصدير بيانات الأعضاء</button>
                            <button className="bg-white/5 px-4 py-2 rounded text-sm">إرسال رسالة للفريق</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
