import React, { useState, useEffect } from 'react';
import { usePanic } from '../../hooks/gamification/usePanic';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GameConfig } from '../../lib/games';
import { performTransaction } from '../../lib/ledger';
import ExitButton from '../../components/games/ExitButton';
import GameContainer from '../../components/games/GameContainer';

const PanicGameContent = ({ config }: { config: GameConfig }) => {
    const navigate = useNavigate();
    const {
        state, updatePlayers, startGame, startTurn,
        handleSuccess, handleFail, nextTurn, resetGame
    } = usePanic();
    const { user } = useAuth();

    // Setup state
    const [playerNames, setPlayerNames] = useState(['', '', '', '']);

    const handlePlayerNameChange = (index: number, value: string) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    // --- EFFECT: AWARD POINTS ---
    useEffect(() => {
        if (state.phase === 'GAME_OVER' && user && config) {
            const awardPoints = async () => {
                if (user.role === 'ADMIN') return;
                try {
                    await performTransaction({
                        type: 'GAME_REWARD',
                        amount: config.rewards.win, // Dynamic Reward
                        from: { type: 'SYSTEM', id: 'game_engine', name: config.title },
                        to: { type: 'USER', id: user.id, name: user.name },
                        reason: `Game Reward: ${config.title} `,
                        metadata: { gameId: config.id }
                    });
                } catch (e) { console.error(e); }
            };
            awardPoints();
        }
    }, [state.phase, user, config]);

    // --- RENDERERS ---

    if (state.phase === 'SETUP') {
        return (
            <div className="min-h-screen bg-[#070A0F] text-white p-6 flex flex-col items-center justify-center space-y-8 safe-area-pb">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">قول بسرعة 💣</h1>
                    <p className="text-gray-400">٣ ثواني.. ٣ إجابات.. وإلا هتتفضح!</p>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <label className="text-sm font-bold text-gray-500 uppercase">Players (2-4)</label>
                    {playerNames.map((name, i) => (
                        <input
                            key={i}
                            value={name}
                            onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                            placeholder={`Player ${i + 1} `}
                            className="w-full bg-[#1A1D24] border border-white/10 rounded-xl p-4 text-center font-bold focus:border-red-500 outline-none transition-all"
                        />
                    ))}

                    <button
                        onClick={() => {
                            updatePlayers(playerNames.filter(n => n.trim() !== ''));
                            startGame();
                        }}
                        className="w-full bg-red-600 text-white font-black text-xl py-5 rounded-2xl hover:scale-[1.02] shadow-xl transition-all mt-4"
                    >
                        START PANIC 🔥
                    </button>
                </div>
                <ExitButton className="absolute top-4 left-4" showConfirm={false} />
            </div>
        );
    }

    if (state.phase === 'READY') {
        const currentPlayer = state.players[state.currentPlayerIndex];
        return (
            <div className={`min - h - screen flex flex - col items - center justify - center text - center p - 6 space - y - 8 bg - red - 950 safe - area - pb`}>
                <h2 className="text-2xl font-bold text-red-200">الدور على</h2>
                <h1 className="text-6xl font-black text-white mb-4 animate-bounce">{currentPlayer.name}</h1>
                <div className="bg-black/30 p-6 rounded-2xl border border-red-500/30 max-w-xs">
                    <p className="text-xl text-red-200">قول ٣ حاجات بسرعة!</p>
                    <p className="text-sm text-gray-400 mt-2">معاك ٣ ثواني بس</p>
                </div>
                <button
                    onClick={startTurn}
                    className="bg-white text-red-900 font-black text-3xl py-8 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all"
                >
                    GO! ⚡
                </button>
            </div>
        );
    }

    if (state.phase === 'PLAYING') {
        const progress = Math.max(0, (state.timer / 3) * 100);

        return (
            <div className="min-h-screen bg-red-600 text-white flex flex-col justify-between items-center relative overflow-hidden safe-area-pb">
                {/* Intense Background Animation */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_100%)] opacity-50" />

                {/* Timer Bar */}
                <div className="w-full h-4 bg-black/30">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{ width: `${progress}% ` }}
                    />
                </div>

                <ExitButton className="absolute right-4 top-16" confirmMessage="Quit Panic Mode?" />

                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 space-y-12">
                    <h2 className="text-2xl font-bold text-red-200 uppercase tracking-widest">{state.currentPrompt?.category}</h2>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={state.currentPrompt?.text}
                            initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="bg-white text-black p-8 rounded-3xl shadow-2xl transform rotate-1"
                        >
                            <h1 className="text-4xl md:text-6xl font-black leading-tight">{state.currentPrompt?.text}</h1>
                        </motion.div>
                    </AnimatePresence>

                    <div className="text-8xl font-black font-mono">{Math.ceil(state.timer)}</div>
                </div>

                {/* Hidden Tap Area for Referee Intervention? Or just auto-fail? 
                    Actually, it's hard for the phone to know if they said 3 things.
                    We need buttons: "Pass" (Completed) or wait for timeout.
                */}
                <div className="w-full p-6 z-10 pb-12">
                    <button
                        onClick={handleSuccess}
                        className="w-full bg-green-500 text-white font-black text-4xl py-6 rounded-3xl shadow-xl hover:scale-105 transition-all border-b-8 border-green-700 active:border-b-0 active:translate-y-2"
                    >
                        DONE! ✅
                    </button>
                    <button
                        onClick={handleFail}
                        className="w-full text-white/50 font-bold mt-4"
                    >
                        Failed ❌
                    </button>
                </div>
            </div>
        );
    }

    if (state.phase === 'FEEDBACK') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-8 safe-area-pb">
                <h1 className="text-4xl font-black text-red-500 mb-4">{state.judgment}</h1>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {state.players.map(p => (
                        <div key={p.id} className={`p - 4 rounded - xl border border - white / 10 ${p.id === state.players[state.currentPlayerIndex].id ? 'bg-white/10' : ''} `}>
                            <div className="text-gray-400 text-sm">{p.name}</div>
                            <div className="text-2xl font-bold">{p.score}</div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={nextTurn}
                    className="w-full max-w-xs bg-white text-black font-black py-4 rounded-xl hover:scale-105 transition-all"
                >
                    Next Turn ➡️
                </button>
            </div>
        );
    }

    if (state.phase === 'GAME_OVER') {
        const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center safe-area-pb">
                <div className="text-6xl mb-6">🏁</div>
                <h1 className="text-5xl font-black text-white mb-4">Game Over</h1>
                <div className="text-red-400 font-bold mb-8 flex items-center gap-2 bg-red-900/20 px-4 py-2 rounded-full border border-red-900/50">
                    <span>+{config.rewards.win} PTS</span>
                    <span className="text-xs text-gray-400">(Host Reward)</span>
                </div>

                <div className="w-full max-w-md space-y-4 mb-12">
                    {sortedPlayers.map((p, i) => (
                        <div key={p.id} className={`flex justify - between items - center p - 6 rounded - 2xl ${i === 0 ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-white/5'} `}>
                            <div className="flex items-center gap-4">
                                <span className={`text - 2xl font - black ${i === 0 ? 'text-yellow-500' : 'text-gray-500'} `}>#{i + 1}</span>
                                <span className="font-bold text-xl">{p.name}</span>
                            </div>
                            <span className="font-black text-3xl font-mono">{p.score}</span>
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

const PanicGame = () => {
    return (
        <GameContainer gameId="oul_besor3a">
            {(config) => <PanicGameContent config={config} />}
        </GameContainer>
    );
};

export default PanicGame;
