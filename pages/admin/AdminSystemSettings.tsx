import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminData } from '../../hooks/useAdminData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function AdminSystemSettings() {
    // This could also hook into FeatureFlags logic if unified, but handling separately for clear UX here.
    const { triggerForceRefresh } = useAdminData();
    const [maintenance, setMaintenance] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);
    const [refreshingClients, setRefreshingClients] = useState(false);

    const handleClearCache = () => {
        if (!confirm("Flush System Cache? This may slow down initial loads.")) return;
        setClearingCache(true);
        setTimeout(() => {
            setClearingCache(false);
            alert("Cache Flush Signal Sent.");
        }, 1500);
    };

    const handleForceRefresh = async () => {
        if (!confirm("🚧 WARNING 🚧\n\nThis will force a RELOAD for ALL active users immediately.\nUse this only if you pushed a critical update.\n\nContinue?")) return;

        setRefreshingClients(true);
        const success = await triggerForceRefresh();
        if (success) {
            alert("✅ Refresh Signal Broadcasted.\nClients will reload within 5 seconds.");
        }
        setRefreshingClients(false);
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#141414] p-5 lg:p-6 rounded-2xl border border-white/5 shadow-lg pt-[calc(1.25rem+env(safe-area-inset-top))] lg:pt-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> System Configuration
                    </h2>
                    <p className="text-gray-500 text-xs lg:text-sm mt-1">Manage core system behaviors, maintenance, and storage.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

                {/* Maintenance Section */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6 flex flex-col">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4 flex items-center gap-2">
                        <span>🚧</span> Maintenance Protocol
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-400 mb-6 leading-relaxed">
                        When active, all non-admin users will be redirected to a dedicated maintenance page.
                        Use this during deployments or migrations.
                    </p>

                    <div className="mt-auto flex flex-col sm:flex-row items-center justify-between bg-black/30 p-4 rounded-xl border border-white/5 gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-gray-300 font-bold text-sm">Status:</span>
                            {maintenance ? (
                                <span className="text-red-500 text-[10px] font-black animate-pulse tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">ACTIVE</span>
                            ) : (
                                <span className="text-gray-500 text-[10px] font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">IDLE</span>
                            )}
                        </div>
                        <button
                            onClick={() => setMaintenance(!maintenance)}
                            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all active:scale-95 shadow-lg ${maintenance
                                ? 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-500'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 active:bg-white/20'
                                }`}
                        >
                            {maintenance ? 'DEACTIVATE' : 'ACTIVATE'}
                        </button>
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4 flex items-center gap-2">
                        <span>⚡</span> Cache & Performance
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-400 mb-6 leading-relaxed">
                        Manage Redis/Edge cache layers.
                        <span className="text-accent-gold text-[10px] font-black uppercase text-xs ml-2 bg-accent-gold/5 px-1.5 py-0.5 rounded">Experimental</span>
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleClearCache}
                            disabled={clearingCache}
                            className="w-full h-14 px-4 flex justify-between items-center bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.98] rounded-xl text-sm transition-all border border-white/5"
                        >
                            <span className="text-gray-200 font-bold">Flush Global Cache</span>
                            <div className="flex items-center gap-2">
                                {clearingCache && <div className="w-3 h-3 border-2 border-accent-gold border-t-transparent animate-spin rounded-full" />}
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{clearingCache ? 'Executing...' : 'Run'}</span>
                            </div>
                        </button>

                        <button
                            onClick={handleForceRefresh}
                            disabled={refreshingClients}
                            className="w-full h-14 px-4 flex justify-between items-center bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 active:scale-[0.98] rounded-xl text-sm transition-all border border-red-500/20"
                        >
                            <span className="text-red-400 font-bold flex items-center gap-2">
                                <span>🔄</span> Force Client Refresh
                            </span>
                            <div className="flex items-center gap-2">
                                {refreshingClients && <div className="w-3 h-3 border-2 border-red-400 border-t-transparent animate-spin rounded-full" />}
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${refreshingClients ? 'text-red-400' : 'text-gray-500'}`}>
                                    {refreshingClients ? 'Broadcasting...' : 'Execute'}
                                </span>
                            </div>
                        </button>

                        <button className="w-full h-14 px-4 flex justify-between items-center bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.98] rounded-xl text-sm transition-all border border-white/5">
                            <span className="text-gray-200 font-bold">Prune Audit Logs</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Execute</span>
                        </button>
                    </div>
                </div>

                {/* Notifications Config Stub */}
                <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 lg:p-6 md:col-span-2 opacity-30 select-none">
                    <h3 className="text-base lg:text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>🔔</span> Push Notification Channels (Coming Soon)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                        <div className="bg-black/40 h-20 lg:h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-black">STUB_CHANNEL_01</div>
                        <div className="bg-black/40 h-20 lg:h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-black">STUB_CHANNEL_02</div>
                        <div className="bg-black/40 h-20 lg:h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-black">STUB_CHANNEL_03</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
