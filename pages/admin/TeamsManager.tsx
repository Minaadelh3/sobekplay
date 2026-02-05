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
                </div>

                {can(user, 'manage_teams') && (
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
                )}
            </div>

            {/* --- Live Scoreboard --- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {sortedTeams.map((team, idx) => (
                    <div key={team.id} className={`
                        p-4 rounded-lg border flex flex-col items-center justify-center
                        ${team.id === 'uncle_joy' ? 'border-purple-500/30 bg-purple-900/10' : 'border-white/5 bg-black/40'}
                     `}>
                        <div className="text-xs text-gray-500 font-mono mb-1">#{idx + 1}</div>
                        <div className="font-bold text-gray-300">{team.name}</div>
                        <div className="text-2xl font-black text-white font-mono">{(team.points || 0).toLocaleString()}</div>
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
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Score</div>
                                        <div className="text-3xl font-black text-white font-mono">
                                            {(team.points || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Operatives</div>
                                        <div className="text-3xl font-black text-white font-mono">
                                            {membersCount}
                                        </div>
                                    </div>
                                </div>

                                {/* GOD MODE CONTROLS */}
                                <div className="space-y-3">
                                    <div className="text-[10px] uppercase text-gray-600 font-bold tracking-widest pl-1">Quick Actions</div>

                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => updateTeamScore(team.id, -100)}
                                            disabled={godLoading}
                                            className="p-3 bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold border border-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            -100
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, -10)}
                                            disabled={godLoading}
                                            className="p-3 bg-red-900/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold border border-red-500/10 transition-all disabled:opacity-50"
                                        >
                                            -10
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, 10)}
                                            disabled={godLoading}
                                            className="p-3 bg-green-900/10 text-green-400 hover:bg-green-500 hover:text-white rounded-xl font-bold border border-green-500/10 transition-all disabled:opacity-50"
                                        >
                                            +10
                                        </button>
                                        <button
                                            onClick={() => updateTeamScore(team.id, 100)}
                                            disabled={godLoading}
                                            className="p-3 bg-green-900/20 text-green-500 hover:bg-green-500 hover:text-white rounded-xl font-bold border border-green-500/20 transition-all disabled:opacity-50"
                                        >
                                            +100
                                        </button>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setSelectedTeam(team)}
                                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-colors"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => setBroadcastTeam({ id: team.id, name: team.name })}
                                            className="px-4 py-3 rounded-xl bg-accent-gold/10 hover:bg-accent-gold hover:text-black text-accent-gold font-bold transition-all"
                                            title="Broadcast Message"
                                        >
                                            📢
                                        </button>
                                        <button
                                            onClick={() => resetTeam(team.id)}
                                            disabled={godLoading}
                                            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition-all disabled:opacity-50"
                                            title="Reset Team Score"
                                        >
                                            ☢️
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
