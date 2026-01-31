import React, { useState } from 'react';
import { TEAMS, TeamProfile } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import PinModal from '../components/PinModal';
import { motion } from 'framer-motion';
import { ToutIcon, AnkhIcon, AmonIcon, RaIcon } from '../components/icons/teams/TeamIcons';

import { UNCLE_JOY_AVATAR as JOY_IMG } from '../lib/avatars';

const TeamAvatar = ({ team }: { team: TeamProfile }) => {
    // Check for admin role or specific ID
    if (team.id === 'uncle_joy' || (team as any).role === 'admin') {
        return (
            <img
                src={team.avatar} // Use source from TEAMS definition
                alt={team.name}
                className="w-full h-full object-cover rounded-xl"
            />
        );
    }

    // Default: Check if avatar is an image path (starts with /) or fallback to icons
    if (team.avatar && team.avatar.startsWith('/')) {
        return (
            <img
                src={team.avatar}
                alt={team.name}
                className="w-full h-full object-cover rounded-xl"
            />
        );
    }

    switch (team.id) {
        case 'tout': return <ToutIcon />;
        case 'ankh': return <AnkhIcon />;
        case 'amon': return <AmonIcon />;
        case 'ra': return <RaIcon />;
        default: return null;
    }
};

export default function ProfileSelectionPage() {
    const { user } = useAuth();
    const [verifyingTeam, setVerifyingTeam] = useState<TeamProfile | null>(null);

    return (
        <div className="min-h-screen bg-[#070A0F] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans" dir="rtl">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#08111A] to-[#0B5D4B]/20 z-0" />
            <div className="absolute inset-0 bg-[url('/assets/brand/pattern.png')] opacity-5 pointer-events-none" />

            <div className="z-10 text-center mb-12 animate-fade-in-down">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
                    بدورك مين؟
                </h1>
                <p className="text-gray-400 text-lg">
                    اختار فريقك عشان تبدأ اللعب
                </p>
            </div>

            {/* Profiles Grid */}
            <div className="z-10 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 max-w-5xl mx-auto px-4">
                {TEAMS.map((team) => (
                    <motion.div
                        key={team.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVerifyingTeam(team)}
                        className="group flex flex-col items-center cursor-pointer"
                    >
                        <div className={`
                            w-24 h-24 md:w-32 md:h-32 rounded-2xl mb-4 
                            bg-gradient-to-br ${team.color} p-1
                            shadow-2xl transition-all duration-300
                            group-hover:shadow-[0_0_25px_rgba(191,160,90,0.5)]
                            group-hover:ring-2 group-hover:ring-accent-gold
                            relative overflow-hidden
                        `}>
                            <TeamAvatar team={team} />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg md:text-xl font-bold text-gray-300 group-hover:text-white transition-colors">
                                {team.name}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* PIN Modal */}
            {verifyingTeam && (
                <PinModal
                    team={verifyingTeam}
                    onClose={() => setVerifyingTeam(null)}
                />
            )}

            {/* Sign Out Button */}
            <div className="z-10 mt-12 pb-8">
                <button
                    onClick={() => user && useAuth().logout()}
                    className="text-gray-500 hover:text-red-400 transition-colors text-sm font-bold flex items-center gap-2"
                >
                    <span>تسجيل الخروج من الحساب</span>
                    <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
            </div>
        </div>
    );
}
