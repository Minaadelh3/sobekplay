import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeamRanking } from '../hooks/useTeamRanking';

const TeamRankList = () => {
    const { sortedTeams, teamMembers, loading, error } = useTeamRanking();

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 mt-8 mb-12">
                <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:pb-0">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="min-w-[280px] h-32 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) return null;

    return (
        <section className="relative z-20 max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                    {sortedTeams.map((team, index) => {
                        const isNonScorable = team.rank === null;
                        const members = teamMembers[team.id] || [];
                        const isTop3 = team.rank && team.rank <= 3;

                        // Card Styles based on Rank
                        let borderColor = "border-white/5";
                        let bgColor = "bg-[#121212]/90";
                        let rankBadgeColor = "text-gray-400 bg-white/5";

                        if (isTop3) {
                            if (team.rank === 1) {
                                borderColor = "border-yellow-500/30";
                                bgColor = "bg-gradient-to-b from-[#222] to-[#1a1a0d]"; // Subtle Gold tint
                                rankBadgeColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                            } else if (team.rank === 2) {
                                borderColor = "border-gray-400/20";
                                bgColor = "bg-gradient-to-b from-[#222] to-[#1a1a1a]";
                                rankBadgeColor = "text-gray-300 bg-white/10 border-white/20";
                            } else if (team.rank === 3) {
                                borderColor = "border-amber-700/30";
                                bgColor = "bg-gradient-to-b from-[#222] to-[#1a100a]"; // Subtle Bronze tint
                                rankBadgeColor = "text-amber-500 bg-amber-700/10 border-amber-700/20";
                            }
                        } else if (isNonScorable) {
                            borderColor = "border-blue-500/20";
                            bgColor = "bg-[#0f111a]/95"; // Slight blue tint for admin
                        }

                        return (
                            <motion.div
                                key={team.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, type: "spring", bounce: 0 }}
                                className={`
                                    relative flex flex-col justify-between p-5 rounded-2xl border backdrop-blur-md overflow-hidden group
                                    transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-opacity-50
                                    ${borderColor} ${bgColor} min-h-[160px] cursor-pointer
                                `}
                            >
                                {/* Hover Gradient Overlay */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                                    style={{ background: `linear-gradient(45deg, ${team.color || '#333'}, transparent)` }}
                                />

                                {/* HEADER: Name & Rank */}
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold text-white leading-tight tracking-tight group-hover:text-accent-gold transition-colors">
                                            {team.name}
                                        </h3>
                                        <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-2 rounded-full hidden" />
                                    </div>

                                    {!isNonScorable && (
                                        <div className={`
                                            flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-black font-mono shadow-inner
                                            ${rankBadgeColor}
                                        `}>
                                            <span className="scale-110">{team.displayRank}</span>
                                        </div>
                                    )}
                                </div>

                                {/* BODY: Members */}
                                <div className="flex-1 flex items-center relative z-10 min-h-[40px]">
                                    {members.length > 0 ? (
                                        <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300 p-1 -ml-1">
                                            {members.slice(0, 5).map((m, i) => (
                                                <div
                                                    key={m.id}
                                                    className="relative w-9 h-9 rounded-full border-2 border-[#181818] bg-gray-800 z-0 hover:z-20 hover:scale-110 transition-transform shadow-lg"
                                                    style={{ zIndex: 10 - i }}
                                                >
                                                    <img
                                                        src={m.photoURL || m.avatar || '/assets/brand/logo.png'}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/brand/logo.png'; }}
                                                        alt={m.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </div>
                                            ))}
                                            {members.length > 5 && (
                                                <div className="w-9 h-9 rounded-full border-2 border-[#181818] bg-[#222] flex items-center justify-center text-[10px] text-gray-400 font-bold z-0">
                                                    +{members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500/80 font-medium italic">
                                            No active members yet
                                        </span>
                                    )}
                                </div>

                                {/* FOOTER: Points / Status */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                    {isNonScorable ? (
                                        <div className="flex items-center gap-2 text-blue-400/70">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className="text-[10px] uppercase font-bold tracking-widest">
                                                Not a scoring team
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-baseline gap-1.5 group-hover:scale-105 transition-transform origin-left">
                                            <span className="text-2xl font-black text-accent-gold font-mono tracking-tight leading-none drop-shadow-lg">
                                                {(team.points || 0).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                PTS
                                            </span>
                                        </div>
                                    )}

                                    {/* Subtle decorative arrow for tappability */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 text-gray-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default TeamRankList;
