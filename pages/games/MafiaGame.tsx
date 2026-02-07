import React, { useEffect } from 'react';
import { useMafiaGame } from '../../hooks/gamification/useMafiaGame';
import MafiaSetup from '../../components/games/mafia/MafiaSetup';
import MafiaRoleReveal from '../../components/games/mafia/MafiaRoleReveal';
import MafiaNight from '../../components/games/mafia/MafiaNight';
import MafiaDay from '../../components/games/mafia/MafiaDay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GAMES_CONFIG } from '../../lib/games';
import { performTransaction } from '../../lib/ledger';
import ExitButton from '../../components/games/ExitButton';

const MafiaGame = () => {
    const navigate = useNavigate();
    const {
        settings,
        updateSettings,
        state,
        startGame, resetGame,
        startRoleDistribution,
        nextRoleReveal,
        startNight,
        commitMafiaAction,
        commitDoctorAction,
        commitDetectiveAction,
        endNight,
        startDiscussion,
        startVoting,
        commitVote,
        nextRound
    } = useMafiaGame();

    // --- SCORING ---
    const { user } = useAuth();
    const gameConfig = GAMES_CONFIG.find(g => g.id === 'mafia');

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
                        metadata: { gameId: gameConfig.id, winner: state.winner }
                    });
                } catch (e) { console.error(e); }
            };
            awardPoints();
        }
    }, [state.phase, user, gameConfig, state.winner]);

    // --- Phase Router ---
    const renderPhase = () => {
        switch (state.phase) {
            case 'SETUP':
                return (
                    <MafiaSetup
                        settings={settings}
                        onUpdate={updateSettings}
                        onStart={startGame}
                    />
                );

            case 'READY':
                return (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-8 h-full">
                        <div className="text-6xl animate-bounce">⭕</div>
                        <h2 className="text-3xl font-black text-white">اقعدوا في دايرة</h2>
                        <ul className="text-gray-400 text-lg space-y-4 font-medium">
                            <li>🔄 الموبايل هيلف على واحد واحد</li>
                            <li>🤫 محدش يبص على دور غيره</li>
                            <li>🎭 جهزوا نفسكم للتمثيل</li>
                        </ul>
                        <button
                            onClick={startRoleDistribution}
                            className="bg-accent-gold text-black font-black py-4 px-12 rounded-2xl shadow-lg hover:scale-105 transition-all w-full max-w-xs"
                        >
                            يلا نوزع الأدوار 🃏
                        </button>
                    </div>
                );

            case 'ROLE_DISTRIBUTION':
                return (
                    <MafiaRoleReveal
                        player={state.players[state.currentTurnIndex]}
                        onNext={nextRoleReveal}
                    />
                );

            case 'NIGHT_START':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-8" onClick={startNight}>
                        <div className="text-8xl animate-pulse">🌙</div>
                        <h2 className="text-5xl font-black">الليل جه</h2>
                        <p className="text-gray-400 text-xl">الكل يغمض عينه.. ومحدش يتنفس 🤫</p>
                        <button className="bg-white text-black px-12 py-4 rounded-2xl font-black text-xl hover:scale-105 transition-all">
                            يلا نبدأ
                        </button>
                    </div>
                );

            case 'NIGHT_MAFIA':
                return <MafiaNight phase="NIGHT_MAFIA" players={state.players} onAction={commitMafiaAction} />;
            case 'NIGHT_DOCTOR':
                return <MafiaNight phase="NIGHT_DOCTOR" players={state.players} onAction={commitDoctorAction} />;
            case 'NIGHT_DETECTIVE':
                return <MafiaNight phase="NIGHT_DETECTIVE" players={state.players} onAction={commitDetectiveAction} />;

            case 'MORNING_REVEAL':
            case 'DISCUSSION':
            case 'VOTING':
            case 'ELIMINATION_REVEAL':
            case 'GAME_OVER':
                return (
                    <MafiaDay
                        phase={state.phase}
                        players={state.players}
                        lastEliminated={state.lastEliminatedPlayer || null}
                        winner={state.winner || null}
                        onNext={() => {
                            if (state.phase === 'MORNING_REVEAL') startDiscussion();
                            else if (state.phase === 'DISCUSSION') startVoting();
                            else if (state.phase === 'ELIMINATION_REVEAL') nextRound();
                        }}
                        onVote={commitVote}
                        onReset={resetGame}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#070A0F] text-white overflow-hidden relative font-sans safe-area-pb">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#070A0F] to-[#070A0F] pointer-events-none" />

            <div className="relative z-10 max-w-md mx-auto h-screen">
                {renderPhase()}
            </div>

            {/* Quit Button (Top Left) */}
            <ExitButton className="absolute top-4 left-4 z-50" confirmMessage="Are you sure you want to quit the game? The game will end for everyone." />
        </div>
    );
};

export default MafiaGame;
