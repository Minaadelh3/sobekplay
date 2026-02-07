import React, { useState, useEffect } from 'react';
import { useCharades } from '../../hooks/gamification/useCharades';
import { CharadesCategory } from '../../data/charadesData';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GAMES_CONFIG } from '../../lib/games';
import { performTransaction } from '../../lib/ledger';
import ExitButton from '../../components/games/ExitButton';

const CharadesGame = () => {
    const navigate = useNavigate();
    const {
        state, updateSettings, startGame, startRound,
        handleCorrect, handleSkip, nextTurn, resetGame
    } = useCharades();

    // Local state for setup inputs
    const [team1, setTeam1] = useState('الوحوش');
    const [team2, setTeam2] = useState('الحريفة');
    const [cats, setCats] = useState<CharadesCategory[]>(['MOVIES_EG', 'SERIES_EG', 'PLAYS_EG']);

    const toggleCat = (cat: CharadesCategory) => {
        if (cats.includes(cat)) {
            if (cats.length > 1) setCats(cats.filter(c => c !== cat));
        } else {
            setCats([...cats, cat]);
        }
    };

    // --- RENDERERS ---

    if (state.phase === 'SETUP') {
        return (
            <div className="min-h-screen bg-[#070A0F] text-white p-6 flex flex-col items-center justify-center space-y-8 safe-area-pb">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-white drop-shadow-md">مثلها لو قدك 🎭</h1>
                    <p className="text-gray-400">لعبة التمثيل والفهلوة.. مين بيفهم التاني أكتر؟</p>
                </div>

                <div className="w-full max-w-md space-y-6">
                    {/* Teams */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Team 1</label>
                            <input
                                value={team1} onChange={e => setTeam1(e.target.value)}
                                className="w-full bg-[#1A1D24] border border-white/10 rounded-xl p-4 text-center font-bold focus:border-yellow-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Team 2</label>
                            <input
                                value={team2} onChange={e => setTeam2(e.target.value)}
                                className="w-full bg-[#1A1D24] border border-white/10 rounded-xl p-4 text-center font-bold focus:border-yellow-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="bg-[#1A1D24] p-4 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-3">Categories</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'MOVIES_EG', label: 'أفلام عربي 🎬' },
                                { id: 'SERIES_EG', label: 'مسلسلات عربي 📺' },
                                { id: 'PLAYS_EG', label: 'مسرحيات 😂' },
                                { id: 'MOVIES_EN', label: 'أفلام أجنبي 🍿' },
                            ].map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => toggleCat(c.id as CharadesCategory)}
                                    className={`p-3 rounded-lg text-sm font-bold border transition-all ${cats.includes(c.id as CharadesCategory) ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-black/20 border-transparent text-gray-500'}`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => { updateSettings(team1, team2, cats); startGame(); }}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-black text-xl py-5 rounded-2xl hover:scale-[1.02] shadow-xl transition-all"
                    >
                        START GAME ▶
                    </button>
                </div>

                <button onClick={() => navigate('/games')} className="absolute top-4 left-4 text-white/30 hover:text-white">✕</button>
            </div>
        );
    }

    if (state.phase === 'READY') {
        const currentTeam = state.teams.find(t => t.id === state.currentTeamId);
        return (
            <div className={`min-h-screen ${state.currentTeamId === 1 ? 'bg-blue-900/20' : 'bg-red-900/20'} flex flex-col items-center justify-center text-center p-6 space-y-8 safe-area-pb`}>
                <h2 className="text-2xl font-bold text-gray-400">دور فريق</h2>
                <h1 className="text-6xl font-black text-white mb-4">{currentTeam?.name}</h1>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/10 max-w-xs">
                    <p className="text-lg">واحد يمسك الموبايل ويمثل</p>
                    <p className="text-lg font-bold text-yellow-500 mt-2">والباقي يخمن!</p>
                </div>
                <button
                    onClick={startRound}
                    className="bg-white text-black font-black text-2xl py-6 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all animate-pulse"
                >
                    GO! 🎬
                </button>
            </div>
        );
    }

    if (state.phase === 'PLAYING') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden safe-area-pb">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 h-2 bg-yellow-500 z-50 transition-all duration-1000 ease-linear" style={{ width: `${(state.timer / 60) * 100}%` }} />

                {/* Score & Time */}
                <div className="flex justify-between items-center p-6 z-10 w-full relative">
                    <ExitButton className="absolute left-6 top-6" confirmMessage="Game is in progress! Quit now?" />
                    <div className="text-4xl font-black">{state.timer}s</div>
                    <div className="text-2xl font-bold text-yellow-500">Score: {state.roundScore}</div>
                </div>

                {/* The Word */}
                <div className="flex-1 flex items-center justify-center p-4 z-10 relative">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={state.currentWord}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1, y: -20 }}
                            className="text-center"
                        >
                            <h1 className="text-5xl md:text-7xl font-black leading-tight drop-shadow-2xl">{state.currentWord}</h1>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls (Big Tap Areas) */}
                <div className="h-1/3 grid grid-cols-2">
                    <button
                        onClick={handleSkip}
                        className="bg-red-600/80 hover:bg-red-600 border-t-4 border-red-400 flex flex-col items-center justify-center space-y-2 active:bg-red-700 transition-all"
                    >
                        <span className="text-4xl">⏭️</span>
                        <span className="font-black text-xl uppercase tracking-widest">Skip</span>
                    </button>
                    <button
                        onClick={handleCorrect}
                        className="bg-green-600/80 hover:bg-green-600 border-t-4 border-green-400 flex flex-col items-center justify-center space-y-2 active:bg-green-700 transition-all"
                    >
                        <span className="text-4xl">✅</span>
                        <span className="font-black text-xl uppercase tracking-widest">Correct</span>
                    </button>
                </div>
            </div>
        );
    }

    if (state.phase === 'ROUND_RESULT') {
        const currentTeam = state.teams.find(t => t.id === state.currentTeamId);
        return (
            <div className="min-h-screen bg-[#070A0F] text-white p-6 flex flex-col items-center justify-center space-y-8 safe-area-pb">
                <h2 className="text-2xl font-bold text-gray-500">وقتك خلص!</h2>
                <h1 className="text-5xl font-black">نتيجة {currentTeam?.name}</h1>
                <div className="text-9xl font-black text-yellow-500 my-8">{state.roundScore}</div>

                <div className="w-full max-w-sm grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                    {state.teams.map(t => (
                        <div key={t.id} className={`p-4 rounded-lg ${t.id === state.currentTeamId ? 'bg-white/10 ring-2 ring-yellow-500' : ''}`}>
                            <div className="text-sm text-gray-400">{t.name}</div>
                            <div className="text-3xl font-bold">{t.score}</div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 w-full max-w-md">
                    <button
                        className="flex-1 bg-white text-black font-black py-4 rounded-xl hover:scale-105 transition-all"
                        onClick={nextTurn}
                    >
                        Next Team ➡️
                    </button>
                </div>
            </div>
        );
    }


    // --- SCORING & EXIT ---
    const { user } = useAuth();
    const gameConfig = GAMES_CONFIG.find(g => g.id === 'matlha_law_adak');

    useEffect(() => {
        if (state.phase === 'GAME_OVER' && user && gameConfig) {
            const awardPoints = async () => {
                try {
                    if (user.role === 'ADMIN') return;

                    await performTransaction({
                        type: 'GAME_REWARD',
                        amount: gameConfig.rewards.win,
                        from: { type: 'SYSTEM', id: 'game_engine', name: gameConfig.title },
                        to: { type: 'USER', id: user.id, name: user.name },
                        reason: `Game Reward: ${gameConfig.title}`,
                        metadata: {
                            gameId: gameConfig.id,
                            teams: state.teams
                        }
                    });
                } catch (err) {
                    console.error("Failed to award points", err);
                }
            };
            awardPoints();
        }
    }, [state.phase, user]);

    if (state.phase === 'GAME_OVER') {
        const winner = state.teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
        const isDraw = state.teams[0].score === state.teams[1].score;

        return (
            <div className="min-h-screen bg-gradient-to-b from-yellow-900/20 to-black text-white flex flex-col items-center justify-center p-6 text-center safe-area-pb">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-6xl font-black text-yellow-500 mb-2">GAME OVER</h1>
                <div className="text-green-400 font-bold mb-8 flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full">
                    <span>+{gameConfig?.rewards.win} PTS</span>
                    <span className="text-xs text-gray-400">(Host Reward)</span>
                </div>

                {isDraw ? (
                    <h2 className="text-3xl font-bold">تعادل!</h2>
                ) : (
                    <div className="space-y-2">
                        <p className="text-xl text-gray-400">الفائز هو</p>
                        <h2 className="text-5xl font-black">{winner.name}</h2>
                    </div>
                )}

                <div className="w-full max-w-md my-12 space-y-4">
                    {state.teams.map((t, i) => (
                        <div key={t.id} className="flex justify-between items-center bg-white/10 p-6 rounded-2xl">
                            <span className="font-bold text-xl">{i + 1}. {t.name}</span>
                            <span className="font-black text-3xl font-mono">{t.score}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 w-full max-w-xs">
                    <button onClick={resetGame} className="flex-1 bg-white/10 py-4 rounded-xl font-bold hover:bg-white/20">Play Again</button>
                    <ExitButton className="flex-1 bg-red-600 py-4 rounded-xl font-bold hover:bg-red-700 h-auto" showConfirm={false} />
                </div>
            </div>
        );
    }

    return null;
};

export default CharadesGame;
