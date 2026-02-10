
import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useOneSignal } from '../hooks/useOneSignal';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Settings, CheckCircle2 } from 'lucide-react';

export default function NotificationSubscriptionPrompt() {
    const { permission, enableNotifications, isSupported, isOptedIn, addLog } = useOneSignal();
    const [showPrompt, setShowPrompt] = useState(false);
    const [lastTriggerTime, setLastTriggerTime] = useState<number>(0);
    const [isManualTrigger, setIsManualTrigger] = useState(false);

    // load last viewed time from local storage
    useEffect(() => {
        const stored = localStorage.getItem('last_subscription_prompt_viewed');
        if (stored) {
            setLastTriggerTime(parseInt(stored));
        }
    }, []);

    // Listen to admin trigger
    useEffect(() => {
        // If already subscribed and opted in, don't show prompt (unless we want to show a "success" state, but usually not needed)
        if (permission === 'granted' && isOptedIn && !isManualTrigger) {
            setShowPrompt(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'system_states', 'notifications'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const triggerTime = data.triggerTimestamp?.toMillis?.() || 0;

                // If the trigger is newer than when we last viewed/dismissed it
                // AND we are not fully subscribed
                if (triggerTime > lastTriggerTime) {
                    // Double check if we really need to show it
                    if (permission !== 'granted' || !isOptedIn) {
                        setShowPrompt(true);
                        setIsManualTrigger(false);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [permission, isOptedIn, lastTriggerTime, isManualTrigger]);

    const handleSubscribe = async () => {
        addLog("User clicked Subscribe in Prompt");
        await enableNotifications();
        // We don't immediately close, we wait for state to update or user to interact.
        // But if permission becomes granted, the useEffect above might close it if we don't handle it.
        // Actually, let's keep it open for a moment or show success.

        // If it was 'default', the browser prompt takes over. 
        // If it was 'denied', we showed instructions.

        if (Notification.permission === 'granted') {
            handleDismiss();
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Save current time as the "viewed" time so we don't see THIS trigger again
        const now = Date.now();
        localStorage.setItem('last_subscription_prompt_viewed', now.toString());
        setLastTriggerTime(now);
    };

    // If not supported, don't show anything
    if (!isSupported) return null;

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

                        {permission === 'denied' ? (
                            <>
                                <h3 className="text-xl font-bold text-white mb-2">التنبيهات مقفولة 🔕</h3>
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-right">
                                    <p className="text-gray-300 text-xs leading-relaxed flex items-start gap-2">
                                        <Settings size={14} className="mt-1 shrink-0 text-red-400" />
                                        <span>
                                            لقد قمت بحظر التنبيهات سابقاً. لتفعيلها، يجب عليك الذهاب إلى
                                            <span className="font-bold text-white mx-1">إعدادات المتصفح</span>
                                            بجانب شريط العنوان والسماح بالإشعارات لهذا الموقع.
                                        </span>
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleDismiss}
                                        className="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        حسناً، فهمت
                                    </button>
                                </div>
                            </>
                        ) : permission === 'granted' && !isOptedIn ? (
                            <>
                                <h3 className="text-xl font-bold text-white mb-2">إعادة تفعيل التنبيهات</h3>
                                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                    أنت مشترك، لكنك قمت بإيقاف التنبيهات من داخل التطبيق. هل تريد استلامها مرة أخرى؟
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSubscribe}
                                        className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-accent-gold/20"
                                    >
                                        تفعيل
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        ليس الآن
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
