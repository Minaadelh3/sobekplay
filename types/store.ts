export type TeamId = 'tout' | 'ankh' | 'amon' | 'ra' | 'uncle_joy';

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
}
