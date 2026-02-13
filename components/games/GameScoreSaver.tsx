import React, { useState } from 'react';
import { useTeamRanking } from '../../hooks/useTeamRanking';
import { awardPoints } from '../../services/scoring/scoreEngine';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface GameScoreSaverProps {
    gameId: string;
    gameName: string;
    scoreA: number;
    scoreB: number;
    onSaved?: () => void;
}

export const GameScoreSaver: React.FC<GameScoreSaverProps> = ({ gameId, gameName, scoreA, scoreB, onSaved }) => {
    const { user } = useAuth();
    const { sortedTeams, loading } = useTeamRanking();

    // Form State
    const [finalScoreA, setFinalScoreA] = useState(scoreA);
    const [finalScoreB, setFinalScoreB] = useState(scoreB);
    const [teamAId, setTeamAId] = useState<string>('');
    const [teamBId, setTeamBId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Only Admins or Games Moderators should ideally see this, 
    // but for now we'll let it be visible effectively to anyone running the game locally/on-screen.
    // In a real kiosk mode, the user logged in would be an admin.

    const handleSave = async () => {
        if (!teamAId && !teamBId) {
            alert("اختار فريق واحد على الأقل!");
            return;
        }

        if (teamAId && teamBId && teamAId === teamBId) {
            alert("لازم الفريقين يكونوا مختلفين");
            return;
        }

        setIsSubmitting(true);
        try {
            const timestamp = Date.now();

            // Save for Team A
            if (teamAId && finalScoreA !== 0) {
                await awardPoints({
                    teamId: teamAId,
                    userId: user?.teamId === teamAId ? user.id : undefined, // Auto-attribute to user if in team
                    actionType: `GAME_${gameId.toUpperCase()}_RESULT`,
                    points: finalScoreA,
                    idempotencyKey: `GAME:${gameId}:${teamAId}:${timestamp}`,
                    reason: `${gameName} Result`,
                    metadata: { opponentTeamId: teamBId, result: finalScoreA > finalScoreB ? 'WIN' : finalScoreA < finalScoreB ? 'LOSS' : 'DRAW' }
                });
            }

            // Save for Team B
            if (teamBId && finalScoreB !== 0) {
                await awardPoints({
                    teamId: teamBId,
                    userId: user?.teamId === teamBId ? user.id : undefined, // Auto-attribute to user if in team
                    actionType: `GAME_${gameId.toUpperCase()}_RESULT`,
                    points: finalScoreB,
                    idempotencyKey: `GAME:${gameId}:${teamBId}:${timestamp}`,
                    reason: `${gameName} Result`,
                    metadata: { opponentTeamId: teamAId, result: finalScoreB > finalScoreA ? 'WIN' : finalScoreB < finalScoreA ? 'LOSS' : 'DRAW' }
                });
            }

            setSubmitted(true);
            if (onSaved) onSaved();

        } catch (e: any) {
            console.error(e);
            alert("حصلت مشكلة وقت الحفظ: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-white/50 text-sm">Loading teams...</div>;

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-center"
            >
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-green-400 mb-1">تم حفظ النتيجة!</h3>
                <p className="text-white/60 text-sm">النقاط اتضافت للفرق في الـ Leaderboard.</p>
            </motion.div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full max-w-lg mx-auto backdrop-blur-sm">
            <h3 className="text-center text-yellow-500 font-bold font-arabic mb-6 text-xl">
                💾 حفظ النتيجة للفرق
            </h3>

            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Team A Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-blue-400 tracking-widest text-center mb-2">
                        Team A
                    </label>
                    <input
                        type="number"
                        value={finalScoreA}
                        onChange={(e) => setFinalScoreA(parseInt(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-3 py-2 text-white text-center font-black text-2xl outline-none focus:border-blue-500 mb-2"
                    />
                    <select
                        value={teamAId}
                        onChange={(e) => setTeamAId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                        dir="rtl"
                    >
                        <option value="">اختار فريق (Optional)...</option>
                        {sortedTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Team B Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-red-400 tracking-widest text-center mb-2">
                        Team B
                    </label>
                    <input
                        type="number"
                        value={finalScoreB}
                        onChange={(e) => setFinalScoreB(parseInt(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-red-500/30 rounded-xl px-3 py-2 text-white text-center font-black text-2xl outline-none focus:border-red-500 mb-2"
                    />
                    <select
                        value={teamBId}
                        onChange={(e) => setTeamBId(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-500 transition-colors"
                        dir="rtl"
                    >
                        <option value="">اختار فريق (Optional)...</option>
                        {sortedTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSubmitting}
                className={`
                    w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2
                    ${isSubmitting
                        ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:scale-[1.02] hover:brightness-110'
                    }
                `}
            >
                {isSubmitting ? 'جاري الحفظ...' : 'تأكيد وحفظ النقاط 🏆'}
            </button>

            {!user?.role?.includes('ADMIN') && !user?.role?.includes('MODERATOR') && (
                <p className="text-[10px] text-gray-500 text-center mt-4 opacity-50">
                    * يفضل استخدام الخاصية دي عن طريق شخص مسؤول (Kiosk Mode)
                </p>
            )}
        </div>
    );
};
