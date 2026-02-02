import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMatch, joinMatchByCode, quickMatch, VERSUS_GAME_IDS } from '../../lib/versus';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const VersusLobby = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getPlayerInfo = () => {
        if (!user) throw new Error("يجب تسجيل الدخول");
        return {
            id: user.id,
            name: user.name || 'User',
            avatar: user.avatar || user.photoURL || '',
            teamId: user.teamId
        };
    };

    const handleCreate = async (maxPlayers: number = 2) => {
        setLoading(true);
        setError('');
        try {
            const player = getPlayerInfo();
            // Randomly select a game for now, or could let user choose
            const randomGame = VERSUS_GAME_IDS[Math.floor(Math.random() * VERSUS_GAME_IDS.length)];
            const { matchId } = await createMatch(player, randomGame, maxPlayers);
            navigate(`/app/versus/${matchId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "حصل خطأ.. حاول تاني");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (joinCode.length < 4) return;
        setLoading(true);
        setError('');
        try {
            const player = getPlayerInfo();
            const matchId = await joinMatchByCode(joinCode, player);
            navigate(`/app/versus/${matchId}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "الكود غلط أو الماتش خلص");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickMatch = async () => {
        setLoading(true);
        setError('');
        try {
            const player = getPlayerInfo();
            const matchId = await quickMatch(player);
            navigate(`/app/versus/${matchId}`);
        } catch (err: any) {
            console.error(err);
            setError("مفيش ماتشات متاحة دلوقتي.. جرب تعمل ماتش جديد");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full max-w-md mx-auto">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full bg-[#121820] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />

                <h2 className="text-3xl font-black text-white text-center mb-2">واجه لاعب ⚔️</h2>
                <p className="text-gray-400 text-center mb-8">تحدى حد من الفرق التانية واكسب نقط!</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center font-bold">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Quick Match */}
                    <button
                        onClick={handleQuickMatch}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 group"
                    >
                        {loading ? 'ثواني...' : (
                            <>
                                <span>🚀</span> هاتلي حد ألعب معاه
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold my-2">
                        <div className="h-px bg-white/5 flex-1" />
                        <span>أو</span>
                        <div className="h-px bg-white/5 flex-1" />
                    </div>

                    {/* Join Code */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="كود الماتش"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            className="bg-black/30 border border-white/10 rounded-xl px-4 text-center font-mono text-xl text-white outline-none focus:border-accent-gold w-full transition-colors uppercase placeholder:text-gray-600"
                            maxLength={4}
                        />
                        <button
                            onClick={handleJoin}
                            disabled={loading || joinCode.length < 4}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            دخول
                        </button>
                    </div>

                    {/* Create Match Options */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleCreate(2)}
                            disabled={loading}
                            className="w-full py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all text-sm"
                        >
                            🥊 1 vs 1
                        </button>
                        <button
                            onClick={() => handleCreate(4)}
                            disabled={loading}
                            className="w-full py-3 rounded-xl border border-accent-gold/20 text-accent-gold font-bold hover:bg-accent-gold/10 transition-all text-sm"
                        >
                            👥 2 vs 2
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button onClick={() => navigate('/app/games')} className="text-gray-600 hover:text-gray-400 text-sm font-bold">
                        العودة للألعاب
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VersusLobby;
