// types/partyEngine.ts

export type IntensityLevel = 1 | 2 | 3 | 4 | 5; // 1: Chill, 5: Extreme
export type SocialRisk = 1 | 2 | 3; // 1: Safe, 2: Bold, 3: Risky
export type GameModeId = 'pass_boom' | 'truth_dare' | 'movies_emoji' | 'proverbs' | 'story_chain';

export interface Card {
    id: string;              // Unique UUID
    text: string;            // The question/challenge in Masry
    answer?: string;         // For trivia/riddles
    emoji?: string;          // Visual aid

    // Dimensions
    intensity: IntensityLevel;
    socialRisk: SocialRisk;

    // Metadata
    tags: string[];          // e.g., 'acting', 'singing', 'personal', 'funny'
    minPlayers?: number;
    packId: string;
    season?: string;         // e.g., 'ramadan', 'new_year'

    // Rules
    minTime?: number;        // For timed games, minimum seconds needed
}

export interface Deck {
    id: string;
    name: string;
    description: string;
    coverImage?: string;
    isPremium?: boolean;
    baseIntensity: IntensityLevel;
    cards: Card[];
}

export interface GameSession {
    mode: GameModeId;
    activeDeckIds: string[];
    intensityTarget: IntensityLevel;
    history: string[]; // List of Card IDs played
    startTime: number;
}
