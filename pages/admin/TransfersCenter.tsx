import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { performTransaction, EntityType, TransactionType } from '../../lib/ledger';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../../components/UserAvatar';

interface EntityOption {
    id: string;
    name: string;
    type: EntityType;
    points?: number;
    avatar?: string;
}

const TransfersCenter = () => {
    const { user: currentUser } = useAuth();

    // State
    const [users, setUsers] = useState<EntityOption[]>([]);
    const [teams, setTeams] = useState<EntityOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [transType, setTransType] = useState<'ADJUSTMENT' | 'TRANSFER'>('ADJUSTMENT');
    const [direction, setDirection] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD'); // For Adjustment

    const [sourceType, setSourceType] = useState<EntityType>('SYSTEM');
    const [sourceId, setSourceId] = useState('');

    const [destType, setDestType] = useState<EntityType>('USER');
    const [destId, setDestId] = useState('');

    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState('');

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Teams
                const teamsSnap = await getDocs(collection(db, 'teams'));
                const teamsData = teamsSnap.docs.map(d => ({
                    id: d.id,
                    name: d.data().name || d.id,
                    type: 'TEAM' as EntityType,
                    points: d.data().points || 0
                }));
                setTeams(teamsData);

                // Fetch Users
                const usersSnap = await getDocs(collection(db, 'users'));
                const usersData = usersSnap.docs.map(d => ({
                    id: d.id,
                    name: d.data().name || d.data().displayName || 'Unknown',
                    type: 'USER' as EntityType,
                    points: d.data().points || 0,
                    avatar: d.data().avatar || d.data().photoURL
                }));
                setUsers(usersData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setProcessing(true);

        try {
            if (amount <= 0) throw new Error("المبلغ لازم يكون أكبر من صفر");
            if (reason.length < 3) throw new Error("اكتب سبب واضح");

            let fromEnt: any = { type: 'SYSTEM', id: 'system', name: 'System' };
            let toEnt: any = { type: 'SYSTEM', id: 'system', name: 'System' };

            // LOGIC MAPPING
            if (transType === 'ADJUSTMENT') {
                // Adjusting a Single Entity
                const targetId = destId; // Reusing dest inputs for target
                const targetType = destType; // Reusing dest inputs for target

                const target = targetType === 'USER' ? users.find(u => u.id === targetId) : teams.find(t => t.id === targetId);
                if (!target) throw new Error("اختار المستهدف صح");

                if (direction === 'ADD') {
                    fromEnt = { type: 'SYSTEM', id: 'system', name: 'System Grant' };
                    toEnt = { type: targetType, id: target.id, name: target.name };
                } else if (direction === 'SUBTRACT') {
                    fromEnt = { type: targetType, id: target.id, name: target.name };
                    toEnt = { type: 'SYSTEM', id: 'system', name: 'System Penalty' };
                }
                // TODO: Handle 'SET' (Requires diff calculation, maybe later)
            } else {
                // Transfer
                const src = sourceType === 'USER' ? users.find(u => u.id === sourceId) : teams.find(t => t.id === sourceId);
                const dst = destType === 'USER' ? users.find(u => u.id === destId) : teams.find(t => t.id === destId);

                if (!src || !dst) throw new Error("المصدر أو المستلم مش موجودين");
                if (src.id === dst.id) throw new Error("مينفعش تحول لنفس الحساب");

                fromEnt = { type: sourceType, id: src.id, name: src.name };
                toEnt = { type: destType, id: dst.id, name: dst.name };
            }

            await performTransaction({
                type: transType,
                amount,
                from: fromEnt,
                to: toEnt,
                reason,
                adminId: currentUser?.email || 'admin'
            });

            setMsg({ type: 'success', text: "تمت العملية بنجاح! ✅" });
            setAmount(0);
            setReason('');

        } catch (err: any) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    const allEntities = [...teams, ...users];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-2">
                💸 بنك النقاط
            </h1>

            {/* Type Selector */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setTransType('ADJUSTMENT')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${transType === 'ADJUSTMENT' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'}`}
                >
                    🔧 تعديل رصيد
                </button>
                <button
                    onClick={() => setTransType('TRANSFER')}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${transType === 'TRANSFER' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}
                >
                    🔄 تحويل نقاط
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/5 p-6 rounded-2xl max-w-2xl">

                {/* ADJUSTMENT UI */}
                {transType === 'ADJUSTMENT' && (
                    <div className="mb-6 space-y-4">
                        <div className="flex gap-2 bg-black/20 p-1 rounded-lg w-fit">
                            <button type="button" onClick={() => setDirection('ADD')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${direction === 'ADD' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>+ إضافة</button>
                            <button type="button" onClick={() => setDirection('SUBTRACT')} className={`px-4 py-1.5 rounded-md text-sm font-bold ${direction === 'SUBTRACT' ? 'bg-red-600 text-white' : 'text-gray-400'}`}>- خصم</button>
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">المستهدف</label>
                            <div className="flex gap-2 mb-2">
                                <select
                                    value={destType}
                                    onChange={(e) => setDestType(e.target.value as EntityType)}
                                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="USER">مستخدم</option>
                                    <option value="TEAM">فريق</option>
                                </select>
                                <select
                                    value={destId}
                                    onChange={(e) => setDestId(e.target.value)}
                                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white flex-1"
                                    required
                                >
                                    <option value="">اختار...</option>
                                    {(destType === 'USER' ? users : teams).map(e => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.points} pts)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* TRANSFER UI */}
                {transType === 'TRANSFER' && (
                    <div className="mb-6 grid grid-cols-2 gap-6 bg-black/20 p-4 rounded-xl">
                        {/* FROM */}
                        <div>
                            <label className="block text-gray-400 text-xs uppercase mb-2">من (المرسل)</label>
                            <select
                                value={sourceType}
                                onChange={(e) => setSourceType(e.target.value as EntityType)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm w-full mb-2"
                            >
                                <option value="USER">مستخدم (User)</option>
                                <option value="TEAM">فريق (Team)</option>
                            </select>
                            <select
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm w-full"
                                required
                            >
                                <option value="">المصدر...</option>
                                {(sourceType === 'USER' ? users : teams).map(e => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.points})</option>
                                ))}
                            </select>
                        </div>

                        {/* TO */}
                        <div>
                            <label className="block text-gray-400 text-xs uppercase mb-2">إلى (المستلم)</label>
                            <select
                                value={destType}
                                onChange={(e) => setDestType(e.target.value as EntityType)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm w-full mb-2"
                            >
                                <option value="USER">مستخدم (User)</option>
                                <option value="TEAM">فريق (Team)</option>
                            </select>
                            <select
                                value={destId}
                                onChange={(e) => setDestId(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm w-full"
                                required
                            >
                                <option value="">المستلم...</option>
                                {(destType === 'USER' ? users : teams).map(e => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.points})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Amount & Reason */}
                <div className="space-y-4 border-t border-white/5 pt-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">المبلغ (Points)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-full font-mono text-xl"
                            min={1}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">السبب (يظهر في السجل)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white w-full h-20 text-sm"
                            placeholder="مثال: تصحيح خطأ - مكافأة إضافية..."
                            required
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-8">
                    {msg && (
                        <div className={`p-3 rounded-lg text-sm font-bold text-center mb-4 ${msg.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                            {msg.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-accent-gold text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'جاري التنفيذ...' : 'تأكيد العملية ✅'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        ⚠️ العملية دي هتتسجل في الـ Audit Log ولا يمكن التراجع عنها تلقائياً.
                    </p>
                </div>

            </form>
        </div>
    );
};

export default TransfersCenter;
