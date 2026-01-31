export type TeamId = 'tot' | 'ankh' | 'amon' | 'ra' | 'uncle_joy';

export interface PlayerProfile {
    id: string; // Firestore Doc ID
    ownerUid: string; // Firebase Auth UID
    name: string;
    phone?: string;
    avatarUrl?: string;
    teamId: TeamId;
    personalPoints: number;
    createdAt: string;
    updatedAt: string;
    // Extended properties for display
    role?: string;
    email?: string;
}

export interface AccountData {
    ownerUid: string;
    totalPoints: number;
    unlockedGames: string[];
    createdAt: string;
    updatedAt: string;
}

export interface TeamScore {
    id: string; // ownerUid_teamId
    ownerUid: string;
    teamId: TeamId;
    points: number;
    updatedAt: string;
}
