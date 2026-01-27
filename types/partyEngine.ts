// types/partyEngine.ts

export type IntensityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // Expanded to 1-10
export type SocialDanger = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // New metric

export type Tone = 'playful' | 'neutral' | 'serious' | 'heavy';
export type Mood = 'reflective' | 'tense' | 'relieving' | 'provocative';
export type TimeSuitability = 'early' | 'mid' | 'late' | 'very_late';
export type GroupSize = 'small' | 'medium' | 'large';

export type GameModeId = 'pass_boom' | 'truth_dare' | 'movies_emoji' | 'proverbs' | 'story_chain';

export interface Card {
    id: string;              // Unique UUID
    text: string;            // The content in human, uneven Masry

    // Core Metrics
    intensity: IntensityLevel;
    socialDanger: SocialDanger;
    replayFatigue: number;   // 0-100 (High = dies fast)

    // Vibe Metadata
    tone: Tone;
    mood: Mood;
    tags: string[];

    // Constraints
    minPlayers?: GroupSize;
    timing?: TimeSuitability[];

    // Game Specifics
    answer?: string;
    emoji?: string;
    minTime?: number;
    packId: string;
}

export interface Deck {
    id: string;
    name: string;
    description: string;
    coverImage?: string;
    baseIntensity: IntensityLevel;
    cards: Card[];
}

export interface GameSession {
    mode: GameModeId;
    activeDeckIds: string[];
    intensityTarget: number; // Float for granular Director control
    history: string[];
    startTime: number;
}
