import { RoomMeta } from './types';
import { MASTER_ROOMS_DATA } from './master_seed';

export const getFloorLayout = (floor: 1 | 2 | 3 | 4): RoomMeta[] => {
    // Filter master data for the requested floor
    const floorRooms = MASTER_ROOMS_DATA.filter(r => r.floor === floor);

    return floorRooms.map(r => ({
        id: r.id,
        floor: r.floor,
        room: r.roomCode, // "R1-7" will be the label
        type: r.roomNumber <= 7 ? 'NILE' : 'SIDE', // Heuristic based on room number if needed, or default
        bedCount: r.capacity,
        hasKing: r.bedType === 'king'
    }));
};

export const FLOOR_1_LAYOUT = getFloorLayout(1);
export const FLOOR_2_LAYOUT = getFloorLayout(2);
export const FLOOR_3_LAYOUT = getFloorLayout(3);
export const FLOOR_4_LAYOUT = getFloorLayout(4);

export const ALL_ROOMS = [...FLOOR_1_LAYOUT, ...FLOOR_2_LAYOUT, ...FLOOR_3_LAYOUT, ...FLOOR_4_LAYOUT];
