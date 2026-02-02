import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTeamRanking } from '../../hooks/useTeamRanking';
import { TOKENS } from '../../lib/gamification';

const MyTeam: React.FC = () => {
    const { user, activeTeam } = useAuth();
    const { sortedTeams, teamMembers, loading } = useTeamRanking();

    if (!user || !activeTeam) return null;

    // Use a skeleton or minimal loading state
    if (loading) return (
        <div className="rounded-3xl p-6 border border-white/5 bg-[#121820] animate-pulse h-[250px] flex items-center justify-center">
            <div className="text-gray-600 text-sm">جاري تحميل بيانات الفريق...</div>
        </div>
    );

    // Find full ranked team object
    const rankedTeam = sortedTeams.find(t => t.id === activeTeam.id);
    const members = teamMembers[activeTeam.id] || [];

    // Display Members (Hook already handles Admin exclusion in members list)
    const displayMembers = members;

    if (!rankedTeam) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
                relative p-6 rounded-3xl overflow-hidden border border-white/10
                bg-gradient-to-br ${rankedTeam.color}
            `}
            dir="rtl"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-xs font-bold text-white/60 mb-1">فريقي</div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">
                            {rankedTeam.name}
                        </h2>

                        <div className="flex items-center gap-3 mt-2">
                            <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                                <span className="text-xs text-gray-300 ml-1">الترتيب:</span>
                                <span className={`text-sm font-bold ${rankColor(rankedTeam.rank)}`}>
                                    #{rankedTeam.displayRank || '-'}
                                </span>
                            </div>
                            <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/10">
                                <span className="text-xs text-gray-300 ml-1">الأعضاء:</span>
                                <span className="text-sm font-bold text-white">{displayMembers.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end pt-5">
                        <span className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
                            {(rankedTeam.points || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mr-1">
                            مجموع النقاط
                        </span>
                    </div>
                </div>

                {/* Team Members Preview */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    {displayMembers.length > 0 ? (
                        <>
                            <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
                                أبطال الفريق
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {displayMembers.slice(0, 8).map((m) => {
                                    const isMe = m.id === user.id;
                                    return (
                                        <div key={m.id} className="relative group">
                                            <img
                                                src={m.avatar || '/assets/brand/logo.png'}
                                                alt={m.name}
                                                className={`
                                                    w-10 h-10 rounded-full object-cover border-2 
                                                    ${isMe ? 'border-[#D4AF37] scale-110 z-10' : 'border-white/10 opacity-70 group-hover:opacity-100'}
                                                    transition-all duration-200
                                                `}
                                                title={m.name}
                                            />
                                            {isMe && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />}
                                        </div>
                                    );
                                })}
                                {displayMembers.length > 8 && (
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 border-2 border-transparent">
                                        +{displayMembers.length - 8}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-2 text-white/60 text-sm">
                            الفريق لسه بيتكوّن.. <br />
                            لما صحابك ينضمّوا القوة هتظهر 🔥
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Helper for Rank Color
function rankColor(rank: number | null) {
    if (rank === 1) return "text-[#D4AF37]"; // Gold
    if (rank === 2) return "text-gray-300"; // Silver
    if (rank === 3) return "text-amber-700"; // Bronze
    return "text-white";
}

export default MyTeam;
