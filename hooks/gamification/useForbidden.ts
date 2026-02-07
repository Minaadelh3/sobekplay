import { useState } from 'react';
import { FORBIDDEN_PROMPTS, ForbiddenPrompt, getForbiddenPrompt } from '../../data/forbiddenData';

export type ForbiddenPhase = 'SETUP' | 'PLAYING' | 'GAME_OVER';

interface ForbiddenState {
    phase: ForbiddenPhase;
    round: number; // 1 to 5
    currentPrompt: ForbiddenPrompt | null;
    history: string[]; // Keep track of played prompt IDs to avoid repeats if we stay in same level
}

const MAX_ROUNDS = 5;

export const useForbidden = () => {
    const [state, setState] = useState<ForbiddenState>({
        phase: 'SETUP',
        round: 1,
        currentPrompt: null,
        history: []
    });

    const startGame = () => {
        const firstPrompt = getForbiddenPrompt(1);
        setState({
            phase: 'PLAYING',
            round: 1,
            currentPrompt: firstPrompt,
            history: firstPrompt ? [firstPrompt.id] : []
        });
    };

    const nextCard = () => {
        // Try to get a card for the current round
        // We need to implement a 'getRandomUnplayed' logic if we want to stay in level
        // But getForbiddenPrompt is simple random.
        // Let's just use it for now.
        const prompt = getForbiddenPrompt(state.round);
        setState(prev => ({
            ...prev,
            currentPrompt: prompt,
            history: prompt ? [...prev.history, prompt.id] : prev.history
        }));
    };

    const nextLevel = () => {
        const nextRound = state.round + 1;
        if (nextRound > MAX_ROUNDS) {
            setState(prev => ({ ...prev, phase: 'GAME_OVER' }));
            return;
        }

        const prompt = getForbiddenPrompt(nextRound);
        setState(prev => ({
            ...prev,
            round: nextRound,
            currentPrompt: prompt,
            history: prompt ? [...prev.history, prompt.id] : prev.history
        }));
    };

    const resetGame = () => {
        setState({
            phase: 'SETUP',
            round: 1,
            currentPrompt: null,
            history: []
        });
    };

    return {
        state,
        startGame,
        nextCard,
        nextLevel,
        resetGame
    };
};
