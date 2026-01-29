export interface RoomMeta {
    id: string; // e.g. "F1-R1"
    floor: 1 | 2 | 3;
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

export interface Assignment {
    personName: string;
    floor: 1 | 2 | 3;
    room: string;
    bedLabel: string; // e.g. "Bed 1"
    view: 'NILE' | 'SIDE';
}
