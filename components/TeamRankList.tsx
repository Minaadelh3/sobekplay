import React from 'react';
import { motion } from 'framer-motion';
import { useTeamRanking } from '../hooks/useTeamRanking';

const TeamRankList = () => {
    const { sortedTeams, teamMembers, loading, error } = useTeamRanking();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
                <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:gap-6 md:pb-0">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="min-w-[140px] h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return null; // Fail gracefully

    return (
        <section className="relative z-20 max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 mb-16">
            <div className="flex flex-col gap-3 md:flex-row md:gap-6">
                {sortedTeams.map((team, index) => {
                    const isUncleJoy = team.id === 'uncle_joy' || team.isScorable === false;
                    const members = teamMembers[team.id] || [];
                    const rank = index + 1;

                    // Rank Colors
                    let rankColor = "text-gray-500";
                    let rankIcon = `#${rank}`;

                    if (!isUncleJoy) {
                        if (index === 0) { rankColor = "text-yellow-400"; rankIcon = "🥇"; }
                        else if (index === 1) { rankColor = "text-gray-300"; rankIcon = "🥈"; }
                        else if (index === 2) { rankColor = "text-amber-600"; rankIcon = "🥉"; }
                    } else {
                        rankIcon = "🛡️"; // Admin/Guard icon
                        rankColor = "text-blue-400";
                    }

                    return (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 group min-h-[80px]
                                ${isUncleJoy
                                    ? 'bg-blue-900/10 border-blue-500/20 w-full md:w-auto md:flex-1'
                                    : 'bg-[#141414] border-white/5 hover:border-accent-gold/40 flex-1'
                                }
                            `}
                        >
                            {/* Background Gradient overlay */}
                            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${team.color} opacity-[0.05]`} />

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 relative z-10">
                                    {/* Rank */}
                                    <span className={`font-black font-mono text-sm ${rankColor} w-6 text-center`}>
                                        {rankIcon}
                                    </span>

                                    {/* Team Avatar */}
                                    <div className={`w-8 h-8 rounded-full p-0.5 bg-gradient-to-b ${team.color}`}>
                                        <img
                                            src={team.avatar?.startsWith('/') ? team.avatar : `/${team.avatar}`}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/assets/brand/logo.png';
                                            }}
                                            alt={team.name}
                                            className="w-full h-full object-cover rounded-full bg-black/50"
                                        />
                                    </div>

                                    {/* Name */}
                                    <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                                        {team.name}
                                    </span>
                                </div>

                                {/* Points badge */}
                                {!isUncleJoy && (
                                    <div className="bg-black/40 border border-white/5 px-2 py-0.5 rounded text-xs">
                                        <span className="text-accent-gold font-mono font-bold">
                                            {team.points || 0}
                                        </span>
                                    </div>
                                )}
                                {isUncleJoy && (
                                    <span className="text-[10px] uppercase font-bold text-blue-400/50 tracking-wider px-2">
                                        Admin
                                    </span>
                                )}
                            </div>

                            {/* Members Avatars (Non-Admin Only) */}
                            {members.length > 0 ? (
                                <div className="flex -space-x-2 rtl:space-x-reverse px-9 overflow-hidden py-1">
                                    {members.slice(0, 5).map(m => (
                                        <img
                                            key={m.id}
                                            src={m.photoURL || m.avatar || '/assets/brand/logo.png'} // Fallback
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/assets/brand/logo.png'; // Double Fallback
                                            }}
                                            alt={m.name}
                                            title={m.name}
                                            className="w-6 h-6 rounded-full border border-[#141414] object-cover bg-gray-800"
                                        />
                                    ))}
                                    {members.length > 5 && (
                                        <div className="w-6 h-6 rounded-full border border-[#141414] bg-gray-800 flex items-center justify-center text-[8px] text-gray-400 font-bold">
                                            +{members.length - 5}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                !isUncleJoy && <div className="px-9 text-[10px] text-gray-600 italic">No Active Members</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default TeamRankList;
