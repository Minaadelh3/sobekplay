
import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

interface AudienceSelectorProps {
    audience: any;
    setAudience: (audience: any) => void;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({ audience, setAudience }) => {
    const { checkHealth, getUsersStats } = usePushNotifications();
    const [health, setHealth] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Targeting State
    const [mode, setMode] = useState<'ALL' | 'TEAM' | 'USER' | 'TEST'>('ALL');
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setIsLoading(true);
        // Sequential fetch to avoid racebox if one is slow
        const load = async () => {
            try {
                const healthData = await checkHealth();
                setHealth(healthData);
                const statsData = await getUsersStats();
                setStats(statsData);
                if (statsData?.users) setUsers(statsData.users);
            } catch (e) {
                console.error("Audience load error", e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Effect: Sync local mode to parent audience prop
    useEffect(() => {
        if (mode === 'ALL') {
            setAudience({ type: 'All' });
        } else if (mode === 'TEAM') {
            // We'll target SpecificUsers who belong to this team
            if (selectedTeam) {
                const teamUsers = users.filter(u => u.teamId === selectedTeam).map(u => u.id);
                setAudience({ type: 'SpecificUsers', userIds: teamUsers });
            } else {
                setAudience({ type: 'SpecificUsers', userIds: [] }); // No team selected
            }
        } else if (mode === 'USER') {
            setAudience({ type: 'SpecificUsers', userIds: selectedUserIds });
        } else if (mode === 'TEST') {
            // Test mode logic handling - Parent handles include_player_ids logic on send
            setAudience({ type: 'Test', include_player_ids: [] });
        }
    }, [mode, selectedTeam, selectedUserIds, users]);

    // Computation for Stats Display
    const getReachCount = () => {
        if (mode === 'ALL') return stats?.stats?.messageable_users || 0;
        if (mode === 'TEAM') return users.filter(u => u.teamId === selectedTeam && u.isSubscribed).length;
        if (mode === 'USER') return selectedUserIds.length;
        if (mode === 'TEST') return 1;
        return 0;
    };

    const getDisabledCount = () => {
        if (mode === 'ALL') return (stats?.stats?.total_users || 0) - (stats?.stats?.messageable_users || 0); // Rough estimate
        if (mode === 'TEAM') return users.filter(u => u.teamId === selectedTeam && !u.isSubscribed).length;
        if (mode === 'USER') return users.filter(u => selectedUserIds.includes(u.id) && !u.isSubscribed).length;
        return 0;
    };

    const handleUserToggle = (uid: string) => {
        setSelectedUserIds(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]);
    };

    const filteredUsers = users.filter(u =>
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) return <div className="p-6 text-center text-gray-500">Loading Audience Data...</div>;

    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">🎯 Audience Targeting</h3>
                {health?.status === 'online' || health?.status === 'client-side-only' ? (
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                        ● {health?.status === 'client-side-only' ? 'Client-Side Mode' : 'System Online'}
                    </span>
                ) : (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 animate-pulse">● System Offline</span>
                )}
            </div>

            {/* Mode Switch */}
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1 rounded-lg">
                {['ALL', 'TEAM', 'USER', 'TEST'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m as any)}
                        className={`py-2 text-xs font-bold rounded-md transition-all ${mode === m ? 'bg-accent-gold text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {m === 'ALL' ? '🌍 ALL USERS' : m === 'TEAM' ? '🏢 TEAM' : m === 'USER' ? '👤 SPECIFIC' : '🧪 TEST'}
                    </button>
                ))}
            </div>

            {/* Mode Content */}
            <div className="space-y-4 min-h-[150px]">
                {mode === 'ALL' && (
                    <div className="text-center py-6 space-y-2">
                        <div className="text-4xl font-black text-white">{getReachCount()}</div>
                        <div className="text-sm text-gray-400">Total Subscribed Users</div>
                        <p className="text-xs text-gray-600 max-w-xs mx-auto">This will verify delivery to all active devices registered in OneSignal.</p>
                    </div>
                )}

                {mode === 'TEAM' && (
                    <div className="space-y-4">
                        <label className="text-xs text-gray-400 uppercase tracking-widest">Select Team</label>
                        <div className="flex flex-wrap gap-2">
                            {['tout', 'ptah', 'amon', 'ra', 'uncle_joy'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTeam(t)}
                                    className={`px-3 py-2 rounded border text-sm capitalize ${selectedTeam === t ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                                >
                                    {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        {selectedTeam && (
                            <div className="bg-black/20 p-3 rounded border border-white/5 flex gap-4 text-xs">
                                <div>
                                    <span className="block text-gray-500">Total Members</span>
                                    <span className="text-white font-bold text-lg">{users.filter(u => u.teamId === selectedTeam).length}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Reachable</span>
                                    <span className="text-green-400 font-bold text-lg">{getReachCount()}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Disabled</span>
                                    <span className="text-red-400 font-bold text-lg">{getDisabledCount()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'USER' && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Search user by name or email..."
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-gold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserToggle(user.id)}
                                    className={`flex items-center justify-between p-2 rounded cursor-pointer border ${selectedUserIds.includes(user.id) ? 'bg-accent-gold/10 border-accent-gold/50' : 'border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUserIds.includes(user.id) ? 'bg-accent-gold border-accent-gold' : 'border-gray-600'}`}>
                                            {selectedUserIds.includes(user.id) && <span className="text-black text-[10px] font-bold">✓</span>}
                                        </div>
                                        <img src={user.avatar || '/profile/placeholder.png'} className="w-8 h-8 rounded-full bg-gray-800" />
                                        <div>
                                            <div className="text-sm text-white font-medium">{user.name}</div>
                                            <div className="text-[10px] text-gray-500">{user.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {user.isSubscribed ? (
                                            <span className="text-[10px] text-green-400 flex items-center gap-1">🔔 ON</span>
                                        ) : (
                                            <span className="text-[10px] text-red-500 flex items-center gap-1">🔕 OFF</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            Selected: <span className="text-white font-bold">{selectedUserIds.length}</span>
                        </div>
                    </div>
                )}

                {mode === 'TEST' && (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto text-2xl">🧪</div>
                        <div className="text-sm text-gray-300">
                            Send a test notification to <span className="font-bold text-white">YOUR device</span> only.
                        </div>
                        <p className="text-xs text-gray-500">This does not verify if other users can receive notifications via OneSignal logic, but it checks if the API pipeline works.</p>
                    </div>
                )}
            </div>

            {/* Health Warning Block */}
            {health?.status !== 'online' && health?.status !== 'client-side-only' && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-xs text-red-400">
                    ⚠ <b>System Status:</b> {health?.error || 'Checking...'} (If persistent, check backend logs)
                </div>
            )}
        </div>
    );
};

export default AudienceSelector;
