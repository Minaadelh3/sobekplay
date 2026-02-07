export type WhoCategory =
    | 'EGYPTIAN'
    | 'SPORTS'
    | 'RELIGIOUS'
    | 'INVENTORS'
    | 'CULTURE'
    | 'RANDOM';

export interface WhoCharacter {
    id: string;
    name: string;
    clues: string[]; // 3-4 clues, ordered from hardest to easiest
    category: WhoCategory;
    subcategory?: string; // e.g., 'Football', 'Cinema', 'Science'
}

export interface WhoGameData {
    characters: WhoCharacter[];
}
