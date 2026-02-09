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
                <header className="lg:hidden bg-[#0F1218] border-b border-white/5 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex justify-between items-center z-40 sticky top-0 shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-accent-gold flex items-center justify-center text-black font-black text-sm">GM</div>
                        <span className="font-bold text-xs tracking-widest text-white/80 uppercase">Mission Control</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg active:scale-90 transition-transform"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </header>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 lg:hidden flex"
                        >
                            <motion.div
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                className="w-80 h-full relative z-50 pt-[env(safe-area-inset-top)] shadow-2xl"
                            >
                                <AdminSidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
                            </motion.div>
                            <div
                                className="flex-1 bg-black/80 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-[env(safe-area-inset-bottom)] p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
