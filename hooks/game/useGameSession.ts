import { useState, useCallback } from 'react';
import { awardPoints, generateIdempotencyKey } from '../../services/scoring/scoreEngine';
import { useAuth } from '../../context/AuthContext';

export interface UseGameSessionProps {
    gameId: string;
    gameType: string;
}

export interface UseGameSessionReturn {
    score: number;
    answeredQuestionIds: string[];
    isProcessing: boolean;
    startGame: () => void;
    handleAnswer: (questionId: string, isCorrect: boolean, points: number) => Promise<void>;
}

export function useGameSession({ gameId, gameType }: UseGameSessionProps): UseGameSessionReturn {
    const { user } = useAuth();
    const [score, setScore] = useState(0);
    const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const startGame = useCallback(() => {
        setScore(0);
        setAnsweredQuestionIds([]);
        setIsProcessing(false);
        // Additional reset logic if needed
    }, []);

    const handleAnswer = useCallback(async (questionId: string, isCorrect: boolean, points: number) => {
        if (answeredQuestionIds.includes(questionId)) {
            console.warn(`Question ${questionId} already answered`);
            return;
        }

        if (isProcessing) {
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Mark question as answered IMMEDIATELY to prevent double submissions in UI
            setAnsweredQuestionIds(prev => [...prev, questionId]);

            if (isCorrect) {
                // 2. Optimistic score update
                setScore(prev => prev + points);

                // 3. Async Score Saving
                if (user?.id) {
                    const idempotencyKey = generateIdempotencyKey('GAME_ANSWER', user.id, `${gameId}_${questionId}`);

                    // We don't await this to block the UI, but we catch errors
                    awardPoints({
                        userId: user.id,
                        actionType: 'GAME_ANSWER', // Or specific game type action
                        points: points,
                        idempotencyKey: idempotencyKey,
                        metadata: {
                            gameId,
                            questionId,
                            gameType
                        },
                        reason: `Correct answer in ${gameId}`
                    }).catch(err => {
                        console.error("Failed to save score async:", err);
                        // Optional: Rollback score if critical, but usually for games we keep going
                    });
                }
            }

            // 4. Next question logic is handled by the consumer observing 'answeredQuestionIds'
            // or by the caller of handleAnswer.

        } catch (error) {
            console.error("Error in handleAnswer:", error);
        } finally {
            setIsProcessing(false);
        }
    }, [answeredQuestionIds, isProcessing, user?.id, gameId, gameType]);

    return {
        score,
        answeredQuestionIds,
        isProcessing,
        startGame,
        handleAnswer
    };
}
