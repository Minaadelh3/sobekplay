import React, { useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';

export default function AuditLog() {
    const { logs, fetchLogs, loading } = useAdminData();

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 overflow-x-auto shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <span>📜</span> سجل العمليات
            </h2>
            <table className="w-full text-right text-sm">
                <thead className="text-gray-500 border-b border-white/5 uppercase font-mono text-xs">
                    <tr>
                        <th className="pb-4">الحدث</th>
                        <th className="pb-4">المستهدف</th>
                        <th className="pb-4">المسؤول</th>
                        <th className="pb-4">التوقيت</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500 animate-pulse">جاري تحميل السجل...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-500">السجل فارغ.</td></tr>
                    ) : logs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 text-accent-gold font-mono">{log.action || 'Unknown Action'}</td>
                            <td className="py-4 text-white">
                                {log.targetTeam ? `Team: ${log.targetTeam}` :
                                    log.targetUser ? `User: ${log.targetUser}` :
                                        log.targetUid || '-'}
                            </td>
                            <td className="py-4 text-gray-400">{log.adminEmail || 'Unknown'}</td>
                            <td className="py-4 text-gray-500 font-mono text-xs">
                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'N/A'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
