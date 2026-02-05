import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { isPWA } from '../../lib/authActions';

interface SettingsLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TABS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'account', label: 'Account', icon: '🔒' },
    { id: 'app', label: 'App', icon: '📱' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
] as const;

export default function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
    const { isAdmin } = useAuth();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen pt-24 pb-32">
            <h1 className="text-4xl font-black text-white mb-8 border-r-8 border-accent-gold pr-6 tracking-tight">
                SETTINGS
            </h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <nav className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#141414] border border-white/5 rounded-2xl p-2 sticky top-24">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`w-full text-right px-4 py-3 rounded-xl mb-1 flex items-center justify-end gap-3 transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-accent-gold text-black font-bold shadow-lg shadow-accent-gold/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-sm md:text-base">{tab.label}</span>
                                <span className="text-lg">{tab.icon}</span>
                            </button>
                        ))}

                        {isAdmin && (
                            <div className="border-t border-white/10 mt-2 pt-2">
                                <span className="block px-4 py-2 text-xs text-gray-600 font-mono text-center">ADMIN MODE</span>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
