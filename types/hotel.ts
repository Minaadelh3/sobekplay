// types/hotel.ts

export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'SUITE' | 'FAMILY';
export type RoomStatus = 'READY' | 'CLEANING' | 'OCCUPIED' | 'MAINTENANCE';

export interface GuestAllocation {
    id: string;             // Unique ID (e.g. "guest_123")
    fullName: string;       // Display Name
    normalizedName: string; // Search-optimized key (lowercase, no accents)

    // Room Details
    roomNumber: string;
    building?: string;
    floor?: string;
    roomType: RoomType;

    // Context
    roommates: string[];    // Names of others in the room
    checkIn: string;        // ISO Date
    checkOut: string;       // ISO Date

    // Metadata
    tags: string[];         // Search tags
    notes?: string;         // e.g. "Late Check-in"
    lastUpdated: number;    // Timestamp
}

export interface HotelData {
    propetyName: string;
    lastUpdated: string; // ISO String for UI display
    guests: GuestAllocation[];
}
