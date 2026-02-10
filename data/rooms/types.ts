export interface RoomMeta {
    id: string; // e.g. "F1-R1"
    floor: 1 | 2 | 3 | 4;
    room: string; // "Room 1"
    type: 'NILE' | 'SIDE';
    bedCount: number;
    hasKing: boolean;
}

export interface Person {
    name: string;
    gender: 'M' | 'F';
    isFiller?: boolean; // For admin only
}

export interface RoomOccupant {
    order: number;
    fullName: string;
}

export interface Room {
    id: string;          // e.g. "F1_R1-7"
    floor: 1 | 2 | 3 | 4;
    roomCode: string;    // e.g. "R1-7" (Visual Label)
    roomNumber: number;  // e.g. 7 (Derived from Code)
    bedType: "normal" | "king";
    occupants: RoomOccupant[];
    capacity: number;
}

// Assignment interface for backward compatibility if needed, 
// or we might refactor the whole app to use Room directly.
// For now, let's keep Assignment but maybe we derive it?
// The prompt says "Rebuild... structure". High chance UI needs updates.
// Let's keep RoomMeta for layout if needed, but the new Room interface is the source of truth.

export interface Assignment {
    personName: string;
    floor: 1 | 2 | 3 | 4;
    room: string;
    bedLabel: string;
    view?: 'NILE' | 'SIDE'; // Optional now
}
