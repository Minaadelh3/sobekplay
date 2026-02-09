export type TeamId = 'tout' | 'ptah' | 'amon' | 'ra' | 'uncle_joy';

export interface PlayerProfile {
    id: string; // Firestore Doc ID
    ownerUid: string; // Firebase Auth UID
    name: string;
    phone?: string;
    avatarUrl?: string;
    teamId: TeamId;
    createdAt: string;
    updatedAt: string;
    // Extended properties for display
    role?: string;
    email?: string;

    // Gamification
    xp?: number;
    level?: number;
    badges?: string[];
    unlockedAchievements?: string[];
}
