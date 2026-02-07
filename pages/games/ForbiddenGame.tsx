import React, { useEffect } from 'react';
import { useForbidden } from '../../hooks/gamification/useForbidden';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GAMES_CONFIG } from '../../lib/games';
import { performTransaction } from '../../lib/ledger';

const ForbiddenGame = () => {
    const navigate = useNavigate();
    const { state, startGame, nextCard, nextLevel, resetGame } = useForbidden();
    const { user } = useAuth();
    const gameConfig = GAMES_CONFIG.find(g => g.id === 'mamno3at');

    useEffect(() => {
        if (state.phase === 'GAME_OVER' && user && gameConfig) {
            const awardPoints = async () => {
                if (user.role === 'ADMIN') return;
                try {
                    await performTransaction({
                        type: 'GAME_REWARD',
                        amount: gameConfig.rewards.win,
                        from: { type: 'SYSTEM', id: 'game_engine', name: gameConfig.title },
                        to: { type: 'USER', id: user.id, name: user.name },
                        reason: `Game Reward: ${gameConfig.title}`,
                        metadata: { gameId: gameConfig.id }
                    });
                } catch (e) { console.error(e); }
            };
            awardPoints();
        }
    }, [state.phase, user]);

    // --- RENDERERS ---

    if (state.phase === 'SETUP') {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">⛔</div>
                    <h1 className="text-5xl font-black text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">ممنوعات</h1>
                    <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
                        لعبة الصراحة المطلقة..
                        <br />
                        أسئلة بتدرج في الصعوبة لحد ما القناع يقع.
                        <br />
                        <span className="text-red-500 font-bold mt-2 block">على مسئوليتكم الخاصة!</span>
                    </p>
                </div>

                <button
                    onClick={startGame}
                    className="w-full max-w-xs bg-red-900/50 border border-red-600 text-red-200 font-black text-xl py-5 rounded-2xl hover:bg-red-900 transition-all shadow-xl"
                >
                    أدخل المنطقة المحظورة ⚠️
                </button>

                <button onClick={() => navigate('/games')} className="absolute top-4 left-4 text-white/30 hover:text-white">✕</button>
            </div>
        );
    }

    if (state.phase === 'PLAYING') {
        const roundColors = [
            'text-blue-400 border-blue-500', // Boundary
            'text-yellow-400 border-yellow-500', // Loyalty
            'text-orange-500 border-orange-600', // Resentment
            'text-red-600 border-red-700', // Power
            'text-green-400 border-green-500', // Exit
        ];

        const roundNames = ['Boundary', 'Loyalty', 'Resentment', 'Power', 'Exit'];
        const currentStyle = roundColors[state.round - 1] || 'text-white border-white';
        const currentName = roundNames[state.round - 1];

        return (
            <div className="min-h-screen bg-[#050000] text-white flex flex-col relative overflow-hidden">
                {/* Background Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a0505_0%,_#000000_100%)]" />

                {/* Header */}
                <div className="relative z-10 p-6 flex justify-between items-center text-red-900/50">
                    <div className="font-black text-2xl">MAMNO3AT</div>
                    <div className="font-mono text-xl">Lvl {state.round}/5</div>
                </div>

                {/* Card Container */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={state.currentPrompt?.id}
                            initial={{ opacity: 0, y: 50, rotateX: 90 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, y: -50, rotateX: -90 }}
                            transition={{ type: "spring", damping: 20 }}
                            className={`
                                w-full max-w-md aspect-[3/4] 
                                bg-[#0A0A0A] border-2 ${currentStyle.split(' ')[1]} 
                                rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-2xl
                            `}
                        >
                            <div className={`text-xs font-bold uppercase tracking-[0.2em] ${currentStyle.split(' ')[0]}`}>
                                {currentName} . {state.currentPrompt?.intensity}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold leading-relaxed text-white/90" style={{ direction: 'rtl' }}>
                                {state.currentPrompt?.text}
                            </h2>

                            <div className="text-2xl opacity-20">❝</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="relative z-10 p-6 flex flex-col gap-4 max-w-md mx-auto w-full">
                    <button
                        onClick={nextCard}
                        className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-all"
                    >
                        سؤال تاني (نفس المستوى) 🔄
                    </button>
                    <button
                        onClick={nextLevel}
                        className={`w-full font-black py-4 rounded-xl transition-all shadow-lg ${state.round === 5 ? 'bg-green-600 text-white' : 'bg-red-900 text-white hover:bg-red-800'}`}
                    >
                        {state.round === 5 ? 'إنهاء اللعبة ✅' : 'المستوى اللي بعده 🔥'}
                    </button>
                </div>
            </div>
        );
    }

    if (state.phase === 'GAME_OVER') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="text-6xl animate-pulse">🕊️</div>
                <h1 className="text-4xl font-bold">برافو عليكم.. نجيتوا!</h1>
                <div className="text-red-400 font-bold flex items-center gap-2 bg-red-900/20 px-4 py-2 rounded-full border border-red-900/50 justify-center">
                    <span>+{gameConfig?.rewards.win} PTS</span>
                    <span className="text-xs text-gray-400">(Host Reward)</span>
                </div>
                <p className="text-gray-400">
                    اللي حصل هنا.. يفضل هنا.
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                    <button onClick={resetGame} className="flex-1 bg-white/10 py-4 rounded-xl font-bold hover:bg-white/20">Restart</button>
                    <button onClick={() => navigate('/games')} className="flex-1 bg-red-900 py-4 rounded-xl font-bold hover:bg-red-800">Exit</button>
                </div>
            </div>
        );
    }

    return null;
};

export default ForbiddenGame;
