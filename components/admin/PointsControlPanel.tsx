import React, { useState } from 'react';
import { performTransaction } from '../../lib/ledger';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface PointsControlPanelProps {
    targetId: string;
    targetName: string;
    targetType: 'USER' | 'TEAM';
    currentPoints: number;
    onSuccess: () => void;
    onClose: () => void;
}

const PointsControlPanel: React.FC<PointsControlPanelProps> = ({ targetId, targetName, targetType, currentPoints, onSuccess, onClose }) => {
    const { user: adminUser } = useAuth();
    const [amount, setAmount] = useState<string>('');
    const [reason, setReason] = useState('');
    const [mode, setMode] = useState<'ADD' | 'DEDUCT'>('ADD');
    const [loading, setLoading] = useState(false);
    const [previewPoint, setPreviewPoints] = useState<number | null>(null);

    const numericAmount = parseInt(amount) || 0;
    const finalPoints = mode === 'ADD' ? currentPoints + numericAmount : currentPoints - numericAmount;

    const handleExecute = async () => {
        if (!amount || numericAmount <= 0) return alert("من فضلك أدخل مبلغ صحيح");
        if (!reason || reason.length < 3) return alert("لازم تكتب سبب واضح للعملية (للتدقيق)");

        setLoading(true);
        try {
            await performTransaction({
                type: 'ADJUSTMENT',
                amount: numericAmount, // Ledger usually takes positive amounts, handle direction via logic below? 
                // Wait, performTransaction params logic:
                // If ADD: From SYSTEM -> To TARGET
                // If DEDUCT: From TARGET -> To SYSTEM
                from: mode === 'ADD'
                    ? { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin' }
                    : { type: targetType, id: targetId, name: targetName },
                to: mode === 'ADD'
                    ? { type: targetType, id: targetId, name: targetName }
                    : { type: 'SYSTEM', id: 'admin_panel', name: 'Sobek Admin' },
                reason: `[ADMIN ${mode === 'ADD' ? 'GRANT' : 'PENALTY'}] ${reason}`,
                adminId: adminUser?.id
            });

            alert("تمت العملية بنجاح! ✅");
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(`فشلت العملية: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-md mx-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>⚡</span> التحكم في النقاط
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-6">
                {/* Target Info */}
                <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">{targetType} TARGET</div>
                        <div className="font-bold text-white text-lg">{targetName}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">الرصيد الحالي</div>
                        <div className="font-mono text-xl text-accent-gold">{currentPoints.toLocaleString()} SP</div>
                    </div>
                </div>

                {/* Mode Select */}
                <div className="flex bg-black/20 p-1 rounded-xl">
                    <button
                        onClick={() => setMode('ADD')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'ADD' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        ➕ إضافة مكافأة
                    </button>
                    <button
                        onClick={() => setMode('DEDUCT')}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'DEDUCT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        ➖ خصم عقوبة
                    </button>
                </div>

                {/* Amount Input */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1 font-bold uppercase">قيمة النقاط</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono text-white focus:border-accent-gold outline-none text-center"
                    />
                </div>

                {/* Simulation Preview */}
                <div className="flex items-center justify-between text-sm px-2 py-2 border-t border-b border-white/5">
                    <span className="text-gray-400">الرصيد بعد العملية:</span>
                    <div className="flex items-center gap-2 font-mono font-bold">
                        <span className="text-gray-500 line-through">{currentPoints}</span>
                        <span>→</span>
                        <span className={mode === 'ADD' ? 'text-green-400' : 'text-red-400'}>
                            {finalPoints.toLocaleString()} SP
                        </span>
                    </div>
                </div>

                {/* Reason Input */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1 font-bold uppercase">السبب (للتدقيق)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="ليه بتعمل كده؟ (مكافأة مسابقة، تصحيح خطأ، إلخ)"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-gold outline-none h-24 resize-none"
                    />
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecute}
                    disabled={loading || !amount}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}
                        ${mode === 'ADD'
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-green-900/20'
                            : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-red-900/20'
                        }
                    `}
                >
                    {loading ? 'جاري التنفيذ...' : mode === 'ADD' ? '💰 تحويل المكافأة' : '🚨 تنفيذ الخصم'}
                </button>
            </div>
        </div>
    );
};

export default PointsControlPanel;
