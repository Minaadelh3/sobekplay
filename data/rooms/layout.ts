import { RoomMeta } from './types';

const ROOM_CAPACITIES = [4, 3, 4, 3, 4, 3, 4, 3, 3, 3]; // Updated based on master list

export const getFloorLayout = (floor: 1 | 2 | 3): RoomMeta[] => {
    return Array.from({ length: 10 }, (_, i) => {
        const num = i + 1;
        const isNile = num <= 7; // 1..7 are Nile
        const hasKing = num === 3 || num === 5;

        return {
            id: `F${floor}-R${num}`,
            floor,
            room: `Room ${num}`,
            type: isNile ? 'NILE' : 'SIDE',
            bedCount: ROOM_CAPACITIES[i],
            hasKing
        };
    });
};

export const FLOOR_1_LAYOUT = getFloorLayout(1);
export const FLOOR_2_LAYOUT = getFloorLayout(2);
export const FLOOR_3_LAYOUT = getFloorLayout(3);

export const ALL_ROOMS = [...FLOOR_1_LAYOUT, ...FLOOR_2_LAYOUT, ...FLOOR_3_LAYOUT];
