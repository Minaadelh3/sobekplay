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
            <div className="bg-red-900/10 border border-red-500/30 p-4 lg:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                        <span className="text-3xl lg:text-4xl">⚡</span> MISSION CONTROL
                    </h1>
                    <p className="text-red-400 font-mono text-[10px] lg:text-sm mt-1 tracking-widest uppercase opacity-80">
                        God Mode Active • Authorized Personnel Only
                    </p>
                    <p className="hidden md:block text-xs text-gray-500 mt-2 max-w-md">
                        <span className="font-bold text-accent-gold">TIP:</span> Use this panel to manage team scores, broadcasts, and season resets. Actions here are immediate and affect all users.
                    </p>
                </div>

                {can(user, 'manage_teams') && (
                    <div className="text-center group relative w-full md:w-auto">
                        <button
                            onClick={resetSeason}
                            disabled={godLoading}
                            className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all flex items-center justify-center gap-3 border border-red-400 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <span className="text-xl lg:text-2xl group-hover:rotate-180 transition-transform duration-500">☢️</span>
                            <div className="text-left">
                                <div className="leading-none text-[10px] opacity-80 uppercase tracking-widest">Danger Zone</div>
                                <div className="text-base lg:text-lg uppercase">Reset Season</div>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* --- Live Scoreboard --- */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {sortedTeams.map((team, idx) => (
                    <div key={team.id} className={`
                        p-3 lg:p-4 rounded-lg border flex flex-col items-center justify-center relative group cursor-help transition-all
                        ${team.id === 'uncle_joy' ? 'border-purple-500/30 bg-purple-900/10' : 'border-white/5 bg-black/40'}
                     `}>
                        <div className="text-[10px] text-gray-500 font-mono mb-0.5 lg:mb-1">#{idx + 1}</div>
                        <div className="font-bold text-gray-300 text-xs lg:text-sm truncate w-full text-center">{team.name}</div>
                        <div className="text-lg lg:text-2xl font-black text-white font-mono">{(team.points || 0).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            {/* --- Team Units --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {displayTeams.map(team => {
                    const isUncleJoy = team.id === 'uncle_joy';
                    const membersCount = users.filter(u => u.teamId === team.id).length;

                    return (
                        <div key={team.id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl lg:rounded-3xl overflow-hidden relative group transition-all hover:border-white/20">
                            {/* Color Bar */}
                            <div className={`h-1.5 lg:h-2 w-full bg-gradient-to-r ${team.color || 'from-gray-700 to-gray-900'}`} />

                            <div className="p-4 lg:p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4 lg:mb-8">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                                            <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-lg lg:text-2xl font-bold text-white truncate">{team.name}</h3>
                                            <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest truncate">
                                                ID: {team.id}
                                            </div>
                                        </div>
                                    </div>
                                    {isUncleJoy && <span className="px-2 lg:px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-[8px] lg:text-[10px] font-bold uppercase border border-purple-500/30 shrink-0">Admin</span>}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
                                    <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/stat relative cursor-help">
                                        <div className="text-[8px] lg:text-[10px] uppercase text-gray-500 font-bold mb-0.5 lg:mb-1">Score</div>
                                        <div className="text-xl lg:text-3xl font-black text-white font-mono">
                                            {(team.points || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group/stat relative cursor-help">
                                        <div className="text-[8px] lg:text-[10px] uppercase text-gray-500 font-bold mb-0.5 lg:mb-1">Operatives</div>
                                        <div className="text-xl lg:text-3xl font-black text-white font-mono">
                                            {membersCount}
                                        </div>
                                    </div>
                                </div>

                                {/* GOD MODE CONTROLS */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] uppercase text-gray-600 font-bold tracking-widest pl-1">Strategic Operations</div>
                                        <div className="hidden lg:block text-[10px] text-accent-gold/50 italic">Updates are instant</div>
                                    </div>

                                    {/* Presets */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { val: -100, label: '-100', color: 'red' },
                                            { val: -10, label: '-10', color: 'red' },
                                            { val: 10, label: '+10', color: 'green' },
                                            { val: 100, label: '+100', color: 'green' }
                                        ].map(preset => (
                                            <button
                                                key={preset.val}
                                                onClick={() => updateTeamScore(team.id, preset.val)}
                                                disabled={godLoading}
                                                className={`p-2.5 lg:p-3 rounded-xl font-bold border transition-all disabled:opacity-50 text-[10px] lg:text-xs active:scale-95
                                                    ${preset.color === 'red'
                                                        ? 'bg-red-900/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'
                                                        : 'bg-green-900/10 text-green-500 border-green-500/20 hover:bg-green-500 hover:text-white'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Input */}
                                    <div className="bg-black/20 p-1.5 lg:p-2 rounded-xl flex items-center gap-2 border border-white/5">
                                        <input
                                            type="number"
                                            placeholder="Custom..."
                                            value={customPoints[team.id] || ''}
                                            onChange={(e) => handleCustomPointChange(team.id, e.target.value)}
                                            className="min-w-0 flex-1 bg-transparent border-none text-white text-xs lg:text-sm focus:ring-0 placeholder-gray-700 font-mono pl-2"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => applyCustomPoints(team.id, -1)}
                                                disabled={godLoading || !customPoints[team.id]}
                                                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                -
                                            </button>
                                            <button
                                                onClick={() => applyCustomPoints(team.id, 1)}
                                                disabled={godLoading || !customPoints[team.id]}
                                                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-white/5 mt-4">
                                        <button
                                            onClick={() => setSelectedTeam(team)}
                                            className="flex-1 py-3 lg:py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[10px] lg:text-sm transition-colors active:scale-95"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => setBroadcastTeam({ id: team.id, name: team.name })}
                                            className="px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl bg-accent-gold/10 hover:bg-accent-gold hover:text-black text-accent-gold font-bold transition-all active:scale-95"
                                            title="Broadcast Message"
                                        >
                                            📢
                                        </button>
                                        <button
                                            onClick={() => resetTeam(team.id)}
                                            disabled={godLoading}
                                            className="px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold transition-all disabled:opacity-50 active:scale-95"
                                            title="Reset Team"
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
