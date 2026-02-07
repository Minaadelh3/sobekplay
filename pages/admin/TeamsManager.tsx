import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import { TEAMS } from '../../types/auth'; // Fallback
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/permissions';
import PointsControlPanel from '../../components/admin/PointsControlPanel';
import TeamDetailDrawer from '../../components/admin/TeamDetailDrawer';
import { useGodMode } from '../../hooks/useGodMode';
import TeamMessageDialog from '../../components/admin/TeamMessageDialog';



export default function TeamsManager() {
    const { teams, users, fetchTeams, fetchUsers } = useAdminData();
    const { updateTeamScore, resetTeam, resetSeason, loading: godLoading } = useGodMode();
    const { user } = useAuth();

    const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
    const [broadcastTeam, setBroadcastTeam] = useState<{ id: string, name: string } | null>(null);
    const [customPoints, setCustomPoints] = useState<Record<string, string>>({});
    const { sendTeamBroadcast } = useAdminData();

    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    const displayTeams = teams.length > 0 ? teams : TEAMS;

    // Sort: Uncle Joy last, then by Rank/Points
    const sortedTeams = [...displayTeams].sort((a, b) => {
        if (a.id === 'uncle_joy') return 1;
        if (b.id === 'uncle_joy') return -1;
        return (b.points || 0) - (a.points || 0);
    });

    const handleCustomPointChange = (teamId: string, value: string) => {
        setCustomPoints(prev => ({ ...prev, [teamId]: value }));
    };

    const applyCustomPoints = (teamId: string, multiplier: number) => {
        const val = parseInt(customPoints[teamId] || '0');
        if (!val || isNaN(val)) return;
        updateTeamScore(teamId, val * multiplier);
        setCustomPoints(prev => ({ ...prev, [teamId]: '' }));
    };

    return (
        <div className="space-y-8 relative min-h-screen pb-20">
            {/* --- Global Command Bar --- */}
            <div className="bg-red-900/10 border border-red-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <span className="text-4xl">⚡</span> MISSION CONTROL
                    </h1>
                    <p className="text-red-400 font-mono text-sm mt-1 tracking-widest uppercase opacity-80">
                        God Mode Active • Authorized Personnel Only
                    </p>
                    <p className="text-xs text-gray-500 mt-2 max-w-md">
                        <span className="font-bold text-accent-gold">TIP:</span> Use this panel to manage team scores, broadcasts, and season resets. Actions here are immediate and affect all users.
                    </p>
                </div>

                {can(user, 'manage_teams') && (
                    <div className="text-center group relative">
                        <button
                            onClick={resetSeason}
                            disabled={godLoading}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all flex items-center gap-3 border border-red-400 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <span className="text-2xl group-hover:rotate-180 transition-transform duration-500">☢️</span>
                            <div className="text-left">
                                <div className="leading-none text-xs opacity-80 uppercase tracking-widest">Danger Zone</div>
                                <div className="text-lg">RESET SEASON</div>
                            </div>
                        </button>
                        <div className="absolute top-full mt-2 left-0 right-0 text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-center mt-2">
                            Set all scores to 0 (Irreversible)
                        </div>
                    </div>
                )}
            </div>

            {/* --- Live Scoreboard --- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {sortedTeams.map((team, idx) => (
                    <div key={team.id} className={`
                        p-4 rounded-lg border flex flex-col items-center justify-center relative group cursor-help
                        ${team.id === 'uncle_joy' ? 'border-purple-500/30 bg-purple-900/10' : 'border-white/5 bg-black/40'}
                     `}>
                        <div className="text-xs text-gray-500 font-mono mb-1">#{idx + 1}</div>
                        <div className="font-bold text-gray-300">{team.name}</div>
                        <div className="text-2xl font-black text-white font-mono">{(team.points || 0).toLocaleString()}</div>
                        <div className="absolute inset-x-0 bottom-full mb-2 bg-black/90 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none z-10">
                            Current live ranking based on total points
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Team Units --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {displayTeams.map(team => {
                    const isUncleJoy = team.id === 'uncle_joy';
                    const membersCount = users.filter(u => u.teamId === team.id).length;

                    return (
                        <div key={team.id} className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden relative group">
                            {/* Color Bar */}
                            <div className={`h-2 w-full bg-gradient-to-r ${team.color || 'from-gray-700 to-gray-900'}`} />

                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{team.name}</h3>
                                            <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                                                ID: {team.id}
                                            </div>
                                        </div>
                                    </div>
                                    {isUncleJoy && <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-bold uppercase border border-purple-500/30">Admin Unit</span>}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/stat relative cursor-help">
                                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Score</div>
                                        <div className="text-3xl font-black text-white font-mono">
                                            {(team.points || 0).toLocaleString()}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-2xl text-[10px] text-gray-300">
                                            Total Points
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/stat relative cursor-help">
                                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Operatives</div>
                                        <div className="text-3xl font-black text-white font-mono">
                                            {membersCount}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-2xl text-[10px] text-gray-300">
                                            Active Members
                                        </div>
                                    </div>
                                </div>

                                {/* GOD MODE CONTROLS */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] uppercase text-gray-600 font-bold tracking-widest pl-1">Quick Actions</div>
                                        <div className="text-[10px] text-accent-gold/50 italic">Updates are instant</div>
                                    </div>

                                    {/* Presets */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => updateTeamScore(team.id, -100)}
                                            disabled={godLoading}
                                            className="p-3 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold border border-red-500/20 transition-all disabled:opacity-50 text-xs"
                                            title="Subtract 100 points"
                                        >
                                            -100
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, -10)}
                                            disabled={godLoading}
                                            className="p-3 bg-red-900/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold border border-red-500/10 transition-all disabled:opacity-50 text-xs"
                                            title="Subtract 10 points"
                                        >
                                            -10
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, 10)}
                                            disabled={godLoading}
                                            className="p-3 bg-green-900/10 text-green-400 hover:bg-green-500 hover:text-white rounded-xl font-bold border border-green-500/10 transition-all disabled:opacity-50 text-xs"
                                            title="Add 10 points"
                                        >
                                            +10
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, 100)}
                                            disabled={godLoading}
                                            className="p-3 bg-green-900/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-bold border border-green-500/20 transition-all disabled:opacity-50 text-xs"
                                            title="Add 100 points"
                                        >
                                            +100
                                        </button>
                                    </div>

                                    {/* Custom Input */}
                                    <div className="bg-black/20 p-2 rounded-xl flex items-center gap-2 border border-white/5">
                                        <input
                                            type="number"
                                            placeholder="Custom amount..."
                                            value={customPoints[team.id] || ''}
                                            onChange={(e) => handleCustomPointChange(team.id, e.target.value)}
                                            className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 placeholder-gray-700 font-mono pl-2"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => applyCustomPoints(team.id, -1)}
                                                disabled={godLoading || !customPoints[team.id]}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Subtract Custom Amount"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => applyCustomPoints(team.id, 1)}
                                                disabled={godLoading || !customPoints[team.id]}
                                                className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Add Custom Amount"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-600 pl-1">
                                        Enter a specific number (e.g., 53) and click + or -
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-white/5 mt-4">
                                        <button
                                            onClick={() => setSelectedTeam(team)}
                                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-colors group/btn relative"
                                        >
                                            Details
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                                                View Member List
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setBroadcastTeam({ id: team.id, name: team.name })}
                                            className="px-4 py-3 rounded-xl bg-accent-gold/10 hover:bg-accent-gold hover:text-black text-accent-gold font-bold transition-all group/btn relative"
                                            title="Broadcast Message"
                                        >
                                            📢
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                                                Send Alert to Team
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => resetTeam(team.id)}
                                            disabled={godLoading}
                                            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition-all disabled:opacity-50 group/btn relative"
                                        >
                                            ☢️
                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                                                Reset Only This Team
                                            </span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedTeam && (
                    <TeamDetailDrawer
                        team={selectedTeam}
                        onClose={() => setSelectedTeam(null)}
                        onUpdate={() => { fetchTeams(); fetchUsers(); setSelectedTeam(null); }}
                    />
                )}
            </AnimatePresence>

            <TeamMessageDialog
                isOpen={!!broadcastTeam}
                onClose={() => setBroadcastTeam(null)}
                onSend={(msg) => sendTeamBroadcast(broadcastTeam!.id, msg)}
                teamName={broadcastTeam?.name || ''}
            />
        </div>
    );
}
