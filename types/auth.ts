export type UserRole = 'SUPER_ADMIN' | 'POINTS_MANAGER' | 'GAMES_MODERATOR' | 'VIEWER' | 'ADMIN' | 'USER';

export interface User {
    id: string;
    name: string;
    email?: string;
    role: UserRole;
    avatar?: string;
    mobile?: string;
    // New Fields for Social/Chat
    displayName?: string;
    nickname?: string;
    photoURL?: string;
    isOnboarded?: boolean;
    teamId?: TeamId;
    isDisabled?: boolean;
    // Gamification
    points?: number;
    badges?: string[];
    rankIdentifier?: string;
    unlockedAchievements?: string[]; // IDs of unlocked achievements
}

export const USERS_DB: User[] = [
    { id: 'admin', name: 'Uncle Joy', role: 'ADMIN', avatar: '/profile/joy.png' },
];


export type TeamId = 'tout' | 'ankh' | 'amon' | 'ra' | 'uncle_joy';

export interface TeamProfile {
    id: TeamId;
    name: string;
    avatar: string;
    pin?: string;
    color: string;
    points: number;      // Current Score
    isScorable: boolean; // Eligibility for points
}

export const TEAMS: TeamProfile[] = [
    { id: 'tout', name: 'توت', avatar: '/profile/toot.png', color: 'from-[#1a237e] to-[#0d47a1]', points: 0, isScorable: true },
    { id: 'ankh', name: 'عنخ', avatar: '/profile/ankh.png', color: 'from-[#1b5e20] to-[#004d40]', points: 0, isScorable: true },
    { id: 'amon', name: 'آمون', avatar: '/profile/amoun.png', color: 'from-[#4a148c] to-[#311b92]', points: 0, isScorable: true },
    { id: 'ra', name: 'رع', avatar: '/profile/raa.png', color: 'from-[#ff6f00] to-[#ffca28]', points: 0, isScorable: true },
    // Uncle Joy is NOT Scorable
    { id: 'uncle_joy', name: 'Uncle Joy', avatar: '/profile/joy.png', color: 'from-[#b71c1c] to-[#880e4f]', points: 0, isScorable: false },
];

export interface AuthState {
    user: User | null;
    selectedTeam: TeamProfile | null;
    isAuthenticated: boolean;
}

