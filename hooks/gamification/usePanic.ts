import { useState, useEffect, useCallback } from 'react';
import { PANIC_PROMPTS, PanicCategory, getPanicPrompt, getJudgment } from '../../data/panicData';

export type PanicPhase = 'SETUP' | 'READY' | 'PLAYING' | 'FEEDBACK' | 'GAME_OVER';

interface Player {
    id: number;
    name: string;
    score: number;
}

interface PanicState {
    phase: PanicPhase;
    players: Player[];
    currentPlayerIndex: number;
    round: number;
    maxRounds: number;
    currentPrompt: { text: string; category: PanicCategory } | null;
    timer: number;
    judgment: string | null;
}

const ANSWER_TIME = 3; // 3 seconds to answer

export const usePanic = () => {
    const [state, setState] = useState<PanicState>({
        phase: 'SETUP',
        players: [
            { id: 1, name: 'لاعب ١', score: 0 },
            { id: 2, name: 'لاعب ٢', score: 0 }
        ],
        currentPlayerIndex: 0,
        round: 1,
        maxRounds: 5,
        currentPrompt: null,
        timer: ANSWER_TIME,
        judgment: null
    });

    const updatePlayers = (names: string[]) => {
        const newPlayers = names.map((name, index) => ({
            id: index + 1,
            name: name || `Player ${index + 1}`,
            score: 0
        }));
        setState(prev => ({ ...prev, players: newPlayers }));
    };

    const startGame = () => {
        setState(prev => ({ ...prev, phase: 'READY' }));
    };

    const startTurn = () => {
        const prompt = getPanicPrompt(state.round);
        setState(prev => ({
            ...prev,
            phase: 'PLAYING',
            currentPrompt: prompt,
            timer: ANSWER_TIME
        }));
    };

    const handleSuccess = () => {
        // Player answered in time
        setState(prev => {
            const updatedPlayers = [...prev.players];
            updatedPlayers[prev.currentPlayerIndex].score += 10;
            return {
                ...prev,
                players: updatedPlayers,
                phase: 'FEEDBACK',
                judgment: 'Excellent! 🚀'
            };
        });
    };

    const handleFail = () => {
        // Player failed or timeout
        const judgment = getJudgment();
        setState(prev => ({
            ...prev,
            phase: 'FEEDBACK',
            judgment: judgment
        }));
    };

    const nextTurn = () => {
        setState(prev => {
            const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
            const isRoundComplete = nextIndex === 0;
            const nextRound = isRoundComplete ? prev.round + 1 : prev.round;

            if (nextRound > prev.maxRounds) {
                return { ...prev, phase: 'GAME_OVER' };
            }

            return {
                ...prev,
                phase: 'READY',
                currentPlayerIndex: nextIndex,
                round: nextRound,
                timer: ANSWER_TIME,
                currentPrompt: null,
                judgment: null
            };
        });
    };

    const resetGame = () => {
        setState({
            phase: 'SETUP',
            players: state.players.map(p => ({ ...p, score: 0 })),
            currentPlayerIndex: 0,
            round: 1,
            maxRounds: 5,
            currentPrompt: null,
            timer: ANSWER_TIME,
            judgment: null
        });
    };

    // --- Timer Effect ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.phase === 'PLAYING' && state.timer > 0) {
            interval = setInterval(() => {
                setState(prev => {
                    if (prev.timer <= 0) return prev; // Should be handled by effect below
                    return { ...prev, timer: prev.timer - 0.1 }; // 100ms updates for smooth bar
                });
            }, 100);
        } else if (state.phase === 'PLAYING' && state.timer <= 0) {
            handleFail();
        }
        return () => clearInterval(interval);
    }, [state.phase, state.timer]);

    return {
        state,
        updatePlayers,
        startGame,
        startTurn,
        handleSuccess,
        handleFail,
        nextTurn,
        resetGame
    };
};
