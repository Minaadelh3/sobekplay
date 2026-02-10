
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useOneSignal } from '../hooks/useOneSignal';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

export default function NotificationSubscriptionPrompt() {
    const { permission, enableNotifications, isSupported } = useOneSignal();
    const [showPrompt, setShowPrompt] = useState(false);
    const [lastTriggerTime, setLastTriggerTime] = useState<number>(0);

    // load last viewed time from local storage
    useEffect(() => {
        const stored = localStorage.getItem('last_subscription_prompt_viewed');
        if (stored) {
            setLastTriggerTime(parseInt(stored));
        }
    }, []);

    // Listen to admin trigger
    useEffect(() => {
        // If notifications are already enabled, don't show prompt
        if (permission === 'granted' || !isSupported) {
            setShowPrompt(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'system_states', 'notifications'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const triggerTime = data.triggerTimestamp?.toMillis?.() || 0;

                // If the trigger is newer than when we last viewed/dismissed it
                if (triggerTime > lastTriggerTime) {
                    setShowPrompt(true);
                }
            }
        });

        return () => unsubscribe();
    }, [permission, isSupported, lastTriggerTime]);

    const handleSubscribe = async () => {
        await enableNotifications();
        handleDismiss();
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Save current time as the "viewed" time so we don't see THIS trigger again
        const now = Date.now();
        localStorage.setItem('last_subscription_prompt_viewed', now.toString());
        setLastTriggerTime(now);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1a1a1a] border border-accent-gold/30 rounded-2xl p-6 max-w-sm w-full relative shadow-[0_0_50px_rgba(255,215,0,0.1)] text-center"
                    >
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-gold">
                            <Bell size={32} />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">تفعيل التنبيهات</h3>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                            عشان يوصلك كل جديد، ومواعيد الألعاب، وأخبار الرحلة.. فعل التنبيهات دلوقتي! 🔔
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleSubscribe}
                                className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-accent-gold/20"
                            >
                                اشترك الآن
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
                            >
                                ليس الآن
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
