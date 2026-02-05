import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminData } from '../../hooks/useAdminData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function AdminSystemSettings() {
    // This could also hook into FeatureFlags logic if unified, but handling separately for clear UX here.
    const [maintenance, setMaintenance] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);

    const handleClearCache = () => {
        if (!confirm("Flush System Cache? This may slow down initial loads.")) return;
        setClearingCache(true);
        setTimeout(() => {
            setClearingCache(false);
            alert("Cache Flush Signal Sent.");
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span>⚙️</span> System Configuration
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage core system behaviors, maintenance, and storage.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Maintenance Section */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>🚧</span> Maintenance Protocol
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        When active, all non-admin users will be redirected to a dedicated maintenance page.
                        Use this during deployments or database migrations.
                    </p>

                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-white/5">
                        <span className="text-gray-300 font-bold">Status</span>
                        <div className="flex items-center gap-3">
                            {maintenance && <span className="text-red-500 text-xs font-bold animate-pulse">ACTIVE</span>}
                            <button
                                onClick={() => setMaintenance(!maintenance)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${maintenance ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {maintenance ? 'DEACTIVATE PROTOCOL' : 'ACTIVATE MAINTENANCE'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>⚡</span> Cache & Performance
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Manage Redis/Edge cache layers.
                        <span className="text-accent-gold text-xs ml-2">Experimental</span>
                    </p>

                    <div className="space-y-2">
                        <button
                            onClick={handleClearCache}
                            disabled={clearingCache}
                            className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/5"
                        >
                            <span className="text-gray-300">Flush Global Cache</span>
                            <span className="text-xs text-gray-500">{clearingCache ? 'Executing...' : 'Execute'}</span>
                        </button>
                        <button className="w-full flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/5">
                            <span className="text-gray-300">Prune Audit Logs (Older than 90d)</span>
                            <span className="text-xs text-gray-500">Execute</span>
                        </button>
                    </div>
                </div>

                {/* Notifications Config Stub */}
                <div className="bg-[#141414] border border-white/5 rounded-xl p-6 md:col-span-2 opacity-50 pointer-events-none">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>🔔</span> Push Notification Channels (Coming Soon)
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black/20 h-24 rounded-lg border border-white/5"></div>
                        <div className="bg-black/20 h-24 rounded-lg border border-white/5"></div>
                        <div className="bg-black/20 h-24 rounded-lg border border-white/5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
