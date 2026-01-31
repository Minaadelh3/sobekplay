import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TEAMS } from '../types/auth'; // Ensure UNCLE_JOY is handled or filtered if needed
import { motion } from 'framer-motion';

export default function Leaderboard() {
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'teams'), orderBy('totalPoints', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(doc => {
                    const localDef = TEAMS.find(t => t.id === doc.id);
                    // Filter out Uncle Joy from "Playable" leaderboard if desired, or keep to show dominance
                    if (doc.id === 'uncle_joy') return null;
                    return {
                        id: doc.id,
                        points: doc.data().totalPoints || 0,
                        ...localDef
                    };
                })
                .filter(Boolean)
                .sort((a: any, b: any) => b.points - a.points);

            setTeams(data);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/10 p-4 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> ترتيب الفرق
            </h2>
            <div className="space-y-3">
                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-4 p-3 rounded-xl border border-white/5 relative overflow-hidden
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30' : 'bg-white/5'}
                        `}
                    >
                        {/* Rank */}
                        <div className={`font-black text-2xl w-8 text-center
                             ${index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-gray-300' :
                                    index === 2 ? 'text-orange-400' : 'text-gray-600'}
                        `}>
                            {index + 1}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-lg bg-black/50 p-0.5">
                            <img src={team?.avatar} alt={team?.name} className="w-full h-full object-cover rounded-md" />
                        </div>

                        {/* Name */}
                        <div className="flex-1 font-bold text-white">
                            {team?.name}
                        </div>

                        {/* Points */}
                        <div className="font-mono font-bold text-accent-gold">
                            {team.points.toLocaleString()}
                        </div>

                        {/* Highlight Effect for #1 */}
                        {index === 0 && (
                            <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay pointer-events-none" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
