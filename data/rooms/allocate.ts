import { BOYS_LIST, GIRLS_LIST } from './people';
import { ALL_ROOMS } from './layout';
import { Assignment, Person } from './types';

// Deterministic Pseudo-Random Shuffle
const seededShuffle = <T>(array: T[], seed: number) => {
    let m = array.length, t, i;
    // Clone array to avoid mutating original
    const arr = [...array];
    while (m) {
        i = Math.floor(random(seed) * m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
        seed++;
    }
    return arr;
};

const random = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

let cachedAssignments: Assignment[] | null = null;

const fillFloor = (
    floor: number,
    people: Person[],
    startIdx: number
): { assignments: Assignment[], nextIdx: number } => {
    const rooms = ALL_ROOMS.filter(r => r.floor === floor);
    const assignments: Assignment[] = [];
    let idx = startIdx;

    for (const room of rooms) {
        if (idx >= people.length) break;

        for (let b = 1; b <= room.bedCount; b++) {
            if (idx >= people.length) break;

            const person = people[idx++];
            assignments.push({
                personName: person.name,
                floor: room.floor,
                room: room.room,
                bedLabel: `Bed ${b}`,
                view: room.type
            });
        }
    }
    return { assignments, nextIdx: idx };
};

export const getAllAssignments = (): Assignment[] => {
    if (cachedAssignments) return cachedAssignments;

    // 1. Prepare People groups
    const boys = seededShuffle(BOYS_LIST, 555);
    const girls = seededShuffle(GIRLS_LIST, 888);

    const assignments: Assignment[] = [];

    // 2. Fill Floor 1 (Boys)
    const f1Result = fillFloor(1, boys, 0);
    assignments.push(...f1Result.assignments);

    // 3. Fill Floor 2 (Remaining Boys)
    const f2Result = fillFloor(2, boys, f1Result.nextIdx);
    assignments.push(...f2Result.assignments);

    // 4. Fill Floor 3 (Girls)
    const f3Result = fillFloor(3, girls, 0);
    assignments.push(...f3Result.assignments);

    cachedAssignments = assignments;
    return assignments;
};

// Helper to get roommates
export const getRoommates = (floor: number, room: string, currentPerson: string) => {
    const all = getAllAssignments();
    return all
        .filter(a => a.floor === floor && a.room === room && a.personName !== currentPerson)
        .map(a => a.personName);
};
