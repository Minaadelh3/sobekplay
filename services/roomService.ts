import { db } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, onSnapshot, writeBatch, query } from 'firebase/firestore';
import { Assignment } from '../data/rooms/types';
import { getAllAssignments } from '../data/rooms/allocate';

const COLLECTION_NAME = 'room_assignments';

export const RoomService = {
    // 1. Initialize Default Assignments if Empty
    initializeDefaults: async () => {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        if (snapshot.empty) {
            console.log("⚠️ No assignments found in Firestore. Seeding defaults...");
            const defaults = getAllAssignments();
            const batch = writeBatch(db);

            defaults.forEach(assignment => {
                const ref = doc(db, COLLECTION_NAME, assignment.personName);
                batch.set(ref, assignment);
            });

            await batch.commit();
            console.log("✅ Seeding complete.");
        }
    },

    // 2. Subscribe to Realtime Updates
    subscribe: (callback: (assignments: Assignment[]) => void) => {
        const q = query(collection(db, COLLECTION_NAME));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as Assignment);
            callback(data);
        });
    },

    // 3. Update a Single Assignment
    updateAssignment: async (personName: string, newAssignment: Partial<Assignment>) => {
        const ref = doc(db, COLLECTION_NAME, personName);
        await setDoc(ref, newAssignment, { merge: true });
    },

    // 4. Reset to Default Algorithm
    resetToDefaults: async () => {
        const defaults = getAllAssignments();
        const batch = writeBatch(db);

        // Delete existing (optional but cleaner to overwrite)
        // For batch limits (500), we'll just overwrite. 
        // If we had >500 users, we'd need multiple batches.
        defaults.forEach(assignment => {
            const ref = doc(db, COLLECTION_NAME, assignment.personName);
            batch.set(ref, assignment);
        });

        await batch.commit();
    }
};
