
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEAMS } from '../../../types/auth'; // Adjust path
import { updatePoints } from '../../../lib/points';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { getAvatarUrl } from '../../../lib/getAvatarUrl';

export default function AdminPointsPerson() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [amount, setAmount] = useState<number | ''>('');

    const [loadingMembers, setLoadingMembers] = useState(false);
    const [members, setMembers] = useState<any[]>([]);

    const [executing, setExecuting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Quick amounts
    const AMOUNTS = [10, 20, 50, 100, -10, -50];

    // Fetch Members when Team Selected
    useEffect(() => {
        if (selectedTeam) {
            setLoadingMembers(true);
            const fetchMembers = async () => {
                const q = query(collection(db, "users"), where("teamId", "==", selectedTeam));
                const snap = await getDocs(q);
                const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMembers(list);
                setLoadingMembers(false);
            };
            fetchMembers();
        }
    }, [selectedTeam]);

    const filteredMembers = members.filter(m => (m.name || '').toLowerCase().includes(search.toLowerCase()));

    const handleExecute = async () => {
        if (!selectedUser || !amount || !user) return;
        setExecuting(true);

        try {
            await updatePoints({
                actorUid: user.id,
                userId: selectedUser.id,
                teamId: selectedUser.teamId, // Optional but good for log
                delta: Number(amount),
                reason: 'Admin Person Flow'
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/points');
            }, 1500);
        } catch (e) {
            alert('Error: ' + e);
            setExecuting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-400">تمت العملية بنجاح</h2>
                    <p className="text-gray-400 mt-2">{selectedUser?.name}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => {
                    if (step === 1) navigate('/admin/points');
                    else setStep(prev => (prev - 1) as any);
                }} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <h1 className="text-xl font-bold">
                    {step === 1 && 'اختر الفريق'}
                    {step === 2 && 'اختر العضو'}
                    {step === 3 && 'تحديد النقاط'}
                </h1>
            </div>

            {/* STEP 1: TEAM */}
            {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                    {TEAMS.filter(t => t.id !== 'uncle_joy').map(team => (
                        <button
                            key={team.id}
                            onClick={() => { setSelectedTeam(team.id); setStep(2); }}
                            className="bg-[#141414] border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition"
                        >
                            <img src={team.avatar} className="w-12 h-12" />
                            <span className="font-bold">{team.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* STEP 2: USER */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="sticky top-20 z-10">
                        <input
                            type="text"
                            placeholder="ابحث بالاسم..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3 text-right"
                        />
                    </div>

                    {loadingMembers ? (
                        <div className="text-center text-gray-500 py-8">جاري التحميل...</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMembers.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => { setSelectedUser(m); setStep(3); }}
                                    className="w-full bg-[#141414] border border-white/5 p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 text-right"
                                >
                                    <img src={getAvatarUrl({ avatarUrl: m.avatar || m.avatarUrl, role: m.role })} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                                    <div>
                                        <div className="font-bold">{m.name}</div>
                                        <div className="text-xs text-accent-gold font-mono">{m.personalPoints || 0} pts</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: AMOUNT */}
            {step === 3 && selectedUser && (
                <div className="max-w-md mx-auto space-y-8">
                    {/* Selected User */}
                    <div className="bg-[#141414] p-4 rounded-xl border border-white/10 flex items-center gap-4">
                        <img src={getAvatarUrl({ avatarUrl: selectedUser.avatar || selectedUser.avatarUrl, role: selectedUser.role })} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                            <div className="text-sm text-gray-400">العضو المختار</div>
                            <div className="text-xl font-bold">{selectedUser.name}</div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">قيمة النقاط (+ أو -)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-black/30 border border-white/20 rounded-xl p-4 text-3xl font-mono text-center focus:border-accent-gold outline-none transition"
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    {/* Quick Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {AMOUNTS.map(val => (
                            <button
                                key={val}
                                onClick={() => setAmount(val)}
                                className={`py-2 rounded-lg font-mono text-sm border ${val > 0
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}
                            >
                                {val > 0 ? '+' : ''}{val}
                            </button>
                        ))}
                    </div>

                    {/* Confirm */}
                    <button
                        disabled={!amount || executing}
                        onClick={handleExecute}
                        className="w-full py-4 bg-accent-gold text-black text-xl font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {executing ? 'جاري التنفيذ...' : 'تأكيد العملية ✅'}
                    </button>
                </div>
            )}

        </div>
    );
}
