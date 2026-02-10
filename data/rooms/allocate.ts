// TRANSFORMER: Converts Strict Room Data -> Legacy Assignment format for UI
import { Assignment } from './types';
import { MASTER_ROOMS_DATA } from './master_seed';

export const getAllAssignments = (): Assignment[] => {
    const assignments: Assignment[] = [];

    MASTER_ROOMS_DATA.forEach(room => {
        room.occupants.forEach(occ => {
            assignments.push({
                personName: occ.fullName,
                floor: room.floor,
                room: room.roomCode, // "R1-7"
                bedLabel: room.bedType === 'king' ? 'King Bed' : `Bed ${occ.order} `,
                view: undefined // We don't have this in strict data, UI handles fallback
            });
        });
    });

    return assignments;
};

export const getRoommates = (floor: number, roomCode: string, selfName: string): string[] => {
    const room = MASTER_ROOMS_DATA.find(r => r.floor === floor && r.roomCode === roomCode);
    if (!room) return [];
    return room.occupants
        .filter(occ => occ.fullName !== selfName)
        .map(occ => occ.fullName);
};
