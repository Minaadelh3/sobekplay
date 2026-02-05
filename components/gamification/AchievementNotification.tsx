import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface NotificationMessage {
    id: string;
    title: string;
    message: string;
    type: string;
    meta: any;
    readBy?: string[];
}

export default function AchievementNotification() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [currentNotification, setCurrentNotification] = useState<NotificationMessage | null>(null);

    // Listener
    useEffect(() => {
        if (!user?.id) return;

        const q = query(
            collection(db, 'system_messages'),
            where('targetId', '==', user.id),
            where('type', '==', 'achievement_unlocked'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data() as NotificationMessage;
                    data.id = change.doc.id;

                    // Filter if already read by this user (if multi-target) 
                    // or just check if we have seen it in this session? 
                    // Better: check `readBy` array in doc.
                    const isRead = data.readBy?.includes(user.id);

                    if (!isRead) {
                        setNotifications(prev => [...prev, data]);
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user?.id]);

    // Queue Processor
    useEffect(() => {
        if (notifications.length > 0 && !currentNotification) {
            const next = notifications[0];
            setCurrentNotification(next);
            setNotifications(prev => prev.slice(1));

            // Mark as read in backend
            markAsRead(next.id);

            // Auto dismiss
            setTimeout(() => {
                setCurrentNotification(null);
            }, 6000);
        }
    }, [notifications, currentNotification]);

    const markAsRead = async (id: string) => {
        try {
            if (!user?.id) return;
            const ref = doc(db, 'system_messages', id);
            await updateDoc(ref, {
                readBy: arrayUnion(user.id)
            });
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    return (
        <AnimatePresence>
            {currentNotification && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.8 }}
                    className="fixed top-24 right-4 z-[100] w-96 p-4 rounded-2xl bg-[#121820]/95 backdrop-blur-md border border-accent-gold/50 shadow-[0_0_30px_rgba(191,160,90,0.2)] flex items-center gap-4"
                    dir="rtl"
                >
                    <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center text-4xl border-2 border-accent-gold animate-bounce">
                        🏆
                    </div>
                    <div>
                        <div className="text-[10px] text-accent-gold font-bold uppercase tracking-widest mb-1">
                            إنجاز جديد!
                        </div>
                        <h4 className="text-white font-black text-lg leading-tight">
                            {currentNotification.title}
                        </h4>
                        <div className="text-gray-300 text-xs mt-1">
                            {currentNotification.message}
                        </div>
                        {currentNotification.meta?.points && (
                            <div className="mt-2 inline-block bg-accent-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                +{currentNotification.meta.points} SP
                            </div>
                        )}
                    </div>
                    {/* Progress Bar (Timer) */}
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-accent-gold block"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
