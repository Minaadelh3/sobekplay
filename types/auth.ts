export type UserRole = 'ADMIN' | 'USER';

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface User {
    id: string;
    name: string;
    email?: string; // Added for display
    role: UserRole;
    avatar?: string; // URL or asset path
    mobile?: string;
    password?: string;
    // New Fields for Social/Chat
    displayName?: string;
    nickname?: string;
    photoURL?: string;
    isOnboarded?: boolean;
}

export const BADGES: Badge[] = [
    { id: 'first_login', name: 'بداية الرحلة', icon: '☥', description: 'أول دخول للمقبرة' },
    { id: 'streak_7', name: 'حارس المعبد', icon: '🔥', description: 'دخول 7 أيام متتالية' },
    { id: 'master_detective', name: 'المحقق الذكي', icon: '🕵️', description: 'حل لغز صعب' },
    { id: 'rich_merchant', name: 'التاجر الغني', icon: '💎', description: 'جمع 500 نقطة' },
];

export const USERS_DB: User[] = [
    { id: '1', name: 'توت', role: 'USER', avatar: '/profile/joy.png' },
    { id: '2', name: 'عنخ', role: 'USER', avatar: '/profile/joy.png' },
    { id: '3', name: 'آمون', role: 'USER', avatar: '/profile/joy.png' },
    { id: '4', name: 'رع', role: 'USER', avatar: '/profile/joy.png' },
    { id: 'admin', name: 'Uncle Joy', role: 'ADMIN', avatar: '/profile/joy.png' },
];


export type TeamId = 'tout' | 'ankh' | 'amon' | 'ra' | 'uncle_joy';

export interface TeamProfile {
    id: TeamId;
    name: string;
    avatar: string; // URL or Asset Path
    pin?: string;   // Optional: For admin set up, heavily guarded in real app
    color: string;
    totalPoints?: number;
}

export const TEAMS: TeamProfile[] = [
    { id: 'tout', name: 'توت', avatar: '/profile/toot.png', color: 'from-[#1a237e] to-[#0d47a1]' },
    { id: 'ankh', name: 'عنخ', avatar: '/profile/ankh.png', color: 'from-[#1b5e20] to-[#004d40]' },
    { id: 'amon', name: 'آمون', avatar: '/profile/amoun.png', color: 'from-[#4a148c] to-[#311b92]' },
    { id: 'ra', name: 'رع', avatar: '/profile/raa.png', color: 'from-[#ff6f00] to-[#ffca28]' },
    { id: 'uncle_joy', name: 'Uncle Joy', avatar: '/profile/joy.png', color: 'from-[#b71c1c] to-[#880e4f]' },
];

export interface AuthState {
    user: User | null;
    selectedTeam: TeamProfile | null;
    isAuthenticated: boolean;
}

export interface UserGamificationState {
    points: number;
    badges: string[]; // Badge IDs
    lastLogin: string | null; // ISO Date
    dailyStreak: number;
    teamId?: TeamId; // Tag activity with team
}

export interface ScoreState {
    [username: string]: UserGamificationState;
}
