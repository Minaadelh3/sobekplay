import { useState, useCallback, useMemo } from 'react';

// --- Types ---

export type Role = 'MAFIA' | 'VILLAGER' | 'DOCTOR' | 'DETECTIVE';

export type GamePhase =
    | 'SETUP'
    | 'READY'
    | 'ROLE_DISTRIBUTION'
    | 'NIGHT_START'
    | 'NIGHT_MAFIA'
    | 'NIGHT_DOCTOR'
    | 'NIGHT_DETECTIVE'
    | 'MORNING_REVEAL'
    | 'DISCUSSION'
    | 'VOTING'
    | 'ELIMINATION_REVEAL'
    | 'GAME_OVER';

export interface Player {
    id: string;
    name: string;
    role: Role;
    isAlive: boolean;
    isProtected: boolean; // For Doctor
    isInvestigated: boolean; // For Detective
}

export interface GameSettings {
    playerCount: number;
    hasDoctor: boolean;
    hasDetective: boolean;
    isKidMode: boolean; // Simpler language?
}

export interface GameState {
    phase: GamePhase;
    players: Player[];
    currentTurnIndex: number; // For role reveal or sequential night actions
    nightActions: {
        mafiaTargetId?: string | null;
        doctorTargetId?: string | null;
        detectiveTargetId?: string | null;
    };
    lastEliminatedPlayer?: Player | null; // For reveal screens
    winner?: 'MAFIA' | 'VILLAGERS' | null;
}

// --- Constants ---
const MAFIA_RATIO = 4; // 1 Mafia per 4 players

// --- Hook ---

