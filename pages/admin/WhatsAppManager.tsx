import React from 'react';
import { useGodMode } from '../../hooks/useGodMode';
import { motion } from 'framer-motion';

export default function WhatsAppManager() {
    const { resetAllChats, loading } = useGodMode();

    return (
        <div className="space-y-8 relative min-h-screen pb-20 p-6">
            {/* Header */}
            <div className="bg-orange-900/10 border border-orange-500/30 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <span className="text-5xl">💬</span> WHATSAPP CONTROL
                    </h1>
                    <p className="text-orange-400 font-mono text-sm mt-1 tracking-widest uppercase opacity-80">
                        Team Communication Management • Admin Only
                    </p>
                    <p className="text-sm text-gray-500 mt-4 max-w-xl">
                        Manage all team communication channels from here. You can reset chats, monitor activity, and broadcast system messages.
                    </p>
                </div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-center group relative"
                >
                    <button
                        onClick={resetAllChats}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-bold shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.5)] transition-all flex items-center gap-4 border border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-3xl group-hover:rotate-12 transition-transform">☢️</span>
                        <div className="text-left">
                            <div className="leading-none text-xs opacity-80 uppercase tracking-widest">Danger Zone</div>
                            <div className="text-xl">RESET ALL CHATS</div>
                        </div>
                    </button>
                    <div className="absolute top-full mt-3 left-0 right-0 text-[11px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Irreversible: Deletes all messages in all teams
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats / Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-widest">Active Channels</div>
                    <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
                        ALL <span className="text-sm text-gray-600 font-normal">Teams Active</span>
                    </div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-widest">Storage Policy</div>
                    <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
                        90 <span className="text-sm text-gray-600 font-normal">Day Auto-Retain</span>
                    </div>
                </div>
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-2 tracking-widest">Security</div>
                    <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
                        GOD <span className="text-sm text-gray-600 font-normal">Level Access</span>
                    </div>
                </div>
            </div>

            {/* Placeholder for more features */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center">
                <div className="text-6xl mb-6 opacity-20">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-2">Message Auditing Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    A searchable message archive and user-specific reporting tools are currently being deployed.
                </p>
            </div>
        </div>
    );
}
