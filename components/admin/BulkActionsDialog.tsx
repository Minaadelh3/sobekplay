import React, { useState } from 'react';
import { performTransaction } from '../../lib/ledger';
import { useAuth } from '../../context/AuthContext';
import { AdminUser, useAdminData } from '../../hooks/useAdminData';
import { doc, updateDoc, writeBatch, collection, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface BulkActionsDialogProps {
    data: AdminUser[];
    selectedIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

type BulkActionType = 'POINTS' | 'RESET_POINTS' | 'RESET_TEAMS' | 'DELETE';

export default function BulkActionsDialog({ data, selectedIds, onClose, onSuccess }: BulkActionsDialogProps) {
    const { user: adminUser } = useAuth();
    const [actionType, setActionType] = useState<BulkActionType>('POINTS');

    // Points Specific State
    const [amount, setAmount] = useState<string>('');
    const [pointsMode, setPointsMode] = useState<'ADD' | 'DEDUCT'>('ADD');

    // Execution State
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExecute = async () => {
        if (actionType === 'POINTS' && (!amount || parseInt(amount) <= 0)) return alert("Please enter a valid amount");

        let confirmMsg = "";
        if (actionType === 'POINTS') confirmMsg = `Are you sure you want to ${pointsMode} ${amount} points to ${selectedIds.length} users?`;
        if (actionType === 'RESET_POINTS') confirmMsg = `Are you sure you want to RESET points to 0 for ${selectedIds.length} users? This cannot be undone easily.`;
        if (actionType === 'RESET_TEAMS') confirmMsg = `Are you sure you want to REMOVE ${selectedIds.length} users from their teams?`;
        if (actionType === 'DELETE') confirmMsg = `⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} users?`;

        if (!confirm(confirmMsg)) return;

        setLoading(true);
        let successCount = 0;

        try {
            // Processing Loop
            for (let i = 0; i < selectedIds.length; i++) {
                const uid = selectedIds[i];
                const targetUser = data.find(u => u.id === uid);

                // Skip if user not found in local data (shouldn't happen)
                if (!targetUser) continue;

                // --- ACTION LOGIC ---
                if (actionType === 'POINTS') {
                    const targetName = targetUser.displayName || targetUser.name || 'Unknown User';
                    await performTransaction({
                        type: 'ADJUSTMENT',
                        amount: parseInt(amount),
                        from: pointsMode === 'ADD'
                            ? { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin (Bulk)' }
                            : { type: 'USER', id: uid, name: targetName },
                        to: pointsMode === 'ADD'
                            ? { type: 'USER', id: uid, name: targetName }
                            : { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin (Bulk)' },
                        reason: `[BULK ${pointsMode}] Admin Manual Adjustment`,
                        adminId: adminUser?.id
                    });
                }

                else if (actionType === 'RESET_POINTS') {
                    await updateDoc(doc(db, "users", uid), { points: 0, xp: 0 });
                    // Log
                    await setDoc(doc(collection(db, "admin_logs")), {
                        action: "RESET_POINTS_BULK",
                        targetUid: uid,
                        adminId: adminUser?.id,
                        timestamp: serverTimestamp()
                    });
                }

                else if (actionType === 'RESET_TEAMS') {
                    await updateDoc(doc(db, "users", uid), { teamId: null });
                    // Log
                    await setDoc(doc(collection(db, "admin_logs")), {
                        action: "RESET_TEAM_BULK",
                        targetUid: uid,
                        adminId: adminUser?.id,
                        timestamp: serverTimestamp()
                    });
                }

                else if (actionType === 'DELETE') {
                    await deleteDoc(doc(db, "users", uid));
                    // Log
                    await setDoc(doc(collection(db, "admin_logs")), {
                        action: "DELETE_USER_PERMANENT_BULK",
                        targetUid: uid,
                        adminId: adminUser?.id,
                        timestamp: serverTimestamp()
                    });
                }

                successCount++;
                setProgress(Math.round(((i + 1) / selectedIds.length) * 100));
            }

            alert(`Operation Complete! Successfully updated ${successCount} users.`);
            onSuccess();
        } catch (e: any) {
            console.error("Bulk Error", e);
            alert("Errors occurred during bulk update. Check logs.");
            // We still call onSuccess to refresh the grid even if some failed
            onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>⚡</span> Bulk Actions
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-2">Selected Users</div>
                    <div className="font-mono text-xl text-accent-gold font-bold">{selectedIds.length} Users</div>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="w-16 h-16 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-white font-bold mb-2">Processing...</h3>
                        <p className="text-gray-400 font-mono">{progress}%</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Action Type Selector */}
                        <div className="grid grid-cols-4 gap-2 bg-black/20 p-1 rounded-xl">
                            <button
                                onClick={() => setActionType('POINTS')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'POINTS' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                💰 Points
                            </button>
                            <button
                                onClick={() => setActionType('RESET_POINTS')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'RESET_POINTS' ? 'bg-orange-500/20 text-orange-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                🔄 0 Pts
                            </button>
                            <button
                                onClick={() => setActionType('RESET_TEAMS')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'RESET_TEAMS' ? 'bg-blue-500/20 text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                🛡️ No Team
                            </button>
                            <button
                                onClick={() => setActionType('DELETE')}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${actionType === 'DELETE' ? 'bg-red-500/20 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                🗑️ Delete
                            </button>
                        </div>

                        {/* Dynamic Content Based on Action */}
                        <div className="bg-white/5 rounded-xl p-4 min-h-[150px] flex flex-col justify-center">

                            {/* 1. POINTS MODE */}
                            {actionType === 'POINTS' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex bg-black/20 p-1 rounded-xl">
                                        <button
                                            onClick={() => setPointsMode('ADD')}
                                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${pointsMode === 'ADD' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            ➕ Grant
                                        </button>
                                        <button
                                            onClick={() => setPointsMode('DEDUCT')}
                                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${pointsMode === 'DEDUCT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        >
                                            ➖ Penalty
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1 font-bold uppercase">Amount</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono text-white focus:border-accent-gold outline-none text-center"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 2. RESET POINTS */}
                            {actionType === 'RESET_POINTS' && (
                                <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="text-4xl">🔄</div>
                                    <h4 className="text-white font-bold">Reset Points to Zero</h4>
                                    <p className="text-sm text-gray-400">This will set the `points` and `xp` of all selected users to 0. This does not affect their team assignment.</p>
                                </div>
                            )}

                            {/* 3. RESET TEAMS */}
                            {actionType === 'RESET_TEAMS' && (
                                <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="text-4xl">🛡️</div>
                                    <h4 className="text-white font-bold">Unassign From Teams</h4>
                                    <p className="text-sm text-gray-400">This will remove all selected users from their current teams. They will become 'Unassigned' or 'Freelancers'.</p>
                                </div>
                            )}

                            {/* 4. DELETE */}
                            {actionType === 'DELETE' && (
                                <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="text-4xl">🗑️</div>
                                    <h4 className="text-red-500 font-bold">Permanent Deletion</h4>
                                    <p className="text-sm text-gray-400">This will permanently delete the user accounts from the database. This action cannot be undone.</p>
                                </div>
                            )}

                        </div>

                        {/* Execute Button */}
                        <button
                            onClick={handleExecute}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                                ${actionType === 'DELETE' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-accent-gold hover:bg-yellow-400 text-black'}
                            `}
                        >
                            {actionType === 'POINTS' && `Wait, verify amount`}
                            {actionType !== 'POINTS' && `Execute ${actionType.replace('_', ' ')}`}
                            {/* Fix button text logic */}
                        </button>
                    </div>
                )}
            </div>

            {/* Text Override for Points since logic above was messy in JSX */}
            {/* Refined Button Logic below */}
            {!loading && (
                <style>
                    {`
                        .confirm-btn-text::after {
                            content: "${actionType === 'POINTS' ? (pointsMode === 'ADD' ? 'Grant Points' : 'Deduct Points') : (actionType === 'DELETE' ? 'DELETE USERS' : 'Confirm Action')}";
                        }
                     `}
                </style>
            )}
        </div>
    );
}
