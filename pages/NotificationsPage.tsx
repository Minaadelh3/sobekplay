import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    targetType: 'ALL' | 'TEAM' | 'SPECIFIC_USER';
    targetId?: string;
    createdAt: Timestamp;
    icon?: string;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const ref = collection(db, 'notifications');
                // We fetch specific types in parallel or one complex query?
                // Firestore logical OR is limited. We'll fetch 'ALL' and filter client side 
                // OR fetch 3 queries: 
                // 1. targetType == 'ALL'
                // 2. targetType == 'TEAM' && targetId == user.teamId
                // 3. targetType == 'SPECIFIC_USER' && targetId == user.id

                // For simplicity/perf in small prototype:
                // Fetch last 50 notifications total (ordered by date) and filter in memory?
                // Might miss some if Broadcasts are rare.
                // Better: Run 3 queries.

                const qBroadcast = query(ref, where('targetType', '==', 'ALL'), orderBy('createdAt', 'desc'), limit(20));

                const promises = [getDocs(qBroadcast)];

                if (user.teamId) {
                    const qTeam = query(ref, where('targetType', '==', 'TEAM'), where('targetId', '==', user.teamId), limit(20));
                    promises.push(getDocs(qTeam));
                }

                const qPersonal = query(ref, where('targetType', '==', 'SPECIFIC_USER'), where('targetId', '==', user.id), limit(20));
                promises.push(getDocs(qPersonal));

                const results = await Promise.all(promises);

                let allItems: NotificationItem[] = [];
                results.forEach(snap => {
                    snap.docs.forEach(d => allItems.push({ id: d.id, ...d.data() } as NotificationItem));
                });

                // Dedup (rare but possible if logic overlaps?) & Sort
                const unique = Array.from(new Map(allItems.map(item => [item.id, item])).values());
                unique.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

                setNotifications(unique);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    return (
        <div className="min-h-screen bg-[#070A0F] text-white pb-24 pt-20 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-accent-gold">🔔 التنبيهات</h1>
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
                    {notifications.map((note, idx) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#14161C] border border-white/5 rounded-2xl p-4 relative overflow-hidden"
                        >
                            {/* Type Indicator */}
                            {note.targetType === 'TEAM' && <div className="absolute top-0 right-0 bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">فريقك</div>}
                            {note.targetType === 'SPECIFIC_USER' && <div className="absolute top-0 right-0 bg-accent-gold/20 text-accent-gold text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">شخصي</div>}
                            {note.targetType === 'ALL' && <div className="absolute top-0 right-0 bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">عام</div>}

                            <div className="flex gap-4">
                                <div className="mt-1 text-2xl">
                                    {note.icon || '📢'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-base leading-tight mb-1">{note.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{note.message}</p>
                                    <div className="mt-3 flex justify-between items-end">
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            {note.createdAt ? format(note.createdAt.toDate(), "d MMM - h:mm a", { locale: ar }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
