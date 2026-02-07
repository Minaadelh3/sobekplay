import { useState } from 'react';
import { STORY_STARTERS, getCurvedPrompt, StoryPrompt } from '../../data/storyData';

export type StoryPhase = 'SETUP' | 'READY' | 'PLAYING' | 'GAME_OVER';

interface StoryState {
    phase: StoryPhase;
    round: number;
    maxRounds: number; // usually 10-15 turns
    players: string[];
    currentPlayerIndex: number;
    starter: string | null;
    currentPrompt: StoryPrompt | null;
    fullStory: string[]; // Track the story parts? (Optional, maybe just oral)
    // Actually, "Oral" is better for party games. We just show prompts to guide the improv.
}

const DEFAULT_ROUNDS = 10;

export const useStory = () => {
    const [state, setState] = useState<StoryState>({
        phase: 'SETUP',
        round: 1,
        maxRounds: DEFAULT_ROUNDS,
        players: ['راوي ١', 'راوي ٢', 'راوي ٣'],
        currentPlayerIndex: 0,
        starter: null,
        currentPrompt: null,
        fullStory: []
    });

    const updatePlayers = (names: string[]) => {
        setState(prev => ({ ...prev, players: names }));
    };

    const startGame = () => {
        const randomStarter = STORY_STARTERS[Math.floor(Math.random() * STORY_STARTERS.length)];
        setState(prev => ({
            ...prev,
            phase: 'READY',
            starter: randomStarter,
            round: 1,
            currentPlayerIndex: 0,
            currentPrompt: null
        }));
    };

    const startTurn = () => {
        const prompt = getCurvedPrompt(state.round, state.maxRounds);
        setState(prev => ({
            ...prev,
            phase: 'PLAYING',
            currentPrompt: prompt
        }));
    };

    const nextTurn = () => {
        setState(prev => {
            const nextRound = prev.round + 1;
            const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;

            if (nextRound > prev.maxRounds) {
                return { ...prev, phase: 'GAME_OVER' };
            }

            return {
                ...prev,
                phase: 'READY', // Show next player name again
                round: nextRound,
                currentPlayerIndex: nextIndex,
                currentPrompt: null
            };
        });
    };

    const resetGame = () => {
        setState({
            phase: 'SETUP',
            round: 1,
            maxRounds: DEFAULT_ROUNDS,
            players: ['راوي ١', 'راوي ٢', 'راوي ٣'],
            currentPlayerIndex: 0,
            starter: null,
            currentPrompt: null,
            fullStory: []
        });
    };

    return {
        state,
        updatePlayers,
        startGame,
        startTurn,
        nextTurn,
        resetGame
    };
};
