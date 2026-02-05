import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function SystemMessagesFeed() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchMessages();
    }, [user]);

    const fetchMessages = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // We need to fetch messages that target:
            // 1. ALL (Global)
            // 2. USER == user.uid
            // 3. TEAM == user.teamId

            // Firestore OR queries are limited, often better to do parallel queries or client filter.
            // Let's do parallel queries for simplicity and speed.

            const globalQ = query(
                collection(db, 'system_messages'),
                where('targetType', '==', 'ALL'),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            const userQ = query(
                collection(db, 'system_messages'),
                where('targetType', '==', 'USER'),
                where('targetId', '==', user.id),
                orderBy('createdAt', 'desc'),
                limit(5)
            );

            let teamQ = null;
            if (user.teamId) {
                teamQ = query(
                    collection(db, 'system_messages'),
                    where('targetType', '==', 'TEAM'),
                    where('targetId', '==', user.teamId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
            }

            const [globalSnap, userSnap, teamSnap] = await Promise.all([
                getDocs(globalQ),
                getDocs(userQ),
                teamQ ? getDocs(teamQ) : Promise.resolve({ docs: [] })
            ]);

            const allMsgs = [
                ...globalSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                ...userSnap.docs.map(d => ({ id: d.id, ...d.data() })),
                // @ts-ignore
                ...teamSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            ].sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 5); // Dedup logic could go here if needed

            setMessages(allMsgs);
        } catch (e) {
            console.error("Message Fetch Error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = (id: string) => {
        // In real app, mark 'readBy' in Firestore. 
        // For now, just hide locally.
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    if (messages.length === 0) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 mb-8 space-y-4">
            <AnimatePresence>
                {messages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-xl border relative shadow-xl backdrop-blur-md overflow-hidden ${msg.type === 'WARNING' ? 'bg-red-500/10 border-red-500/30' :
                            msg.type === 'MISSION' ? 'bg-accent-gold/10 border-accent-gold/30' :
                                'bg-blue-500/10 border-blue-500/20'
                            }`}
                    >
                        {/* Type Indicator */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${msg.type === 'WARNING' ? 'bg-red-500' :
                            msg.type === 'MISSION' ? 'bg-accent-gold' :
                                'bg-blue-500'
                            }`} />

                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <h3 className={`font-bold flex items-center gap-2 ${msg.type === 'WARNING' ? 'text-red-400' :
                                    msg.type === 'MISSION' ? 'text-accent-gold' :
                                        'text-blue-400'
                                    }`}>
                                    <span>
                                        {msg.type === 'WARNING' ? '⚠️' :
                                            msg.type === 'MISSION' ? '🎯' : 'ℹ️'}
                                    </span>
                                    {msg.title}
                                </h3>
                                <p className="text-gray-200 text-sm mt-1 leading-relaxed">
                                    {msg.message}
                                </p>
                                <div className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest flex items-center gap-2">
                                    <span>FROM: {msg.sender || 'SYSTEM'}</span>
                                    <span>•</span>
                                    <span>
                                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('ar-EG') : 'NOW'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDismiss(msg.id)}
                                className="text-gray-500 hover:text-white transition-colors p-1"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
