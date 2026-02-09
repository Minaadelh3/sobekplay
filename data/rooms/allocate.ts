import { Assignment } from './types';
import { FIXED_ASSIGNMENTS } from './fixed_data';

export const getAllAssignments = (): Assignment[] => {
    return FIXED_ASSIGNMENTS;
};

// Helper to get roommates
export const getRoommates = (floor: number, room: string, currentPerson: string) => {
    const all = getAllAssignments();
    return all
        .filter(a => a.floor === floor && a.room === room && a.personName !== currentPerson)
        .map(a => a.personName);
};

