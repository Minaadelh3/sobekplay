import React, { useEffect, useState } from 'react';
import { checkBackendRoots, RootStatus } from '../../services/backendHealth';
import { motion } from 'framer-motion';

export default function RootMapPanel() {
    const [roots, setRoots] = useState<RootStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const runCheck = async () => {
        setLoading(true);
        const results = await checkBackendRoots();
        setRoots(results);
        setLoading(false);
    };

    useEffect(() => {
        runCheck();
    }, []);

    return (
        <div className="bg-[#121820] p-6 rounded-2xl border border-white/5 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>🗺️</span> خريطة الـ Backend
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">Verified Roots & Pipelines</p>
                </div>
                <button
                    onClick={runCheck}
                    disabled={loading}
                    className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
                >
                    {loading ? 'Checking...' : '🔄 Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {roots.map((root) => (
                    <motion.div
                        key={root.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-colors
                            ${root.status === 'ONLINE'
                                ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                            }
                        `}
                    >
                        <div className={`text-lg transition-transform ${loading ? 'scale-90 opacity-50' : ''}`}>
                            {root.status === 'ONLINE' ? '🟢' : '🔴'}
                        </div>
                        <div className="font-mono text-[10px] font-bold text-gray-300 break-all">
                            {root.name}
                        </div>
                        <div className="text-[9px] text-gray-500">
                            {root.message}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
