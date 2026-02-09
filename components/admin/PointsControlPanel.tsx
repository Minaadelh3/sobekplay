import React, { useState, useEffect } from 'react';
import { performTransaction } from '../../lib/ledger';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { getLevelConfig } from '../../types/achievements'; // Import Level Config

interface PointsControlPanelProps {
    targetId: string;
    targetName: string;
    targetType: 'USER' | 'TEAM';
    currentPoints: number;
    currentUserLevel?: number; // Optional current level to check against
    onSuccess: () => void;
    onClose: () => void;
}

const PointsControlPanel: React.FC<PointsControlPanelProps> = ({ targetId, targetName, targetType, currentPoints, currentUserLevel, onSuccess, onClose }) => {
    const { user: adminUser } = useAuth();
    const [tab, setTab] = useState<'ADJUST' | 'HISTORY' | 'LOCK'>('ADJUST');

    // Adjust State
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState('');
    const [mode, setMode] = useState<'ADD' | 'DEDUCT'>('ADD');
    const [loading, setLoading] = useState(false);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Lock State
    const [isLocked, setIsLocked] = useState(false);
    const [lockReason, setLockReason] = useState('');

    useEffect(() => {
        if (tab === 'HISTORY') fetchHistory();
        if (tab === 'LOCK') checkLockStatus();
    }, [tab]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            // Query ledger for this target
            // Assuming ledger has 'to.id' or 'from.id' matching targetId
            // This is a simplified query, might need compound index in real app
            const q = query(collection(db, 'ledger'), where('to.id', '==', targetId), orderBy('timestamp', 'desc'), limit(10));
            const snap = await getDocs(q);
            setHistory(snap.docs.map(d => d.data()));
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingHistory(false);
        }
    };

    const checkLockStatus = async () => {
        if (targetType !== 'TEAM') return;
        const snap = await getDoc(doc(db, 'teams', targetId));
        if (snap.exists()) {
            setIsLocked(snap.data().isPointsLocked || false);
            setLockReason(snap.data().lockReason || '');
        }
    };

    const handleLockToggle = async () => {
        if (targetType !== 'TEAM') return;
        if (!confirm(isLocked ? "Unlock scoring for this team?" : "Lock scoring? No one needs points anyway.")) return;

        try {
            await updateDoc(doc(db, 'teams', targetId), {
                isPointsLocked: !isLocked,
                lockReason: !isLocked ? (lockReason || 'Admin Lock') : null,
                lockedBy: !isLocked ? adminUser?.id : null
            });
            setIsLocked(!isLocked);
            alert(isLocked ? "Unlocked!" : "Locked!");
        } catch (e) {
            alert("Failed to toggle lock");
        }
    };

    const handleExecute = async () => {
        if (!amount || parseInt(amount) <= 0) return alert("من فضلك أدخل مبلغ صحيح");
        if (!amount || parseInt(amount) <= 0) return alert("من فضلك أدخل مبلغ صحيح");
        // Reason removed as per request
        // if (!reason || reason.length < 3) return alert("لازم تكتب سبب واضح للعملية (للتدقيق)");

        setLoading(true);
        try {
            await performTransaction({
                type: 'ADJUSTMENT',
                amount: parseInt(amount),
                from: mode === 'ADD'
                    ? { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin' }
                    : { type: targetType, id: targetId, name: targetName || 'Unknown Target' },
                to: mode === 'ADD'
                    ? { type: targetType, id: targetId, name: targetName || 'Unknown Target' }
                    : { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin' },
                reason: `[ADMIN ${mode === 'ADD' ? 'GRANT' : 'PENALTY'}] ${reason || 'Manual Adjustment'}`,
                adminId: adminUser?.id
            });

            // 🌟 LEVEL CHECK (For Users)
            if (targetType === 'USER') {
                const numericAmount = parseInt(amount) || 0;
                const newTotalXP = mode === 'ADD' ? currentPoints + numericAmount : Math.max(0, currentPoints - numericAmount);

                // Calculate new level based on XP
                const newLevelConfig = getLevelConfig(newTotalXP);

                if (newLevelConfig.level !== currentUserLevel) {
                    // Update Level in DB
                    await updateDoc(doc(db, 'users', targetId), { level: newLevelConfig.level });
                    alert(`✅ Transaction Complete.\nUser Level Updated: ${currentUserLevel} ➝ ${newLevelConfig.level}`);
                } else {
                    alert("تمت العملية بنجاح! ✅");
                }
            } else {
                alert("تمت العملية بنجاح! ✅");
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`فشلت العملية: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const numericAmount = parseInt(amount) || 0;
    const finalPoints = mode === 'ADD' ? currentPoints + numericAmount : currentPoints - numericAmount;

    return (
        <div className="bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-white/10 w-full max-w-md mx-auto shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 lg:mb-6 border-b border-white/5 pb-3 lg:pb-4 relative z-10">
                <h3 className="text-lg lg:text-xl font-black text-white flex items-center gap-2">
                    <span>⚡</span> Score / XP Control
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white p-2 -mr-2 active:scale-90 transition-transform">✕</button>
            </div>

            {/* Target Header */}
            <div className="bg-black/30 p-3 lg:p-4 rounded-xl flex justify-between items-center mb-4 lg:mb-6 border border-white/5 relative z-10">
                <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{targetType} TARGET</div>
                    <div className="font-bold text-white text-base lg:text-lg truncate">{targetName}</div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-500">Current Balance</div>
                    <div className="font-mono text-base lg:text-xl text-accent-gold">{currentPoints.toLocaleString()} XP</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 lg:mb-6 border-b border-white/5 pb-1 relative z-10 overflow-x-auto no-scrollbar">
                <button onClick={() => setTab('ADJUST')} className={`pb-2 px-3 text-[10px] lg:text-xs font-bold uppercase transition-colors whitespace-nowrap active:opacity-70 ${tab === 'ADJUST' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-gray-500'}`}>Adjust</button>
                <button onClick={() => setTab('HISTORY')} className={`pb-2 px-3 text-[10px] lg:text-xs font-bold uppercase transition-colors whitespace-nowrap active:opacity-70 ${tab === 'HISTORY' ? 'text-accent-gold border-b-2 border-accent-gold' : 'text-gray-500'}`}>History</button>
                {targetType === 'TEAM' && (
                    <button onClick={() => setTab('LOCK')} className={`pb-2 px-3 text-[10px] lg:text-xs font-bold uppercase transition-colors whitespace-nowrap active:opacity-70 ${tab === 'LOCK' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}>Lock / Freeze</button>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-[250px] lg:min-h-[300px]">
                {tab === 'ADJUST' && (
                    <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex bg-black/20 p-1 rounded-xl">
                            <button
                                onClick={() => setMode('ADD')}
                                className={`flex-1 py-2 lg:py-2.5 rounded-lg font-bold text-xs lg:text-sm transition-all active:scale-[0.98] ${mode === 'ADD' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ➕ Grant
                            </button>
                            <button
                                onClick={() => setMode('DEDUCT')}
                                className={`flex-1 py-2 lg:py-2.5 rounded-lg font-bold text-xs lg:text-sm transition-all active:scale-[0.98] ${mode === 'DEDUCT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ➖ Penalty
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] lg:text-xs text-gray-400 mb-1 lg:mb-2 font-bold uppercase">Amount</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 lg:py-4 text-2xl lg:text-3xl font-mono text-white focus:border-accent-gold outline-none text-center h-14 lg:h-16"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs lg:text-sm px-2 py-3 border-t border-b border-white/5">
                            <span className="text-gray-400">Projected:</span>
                            <div className="flex items-center gap-2 font-mono font-bold">
                                <span className="text-gray-500 line-through text-[10px] lg:text-xs">{currentPoints}</span>
                                <span className="text-gray-600">→</span>
                                <span className={mode === 'ADD' ? 'text-green-400' : 'text-red-400'}>
                                    {finalPoints.toLocaleString()} XP
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleExecute}
                            disabled={loading || !amount}
                            className={`
                                w-full py-4 lg:py-5 rounded-xl font-bold text-base lg:text-lg shadow-lg transition-all active:scale-95
                                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}
                                ${mode === 'ADD' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                            `}
                        >
                            {loading ? 'Executing...' : 'Confirm Transaction'}
                        </button>
                    </div>
                )}

                {tab === 'HISTORY' && (
                    <div className="animate-in fade-in slide-in-from-right-2 space-y-2 max-h-[300px] lg:max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                        {loadingHistory ? <div className="text-center text-gray-500 py-8 text-xs">Fetching records...</div> :
                            history.length === 0 ? <div className="text-center text-gray-500 py-8 text-xs">No recent history found.</div> :
                                history.map((entry: any, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 flex justify-between items-center group active:bg-white/10 transition-colors">
                                        <div className="min-w-0 pr-2">
                                            <div className="text-[10px] lg:text-xs font-bold text-white mb-0.5 truncate">{entry.reason || 'Manual Adjustment'}</div>
                                            <div className="text-[8px] lg:text-[10px] text-gray-500 font-mono">
                                                {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                                            </div>
                                        </div>
                                        <div className={`font-mono font-bold text-xs lg:text-sm shrink-0 ${entry.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                        }
                    </div>
                )}

                {tab === 'LOCK' && (
                    <div className="animate-in fade-in slide-in-from-right-2 text-center py-6 lg:py-8">
                        <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full mx-auto flex items-center justify-center text-3xl lg:text-4xl mb-4 ${isLocked ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-green-500/20 text-green-500'}`}>
                            {isLocked ? '🔒' : '🔓'}
                        </div>
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-2">{isLocked ? 'Scoring Locked' : 'Scoring Active'}</h3>
                        <p className="text-gray-500 text-[10px] lg:text-sm mb-6 max-w-[250px] mx-auto leading-relaxed">
                            {isLocked
                                ? `Locked by Admin. Reason: ${lockReason}`
                                : "Team can accrue points normally via games and adjustments."}
                        </p>

                        {isLocked && (
                            <div className="mb-6">
                                <label className="block text-[10px] text-gray-400 mb-1 lg:mb-2 font-bold uppercase">Update Reason</label>
                                <input
                                    value={lockReason} onChange={e => setLockReason(e.target.value)}
                                    className="bg-black/30 border border-white/10 p-2 rounded-lg text-white text-center text-sm w-full max-w-[200px] outline-none focus:border-accent-gold"
                                />
                            </div>
                        )}

                        <button
                            onClick={handleLockToggle}
                            className={`w-full max-w-[220px] py-3.5 lg:py-4 rounded-xl font-bold text-sm lg:text-base transition-all active:scale-95 shadow-lg ${isLocked ? 'bg-white text-black' : 'bg-red-600 text-white'}`}
                        >
                            {isLocked ? '🔓 Unlock Scoring' : '🔒 Lock Scoring'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PointsControlPanel;
