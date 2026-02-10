import { db } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, query, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';
import { Assignment, Room } from '../data/rooms/types';
import { getAllAssignments } from '../data/rooms/allocate'; // fallback
import { MASTER_ROOMS_DATA } from '../data/rooms/master_seed';

const COLLECTION_NAME = 'rooms';

export const RoomService = {
    // 1. Initialize Defaults (SEE BELOW FOR STRICT IMPLEMENTATION)
    // Legacy method removed in favor of strict reset below.

    // 2. Subscribe to Realtime Updates
    subscribe: (callback: (data: Assignment[]) => void) => {
        const q = query(collection(db, COLLECTION_NAME));
        return onSnapshot(q, (snapshot) => {
            const strictRooms = snapshot.docs.map(doc => doc.data() as Room);

            // Adapter: Convert Strict Room[] -> Legacy Assignment[]
            const flatAssignments: Assignment[] = [];
            strictRooms.forEach(room => {
                if (room.occupants) {
                    room.occupants.forEach(occ => {
                        flatAssignments.push({
                            personName: occ.fullName,
                            floor: room.floor,
                            room: room.roomCode,
                            bedLabel: room.bedType === 'king' ? 'King Bed' : `Bed ${occ.order}`,
                            view: undefined
                        });
                    });
                }
            });

            callback(flatAssignments);
        });
    },

    // 3. Update a Single Assignment
    updateAssignment: async (personName: string, newAssignment: Partial<Assignment>) => {
        const ref = doc(db, COLLECTION_NAME, personName);
        await setDoc(ref, newAssignment, { merge: true });
    },

    // 4. Reset to Default Algorithm
    // --- STRICT RESET & SEED ---
    initializeDefaults: async () => {
        try {
            console.log("⚠️ STARTING HARD RESET OF ROOMS...");

            // 1. Delete ALL existing room documents
            const snapshot = await getDocs(collection(db, COLLECTION_NAME));
            const deleteBatch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();
            console.log(`✅ Deleted ${snapshot.size} old room records.`);

            // 2. Seed MASTER DATA
            const seedBatch = writeBatch(db);
            let count = 0;

            // We need to transform strict Room data to the flat assignment format 
            // OR store strict data?
            // The existing app subscribes to "assignments" which are flattened.
            // If we store strict "Room" objects, we might break the frontend if it expects "Assignment" documents.
            // Let's check how 'subscribe' works.
            // It listens to COLLECTION_NAME.
            // If the UI expects "Assignment" objects { personName, room, floor... }, we should convert MASTER data to that format.
            // OR better: Store strict "Room" objects if the UI is ready. 
            // BUT 'RoomsManager.tsx' expects `Assignment[]`.
            // SO: We must flatten strict data into Assignment objects for Firestore? 
            // OR: Store 'Room' objects and update 'subscribe' to flattening them on the fly?
            // "Rebuild... structure" in prompt suggests storing Room objects?
            // "Each room MUST be stored as an object with this structure..." -> YES.
            // So we must store Room objects.
            // AND we must update the 'subscribe' method below to map Room[] -> Assignment[] for now.

            // Let's store strict Room objects as requested by prompt.
            // And update the `subscribe` method below to map Room[] -> Assignment[] for now.

            MASTER_ROOMS_DATA.forEach(room => {
                const docRef = doc(db, COLLECTION_NAME, room.id);
                seedBatch.set(docRef, room);
                count++;
            });

            await seedBatch.commit();
            console.log(`✅ Seeded ${count} rooms from MASTER_SEED.`);

            // Log for Verification
            console.log("--- VERIFICATION LOGS ---");
            [1, 2, 3, 4].forEach(f => {
                const fc = MASTER_ROOMS_DATA.filter(r => r.floor === f).length;
                console.log(`Floor ${f}: ${fc} rooms`);
            });

            console.log("--- DETAILED ROOM AUDIT ---");
            MASTER_ROOMS_DATA.forEach(r => {
                console.log(`[${r.id}] ${r.roomCode}: ${r.occupants.length} occupants, Bed: ${r.bedType}`);
                // Assert check (optional, but good for logs)
                if (r.bedType === 'king' && r.occupants.length > 3) {
                    console.warn(`⚠️ WARNING: King bed room ${r.roomCode} has > 3 occupants!`);
                }
            });

        } catch (error) {
            console.error("Error resetting rooms:", error);
            throw error;
        }
    },
};
