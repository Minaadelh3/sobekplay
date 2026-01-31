
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '../lib/getAvatarUrl';

interface Message {
    id: string;
    text: string;
    uid: string;
    name: string;
    avatarUrl: string;
    createdAt: Timestamp | null;
}

export default function TeamChatPage() {
    const { user, activeTeam, activePlayer } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [lastSendTime, setLastSendTime] = useState(0);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Subscribe to Team Messages
    useEffect(() => {
        if (!activeTeam?.id) return;

        const q = query(
            collection(db, `teams/${activeTeam.id}/messages`),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeTeam?.id]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const text = newMessage.trim();
        if (!text || !user || !activeTeam) return;
        if (text.length > 280) return alert("الرسالة طويلة جداً (أقصى حد 280 حرف)");

        // Rate Limit (1.5s)
        const now = Date.now();
        if (now - lastSendTime < 1500) return;

        setSending(true);
        try {
            await addDoc(collection(db, `teams/${activeTeam.id}/messages`), {
                text: text,
                uid: user.id,
                name: user.name,
                avatarUrl: user.avatar || '',
                createdAt: serverTimestamp()
            });
            setNewMessage('');
            setLastSendTime(now);
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setSending(false);
        }
    };

    if (!activeTeam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 text-white">
                <div className="text-4xl mb-4">🛡️</div>
                <h2 className="text-xl font-bold mb-2">اختر فريقك الأول</h2>
                <p className="text-gray-400">لازم تنضم لفريق عشان تشارك في الشات</p>
                {/* Redirect or allow selection elsewhere */}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-[#070A0F] relative overflow-hidden">
            {/* Header */}
            <div className={`p-4 bg-gradient-to-r ${activeTeam.color} shadow-lg z-10 flex justify-between items-center`}>
                <div className="flex items-center gap-3">
                    <img src={activeTeam.avatar} alt={activeTeam.name} className="w-10 h-10 rounded-full border-2 border-white/20 bg-black/20" />
                    <div>
                        <h1 className="font-bold text-white text-lg">{activeTeam.name}</h1>
                        <p className="text-white/80 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {activeTeam.totalPoints || 0} نقطة
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-4xl mb-4">💬</p>
                        <p>لسه مفيش رسايل..</p>
                        <p className="text-sm">ابدأ الكلام مع فريقك!</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.uid === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-2`}>
                            <div className={`flex max-w-[80%] ${isMe ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
                                {/* Avatar */}
                                {!isMe && (
                                    <img
                                        src={getAvatarUrl({
                                            avatarUrl: msg.avatarUrl,
                                            role: (msg as any).role ?? ((msg as any).teamId === "uncle_joy" ? "admin" : "user")
                                        })}
                                        className="w-8 h-8 rounded-full bg-gray-700 object-cover mt-1"
                                    />
                                )}

                                <div className={`px-4 py-2 rounded-2xl text-sm break-words
                                    ${isMe
                                        ? `bg-white text-black rounded-tr-none`
                                        : `bg-white/10 text-white rounded-tl-none border border-white/5`
                                    }
                                `}>
                                    {!isMe && <p className={`text-[10px] font-bold mb-1 opacity-70 text-${activeTeam.id === 'ra' ? 'yellow-400' : 'accent-gold'}`}>{msg.name}</p>}
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded-full border border-white/10 focus-within:border-accent-gold transition-colors"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالة لفريقك..."
                        className="flex-1 bg-transparent px-4 py-2 text-white focus:outline-none placeholder-gray-500 dir-rtl text-right"
                        dir="rtl"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className={`p-3 rounded-full transition-all
                            ${newMessage.trim()
                                ? 'bg-accent-gold text-black rotate-0 hover:scale-105'
                                : 'bg-gray-800 text-gray-500 -rotate-90 opacity-50 cursor-not-allowed'
                            }
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
