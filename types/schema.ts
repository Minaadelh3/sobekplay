
export interface GameConfig {
    id: string;
    name: string;
    description?: string;
    type: 'quiz' | 'puzzle' | 'minigame' | 'social';
    difficulty?: 'easy' | 'medium' | 'hard';
    xpReward?: number;
    enabled: boolean;
}

export interface GameSession {
    id: string;
    gameId: string;
    userId: string;
    startTime: number;
    endTime?: number;
    score?: number;
    status: 'active' | 'completed' | 'abandoned';
    metadata?: Record<string, any>;
}

export type GameActionType = 'START' | 'END' | 'SCORE_UPDATE' | 'ACHIEVEMENT_UNLOCK';

export interface GameAction {
    type: GameActionType;
    payload: any;
    timestamp: number;
}
