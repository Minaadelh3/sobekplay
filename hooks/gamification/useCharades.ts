import { useState, useEffect, useCallback } from 'react';
import { CHARADES_DATA, CharadesCategory } from '../../data/charadesData';

export type CharadesPhase = 'SETUP' | 'READY' | 'PLAYING' | 'ROUND_RESULT' | 'GAME_OVER';

interface Team {
    id: 1 | 2;
    name: string;
    score: number;
}

interface CharadesState {
    phase: CharadesPhase;
    teams: Team[];
    currentTeamId: 1 | 2;
    round: number;
    maxRounds: number;
    selectedCategories: CharadesCategory[];
    currentWord: string | null;
    timer: number;
    roundScore: number;
    wordsPlayed: string[]; // To avoid repeats in a game
}

const ROUND_DURATION = 60; // seconds

export const useCharades = () => {
    const [state, setState] = useState<CharadesState>({
        phase: 'SETUP',
        teams: [
            { id: 1, name: 'فريق أ', score: 0 },
            { id: 2, name: 'فريق ب', score: 0 }
        ],
        currentTeamId: 1,
        round: 1,
        maxRounds: 3, // Each team plays 3 times
        selectedCategories: ['MOVIES_EG', 'SERIES_EG', 'PLAYS_EG'], // Default all Arabic
        currentWord: null,
        timer: ROUND_DURATION,
        roundScore: 0,
        wordsPlayed: []
    });

    // --- Helpers ---
    const getRandomWord = () => {
        // Collect all words from selected categories
        let pool: string[] = [];
        state.selectedCategories.forEach(cat => {
            if (CHARADES_DATA[cat]) {
                pool = [...pool, ...CHARADES_DATA[cat]];
            }
        });

        // Filter out played words
        const available = pool.filter(w => !state.wordsPlayed.includes(w));

        if (available.length === 0) return null; // Should ideally reset or warn
        return available[Math.floor(Math.random() * available.length)];
    };

    // --- Actions ---
    const updateSettings = (team1Name: string, team2Name: string, categories: CharadesCategory[]) => {
        setState(prev => ({
            ...prev,
            teams: [
                { ...prev.teams[0], name: team1Name },
                { ...prev.teams[1], name: team2Name }
            ],
            selectedCategories: categories
        }));
    };

    const startGame = () => {
        setState(prev => ({ ...prev, phase: 'READY' }));
    };

    const startRound = () => {
        const firstWord = getRandomWord();
        setState(prev => ({
            ...prev,
            phase: 'PLAYING',
            currentWord: firstWord,
            timer: ROUND_DURATION,
            roundScore: 0,
            wordsPlayed: firstWord ? [...prev.wordsPlayed, firstWord] : prev.wordsPlayed
        }));
    };

    const handleCorrect = () => {
        const nextWord = getRandomWord();
        setState(prev => ({
            ...prev,
            roundScore: prev.roundScore + 1,
            currentWord: nextWord,
            wordsPlayed: nextWord ? [...prev.wordsPlayed, nextWord] : prev.wordsPlayed
        }));
    };

    const handleSkip = () => {
        const nextWord = getRandomWord();
        setState(prev => ({
            ...prev,
            currentWord: nextWord,
            wordsPlayed: nextWord ? [...prev.wordsPlayed, nextWord] : prev.wordsPlayed
        }));
    };

    const endRound = useCallback(() => {
        setState(prev => {
            // Update team score
            const updatedTeams = prev.teams.map(t =>
                t.id === prev.currentTeamId ? { ...t, score: t.score + prev.roundScore } : t
            );

            return {
                ...prev,
                phase: 'ROUND_RESULT',
                teams: updatedTeams,
                timer: 0
            };
        });
    }, []);

    const nextTurn = () => {
        setState(prev => {
            const isTeam2Finished = prev.currentTeamId === 2;
            const nextTeamId = isTeam2Finished ? 1 : 2;
            const nextRound = isTeam2Finished ? prev.round + 1 : prev.round;

            if (nextRound > prev.maxRounds) {
                return { ...prev, phase: 'GAME_OVER' };
            }

            return {
                ...prev,
                phase: 'READY',
                currentTeamId: nextTeamId,
                round: nextRound,
                currentWord: null,
                timer: ROUND_DURATION,
                roundScore: 0
            };
        });
    };

    const resetGame = () => {
        setState({
            phase: 'SETUP',
            teams: [
                { id: 1, name: 'فريق أ', score: 0 },
                { id: 2, name: 'فريق ب', score: 0 }
            ],
            currentTeamId: 1,
            round: 1,
            maxRounds: 3,
            selectedCategories: ['MOVIES_EG', 'SERIES_EG', 'PLAYS_EG'],
            currentWord: null,
            timer: ROUND_DURATION,
            roundScore: 0,
            wordsPlayed: []
        });
    };

    // --- Timer Effect ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.phase === 'PLAYING' && state.timer > 0) {
            interval = setInterval(() => {
                setState(prev => {
                    if (prev.timer <= 1) {
                        endRound(); // This causes a state update inside the interval? Safe enough.
                        return { ...prev, timer: 0 };
                    }
                    return { ...prev, timer: prev.timer - 1 };
                });
            }, 1000);
        } else if (state.phase === 'PLAYING' && state.timer === 0) {
            // handled by the interval closure usually, but safe guard
        }
        return () => clearInterval(interval);
    }, [state.phase, state.timer, endRound]); // endRound needed in deps

    return {
        state,
        updateSettings,
        startGame,
        startRound,
        handleCorrect,
        handleSkip,
        nextTurn,
        resetGame
    };
};
