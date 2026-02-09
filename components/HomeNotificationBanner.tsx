import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, NotificationItem } from '../context/NotificationContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function HomeNotificationBanner() {
    const { notifications } = useNotification();
    const [latestNotification, setLatestNotification] = useState<NotificationItem | null>(null);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            const dismissedId = localStorage.getItem('dismissed_home_notification_id');

            if (latest.id !== dismissedId) {
                setLatestNotification(latest);
            } else {
                setLatestNotification(null);
            }
        } else {
            setLatestNotification(null);
        }
    }, [notifications]);

    const handleDismiss = () => {
        if (latestNotification) {
            localStorage.setItem('dismissed_home_notification_id', latestNotification.id);
            setLatestNotification(null);
        }
    };

    if (!latestNotification) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 mb-8">
            <AnimatePresence>
                <motion.div
                    key={latestNotification.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A1D26] to-[#12141A] rounded-xl border border-accent-gold/20 shadow-[0_0_20px_-5px_rgba(255,215,0,0.15)]"></div>

                    {/* Glow Effect */}
                    <div className="absolute -left-10 -top-10 w-32 h-32 bg-accent-gold/10 rounded-full blur-[50px] pointer-events-none"></div>

                    <div className="relative p-5 pr-12 flex justify-between items-start gap-4 z-10">
                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl animate-pulse">
                                    {latestNotification.icon || '🔔'}
                                </span>
                                <h3 className="font-bold text-lg text-white leading-tight">
                                    {latestNotification.title}
                                </h3>
                            </div>

                            <p className="text-gray-300 text-sm leading-relaxed mb-2 max-w-2xl">
                                {latestNotification.message}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-mono text-accent-gold/60">
                                <span>
                                    {latestNotification.createdAt?.toDate ? format(latestNotification.createdAt.toDate(), "d MMM - h:mm a", { locale: ar }) : 'NOW'}
                                </span>
                                <span>•</span>
                                <span>FROM: SOBEK</span>
                            </div>
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Decorative Stripe */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent-gold/40 rounded-l-full"></div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
