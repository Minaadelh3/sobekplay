import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { RANK_TIERS, calculateRank, getNextRank, calculateProgress, TOKENS } from '../../lib/gamification';
import { TEAMS } from '../../types/auth';

const MyPoints: React.FC = () => {
    const { user } = useAuth();
    const [points, setPoints] = useState(0);
    const [rank, setRank] = useState(RANK_TIERS[0]);
    const [nextRank, setNextRank] = useState<typeof RANK_TIERS[0] | null>(RANK_TIERS[1]);
    const [progress, setProgress] = useState(0);

    // Fetch real-time points for the user
    useEffect(() => {
        if (!user?.id) return;

        const unsub = onSnapshot(doc(db, "users", user.id), (docS) => {
            const data = docS.data();
            const p = data?.points || 0;
            setPoints(p);

            const r = calculateRank(p);
            const n = getNextRank(r.id);
            const prog = calculateProgress(p);

            setRank(r);
            setNextRank(n);
            setProgress(prog);
        });

        return () => unsub();
    }, [user?.id]);

    if (!user) return null;

    // Resolve Avatar
    let displayAvatar = user.profile?.photoURL || user.avatar;
    if ((!displayAvatar || displayAvatar === "") && user.teamId) {
        const team = TEAMS.find(t => t.id === user.teamId);
        if (team) displayAvatar = team.avatar;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                relative rounded-3xl p-6 shadow-2xl overflow-hidden text-center border border-white/5
                bg-gradient-to-br from-[${TOKENS.colors.bgCard}] to-[${TOKENS.colors.bgPrimary}]
            `}
            style={{ backgroundColor: TOKENS.colors.bgCard }}
            dir="rtl"
        >
            {/* Background Decor */}
            <div className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl -ml-10 -mt-10 opacity-10 bg-[${TOKENS.colors.goldPrimary}]`} />

            <div className="flex flex-col items-center justify-center relative z-10">
                {/* Avatar with Glow */}
                <div className="relative mb-4">
                    <div className={`absolute inset-0 rounded-full blur-md opacity-40 ${rank.color.replace('text-', 'bg-')}`} />
                    <img
                        src={displayAvatar || '/assets/brand/logo.png'}
                        alt={user.name}
                        className="w-20 h-20 rounded-full border-2 border-[#333] object-cover relative z-10"
                    />
                    <div className="absolute -bottom-2 -right-2 text-2xl drop-shadow-md filter grayscale-0">
                        {rank.icon}
                    </div>
                </div>

                {/* Points Counter */}
                <div className="mb-2">
                    <span className={`text-4xl md:text-5xl font-black tracking-tighter text-white`}>
                        {points.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 font-bold mr-2">نقطة</span>
                </div>

                {/* Current Rank Title */}
                <div className={`text-xl font-bold mb-4 tracking-wide ${rank.color}`}>
                    {rank.name}
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs">
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                        <motion.div
                            className={`h-full ${rank.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ backgroundColor: rank.id === 'pro' || rank.id === 'pharaoh' ? TOKENS.colors.goldPrimary : undefined }}
                        />
                    </div>
                </div>

                {/* Motivational Copy */}
                <div className="mt-2 text-sm text-gray-400 font-medium">
                    {nextRank ? (
                        <>
                            فاضلك <span className="text-white font-bold">{nextRank.minPoints - points}</span> نقطة
                            وتطلع <span className={`font-bold ${nextRank.color}`}>{nextRank.name}</span> 💪
                        </>
                    ) : (
                        <span className="text-[#D4AF37] font-bold">أنت وصلت للقمة يا بطل! 👑</span>
                    )}
                </div>

                {/* Tooltip / Helper */}
                <div className="mt-4 text-xs text-gray-600">
                    {nextRank ? rank.nextMsg : "حافظ على مكانك في القمة!"}
                </div>
            </div>
        </motion.div>
    );
};

export default MyPoints;
