import { ALL_PEOPLE } from '../data/rooms/people';
import { getAllAssignments, getRoommates as getAllRoommates } from '../data/rooms/allocate';
import { buildIndex, searchIndexedPeople, SearchablePerson } from '../data/rooms/search.ts';
import { Assignment } from '../data/rooms/types';

// Singleton Index
let searchIndex: SearchablePerson[] | null = null;
const getIndex = () => {
    if (!searchIndex) {
        // Build index from all people names
        searchIndex = buildIndex(ALL_PEOPLE.map(p => p.name));
    }
    return searchIndex;
};

// 1. Find Guest
export interface GuestResult {
    found: boolean;
    assignment?: Assignment;
    candidates?: string[];
}

export const findGuest = (query: string): GuestResult => {
    if (!query.trim()) return { found: false };

    const candidates = searchIndexedPeople(query, getIndex());

    // Direct Match (1 candidate)
    if (candidates.length === 1) {
        const assignments = getAllAssignments();
        // Determine strict equality or substring match for safety
        // The search indexed returns exact original names.
        const personName = candidates[0];
        const assignment = assignments.find(a => a.personName === personName);

        if (assignment) {
            return { found: true, assignment };
        }
    }

    // Multiple Candidates or None
    if (candidates.length > 1) {
        return { found: false, candidates };
    }

    return { found: false };
};

// 2. Get Roommates (Excluding self)
export const getRoommates = (guest: Assignment): string[] => {
    return getAllRoommates(guest.floor, guest.room, guest.personName);
};

// 3. Labels
export const getFloorLabel = (floor: number): string => {
    switch (floor) {
        case 1: return "الدور الأول";
        case 2: return "الدور الثاني";
        case 3: return "الدور الثالث";
        default: return `الدور ${floor}`;
    }
};

export const getRoomLabel = (room: string): string => {
    // room is already "Room X" from layout, but we can localize if needed or keep English digits
    // "Room 1" -> "غرفة ١" or just keep "Room 1" for clarity as door labels might be English.
    // Let's keep it English/Arabic mixed: "Room 1 (غرفة ١)" if desired, but user just wants "Room 1..10"
    return room;
};
