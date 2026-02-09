import React, { useState, useEffect } from 'react';
import { fetchLedger, LedgerEntry } from '../../lib/ledger';
import { motion } from 'framer-motion';

export default function AuditLog() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLog();
    }, []);

    useEffect(() => {
        let result = entries;
        if (filterType !== 'ALL') {
            result = result.filter(e => e.type === filterType);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.fromName?.toLowerCase().includes(q) ||
                e.toName?.toLowerCase().includes(q) ||
                e.reason?.toLowerCase().includes(q)
            );
        }
        setFilteredEntries(result);
    }, [filterType, searchQuery, entries]);

    const loadLog = async () => {
        setLoading(true);
        try {
            const data = await fetchLedger(200); // Increased limit
            setEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
                    <h3 className="text-xs uppercase text-gray-500 font-bold mb-1">Total Signals</h3>
                    <div className="text-2xl font-mono font-bold text-white">{entries.length}</div>
                </div>
                <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
                    <h3 className="text-xs uppercase text-gray-500 font-bold mb-1">Security Events</h3>
                    <div className="text-2xl font-mono font-bold text-red-400">
                        {entries.filter(e => e.type === 'BAN_USER' || e.type === 'UNBAN_USER').length}
                    </div>
                </div>
                <div className="bg-[#141414] border border-white/5 p-4 rounded-xl">
                    <h3 className="text-xs uppercase text-gray-500 font-bold mb-1">Adjustments</h3>
                    <div className="text-2xl font-mono font-bold text-blue-400">
                        {entries.filter(e => e.type === 'ADJUSTMENT').length}
                    </div>
                </div>
            </div>

            {/* Console Filters */}
            <div className="bg-[#141414] border border-white/5 rounded-t-xl p-4 flex flex-wrap gap-4 items-center justify-between border-b border-white/5 sticky top-0 z-10 shadow-lg">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>📜</span> System Logs
                    </h2>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex gap-2">
                        {['ALL', 'TRANSFER', 'ADJUSTMENT', 'BAN_USER', 'CREATE_TEAM'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition-all ${filterType === type
                                    ? 'bg-accent-gold text-black shadow-[0_0_10px_rgba(191,160,90,0.2)]'
                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-gold outline-none w-64 text-xs font-mono"
                    />
                    <button onClick={loadLog} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        🔄
                    </button>
                </div>
            </div>

            {/* Log Stream */}
            <div className="bg-[#0A0C10] border-x border-b border-white/5 rounded-b-xl overflow-hidden min-h-[500px] font-mono text-xs shadow-2xl">
                {loading ? (
                    <div className="p-12 text-center text-green-500 animate-pulse text-[10px] lg:text-xs">
                        &gt; ESTABLISHING UPLINK... <br />
                        &gt; FETCHING SECURITY AUDIT...
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-12 text-center text-gray-600 text-[10px] lg:text-xs">
                        &gt; NO SIGNALS DETECTED.
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                            <thead className="bg-[#141414] text-gray-500 uppercase tracking-wider sticky top-0 z-10 text-[8px] lg:text-[10px]">
                                <tr>
                                    <th className="px-3 lg:px-4 py-3 border-b border-white/5 w-24 lg:w-40">Timestamp</th>
                                    <th className="px-3 lg:px-4 py-3 border-b border-white/5 w-24 lg:w-32">Type</th>
                                    <th className="px-3 lg:px-4 py-3 border-b border-white/5">Details</th>
                                    <th className="px-3 lg:px-4 py-3 border-b border-white/5 w-32 lg:w-48 text-right hidden sm:table-cell">Actor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEntries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-white/[0.02] group transition-colors text-[10px] lg:text-xs">
                                        <td className="px-3 lg:px-4 py-3 text-gray-500 whitespace-nowrap font-mono">
                                            {entry.timestamp?.seconds
                                                ? new Date(entry.timestamp.seconds * 1000).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                : '--:--:--'}
                                        </td>
                                        <td className="px-3 lg:px-4 py-3">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] lg:text-[10px] font-bold border truncate block max-w-[80px] lg:max-w-none ${entry.type === 'ADJUSTMENT' ? 'bg-blue-900/20 text-blue-400 border-blue-900/30' :
                                                entry.type === 'TRANSFER' ? 'bg-purple-900/20 text-purple-400 border-purple-900/30' :
                                                    entry.type.includes('BAN') ? 'bg-red-900/20 text-red-500 border-red-900/30' :
                                                        'bg-gray-800 text-gray-400 border-white/5'
                                                }`}>
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3">
                                            <div className="flex flex-wrap items-center gap-1 LG:gap-2">
                                                <span className="text-gray-300">
                                                    {entry.fromName && <span className="text-gray-500 text-[8px] lg:text-xs">{entry.fromName} → </span>}
                                                    <span className="text-white font-bold">{entry.toName || 'System'}</span>
                                                </span>
                                                {entry.amount !== undefined && (
                                                    <span className="text-accent-gold font-bold">
                                                        [{entry.amount.toLocaleString()} SP]
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-gray-600 mt-0.5 italic text-[8px] lg:text-[10px] truncate max-w-[200px] lg:max-w-md">
                                                &gt; {entry.reason || 'No details provided'}
                                            </div>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                                            <div className="truncate w-32 md:w-40 ml-auto" title={entry.adminId}>
                                                {entry.adminId ? `admin:${entry.adminId.slice(0, 8)}...` : 'system:automated'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
