import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TeamBroadcastListener() {
    const { user } = useAuth();
    const [message, setMessage] = useState<{ id: string, text: string, sender: string } | null>(null);

    useEffect(() => {
        if (!user || !user.teamId) return;

        // Query: Messages for my team, created recently (optional but good), ordered desc
        // We only care about NEW messages arriving while online. 
        // Or unread messages? For now, real-time popups.

        const q = query(
            collection(db, "system_messages"),
            where("type", "==", "team_broadcast"),
            where("targetTeam", "==", user.teamId),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    // Prevent showing old messages on reload (simple check: created within last 30 seconds or verify viewed)
                    // Or keep it simple: Show the latest message if I haven't seen it in this session state?
                    // "added" fires for existing docs on first load.
                    // Improve: check timestamp vs Date.now().

                    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
                    const age = Date.now() - createdAt.getTime();

                    // Show if created in the last minute (Fresh Broadcast)
                    if (age < 60000 * 5) { // 5 minutes buffer
                        // AND check locally if we already showed it to avoid re-show on tab focus logic if using strict mode
                        setMessage({
                            id: change.doc.id,
                            text: data.message,
                            sender: data.sender || 'Admin'
                        });
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user?.teamId]);

    return (
        <AnimatePresence>
            {message && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                        className="bg-[#1a1a1a] border border-accent-gold/50 rounded-2xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(255,215,0,0.2)]"
                    >
                        {/* Audio Notification (Optional) */}
                        {/* <audio src="/sounds/notification.mp3" autoPlay /> */}

                        <div className="w-16 h-16 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-gold/50 text-3xl">
                            📢
                        </div>

                        <h3 className="text-xl font-bold text-accent-gold mb-2">رسالة من القيادة</h3>
                        <p className="text-white text-lg font-medium leading-relaxed mb-6">
                            "{message.text}"
                        </p>

                        <button
                            onClick={() => setMessage(null)}
                            className="w-full py-3 bg-accent-gold text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
                        >
                            علم لوينفذ! 🫡
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
