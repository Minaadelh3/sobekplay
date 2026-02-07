import { WhoCharacter, WhoCategory } from './types';
import { EGYPTIAN_CHARACTERS } from './egyptian_public';
import { SPORTS_CHARACTERS } from './sports';
import { RELIGIOUS_CHARACTERS } from './religious';
import { INVENTORS_CHARACTERS } from './inventors';
import { CULTURE_CHARACTERS } from './culture';

export * from './types';

export const ALL_WHO_CHARACTERS: WhoCharacter[] = [
    ...EGYPTIAN_CHARACTERS,
    ...SPORTS_CHARACTERS,
    ...RELIGIOUS_CHARACTERS,
    ...INVENTORS_CHARACTERS,
    ...CULTURE_CHARACTERS
];

export const getCharactersByCategory = (category: WhoCategory | 'RANDOM'): WhoCharacter[] => {
    if (category === 'RANDOM') return ALL_WHO_CHARACTERS;
    return ALL_WHO_CHARACTERS.filter(c => c.category === category);
};

export const CATEGORIES: { id: WhoCategory; label: string; icon: string; color: string }[] = [
    { id: 'EGYPTIAN', label: 'شخصيات عامة', icon: '🇪🇬', color: 'bg-yellow-600' },
    { id: 'SPORTS', label: 'رياضة', icon: '⚽', color: 'bg-green-600' },
    { id: 'RELIGIOUS', label: 'شخصيات دينية', icon: '🕌', color: 'bg-blue-600' },
    { id: 'INVENTORS', label: 'مخترعين وعلماء', icon: '💡', color: 'bg-purple-600' },
    { id: 'CULTURE', label: 'فنون وأدب', icon: '🎨', color: 'bg-rose-600' },
    { id: 'RANDOM', label: 'عشوائي', icon: '🎲', color: 'bg-slate-600' },
];
