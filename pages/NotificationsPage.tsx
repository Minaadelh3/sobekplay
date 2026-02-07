import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNotification, NotificationItem } from '../context/NotificationContext';

export default function NotificationsPage() {
    const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotification();

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
                        {notifications.map((note: NotificationItem, idx) => {
                            const isRead = note.isRead;
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
