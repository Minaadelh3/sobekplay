import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#050608] text-white flex font-sans selection:bg-accent-gold/30">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block relative z-50">
                <AdminSidebar />
            </div>

            {/* Mobile Header & Content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">

                {/* Mobile Top Bar */}
                <header className="lg:hidden bg-[#0F1218] border-b border-white/5 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-40 sticky top-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-accent-gold flex items-center justify-center text-black font-black text-xs">GM</div>
                        <span className="font-bold text-sm tracking-widest text-white/80">MISSION CONTROL</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </header>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -300 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="fixed inset-0 z-50 lg:hidden flex"
                        >
                            <div className="w-80 h-full relative z-50 pt-[env(safe-area-inset-top)]">
                                <AdminSidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
                            </div>
                            <div
                                className="flex-1 bg-black/80 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-[env(safe-area-inset-bottom)]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
