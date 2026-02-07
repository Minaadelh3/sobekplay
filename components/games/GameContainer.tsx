import React, { useEffect } from 'react';
import { useGame } from '../../hooks/useGameControl';
import { useNavigate } from 'react-router-dom';
import { GameConfig } from '../../lib/games';

interface GameContainerProps {
    gameId: string;
    children: (config: GameConfig) => React.ReactNode;
}

export default function GameContainer({ gameId, children }: GameContainerProps) {
    const { game, loading } = useGame(gameId);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <p className="animate-pulse">Loading Game Engine...</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl">404</h1>
                <p>Game Configuration Not Found</p>
                <button onClick={() => navigate('/app/games')} className="mt-4 text-blue-400">Back to Library</button>
            </div>
        );
    }

    if (!game.isEnabled && gameId !== 'kamel-elayah') {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-3xl font-bold mb-2">Coming Soon / Maintenance</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    This game is currently being updated by the masters. Please try again later.
                </p>
                <button
                    onClick={() => navigate('/app/games')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all"
                >
                    Return to Games
                </button>
            </div>
        );
    }

    return (
        <>
            <React.Fragment key={gameId}>
                {children(game)}
            </React.Fragment>
        </>
    );
}
