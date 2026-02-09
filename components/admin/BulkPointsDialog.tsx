import React, { useState } from 'react';
import { performTransaction } from '../../lib/ledger';
import { useAuth } from '../../context/AuthContext';
import { AdminUser } from '../../hooks/useAdminData';

interface BulkPointsDialogProps {
    data: AdminUser[];
    selectedIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkPointsDialog({ data, selectedIds, onClose, onSuccess }: BulkPointsDialogProps) {
    const { user: adminUser } = useAuth();
    const [amount, setAmount] = useState<string>('');
    const [mode, setMode] = useState<'ADD' | 'DEDUCT'>('ADD');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleExecute = async () => {
        if (!amount || parseInt(amount) <= 0) return alert("من فضلك أدخل مبلغ صحيح");
        if (!confirm(`Are you sure you want to ${mode} ${amount} points to ${selectedIds.length} users?`)) return;

        setLoading(true);
        let successCount = 0;

        try {
            for (let i = 0; i < selectedIds.length; i++) {
                const uid = selectedIds[i];
                const targetUser = data.find(u => u.id === uid);
                if (!targetUser) continue;

                // Defensive name check
                const targetName = targetUser.displayName || targetUser.name || 'Unknown User';

                await performTransaction({
                    type: 'ADJUSTMENT',
                    amount: parseInt(amount),
                    from: mode === 'ADD'
                        ? { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin (Bulk)' }
                        : { type: 'USER', id: uid, name: targetName },
                    to: mode === 'ADD'
                        ? { type: 'USER', id: uid, name: targetName }
                        : { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin (Bulk)' },
                    reason: `[BULK ${mode}] Admin Manual Adjustment`,
                    adminId: adminUser?.id
                });

                successCount++;
                setProgress(Math.round(((i + 1) / selectedIds.length) * 100));
            }

            alert(`Complete! Successfully updated ${successCount} users.`);
            onSuccess();
        } catch (e: any) {
            console.error("Bulk Error", e);
            alert("Errors occurred during bulk update. Check logs.");
            onSuccess(); // Close anyway to refresh
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>⚖️</span> Bulk Score / XP Adjustment
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
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            <button
                                onClick={() => setMode('ADD')}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'ADD' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ➕ Grant
                            </button>
                            <button
                                onClick={() => setMode('DEDUCT')}
                                className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'DEDUCT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
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

                        <button
                            onClick={handleExecute}
                            disabled={!amount || parseInt(amount) <= 0}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                                ${!amount ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
                                ${mode === 'ADD' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                            `}
                        >
                            Confirm for {selectedIds.length} Users
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
