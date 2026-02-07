import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    targetType: 'ALL' | 'TEAM' | 'SPECIFIC_USER';
    targetIds?: string[];
    createdAt: Timestamp;
    icon?: string;
    isRead?: boolean; // Local state
}

interface NotificationContextType {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (notification: NotificationItem) => Promise<void>;
    markAllRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    // Fetch Read Receipts & Notifications
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setReadIds(new Set());
            setLoading(false);
            return;
        }

        let unsubscribeReceipts: () => void;

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Live Listener for Read Receipts (to update badge in real-time)
                const receiptsRef = collection(db, `users/${user.id}/read_receipts`);
                unsubscribeReceipts = onSnapshot(receiptsRef, (snap) => {
                    const reads = new Set(snap.docs.map(d => d.id));
                    setReadIds(reads);
                });

                // 2. Fetch Notifications (Start with one-time fetch, maybe make live later if needed)
                // For now, simple fetch is enough as notifications aren't extremely high frequency
                // If we want checking for new notifications, we'd need a more complex listener setup or periodic polling.
                // Given the complexity of merging multiple queries, let's stick to fetch on mount/focus for now, 
                // but we can add a simple poller or just re-fetch on navigation.

                const notifRef = collection(db, 'notifications');
                const sysMsgRef = collection(db, 'system_messages');

                // Parallel Queries for efficiency
                const queries = [
                    // Global Notifications
                    query(notifRef, where('targetType', '==', 'ALL'), orderBy('createdAt', 'desc'), limit(50)),
                    // Personal Notifications
                    query(notifRef, where('targetType', '==', 'SPECIFIC_USER'), where('targetIds', 'array-contains', user.id), limit(50)),
                    // Global System Messages
                    query(sysMsgRef, where('targetType', '==', 'ALL'), orderBy('createdAt', 'desc'), limit(50)),
                    // Personal System Messages
                    query(sysMsgRef, where('targetType', '==', 'USER'), where('targetId', '==', user.id), limit(50))
                ];

                if (user.teamId) {
                    // Team Notifications
                    queries.push(query(notifRef, where('targetType', '==', 'TEAM'), where('targetId', '==', user.teamId), limit(50)));
                    // Team System Messages
                    queries.push(query(sysMsgRef, where('targetType', '==', 'TEAM'), where('targetId', '==', user.teamId), limit(50)));
                }

                const results = await Promise.all(queries.map(q => getDocs(q)));

                let allItems: NotificationItem[] = [];
                results.forEach(snap => {
                    snap.docs.forEach(d => {
                        const data = d.data();
                        let targetType = data.targetType;
                        if (targetType === 'USER') targetType = 'SPECIFIC_USER';

                        // Map System Message Icons
                        let icon = data.icon;
                        if (!icon && data.type) {
                            if (data.type === 'WARNING') icon = '⚠️';
                            else if (data.type === 'MISSION') icon = '🎯';
                            else icon = 'ℹ️';
                        }

                        allItems.push({
                            id: d.id,
                            title: data.title,
                            message: data.message,
                            targetType: targetType, // Cast or map if needed
                            targetIds: data.targetIds,
                            createdAt: data.createdAt,
                            icon: icon,
                        } as NotificationItem);
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

        return () => {
            if (unsubscribeReceipts) unsubscribeReceipts();
        };
    }, [user]);

    const markAsRead = async (notification: NotificationItem) => {
        if (!user || readIds.has(notification.id)) return;

        // Optimistic UI Update (Snapshot listener will confirm it)
        setReadIds(prev => new Set(prev).add(notification.id));

        try {
            await setDoc(doc(db, `users/${user.id}/read_receipts`, notification.id), {
                readAt: serverTimestamp(),
                notificationId: notification.id
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllRead = async () => {
        if (!user || notifications.length === 0) return;

        const unread = notifications.filter(n => !readIds.has(n.id));
        if (unread.length === 0) return;

        // Optimistic
        const newSet = new Set(readIds);
        unread.forEach(n => newSet.add(n.id));
        setReadIds(newSet);

        // Batch write loop
        unread.forEach(n => {
            setDoc(doc(db, `users/${user.id}/read_receipts`, n.id), { readAt: serverTimestamp() });
        });
    };

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    const exposedNotifications = React.useMemo(() => {
        return notifications.map(n => ({
            ...n,
            isRead: readIds.has(n.id)
        }));
    }, [notifications, readIds]);

    return (
        <NotificationContext.Provider value={{ notifications: exposedNotifications, unreadCount, loading, markAsRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
    return ctx;
}
