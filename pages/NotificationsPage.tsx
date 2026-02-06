import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    targetType: 'ALL' | 'TEAM' | 'SPECIFIC_USER';
    targetIds?: string[];
    createdAt: Timestamp;
    icon?: string;
    isRead?: boolean; // Local state
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    // Fetch Read Receipts & Notifications
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Read Receipts first (to map status immediately)
                const receiptsRef = collection(db, `users/${user.id}/read_receipts`);
                const receiptsSnap = await getDocs(receiptsRef);
                const reads = new Set(receiptsSnap.docs.map(d => d.id));
                setReadIds(reads);

                // 2. Fetch Notifications
                const notifRef = collection(db, 'notifications');

                // Parallel Queries for efficiency
                const queries = [
                    // Global
                    query(notifRef, where('targetType', '==', 'ALL'), orderBy('createdAt', 'desc'), limit(50)),
                    // Personal
                    query(notifRef, where('targetType', '==', 'SPECIFIC_USER'), where('targetIds', 'array-contains', user.id), limit(50))
                ];

                if (user.teamId) {
                    // Team
                    queries.push(query(notifRef, where('targetType', '==', 'TEAM'), where('targetId', '==', user.teamId), limit(50)));
                }

                const results = await Promise.all(queries.map(q => getDocs(q)));

                let allItems: NotificationItem[] = [];
                results.forEach(snap => {
                    snap.docs.forEach(d => {
                        allItems.push({ id: d.id, ...d.data() } as NotificationItem);
                    });
                });

                // Dedup
                const unique = Array.from(new Map(allItems.map(item => [item.id, item])).values());

                // Sort by Date Desc
                unique.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                setNotifications(unique);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const markAsRead = async (notification: NotificationItem) => {
        if (!user || readIds.has(notification.id)) return;

        // Optimistic UI Update
        setReadIds(prev => new Set(prev).add(notification.id));

        try {
            await setDoc(doc(db, `users/${user.id}/read_receipts`, notification.id), {
                readAt: serverTimestamp(),
                notificationId: notification.id // redundant but useful
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
            // Revert on failure not strictly necessary for read receipts, but good practice
        }
    };

    const markAllRead = async () => {
        if (!user || notifications.length === 0) return;

        // Filter unread
        const unread = notifications.filter(n => !readIds.has(n.id));
        if (unread.length === 0) return;

        // Optimistic
        const newSet = new Set(readIds);
        unread.forEach(n => newSet.add(n.id));
        setReadIds(newSet);

        // Batch write? Or simple loop for now (Batch limit 500)
        // For < 50 items, loop is fine or batch. implementing batch for correctness.
        // Actually, let's just do it in UI first to feel responsive.

        // Note: In a real app with many items, a batch write is better.
        unread.forEach(n => {
            setDoc(doc(db, `users/${user.id}/read_receipts`, n.id), { readAt: serverTimestamp() });
        });
    };

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    return (
        <div className="min-h-screen bg-[#070A0F] text-white pb-24 pt-20 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-accent-gold">🔔 التنبيهات</h1>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {unreadCount} جديد
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        قراءة الكل
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500">
                    <span className="text-4xl mb-2">📭</span>
                    <p>مفيش تنبيهات جديدة</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.map((note, idx) => {
                            const isRead = readIds.has(note.id);
                            return (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => markAsRead(note)}
                                    className={`
                                        relative border rounded-2xl p-4 overflow-hidden transition-all cursor-pointer group
                                        ${isRead ? 'bg-[#14161C]/50 border-white/5 opacity-70' : 'bg-[#14161C] border-accent-gold/20 shadow-[0_0_15px_-5px_rgba(255,215,0,0.1)]'}
                                    `}
                                >
                                    {/* Unread Dot */}
                                    {!isRead && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                                    )}

                                    {/* Type Badges */}
                                    <div className="absolute top-0 left-0">
                                        {note.targetType === 'TEAM' && <div className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-br-lg font-bold">فريقك</div>}
                                        {note.targetType === 'SPECIFIC_USER' && <div className="bg-accent-gold/20 text-accent-gold text-[10px] px-2 py-0.5 rounded-br-lg font-bold">شخصي</div>}
                                        {note.targetType === 'ALL' && <div className="bg-white/10 text-gray-400 text-[10px] px-2 py-0.5 rounded-br-lg font-bold">عام</div>}
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className={`mt-1 text-2xl p-2 rounded-xl ${isRead ? 'bg-white/5 grayscale' : 'bg-gradient-to-br from-accent-gold/20 to-transparent'}`}>
                                            {note.icon || '📢'}
                                        </div>
                                        <div className="flex-1 pr-2">
                                            <h3 className={`font-bold text-base leading-tight mb-1 ${isRead ? 'text-gray-400' : 'text-white'}`}>
                                                {note.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                                {note.message}
                                            </p>
                                            <div className="mt-3 flex justify-between items-center">
                                                <span className="text-[10px] text-gray-600 font-mono">
                                                    {note.createdAt ? format(note.createdAt.toDate(), "d MMM - h:mm a", { locale: ar }) : ''}
                                                </span>
                                                {!isRead && <span className="text-[10px] text-accent-gold">اضغط للقراءة</span>}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
