import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GameConfig, GAMES_CONFIG } from '../lib/games';

interface GameContextType {
    game: GameConfig | null;
    isLoading: boolean;
    error: string | null;
    initializeGame: (gameId: string) => Promise<void>;
    clearGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [game, setGame] = useState<GameConfig | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeGame = async (gameId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Check local config first (static definitions)
            const configGame = GAMES_CONFIG.find(g => g.id === gameId);

            if (configGame) {
                setGame(configGame);
            } else {
                // 2. If not in static config, check Firestore (dynamic games)
                // This allows for future dynamic games system
                const gameRef = doc(db, 'games', gameId);
                const gameSnap = await getDoc(gameRef);

                if (gameSnap.exists()) {
                    // Cast to GameConfig - ensure your firestore data matches interface
                    setGame({ id: gameSnap.id, ...gameSnap.data() } as GameConfig);
                } else {
                    setError("اللعبة مش موجودة أو غير متاحة حالياً");
                }
            }
        } catch (err) {
            console.error("Error initializing game:", err);
            setError("حصل خطأ أثناء تحميل اللعبة. حاول تاني.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearGame = () => {
        setGame(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <GameContext.Provider value={{ game, isLoading, error, initializeGame, clearGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
