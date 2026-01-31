import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import TeamChatCore from './TeamChatCore';

export default function TeamChatPopup() {
    const { user, activeTeam } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Auto-Open on Login (Once)
    useEffect(() => {
        if (user && activeTeam && !sessionStorage.getItem('sobek_chat_opened')) {
            setIsOpen(true);
            sessionStorage.setItem('sobek_chat_opened', 'true');
        }
    }, [user, activeTeam]);

    if (!activeTeam) return null;

    return (
        <div className="fixed bottom-24 right-5 z-[9999] font-sans" dir="ltr">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[90vw] md:w-[400px] h-[580px] max-h-[75vh] bg-[#ECE5DD] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-300"
                    >
                        {/* WhatsApp Header */}
                        <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shadow-md z-10 shrink-0">
                            <button onClick={() => setIsOpen(false)} className="md:hidden text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <img
                                src={activeTeam.avatar}
                                alt={activeTeam.name}
                                className="w-10 h-10 rounded-full object-cover bg-white"
                            />
                            <div className="flex-1">
                                <h3 className="font-bold text-base leading-tight">{activeTeam.name}</h3>
                                <p className="text-xs text-green-200 truncate">
                                    {activeTeam.id === 'uncle_joy' ? 'Official Admin Channels' : `${activeTeam.totalPoints || 0} Points • Tap for info`}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* CORE CHAT COMPONENT */}
                        <div className="flex-1 overflow-hidden relative">
                            <TeamChatCore mode="popup" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button (WhatsApp Style) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20bd5a] transition-all hover:scale-110 active:scale-95"
                >
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white justify-center items-center font-bold font-sans">1</span>
                    </span>
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.21C10.43 20.21 8.92 19.78 7.59 18.99L7.28 18.8L4.17 19.61L4.99 16.59L4.8 16.27C3.92 14.87 3.46 13.28 3.46 11.63C3.46 6.91 7.31 3.07 12.05 3.07C14.35 3.07 16.5 3.97 18.13 5.59C19.75 7.22 20.65 9.38 20.65 11.68C20.65 16.41 16.79 20.21 12.05 20.21Z" /></svg>
                </button>
            )}
        </div>
    );
}