export const useMafiaGame = () => {
    const [settings, setSettings] = useState<GameSettings>({
        playerCount: 5,
        hasDoctor: true,
        hasDetective: true,
        isKidMode: false,
    });

    const [state, setState] = useState<GameState>({
        phase: 'SETUP',
        players: [],
        currentTurnIndex: 0,
        nightActions: {},
    });

    // --- Helpers ---

    const generateRoles = (count: number, hasDoc: boolean, hasDet: boolean): Role[] => {
        const roles: Role[] = [];
        const mafiaCount = Math.floor(count / MAFIA_RATIO);

        for (let i = 0; i < mafiaCount; i++) roles.push('MAFIA');
        if (hasDoc) roles.push('DOCTOR');
        if (hasDet) roles.push('DETECTIVE');

        while (roles.length < count) {
            roles.push('VILLAGER');
        }

        // Shuffle
        return roles.sort(() => Math.random() - 0.5);
    };

    const checkWinCondition = (players: Player[]) => {
        const aliveMafia = players.filter(p => p.isAlive && p.role === 'MAFIA').length;
        const aliveVillagers = players.filter(p => p.isAlive && p.role !== 'MAFIA').length;

        if (aliveMafia === 0) return 'VILLAGERS';
        if (aliveMafia >= aliveVillagers) return 'MAFIA';
        return null;
    };

    // --- Actions ---

    const updateSettings = (partial: Partial<GameSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }));
    };

    const startGame = () => {
        const roles = generateRoles(settings.playerCount, settings.hasDoctor, settings.hasDetective);
        const newPlayers: Player[] = Array.from({ length: settings.playerCount }).map((_, i) => ({
            id: `p-${i}`,
            name: `Player ${i + 1}`, // Can be editable later
            role: roles[i],
            isAlive: true,
            isProtected: false,
            isInvestigated: false
        }));

        setState({
            phase: 'READY',
            players: newPlayers,
            currentTurnIndex: 0,
            nightActions: {},
            lastEliminatedPlayer: null,
            winner: null
        });
    };

    const startRoleDistribution = () => {
        setState(prev => ({ ...prev, phase: 'ROLE_DISTRIBUTION' }));
    };

    const nextRoleReveal = () => {
        if (state.currentTurnIndex < state.players.length - 1) {
            setState(prev => ({ ...prev, currentTurnIndex: prev.currentTurnIndex + 1 }));
        } else {
            // All revealed, start Night
            setState(prev => ({ ...prev, phase: 'NIGHT_START', currentTurnIndex: 0 }));
        }
    };

    const startNight = () => {
        setState(prev => ({ ...prev, phase: 'NIGHT_MAFIA', nightActions: {} }));
    };

    const commitMafiaAction = (targetId: string) => {
        setState(prev => ({
            ...prev,
            nightActions: { ...prev.nightActions, mafiaTargetId: targetId },
            phase: settings.hasDoctor ? 'NIGHT_DOCTOR' : (settings.hasDetective ? 'NIGHT_DETECTIVE' : 'MORNING_REVEAL')
        }));

        // If skipping phases, we need to process night immediately? 
        // No, keep state flow consistent.
        if (!settings.hasDoctor && !settings.hasDetective) {
            processNightResults({ ...state.nightActions, mafiaTargetId: targetId });
        }
    };

    const commitDoctorAction = (targetId: string | null) => {
        setState(prev => ({
            ...prev,
            nightActions: { ...prev.nightActions, doctorTargetId: targetId },
            phase: settings.hasDetective ? 'NIGHT_DETECTIVE' : 'MORNING_REVEAL'
        }));

        if (!settings.hasDetective) {
            processNightResults({ ...state.nightActions, doctorTargetId: targetId });
        }
    };

    const commitDetectiveAction = (targetId: string | null) => {
        // Detective sees UI result immediately, then clicks continue to morning
        setState(prev => ({
            ...prev,
            nightActions: { ...prev.nightActions, detectiveTargetId: targetId },
            // Logic to show result is in UI, this moves to next step
        }));
    };

    const endNight = () => {
        processNightResults(state.nightActions);
    };

    const processNightResults = (actions: GameState['nightActions']) => {
        let eliminated: Player | null = null;

        const nextPlayers = state.players.map(p => {
            let player = { ...p, isProtected: false }; // Reset protection

            if (p.id === actions.mafiaTargetId) {
                if (p.id === actions.doctorTargetId) {
                    // Saved!
                    console.log(`Saved ${p.name}`);
                } else {
                    player.isAlive = false;
                    eliminated = player;
                }
            }
            return player;
        });

        const winner = checkWinCondition(nextPlayers);

        setState(prev => ({
            ...prev,
            players: nextPlayers,
            phase: winner ? 'GAME_OVER' : 'MORNING_REVEAL',
            lastEliminatedPlayer: eliminated,
            winner
        }));
    };

    const startDiscussion = () => {
        setState(prev => ({ ...prev, phase: 'DISCUSSION' }));
    };

    const startVoting = () => {
        setState(prev => ({ ...prev, phase: 'VOTING' }));
    };

    const commitVote = (targetId: string | null) => {
        // Simple majority or just selection for now?
        // For "One Phone", we might just select who got the most votes directly.
        // Let's assume the moderator inputs the final decision of the group.

        if (!targetId) {
            // No one eliminated
            setState(prev => ({ ...prev, phase: 'NIGHT_START', lastEliminatedPlayer: null }));
            return;
        }

        const nextPlayers = state.players.map(p =>
            p.id === targetId ? { ...p, isAlive: false } : p
        );

        const eliminated = nextPlayers.find(p => p.id === targetId);
        const winner = checkWinCondition(nextPlayers);

        setState(prev => ({
            ...prev,
            players: nextPlayers,
            phase: winner ? 'GAME_OVER' : 'ELIMINATION_REVEAL',
            lastEliminatedPlayer: eliminated || null,
            winner
        }));
    };

    const nextRound = () => {
        // After elimination reveal -> Night
        setState(prev => ({ ...prev, phase: 'NIGHT_START' }));
    };

    const resetGame = () => {
        setState({
            phase: 'SETUP',
            players: [],
            currentTurnIndex: 0,
            nightActions: {},
        });
    };

    return {
        settings,
        updateSettings,
        state,
        startGame,
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
        nextRound,
        resetGame
    };
};
