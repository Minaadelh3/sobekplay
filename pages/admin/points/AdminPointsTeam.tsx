
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEAMS } from '../../../types/auth'; // Adjust path if needed
import { updatePoints } from '../../../lib/points';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPointsTeam() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Quick amounts
    const AMOUNTS = [50, 100, 200, 500, -50, -100];

    const handleExecute = async () => {
        if (!selectedTeam || !amount || !user) return;
        setLoading(true);

        try {
            await updatePoints({
                actorUid: user.id,
                teamId: selectedTeam,
                delta: Number(amount),
                reason: 'Admin Team Flow'
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/points');
            }, 1500);
        } catch (e) {
            alert('Error: ' + e);
            setLoading(false);
        }
    };

    const activeTeamData = TEAMS.find(t => t.id === selectedTeam);

    if (success) {
        return (
            <div className="min-h-screen bg-[#070A0F] flex items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-green-400">تمت العملية بنجاح</h2>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070A0F] text-white p-6 pb-24 pt-24 font-sans" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/admin/points')} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <h1 className="text-xl font-bold">إضافة لفريق</h1>
            </div>

            {/* Step 1: Select Team */}
            {!selectedTeam ? (
                <div className="grid grid-cols-2 gap-3">
                    {TEAMS.filter(t => t.id !== 'uncle_joy').map(team => (
                        <button
                            key={team.id}
                            onClick={() => setSelectedTeam(team.id)}
                            className="bg-[#141414] border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 transition"
                        >
                            <img src={team.avatar} className="w-12 h-12" />
                            <span className="font-bold">{team.name}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="max-w-md mx-auto space-y-8">
                    {/* Selected Context */}
                    <div className="bg-[#141414] p-4 rounded-xl border border-white/10 flex items-center gap-4">
                        <img src={activeTeamData?.avatar} className="w-12 h-12" />
                        <div className="flex-1">
                            <div className="text-sm text-gray-400">الفريق المختار</div>
                            <div className="text-xl font-bold">{activeTeamData?.name}</div>
                        </div>
                        <button onClick={() => setSelectedTeam(null)} className="text-xs text-gray-500 underline">تغيير</button>
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
                        disabled={!amount || loading}
                        onClick={handleExecute}
                        className="w-full py-4 bg-accent-gold text-black text-xl font-bold rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? 'جاري التنفيذ...' : 'تأكيد العملية ✅'}
                    </button>
                </div>
            )}
        </div>
    );
}
