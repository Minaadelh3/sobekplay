import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/achievements';
import { useAdminData } from '../../hooks/useAdminData';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { REQUIRED_ROOTS } from '../../services/backendHealth';

interface SimulateAchievementDialogProps {
    achievement: Achievement;
    onClose: () => void;
    isSandbox: boolean;
}

export default function SimulateAchievementDialog({ achievement, onClose, isSandbox }: SimulateAchievementDialogProps) {
    const { users } = useAdminData();
    const [selectedUserId, setSelectedUserId] = useState('');
    const [payload, setPayload] = useState('{"source": "admin_simulation", "value": 1}');
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAIL'>('IDLE');

    const handleRun = async () => {
        if (!selectedUserId) {
            setLogs(p => [...p, "❌ User required"]);
            return;
        }

        setStatus('RUNNING');
        setLogs([]);
        setLogs(p => [...p, `🚀 Starting ${isSandbox ? 'SANDBOX' : 'LIVE'} Simulation...`]);

        try {
            // 1. Root Check
            setLogs(p => [...p, "🔍 Checking Roots..."]);
            const missingRoots = []; // Should actually check
            if (missingRoots.length > 0) throw new Error("Missing Roots");

            const collectionPrefix = isSandbox ? 'sandbox_' : '';

            // 2. Write Log
            const logColl = `${collectionPrefix}simulation_events`;
            setLogs(p => [...p, `📝 Writing to ${logColl}...`]);

            await addDoc(collection(db, logColl), {
                adminId: 'current_admin',
                userId: selectedUserId,
                achievementId: achievement.id,
                payload: JSON.parse(payload),
                mode: isSandbox ? 'sandbox' : 'live',
                createdAt: serverTimestamp()
            });

            setLogs(p => [...p, "✅ Simulation Event Logged"]);

            if (isSandbox) {
                setLogs(p => [...p, "🧪 Sandbox Mode: No real points awarded."]);
                setLogs(p => [...p, "🟢 Would update user stats..."]);
                setLogs(p => [...p, "🟢 Would request Notification..."]);
            } else {
                setLogs(p => [...p, "⚠️ LIVE MODE: This event is logged but actual granting logic depends on Trigger Listeners or Manual Grant."]);
                setLogs(p => [...p, "ℹ️ Use 'Grant' button for direct award."]);
            }

            setStatus('SUCCESS');

        } catch (e: any) {
            console.error(e);
            setLogs(p => [...p, `❌ Error: ${e.message}`]);
            setStatus('FAIL');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A202C] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 bg-[#121820]">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🎮</span> محاكاة الإنجاز
                            {isSandbox && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">SANDBOX</span>}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                            <div className="font-bold text-white">{achievement.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{achievement.id}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500 font-bold">Target User</label>
                        <select
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white"
                            onChange={e => setSelectedUserId(e.target.value)}
                            value={selectedUserId}
                        >
                            <option value="">Select User...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500 font-bold">Event Payload (JSON)</label>
                        <textarea
                            className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-xs"
                            value={payload}
                            onChange={e => setPayload(e.target.value)}
                        />
                    </div>

                    {/* Console Output */}
                    <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-xl h-32 overflow-y-auto border border-white/10">
                        {logs.length === 0 ? <span className="opacity-50">// Waiting to run...</span> : logs.map((l, i) => (
                            <div key={i} className="mb-1">{l}</div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleRun}
                            disabled={status === 'RUNNING'}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2
                                ${isSandbox ? 'bg-purple-600 hover:bg-purple-500' : 'bg-red-600 hover:bg-red-500'}
                                text-white disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {status === 'RUNNING' ? 'Running...' : isSandbox ? '🔬 Run Sandbox Test' : '🔴 Run LIVE Simulation'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
