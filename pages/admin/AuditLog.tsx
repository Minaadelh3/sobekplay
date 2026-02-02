import React, { useState, useEffect } from 'react';
import { fetchLedger, LedgerEntry } from '../../lib/ledger';

const AuditLog = () => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLog();
    }, []);

    const loadLog = async () => {
        setLoading(true);
        try {
            const data = await fetchLedger(100);
            setEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white">📜 سجل العمليات (Audit Log)</h1>
                <button onClick={loadLog} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-gray-300">
                    تحديث 🔄
                </button>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-500 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">الوقت</th>
                                <th className="px-6 py-4">النوع</th>
                                <th className="px-6 py-4">من</th>
                                <th className="px-6 py-4">إلى</th>
                                <th className="px-6 py-4 text-right">المبلغ</th>
                                <th className="px-6 py-4">السبب</th>
                                <th className="px-6 py-4">بواسطة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading log...</td></tr>
                            ) : entries.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">سجل نظيف ✨</td></tr>
                            ) : (
                                entries.map(entry => {
                                    const isPositive = true; // Ledger tracks absolute amount, context determines meaning
                                    // But usually visual "From -> To" is enough.

                                    return (
                                        <tr key={entry.id} className="hover:bg-white/5 transition-colors text-sm text-gray-300">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {entry.timestamp?.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString('en-US') : 'Pending...'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold
                                                    ${entry.type === 'ADJUSTMENT' ? 'bg-blue-500/20 text-blue-400' :
                                                        entry.type === 'TRANSFER' ? 'bg-purple-500/20 text-purple-400' :
                                                            'bg-gray-500/20 text-gray-400'}
                                                `}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] opacity-50 bg-white/10 px-1 rounded">{entry.fromType}</span>
                                                    <span className="font-bold">{entry.fromName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] opacity-50 bg-white/10 px-1 rounded">{entry.toType}</span>
                                                    <span className="font-bold">{entry.toName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-white">
                                                {entry.amount}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 italic">
                                                "{entry.reason}"
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {entry.adminId}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
