
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TEAMS } from '../types/auth'; // Ensure this excludes Admin
import { updatePoints } from '../lib/points';
import { useAuth } from '../context/AuthContext';
import { UNCLE_JOY_AVATAR } from '../lib/avatars';
import { getAvatarUrl } from '../lib/getAvatarUrl';

type Scope = 'person' | 'team' | 'account';

export default function AdminPointsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Core State
    const [scope, setScope] = useState<Scope>('person');
    const [activeTabTeam, setActiveTabTeam] = useState<string>('tout'); // For 'person' and 'team' scopes defaults

    // Data State
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Interaction State
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [amount, setAmount] = useState<number | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Derived
    const PLAYABLE_TEAMS = TEAMS.filter(t => t.id !== 'uncle_joy');
    const activeTeamDef = TEAMS.find(t => t.id === activeTabTeam);

    // 1. Fetch Members when needed (Person Scope)
    useEffect(() => {
        if (scope === 'person') {
            setLoadingMembers(true);
            const q = query(collection(db, 'users'), where('teamId', '==', activeTabTeam));
            const unsub = onSnapshot(q, (snap) => {
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                list.sort((a: any, b: any) => (b.personalPoints || 0) - (a.personalPoints || 0));
                setMembers(list);
                setLoadingMembers(false);
            });
            return () => unsub();
        }
    }, [scope, activeTabTeam]);

    // Handlers
    const handleExecute = async () => {
        if (!user) return;
        setIsProcessing(true);

        try {
            let targetId = '';
            let targetTeamId = '';
            const val = Number(amount);

            if (scope === 'team') {
                targetTeamId = activeTabTeam;
                await updatePoints({
                    actorUid: user.id,
                    teamId: targetTeamId,
                    delta: val,
                    reason: 'Admin Team Update'
                });
                setSuccessMessage(`تم إضافة ${val} نقطة لفريق ${activeTeamDef?.name}`);
            }
            else if (scope === 'person' && selectedUser) {
                await updatePoints({
                    actorUid: user.id,
                    userId: selectedUser.id,
                    teamId: selectedUser.teamId,
                    delta: val,
                    reason: 'Admin Person Update'
                });
                setSuccessMessage(`تم تحديث نقاط ${selectedUser.name}`);
            }
            // Account scope placeholder logic (using global search conceptually)

            setAmount('');
            setShowConfirm(false);
            setSelectedUser(null);

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] text-white font-sans pb-32 pt-24" dir="rtl">

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-[#070A0F]/95 backdrop-blur-md z-40 border-b border-white/5 px-4 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <h1 className="text-lg font-bold">إدارة النقاط</h1>
                    </div>
                    <img src={UNCLE_JOY_AVATAR} className="w-10 h-10 rounded-full border border-accent-gold p-0.5" />
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 mt-4">

                {/* SCOPE SELECTOR */}
                <div className="grid grid-cols-3 bg-[#141414] p-1 rounded-xl mb-6">
                    {(['person', 'team', 'account'] as Scope[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => { setScope(s); setAmount(''); setSelectedUser(null); }}
                            className={`py-2 text-sm font-bold rounded-lg transition-all
                                ${scope === s
                                    ? 'bg-white text-black shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {s === 'person' && '👤 شخص'}
                            {s === 'team' && '🛡️ فريق'}
                            {s === 'account' && '🏠 حساب'}
                        </button>
                    ))}
                </div>

                {/* --- SCOPE: PERSON --- */}
                {scope === 'person' && (
                    <div className="space-y-6">
                        {/* Team Filter */}
                        <div className="flex bg-[#141414] p-1 rounded-xl overflow-x-auto no-scrollbar">
                            {PLAYABLE_TEAMS.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setActiveTabTeam(team.id)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap
                                        ${activeTabTeam === team.id
                                            ? `bg-gradient-to-r ${team.color} text-white shadow`
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {team.name}
                                </button>
                            ))}
                        </div>

                        {/* User List */}
                        {!selectedUser ? (
                            <div className="space-y-2">
                                <h3 className="text-xs text-gray-500 font-bold mb-2">اختر العضو:</h3>
                                {loadingMembers ? (
                                    <div className="text-center py-8 text-gray-600">جاري التحميل...</div>
                                ) : members.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedUser(m)}
                                        className="w-full bg-[#141414] p-3 rounded-xl flex items-center justify-between border border-white/5 hover:border-accent-gold/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={getAvatarUrl({ avatarUrl: m.avatar || m.avatarUrl, role: m.role })} className="w-10 h-10 rounded-full bg-gray-700" />
                                            <div className="text-right">
                                                <div className="font-bold text-sm">{m.name}</div>
                                                <div className="text-[10px] text-gray-500">{m.email}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-accent-gold">{m.personalPoints || 0}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#141414] p-4 rounded-xl border border-accent-gold/30">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">تعديل نقاط: {selectedUser.name}</h3>
                                    <button onClick={() => setSelectedUser(null)} className="text-xs text-red-400 underline">تغيير</button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        placeholder="القيمة"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-center text-xl font-mono"
                                        autoFocus
                                    />
                                    <button
                                        disabled={!amount}
                                        onClick={() => setShowConfirm(true)}
                                        className="bg-accent-gold text-black font-bold px-6 rounded-lg disabled:opacity-50"
                                    >
                                        تأكيد
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SCOPE: TEAM --- */}
                {scope === 'team' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            {PLAYABLE_TEAMS.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => setActiveTabTeam(team.id)}
                                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                                        ${activeTabTeam === team.id
                                            ? `bg-gradient-to-br ${team.color} border-white shadow-lg scale-105`
                                            : 'bg-[#141414] border-white/5 text-gray-500'
                                        }`}
                                >
                                    <img src={team.avatar} className="w-10 h-10" />
                                    <span className="font-bold text-sm">{team.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 text-center">
                            <h3 className="text-gray-400 text-sm mb-4">إضافة نقاط لكل الفريق</h3>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                placeholder="0"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-center text-3xl font-mono mb-4 focus:border-accent-gold outline-none"
                            />
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {[10, 50, 100, -50].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="bg-white/5 p-2 rounded-lg text-xs font-mono hover:bg-white/10"
                                    >
                                        {val > 0 ? '+' : ''}{val}
                                    </button>
                                ))}
                            </div>
                            <button
                                disabled={!amount}
                                onClick={() => setShowConfirm(true)}
                                className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
                            >
                                تنفيذ العملية
                            </button>
                        </div>
                    </div>
                )}

                {/* --- SCOPE: ACCOUNT --- */}
                {scope === 'account' && (
                    <div className="text-center py-10">
                        <p className="text-4xl mb-4">🚧</p>
                        <p className="text-gray-400">خاصية الحسابات قيد التطوير</p>
                        <p className="text-xs text-gray-600 mt-2">يمكنك استخدام "بحث شخص" في الوقت الحالي</p>
                    </div>
                )}

            </div>

            {/* CONFIRMATION OVERLAY */}
            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1A1A1A] w-full max-w-sm rounded-2xl p-6 border border-white/10"
                        >
                            <h3 className="text-xl font-bold mb-2 text-center">تأكيد نهائي</h3>
                            <div className="bg-black/30 p-4 rounded-xl mb-6 text-center">
                                <span className="block text-gray-400 text-sm mb-1">القيمة</span>
                                <span className="text-3xl font-mono font-bold text-accent-gold">{amount && amount > 0 ? '+' : ''}{amount}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-3 rounded-xl bg-white/5 font-bold"
                                >
                                    إلغاء
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={handleExecute}
                                    className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold"
                                >
                                    {isProcessing ? 'جاري الحفظ...' : 'تأكيد ✅'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SUCCESS TOAST */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-2xl text-center font-bold z-50 flex items-center justify-center gap-2"
                    >
                        <span>✅</span> {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DANGER ZONE (Bottom of page) */}
            <div className="max-w-md mx-auto px-4 mt-12 pb-12">
                <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
                    <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                        <span>☠️</span> منطقة الخطر
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        هذه الإجراءات لا يمكن التراجع عنها.
                    </p>

                    <button
                        onClick={() => {
                            if (confirm("هل أنت متأكد تماماً؟ سيتم تصفير جميع نقاط الفرق واللاعبين إلى الصفر!")) {
                                if (confirm("تأكيد أخير: تصفير النظام بالكامل؟")) {
                                    // Use type assertion or simply wait for context update propagation
                                    // In a real scenario we'd upgrade the hook return type, but for now:
                                    (useAuth() as any).resetSystemPoints().then(() => {
                                        alert("تم تصفير النظام بنجاح");
                                        window.location.reload();
                                    });
                                }
                            }
                        }}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all"
                    >
                        تصفير الموسم (مسح كل النقاط) 🧨
                    </button>
                </div>
            </div>

        </div>
    );
}
