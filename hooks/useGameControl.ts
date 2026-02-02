import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GAMES_CONFIG, GameConfig } from '../lib/games';

export interface GameDoc extends GameConfig {
    isEnabled: boolean;
    playCount: number;
    totalPointsIssued: number;
    lastUpdated?: any;
    customRules?: any;
}

export function useGameControl() {
    const [games, setGames] = useState<GameDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'games'), (snapshot) => {
            const remoteGamesMap = new Map<string, GameDoc>();

            snapshot.docs.forEach(d => {
                remoteGamesMap.set(d.id, d.data() as GameDoc);
            });

            // Merge Static Config with Remote Config
            const mergedGames = GAMES_CONFIG.map(staticGame => {
                const remote = remoteGamesMap.get(staticGame.id);
                return {
                    ...staticGame, // Base Defaults
                    ...remote, // Overrides (e.g., rewards, custom titles)
                    id: staticGame.id, // Ensure ID mismatch doesn't happen
                    // If remote doesn't exist, default to enabled
                    isEnabled: remote?.isEnabled ?? true
                } as GameDoc;
            });

            setGames(mergedGames);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const toggleGameStatus = async (gameId: string, isEnabled: boolean) => {
        const ref = doc(db, 'games', gameId);
        await setDoc(ref, { isEnabled }, { merge: true });
    };

    const updateGameConfig = async (gameId: string, updates: Partial<GameDoc>) => {
        const ref = doc(db, 'games', gameId);
        await setDoc(ref, {
            ...updates,
            lastUpdated: new Date()
        }, { merge: true });
    };

    // Helper to initialize analytics if missing
    const initializeGameStats = async (gameId: string) => {
        await setDoc(doc(db, 'games', gameId), {
            playCount: 0,
            totalPointsIssued: 0
        }, { merge: true });
    };

    return {
        games,
        loading,
        toggleGameStatus,
        updateGameConfig,
        initializeGameStats
    };
}

export function useGame(gameId: string) {
    const [game, setGame] = useState<GameDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId) return;
        const unsub = onSnapshot(doc(db, 'games', gameId), (docSnap) => {
            const staticConfig = GAMES_CONFIG.find(g => g.id === gameId);
            if (!staticConfig) {
                setLoading(false);
                return;
            }

            if (docSnap.exists()) {
                setGame({
                    ...staticConfig,
                    ...(docSnap.data() as GameDoc),
                    id: gameId
                });
            } else {
                // Default to enabled if no doc exists yet
                setGame({
                    ...staticConfig,
                    isEnabled: true,
                    playCount: 0,
                    totalPointsIssued: 0
                } as GameDoc);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [gameId]);

    return { game, loading };
}
