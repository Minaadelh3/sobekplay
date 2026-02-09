import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ACHIEVEMENTS_LIST } from '../../types/achievements';
import { motion } from 'framer-motion';

interface AdminUserProgressionProps {
    userId: string;
    userName: string;
    unlockedIds: string[];
}

export default function AdminUserProgression({ userId, unlockedIds = [] }: AdminUserProgressionProps) {
    const [activeTab, setActiveTab] = useState<'TIMELINE' | 'ACHIEVEMENTS'>('ACHIEVEMENTS');
    const [events, setEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    useEffect(() => {
        if (activeTab === 'TIMELINE') {
            fetchEvents();
        }
    }, [activeTab, userId]);

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            // Index required: events [userId, timestamp DESC]
            // If missing, this might fail or require creation link in console
            const q = query(
                collection(db, 'events'),
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snap = await getDocs(q);
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Error fetching events", e);
        } finally {
            setLoadingEvents(false);
        }
    };

    // Filter unlocked achievements
    const unlockedAchievements = ACHIEVEMENTS_LIST.filter(a => unlockedIds.includes(a.id));
    const lockedAchievements = ACHIEVEMENTS_LIST.filter(a => !unlockedIds.includes(a.id));

    return (
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
                <button
                    onClick={() => setActiveTab('ACHIEVEMENTS')}
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'ACHIEVEMENTS' ? 'bg-white/5 text-accent-gold border-b-2 border-accent-gold' : 'text-gray-500 hover:text-white'}`}
                >
                    Achievements ({unlockedIds.length})
                </button>
                <button
                    onClick={() => setActiveTab('TIMELINE')}
                    className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${activeTab === 'TIMELINE' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-white'}`}
                >
                    Event Log
                </button>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                {activeTab === 'ACHIEVEMENTS' && (
                    <div className="space-y-6">
                        {unlockedAchievements.length > 0 && (
                            <div>
                                <h4 className="text-[10px] text-green-500 font-bold uppercase mb-2">Unlocked</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {unlockedAchievements.map(ach => (
                                        <div key={ach.id} className="bg-green-500/10 border border-green-500/20 p-2 rounded flex items-center gap-3">
                                            <div className="text-xl">{ach.emoji}</div>
                                            <div>
                                                <div className="text-xs font-bold text-white">{ach.title}</div>
                                                <div className="text-[10px] text-green-300">+{ach.xp} XP</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-2">Locked</h4>
                            <div className="grid grid-cols-1 gap-2 opacity-60">
                                {lockedAchievements.map(ach => (
                                    <div key={ach.id} className="bg-white/5 border border-white/5 p-2 rounded flex items-center gap-3 grayscale">
                                        <div className="text-xl">{ach.emoji}</div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-400">{ach.title}</div>
                                            <div className="text-[10px] text-gray-600">{ach.how_to_get}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'TIMELINE' && (
                    <div className="space-y-3">
                        {loadingEvents ? (
                            <div className="text-center text-gray-500 text-xs py-4">Loading Events...</div>
                        ) : events.length === 0 ? (
                            <div className="text-center text-gray-500 text-xs py-4">No events found.</div>
                        ) : (
                            events.map((ev) => (
                                <div key={ev.id} className="flex gap-3 text-xs">
                                    <div className="text-gray-500 font-mono w-16 pt-0.5 text-[10px]">
                                        {ev.timestamp?.toDate ? ev.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </div>
                                    <div className="flex-1 pb-3 border-l border-white/10 pl-3 relative">
                                        <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-blue-500/50" />
                                        <div className="font-bold text-white">{ev.name}</div>
                                        {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                                            <div className="mt-1 bg-black/40 p-1.5 rounded text-[10px] font-mono text-gray-400 break-all">
                                                {JSON.stringify(ev.metadata)}
                                            </div>
                                        )}
                                        {ev.processed && (
                                            <div className="mt-1 flex gap-2">
                                                {ev.result?.xpGained > 0 && <span className="text-green-400 font-bold">+{ev.result.xpGained} XP</span>}
                                                {ev.result?.unlocked?.length > 0 && <span className="text-accent-gold font-bold">🏆 Unlocked {ev.result.unlocked.length}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="text-center pt-2">
                            <p className="text-[10px] text-gray-600">Showing last 20 events</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
