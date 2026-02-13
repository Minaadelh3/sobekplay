import React, { useState, useEffect } from 'react';
import { useStory } from '../../hooks/gamification/useStory';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GAMES_CONFIG } from '../../lib/games';
import { performTransaction } from '../../lib/ledger';
import ExitButton from '../../components/games/ExitButton';
import GameContainer from '../../components/games/GameContainer';

const _StoryGameComponent = ({ onExit }) => {
    const { state, updatePlayers, startGame, startTurn, nextTurn, resetGame } = useStory();
    const { user } = useAuth();
    const gameConfig = GAMES_CONFIG.find(g => g.id === 'hekaya_gama3eya');
    const [playerNames, setPlayerNames] = useState(['', '', '']);

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

    const handlePlayerNameChange = (index: number, value: string) => {
        const newNames = [...playerNames];
        newNames[index] = value;
        setPlayerNames(newNames);
    };

    const addPlayer = () => setPlayerNames([...playerNames, '']);

    // --- RENDERERS ---

    if (state.phase === 'SETUP') {
        return (
            <div className="min-h-screen bg-[#0f0716] text-white p-6 flex flex-col items-center justify-center space-y-8 safe-area-pb">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-black text-fuchsia-500 drop-shadow-md">حكاية جماعية 🧩</h1>
                    <p className="text-gray-400">تأليف عالحلو.. قصة واحدة، ومؤلفين كتير.</p>
                </div>

                <div className="w-full max-w-md space-y-4 max-h-[50vh] overflow-y-auto">
                    <label className="text-sm font-bold text-gray-500 uppercase">الرواة</label>
                    {playerNames.map((name, i) => (
                        <input
                            key={i}
                            value={name}
                            onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                            placeholder={`راوي ${i + 1}`}
                            className="w-full bg-[#2a1a35] border border-white/10 rounded-xl p-4 text-center font-bold focus:border-fuchsia-500 outline-none transition-all"
                        />
                    ))}
                    <button onClick={addPlayer} className="w-full py-3 text-sm text-fuchsia-400 font-bold border border-dotted border-fuchsia-500/30 rounded-xl hover:bg-fuchsia-900/10">+ Add Player</button>

                    <button
                        onClick={() => {
                            updatePlayers(playerNames.filter(n => n.trim() !== ''));
                            startGame();
                        }}
                        className="w-full bg-fuchsia-600 text-white font-black text-xl py-5 rounded-2xl hover:scale-[1.02] shadow-xl mt-4"
                    >
                        START STORY 📖
                    </button>
                </div>
                <ExitButton className="absolute top-4 left-4" showConfirm={false} />
            </div>
        );
    }

    if (state.phase === 'READY') {
        const currentPlayer = state.players[state.currentPlayerIndex];
        return (
            <div className="min-h-screen bg-fuchsia-950 flex flex-col items-center justify-center text-center p-6 space-y-8 safe-area-pb">
                {state.round === 1 ? (
                    <div className="mb-8 p-6 bg-black/40 rounded-2xl border border-fuchsia-500/30 max-w-sm">
                        <p className="text-sm text-fuchsia-300 uppercase tracking-widest mb-2">بداية القصة</p>
                        <p className="text-2xl leading-relaxed font-bold text-white">
                            "{state.starter}"
                        </p>
                    </div>
                ) : (
                    <div className="text-xl text-fuchsia-300 mb-8">
                        القصة مكملة..
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-gray-400">الدور على</p>
                    <h1 className="text-6xl font-black text-white">{currentPlayer}</h1>
                </div>

                <button
                    onClick={startTurn}
                    className="bg-white text-fuchsia-900 font-black text-2xl py-6 px-12 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all animate-pulse"
                >
                    اسحب ورقة 🃏
                </button>
            </div>
        );
    }

    if (state.phase === 'PLAYING') {
        return (
            <div className="min-h-screen bg-[#0f0716] text-white flex flex-col items-center justify-center p-6 text-center space-y-12 safe-area-pb relative">
                <ExitButton className="absolute left-6 top-6" confirmMessage="Quit Story Mode?" />
                <div className="w-full max-w-sm">
                    <div className="flex justify-between items-center text-fuchsia-500/50 mb-4 px-4">
                        <span className="font-bold">Turn {state.round}/{state.maxRounds}</span>
                        <span className="font-black">{state.players[state.currentPlayerIndex]}</span>
                    </div>

                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="bg-gradient-to-br from-fuchsia-600 to-purple-800 p-8 rounded-3xl shadow-2xl aspect-[3/4] flex flex-col justify-center items-center relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 opacity-50 text-4xl">🧩</div>
                            <div className="absolute bottom-4 left-4 opacity-50 text-4xl">💭</div>

                            <h2 className="text-2xl font-bold text-fuchsia-200 mb-2">{state.currentPrompt?.mood}</h2>
                            <h1 className="text-3xl font-black text-white leading-relaxed dir-rtl mt-4">
                                {state.currentPrompt?.text}
                            </h1>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button
                    onClick={nextTurn}
                    className="w-full max-w-xs bg-white text-black font-black py-4 rounded-xl hover:scale-105 transition-all"
                >
                    خلصت ⏩
                </button>
            </div>
        );
    }

    if (state.phase === 'GAME_OVER') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-8 safe-area-pb">
                <div className="text-6xl">📚</div>
                <h1 className="text-5xl font-black">تمت القصة!</h1>
                <div className="text-fuchsia-400 font-bold flex items-center gap-2 bg-fuchsia-900/20 px-4 py-2 rounded-full border border-fuchsia-900/50 justify-center">
                    <span>+{gameConfig?.rewards.win} PTS</span>
                    <span className="text-xs text-gray-400">(Host Reward)</span>
                </div>
                <p className="text-xl text-gray-300">
                    أكيد طلعت قصة عجيبة..
                    <br />
                    يلا نحكيها لبعض تاني من الأول عشان نضحك.
                </p>
                <div className="flex gap-4 w-full max-w-xs mt-8">
                    <button onClick={resetGame} className="flex-1 bg-white/10 py-4 rounded-xl font-bold hover:bg-white/20">تأليف تاني</button>
                    <ExitButton className="flex-1 bg-fuchsia-900 py-4 rounded-xl font-bold hover:bg-fuchsia-800 h-auto" showConfirm={false} />
                </div>
            </div>
        );
    }

    return null;
};

const StoryGame = () => {
    const navigate = useNavigate();
    return (
        <GameContainer gameId="hekaya_gama3eya">
            {() => <_StoryGameComponent onExit={() => navigate('/app/games')} />}
        </GameContainer>
    );
};

export default StoryGame;
