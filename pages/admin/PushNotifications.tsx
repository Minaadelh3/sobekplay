import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminData } from '../../hooks/useAdminData';
import UserAvatar from '../../components/UserAvatar';
import { TEAMS } from '../../types/auth';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PushNotifications = () => {
    // Advanced Data
    const { users, fetchUsers, loading: dataLoading } = useAdminData();
    const [subscribersOnly, setSubscribersOnly] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC_USER' | 'TEAM'>('ALL');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('tout');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string, raw?: string } | null>(null);

    // User Search
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
        // In real app, check u.pushEnabled, but for now we list all and show status
        // const isSubscribed = u.pushEnabled || u.oneSignalId; 
        // if (subscribersOnly && !isSubscribed) return false;

        return matchesSearch;
    });

    // Helper: Get External IDs
    const getTargetExternalIds = () => {
        if (targetType === 'SPECIFIC_USER') return selectedUserIds;
        if (targetType === 'TEAM') {
            return users
                .filter(u => u.teamId === selectedTeamId) // && u.oneSignalId
                .map(u => u.id);
        }
        return [];
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const externalIds = getTargetExternalIds();

        // Validation
        if (targetType !== 'ALL' && externalIds.length === 0) {
            setStatus({ type: 'error', msg: "No users selected (or no users in this team have IDs)" });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    message,
                    targetType,
                    targetId: targetType === 'TEAM' ? selectedTeamId : undefined,
                    externalUserId: externalIds.length > 0 ? externalIds[0] : undefined, // Legacy backend prop
                    include_external_user_ids: externalIds // New prop we'll add to backend
                })
            });

            // Handle Non-JSON (e.g. Vite Localhost Proxy Error 404/500 HTML)
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                throw new Error(`API Error (Not JSON): ${res.statusText}`);
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send');

            setStatus({ type: 'success', msg: `Sent to ${data.recipients || 'users'}!` });


            if (targetType === 'ALL') setMessage('');

        } catch (err: any) {
            console.error("Push Error", err);

            // 1. Connection Refused (Server not running)
            if (err.message === 'Failed to fetch' && window.location.hostname === 'localhost') {
                setStatus({
                    type: 'error',
                    msg: "Connection Failed: Is the API server running?",
                    raw: "Run 'npm run dev:all' to start both frontend and backend."
                });
                return;
            }

            // 2. Proxy Error (Server running but returned HTML/404/500) - Dev Simulation
            if (err.message.includes('API Error') && window.location.hostname === 'localhost') {
                setStatus({
                    type: 'success',
                    msg: `[DEV SIMULATION] Backend error caught. Payload valid via ${targetType}.`,
                    raw: "Backend returned error (check terminal). Simulating success for UI testing."
                });
            } else {
                setStatus({ type: 'error', msg: err.message });
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (id: string) => {
        setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 min-h-screen pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">🔔 Push Notifications</h1>
                    <p className="text-gray-400">Target users, teams, or broadcast to everyone.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0F1218] border border-white/5 rounded-3xl p-8 sticky top-10"
                    >
                        <form onSubmit={handleSend} className="space-y-6">

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 transition-colors font-bold text-lg"
                                    placeholder="Alert Title..."
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 transition-colors resize-none"
                                    placeholder="Write your message here..."
                                />
                            </div>

                            {/* Target Type */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Target Audience</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['ALL', 'TEAM', 'SPECIFIC_USER'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setTargetType(type as any)}
                                            className={`
                                                py-3 px-4 rounded-xl text-sm font-bold border transition-all
                                                ${targetType === type
                                                    ? 'bg-accent-gold text-black border-accent-gold shadow-lg shadow-accent-gold/20'
                                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {type === 'ALL' && '📢 Everyone'}
                                            {type === 'TEAM' && '🏆 Team'}
                                            {type === 'SPECIFIC_USER' && '👤 Users'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Team Selector */}
                            <AnimatePresence>
                                {targetType === 'TEAM' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">Select Team</label>
                                        <div className="flex gap-4 flex-wrap">
                                            {TEAMS.filter(t => t.isScorable).map(team => (
                                                <button
                                                    key={team.id}
                                                    type="button"
                                                    onClick={() => setSelectedTeamId(team.id)}
                                                    className={`
                                                        px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2
                                                        ${selectedTeamId === team.id
                                                            ? 'bg-white/10 border-accent-gold text-white'
                                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                                                        }
                                                    `}
                                                >
                                                    <img src={team.avatar} className="w-5 h-5 rounded-full" />
                                                    {team.name}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Targeting approx. {users.filter(u => u.teamId === selectedTeamId).length} users.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Specific User Feedback */}
                            <AnimatePresence>
                                {targetType === 'SPECIFIC_USER' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 p-4 bg-blue-900/20 border border-blue-900/50 rounded-xl"
                                    >
                                        <p className="text-blue-200 text-sm font-bold text-center">
                                            {selectedUserIds.length} users selected from list →
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Status */}
                            {status && (
                                <div className={`p-4 rounded-xl text-xs font-mono break-all ${status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                                    <strong>{status.msg}</strong>
                                    {status.raw && <div className="mt-2 text-[10px] opacity-70">{status.raw}</div>}
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || (targetType === 'SPECIFIC_USER' && selectedUserIds.length === 0)}
                                    className={`
                                        w-full py-4 rounded-xl font-black text-lg text-black transition-all flex items-center justify-center gap-3 uppercase tracking-wider
                                        ${loading
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-accent-gold hover:scale-[1.02] shadow-xl shadow-accent-gold/20'
                                        }
                                    `}
                                >
                                    {loading ? 'Sending...' : '🚀 Launch Notification'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>

                {/* Right: User Browser (Only for Specific User mode, or just reference) */}
                <div className="lg:col-span-1 flex flex-col h-[600px] bg-[#0F1218] border border-white/5 rounded-3xl overflow-hidden sticky top-10">
                    <div className="p-4 border-b border-white/5 bg-[#14161C]">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">User Directory</h3>
                        <input
                            type="text"
                            placeholder="Search name, email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-accent-gold outline-none"
                        />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setSelectedUserIds([])} className="text-[10px] text-red-400 hover:underline">Clear All</button>
                            {/* <button onClick={() => setSubscribersOnly(!subscribersOnly)} className={`text-[10px] ${subscribersOnly ? 'text-green-400' : 'text-gray-500'}`}>
                                 {subscribersOnly ? 'Subscribers Only' : 'Show All'}
                             </button> */}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                        {dataLoading ? (
                            <div className="p-4 text-center text-gray-500 text-xs animate-pulse">Loading Users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-xs">No users found.</div>
                        ) : (
                            <div className="space-y-1">
                                {filteredUsers.map(user => {
                                    const isSelected = selectedUserIds.includes(user.id);
                                    const isTargeted = targetType === 'ALL' ||
                                        (targetType === 'TEAM' && user.teamId === selectedTeamId) ||
                                        (targetType === 'SPECIFIC_USER' && isSelected);

                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => targetType === 'SPECIFIC_USER' && toggleUser(user.id)}
                                            className={`
                                                flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border
                                                ${isSelected
                                                    ? 'bg-accent-gold/10 border-accent-gold/40'
                                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                                }
                                                ${targetType !== 'SPECIFIC_USER' ? 'opacity-50 pointer-events-none' : ''}
                                                ${isTargeted && targetType !== 'SPECIFIC_USER' ? '!opacity-100 bg-white/5 border-white/10' : ''}
                                            `}
                                        >
                                            <div className="relative">
                                                <UserAvatar src={user.avatar} name={user.name} size="xs" />
                                                {/* Status Dot for Push Enabled (Mocked for now as we sync) */}
                                                {(user as any).pushEnabled && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-black" title="Push Enabled" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                                                <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                                            </div>
                                            {targetType === 'SPECIFIC_USER' && (
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-accent-gold border-accent-gold' : 'border-white/30'}`}>
                                                    {isSelected && <span className="text-black text-[10px]">✓</span>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PushNotifications;
