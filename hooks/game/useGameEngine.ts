
import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { GameSession, GameConfig, GameAction } from '../../types/schema';

export function useGameEngine(gameConfig: GameConfig) {
    const { user } = useAuth();
    // Fix for 'uid' vs 'id' - use 'id' as primary, but fallback to 'uid' if 'id' is missing on some auth providers
    const userId = user?.id || (user as any)?.uid;

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startGame = useCallback(async () => {
        if (!userId) {
            setError("User not logged in");
            return;
        }

        setIsLoading(true);
        try {
            const sessionData: Omit<GameSession, 'id'> = {
                gameId: gameConfig.id,
                userId: userId,
                startTime: Date.now(),
                status: 'active',
                score: 0
            };

            const docRef = await addDoc(collection(db, 'game_sessions'), sessionData);
            setSessionId(docRef.id);
            setScore(0);
            setError(null);
        } catch (err: any) {
            console.error("Failed to start game:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId, gameConfig.id]);

    const submitScore = useCallback(async (finalScore: number) => {
        if (!sessionId) return;

        try {
            const sessionRef = doc(db, 'game_sessions', sessionId);
            await updateDoc(sessionRef, {
                endTime: Date.now(),
                score: finalScore,
                status: 'completed'
            });

            // Update User XP/Score
            if (userId && gameConfig.xpReward) {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    xp: increment(finalScore), // Or use gameConfig.xpReward based on logic
                    points: increment(finalScore) // Legacy support
                });
            }
        } catch (err: any) {
            console.error("Failed to submit score:", err);
            setError(err.message);
        }
    }, [sessionId, userId, gameConfig.xpReward]);

    const logAction = useCallback(async (action: GameAction) => {
        if (!sessionId) return;
        // Optional: Store detailed actions in a subcollection
    }, [sessionId]);

    return {
        sessionId,
        score,
        setScore,
        isLoading,
        error,
        startGame,
        submitScore,
        userId // Expose for debugging
    };
}
