export type LevelType = 'detective' | 'logic' | 'puzzle' | 'trivia' | 'observation';

export interface Suspect {
    id: string;
    name: string;
    statement: string;
    avatar?: string; // Optional emoji or image path
}

export interface SmartLevel {
    id: number;
    type: LevelType;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string; // The "Story" or "Intro"
    content: {
        suspects?: Suspect[];
        question: string;
        options?: string[];
        image?: string; // For observation
        correctAnswer: string | number; // ID (string) or Index (number) or Value
        explanation: string;
        hint?: string;
    };
    xpReward: number;
    isLocked?: boolean; // For initial state logic
}
